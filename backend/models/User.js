import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

  // Common fields
  firstName: {
    type: String,
    trim: true
  },

  lastName: {
    type: String,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email address"]
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },

  role: {
    type: String,
    enum: ["participant", "organizer", "admin"],
    default: "participant",
    required: true
  },

  // Organizer-specific fields
  category: {
    type: String
  },

  description: {
    type: String
  },

  contactEmail: {
    type: String
  },

  contactNumber: {
    type: String
  },

  isActive: {
    type: Boolean,
    default: true
  }

}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;