import mongoose from "mongoose";

const forumMessageSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  authorRole: {
    type: String,
    enum: ["participant", "organizer", "admin"],
    required: true
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ForumMessage",
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  messageType: {
    type: String,
    enum: ["message", "question", "answer", "announcement"],
    default: "message"
  },
  isAnswered: {
    type: Boolean,
    default: false
  },
  isQuestion: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  deletionReason: String,
  reactions: [
    {
      emoji: String,
      users: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        }
      ]
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes for performance
forumMessageSchema.index({ event: 1, createdAt: -1 });
forumMessageSchema.index({ event: 1, parentMessage: 1 });
forumMessageSchema.index({ event: 1, isPinned: -1, createdAt: -1 });
forumMessageSchema.index({ author: 1, createdAt: -1 });

const ForumMessage = mongoose.model("ForumMessage", forumMessageSchema);

export default ForumMessage;
