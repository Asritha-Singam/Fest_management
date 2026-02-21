import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getInteractMessages,
  getQAQuestions,
  getAnnouncements,
  postForumMessage,
  getMessageReplies,
  toggleReaction,
  deleteForumMessage,
  togglePinMessage,
  markQuestionAsAnswered
} from "../controllers/forumControllers.js";

const router = express.Router();

// All forum routes require authentication
router.use(authMiddleware);

// Tab endpoints
// Get interact messages (general discussions)
router.get("/events/:eventId/forum/interact", getInteractMessages);

// Get Q&A questions
router.get("/events/:eventId/forum/qa", getQAQuestions);

// Get announcements
router.get("/events/:eventId/forum/announcements", getAnnouncements);

// Post a new message (supports all message types)
router.post("/events/:eventId/forum/messages", postForumMessage);

// Get replies for a message (threading)
router.get("/events/:eventId/forum/messages/:messageId/replies", getMessageReplies);

// Add/remove reaction to a message
router.post("/events/:eventId/forum/messages/:messageId/reaction", toggleReaction);

// Delete a message (organizer/admin only)
router.delete("/events/:eventId/forum/messages/:messageId", deleteForumMessage);

// Pin/unpin a message (organizer/admin only)
router.patch("/events/:eventId/forum/messages/:messageId/pin", togglePinMessage);

// Mark question as answered (organizer/admin only)
router.patch("/events/:eventId/forum/questions/:questionId/answered", markQuestionAsAnswered);

export default router;
