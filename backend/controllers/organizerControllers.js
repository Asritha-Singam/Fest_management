import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

export const getOrganizerProfile = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id).select("-password");

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(200).json({
      success: true,
      organizer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching profile",
      error: error.message
    });
  }
};

export const updateOrganizerProfile = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Prevent role switching
    if (req.body.role) {
      return res.status(403).json({ message: "Role cannot be changed" });
    }

    const {
      firstName,
      lastName,
      category,
      description,
      contactEmail,
      contactNumber
    } = req.body;

    if (firstName) organizer.firstName = firstName;
    if (lastName) organizer.lastName = lastName;
    if (category) organizer.category = category;
    if (description) organizer.description = description;
    if (contactEmail) organizer.contactEmail = contactEmail;
    if (contactNumber) organizer.contactNumber = contactNumber;

    await organizer.save();

    res.status(200).json({
      success: true,
      organizer
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message
    });
  }
};
// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    const organizer = await User.findById(req.user.id);
    const { reason } = req.body;

    if (!organizer) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "Reason is required" });
    }

    // Check if organizer already has a pending password reset request
    const existingRequest = await PasswordReset.findOne({
      user: req.user.id,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({ 
        message: "You already have a pending password reset request. Please wait for admin approval." 
      });
    }

    // Create new password reset request
    const passwordResetRequest = new PasswordReset({
      user: req.user.id,
      email: organizer.email,
      firstName: organizer.firstName,
      lastName: organizer.lastName,
      clubName: `${organizer.firstName} ${organizer.lastName}`,
      reason: reason.trim(),
      status: "pending"
    });

    await passwordResetRequest.save();

    res.status(201).json({
      success: true,
      message: "Password reset request submitted. Admin will review and reset your password.",
      request: passwordResetRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error requesting password reset",
      error: error.message
    });
  }
};

// Get organizer password reset history
export const getPasswordResetHistory = async (req, res) => {
  try {
    const requests = await PasswordReset.find({ user: req.user.id })
      .populate("approvedBy", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching password reset history",
      error: error.message
    });
  }
};