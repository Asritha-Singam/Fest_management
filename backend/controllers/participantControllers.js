import Event from "../models/events.js";
import Participation from "../models/participation.js";
import QRCode from "qrcode";
import {sendEmail} from "../utils/sendEmail.js";
import User from "../models/User.js";
import Participant from "../models/participant.js";
import bcrypt from "bcrypt";

export const registerForEvent = async (req, res) => {
  try {
    const userId = req.user.id; // from JWT middleware
    const { eventId } = req.params;
    const { merchandiseSelection, customFieldResponses } = req.body;

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

    // Validate merchandise selection for MERCHANDISE events
    if (event.eventType === "MERCHANDISE") {
      if (!merchandiseSelection || !merchandiseSelection.size || !merchandiseSelection.color) {
        return res.status(400).json({ 
          success: false, 
          message: "Please select size and color for merchandise" 
        });
      }

      // Validate size and color are in available options
      if (event.merchandiseDetails?.sizes?.length > 0 && 
          !event.merchandiseDetails.sizes.includes(merchandiseSelection.size)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid size selection" 
        });
      }

      if (event.merchandiseDetails?.colors?.length > 0 && 
          !event.merchandiseDetails.colors.includes(merchandiseSelection.color)) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid color selection" 
        });
      }
    }

    // Validate custom form fields for NORMAL events
    if (event.eventType === "NORMAL" && event.customFormFields?.length > 0) {
      for (const field of event.customFormFields) {
        if (field.required) {
          const response = customFieldResponses?.find(r => r.fieldName === field.fieldName);
          if (!response || !response.fieldValue) {
            return res.status(400).json({ 
              success: false, 
              message: `${field.fieldName} is required` 
            });
          }
        }
      }
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
    
    // Only generate ticket ID and QR for non-merchandise events during registration
    // For merchandise, ticket and QR are generated after payment approval
    let ticketId = null;
    let qrCodePayload = null;
    let qrCodeDataUrl = null;
    
    if (event.eventType !== "MERCHANDISE") {
      const random = Math.floor(100000 + Math.random() * 900000);
      ticketId = `FEL-${eventId.toString().slice(-6)}-${random}`;
      qrCodePayload = `Ticket ID: ${ticketId}`;
      try {
        qrCodeDataUrl = await QRCode.toDataURL(qrCodePayload);
      } catch (qrError) {
        console.error("Failed to generate QR code data URL:", qrError.message);
      }
    }

    const participationData = {
      participant: userId,
      event: eventId,
    };
    
    // Only add ticketId if it was generated (non-merchandise events)
    if (ticketId) {
      participationData.ticketId = ticketId;
    }

    if (qrCodeDataUrl) {
      participationData.qrCodeData = qrCodeDataUrl;
    }

    // Add merchandise selection if applicable
    if (event.eventType === "MERCHANDISE" && merchandiseSelection) {
      participationData.merchandiseSelection = merchandiseSelection;
    }

    // Add custom field responses if applicable
    if (event.eventType === "NORMAL" && customFieldResponses) {
      participationData.customFieldResponses = customFieldResponses;
    }

    const participation = new Participation(participationData);
    await participation.save();
    event.registrationCount = (event.registrationCount || 0) + 1;

    await event.save();
    
    const user = await User.findById(userId);
    
    // Try sending email (don't fail registration if email fails)
    try {
      // Build email content with merchandise/custom field details
      let additionalInfo = "";
      if (merchandiseSelection) {
        additionalInfo += `<p><strong>Size:</strong> ${merchandiseSelection.size}</p>`;
        additionalInfo += `<p><strong>Color:</strong> ${merchandiseSelection.color}</p>`;
      }
      if (customFieldResponses && customFieldResponses.length > 0) {
        additionalInfo += "<h3>Registration Details:</h3>";
        customFieldResponses.forEach(field => {
          additionalInfo += `<p><strong>${field.fieldName}:</strong> ${field.fieldValue}</p>`;
        });
      }

      // For merchandise events, send different email (no ticket/QR yet - pending payment approval)
      if (event.eventType === "MERCHANDISE") {
        await sendEmail(
          user.email,
          "Event Registration Confirmation - Payment Required",
          `
            <h2>Event Registration Confirmation</h2>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>You have successfully registered for the event: <strong>${event.eventName}</strong></p>
            <p><strong>Event Date:</strong> ${new Date(event.eventStartDate).toLocaleDateString()}</p>
            ${additionalInfo}
            <h3>⚠️ Payment Required</h3>
            <p>Please upload your payment proof to complete the registration.</p>
            <p>Once your payment is approved by the organizer, you will receive your event ticket and QR code.</p>
            <p>Thank you for registering!</p>
          `
        );
      } else {
        // For normal events, send email with QR code
        const qrCodeBuffer = await QRCode.toBuffer(qrCodePayload);
        
        await sendEmail(
          user.email,
          "Event Registration Confirmation",
          `
            <h2>Event Registration Confirmation</h2>
            <p>Hello ${user.firstName} ${user.lastName},</p>
            <p>You have successfully registered for the event: <strong>${event.eventName}</strong></p>
            <p><strong>Ticket ID:</strong> ${ticketId}</p>
            <p><strong>Event Date:</strong> ${new Date(event.eventStartDate).toLocaleDateString()}</p>
            ${additionalInfo}
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
      }
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError.message);
      // Continue anyway - registration was successful
    }

    const response = {
      success: true,
      message: "Registered for event successfully"
    };
    
    // Only include ticketId for non-merchandise events
    if (ticketId) {
      response.ticketId = ticketId;
    }
    
    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering for event",
      error: error.message
    });
  }
};

export const cancelRegistration = async (req, res) => {
  try {
    const userId = req.user.id;
    const { participationId } = req.params;

    // Find the participation record
    const participation = await Participation.findById(participationId).populate('event');
    
    if (!participation) {
      return res.status(404).json({ 
        success: false, 
        message: "Registration not found" 
      });
    }

    // Check if the participation belongs to the requesting user
    if (participation.participant.toString() !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: "Unauthorized to cancel this registration" 
      });
    }

    // Check if already cancelled
    if (participation.status === "Cancelled") {
      return res.status(400).json({ 
        success: false, 
        message: "Registration is already cancelled" 
      });
    }

    // Check if event has already started or completed
    const event = participation.event;
    const now = new Date();
    
    if (new Date(event.eventStartDate) <= now) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot cancel registration for events that have already started or completed" 
      });
    }

    // Update participation status to Cancelled
    participation.status = "Cancelled";
    await participation.save();

    // Decrease the registration count on the event
    if (event.registrationCount > 0) {
      event.registrationCount -= 1;
      await event.save();
    }

    // Try sending cancellation email (don't fail if email fails)
    try {
      const user = await User.findById(userId);
      await sendEmail(
        user.email,
        "Event Registration Cancelled",
        `
          <h2>Event Registration Cancellation</h2>
          <p>Hello ${user.firstName} ${user.lastName},</p>
          <p>Your registration for the event: <strong>${event.eventName}</strong> has been cancelled.</p>
          <p><strong>Ticket ID:</strong> ${participation.ticketId}</p>
          <p>If this was a mistake, you can register again if spots are still available.</p>
        `
      );
    } catch (emailError) {
      console.error("Failed to send cancellation email:", emailError.message);
      // Continue anyway - cancellation was successful
    }

    res.status(200).json({
      success: true,
      message: "Registration cancelled successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error cancelling registration",
      error: error.message
    });
  }
};

export const getMyEvents = async (req, res) => {
  try {
    const userId = req.user.id;

    const participations = await Participation.find({
      participant: userId
    }).populate({
      path: "event",
      populate: {
        path: "organizer",
        select: "firstName lastName"
      }
    });

    const now = new Date();

    const upcoming = [];
    const completed = [];
    const cancelled = [];

    participations.forEach((p) => {
      if (p.status === "Cancelled") {
        cancelled.push(p);
      } else if (p.status === "Completed") {
        completed.push(p);
      } else if (p.status === "Registered") {
        // Check if event has ended
        if (new Date(p.event.eventEndDate) < now) {
          completed.push(p);
        } else {
          upcoming.push(p);
        }
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
    const organizers = await User.find({ role: "organizer", isActive: true }).select("firstName lastName email category description contactEmail contactNumber");

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

// Change Password
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters"
      });
    }

    const user = await User.findById(userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message
    });
  }
};
