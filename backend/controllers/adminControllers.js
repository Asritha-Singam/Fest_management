import bcrypt from "bcrypt";
import User from "../models/User.js";
import PasswordReset from "../models/PasswordReset.js";

// Create organizer (Admin only)
export const createOrganizerAdmin = async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Auto-generate password
    const generatedPassword = Math.random().toString(36).slice(-8);

    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const organizer = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role: "organizer"
    });

    res.status(201).json({
      message: "Organizer created successfully",
      organizer,
      generatedPassword
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Get all organizers
export const getAllOrganizers = async (req, res) => {
  try {
    const organizers = await User.find({ role: "organizer" }).select("-password");

    res.status(200).json({
      success: true,
      count: organizers.length,
      organizers
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Disable/Enable organizer
export const disableOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer || organizer.role !== "organizer") {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Prevent role switching
    if (req.body.role) {
      return res.status(403).json({ message: "Role cannot be changed" });
    }

    // Use isActive from request body, or toggle current status if not provided
    if (req.body.isActive !== undefined) {
      organizer.isActive = req.body.isActive;
    } else {
      organizer.isActive = !organizer.isActive;
    }
    
    await organizer.save();

    res.status(200).json({ 
      success: true,
      message: `Organizer ${organizer.isActive ? "enabled" : "disabled"}`,
      organizer 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete organizer permanently
export const deleteOrganizer = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer || organizer.role !== "organizer") {
      return res.status(404).json({ message: "Organizer not found" });
    }

    await organizer.deleteOne();

    res.status(200).json({ message: "Organizer deleted permanently" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Reset organizer password (Admin only)
export const resetOrganizerPassword = async (req, res) => {
  try {
    const organizer = await User.findById(req.params.id);

    if (!organizer || organizer.role !== "organizer") {
      return res.status(404).json({ message: "Organizer not found" });
    }

    // Generate new password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    organizer.password = hashedPassword;
    await organizer.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
      newPassword: newPassword
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get all password reset requests
export const getPasswordResetRequests = async (req, res) => {
  try {
    const requests = await PasswordReset.find()
      .populate("user", "firstName lastName email role")
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
      message: "Error fetching password reset requests",
      error: error.message 
    });
  }
};

// Get pending password reset requests only
export const getPendingResetRequests = async (req, res) => {
  try {
    const requests = await PasswordReset.find({ status: "pending" })
      .populate("user", "firstName lastName email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error fetching pending requests",
      error: error.message 
    });
  }
};

// Approve password reset request
export const approvePasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { comment } = req.body;

    const resetRequest = await PasswordReset.findById(requestId);

    if (!resetRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (resetRequest.status !== "pending") {
      return res.status(400).json({ 
        message: `Cannot approve a ${resetRequest.status} request` 
      });
    }

    // Generate new password
    const newPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = await User.findById(resetRequest.user);
    user.password = hashedPassword;
    await user.save();

    // Update reset request
    resetRequest.status = "approved";
    resetRequest.newPassword = newPassword;
    resetRequest.approvedBy = req.user.id;
    resetRequest.approvedAt = new Date();
    if (comment && comment.trim()) {
      resetRequest.adminComment = comment.trim();
    }
    resetRequest.updatedAt = new Date();
    await resetRequest.save();

    res.status(200).json({
      success: true,
      message: "Password reset approved",
      request: resetRequest,
      newPassword: newPassword
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error approving password reset",
      error: error.message 
    });
  }
};

// Reject password reset request
export const rejectPasswordReset = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { reason, comment } = req.body;

    const resetRequest = await PasswordReset.findById(requestId);

    if (!resetRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (resetRequest.status !== "pending") {
      return res.status(400).json({ 
        message: `Cannot reject a ${resetRequest.status} request` 
      });
    }

    resetRequest.status = "rejected";
    resetRequest.rejectionReason = reason || "No reason provided";
    if (comment && comment.trim()) {
      resetRequest.adminComment = comment.trim();
    }
    resetRequest.updatedAt = new Date();
    await resetRequest.save();

    res.status(200).json({
      success: true,
      message: "Password reset request rejected",
      request: resetRequest
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Error rejecting password reset",
      error: error.message 
    });
  }
};
