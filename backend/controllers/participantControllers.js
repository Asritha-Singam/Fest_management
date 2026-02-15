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

    if(event.registrationCount >= event.registrationLimit) {
      return res.status(400).json({ success: false, message: "Event is full" });
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
    const qrCodeData = `Ticket ID: ${ticketId}`;
    const qrCodeBuffer = await QRCode.toBuffer(qrCodeData);

    await sendEmail(
      user.email, 
      "Event Registration Confirmation", 
      `
        <h2>Event Registration Confirmation</h2>
        <p>Hello ${user.firstName} ${user.lastName},</p>
        <p>You have successfully registered for the event: <strong>${event.name}</strong></p>
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
    const { firstName, lastName, contactNumber,collegeOROrg, interests, followedOrganizers } = req.body;
    const user = await User.findByIdAndUpdate(userId, { firstName, lastName }, { new: true });
    const participant = await Participant.findOneAndUpdate(
      { userId },
      { contactNumber, collegeOROrg, interests, followedOrganizers },
      { new: true }
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
