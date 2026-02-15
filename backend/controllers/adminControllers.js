import bcrypt from "bcrypt";
import User from "../models/User.js";

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
