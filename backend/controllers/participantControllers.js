import Event from "../models/events.js";
import Participation from "../models/participation.js";
import QRCode from "qrcode";
import {sendEmail} from "../utils/sendEmail.js";
import User from "../models/User.js";
import Participant from "../models/participant.js";

export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { eventId } = req.params;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if(new Date() > new Date(event.registrationDeadline)) {
      return res.status(400).json({ success: false, message: "Registration deadline has passed" });
    }

    // Check eligibility
    const participant = await Participant.findOne({ userId });
    if (!participant) {
      return res.status(404).json({ success: false, message: "Participant not found" });
    }

    if (event.eligibility === "IIIT_ONLY" && participant.participantType !== "IIIT") {
      return res.status(403).json({ success: false, message: "This event is only for IIIT participants" });
    }

    if (event.eligibility === "NON_IIIT_ONLY" && participant.participantType !== "NON_IIIT") {
      return res.status(403).json({ success: false, message: "This event is only for non-IIIT participants" });
    }

    // Check registration limit by counting actual participants
    const participantCount = await Participation.countDocuments({ event: eventId });
    if (event.registrationLimit > 0 && participantCount >= event.registrationLimit) {
      return res.status(400).json({ success: false, message: "Event registration limit reached" });
    }

    const existing=await Participation.findOne({ participant: userId, event: eventId });
    if(existing) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }
    const random=Math.floor(100000 + Math.random() * 900000);
    const ticketId=`FEL-${eventId.toString().slice(-6)}-${random}`;

    const participation = new Participation({
      participant: userId,
      event: eventId,
      ticketId,
    });
    await participation.save();
    event.registrationCount = (event.registrationCount || 0) + 1;

    await event.save();
    
    const user = await User.findById(userId);
    
    // Try sending email with QR code (don't fail registration if email fails)
    try {
      const qrCodeData = `Ticket ID: ${ticketId}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

      await sendEmail(
        user.email, 
        "Event Registration Confirmation", 
        `
          <h2>Event Registration Confirmation</h2>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>You have successfully registered for the event: <strong>${event.eventName}</strong></p>
          <p><strong>Ticket ID:</strong> ${ticketId}</p>
          <p><strong>Event Date:</strong> ${new Date(event.eventStartDate).toLocaleDateString()}</p>
          <p>Please find your QR code below:</p>
          <img src="cid:qrcode" alt="Event QR Code" style="width:200px; height:200px;" />
          <p>Show this QR code at the event entrance.</p>
        `,
        [
          {
            filename: 'qrcode.png',
            content: qrCodeBuffer,
            cid: 'qrcode'
          }
        ]
      );
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
      // Continue anyway - registration was successful
    }

    res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      ticketId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for event",
      error: error.message
    });
  }
};
export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await Participation.find({
      participant: userId
    }).populate("event");

    const now = new Date();

    const upcoming = [];
    const completed = [];
    const cancelled = [];

    participations.forEach((p) => {
      if (p.status === "Cancelled") {
        cancelled.push(p);
      } else if (new Date(p.event.eventEndDate) < now) {
        completed.push(p);
      } else {
        upcoming.push(p);
      }
    });

    res.status(200).json({
      success: true,
      upcoming,
      completed,
      cancelled
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching events",
      error: error.message
    });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Prevent role switching
    if (req.body.role) {
      return res.status(403).json({ message: "Role cannot be changed" });
    }

    const { firstName, lastName, contactNumber,collegeOROrg, interests, followedOrganizers } = req.body;
    const user = await User.findByIdAndUpdate(userId, { firstName, lastName }, { returnDocument: 'after' });
    const participant = await Participant.findOneAndUpdate(
      { userId },
      { contactNumber, collegeOROrg, interests, followedOrganizers },
      { returnDocument: 'after' }
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
      participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  } 
};

// Get participant profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).select("-password");
    const participant = await Participant.findOne({ userId }).populate("followedOrganizers", "firstName lastName email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      success: true,
      user,
      participant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

// Get all organizers (for follow feature)
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer", isActive: true }).select("firstName lastName email category description");

    res.status(200).json({
      success: true,
      organizers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching organizers",
      error: error.message
    });
  }
};

// Get recommended events based on participant preferences
export const getRecommendedEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get participant with their preferences
    const participant = await Participant.findOne({ userId });
    
    if (!participant) {
      return res.status(404).json({ message: "Participant profile not found" });
    }

    const { interests, followedOrganizers } = participant;

    // Get all published events
    let events = await Event.find({ status: "published" })
      .populate("organizer", "firstName lastName email");

    // Score each event based on preferences
    const scoredEvents = events.map(event => {
      let score = 0;

      // Match event tags with participant interests (case-insensitive)
      if (interests && interests.length > 0 && event.eventTags && event.eventTags.length > 0) {
        const matchedTags = event.eventTags.filter(tag => 
          interests.some(interest => 
            interest.toLowerCase().includes(tag.toLowerCase()) || 
            tag.toLowerCase().includes(interest.toLowerCase())
          )
        );
        score += matchedTags.length * 10; // 10 points per matched tag
      }

      // Boost score if event is from a followed organizer
      if (followedOrganizers && followedOrganizers.length > 0) {
        const isFollowedOrganizer = followedOrganizers.some(
          orgId => orgId.toString() === event.organizer._id.toString()
        );
        if (isFollowedOrganizer) {
          score += 50; // 50 bonus points for followed organizers
        }
      }

      // Add recency bonus (newer events get slight boost)
      const daysOld = (Date.now() - new Date(event.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysOld < 7) {
        score += 5; // 5 points for events created in last 7 days
      }

      return { ...event.toObject(), recommendationScore: score };
    });

    // Sort by score (highest first), then by event start date
    scoredEvents.sort((a, b) => {
      if (b.recommendationScore !== a.recommendationScore) {
        return b.recommendationScore - a.recommendationScore;
      }
      return new Date(a.eventStartDate) - new Date(b.eventStartDate);
    });

    res.status(200).json({
      success: true,
      count: scoredEvents.length,
      events: scoredEvents,
      userInterests: interests,
      followedOrganizersCount: followedOrganizers ? followedOrganizers.length : 0
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching recommended events",
      error: error.message
    });
  }
};
