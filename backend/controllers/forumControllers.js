import ForumMessage from "../models/ForumMessage.js";
import Event from "../models/events.js";
import Participation from "../models/participation.js";
import User from "../models/User.js";

const emitForumEvent = (req, eventId, eventName, payload) => {
  const io = req.app?.get("io");
  if (io) {
    io.to(`forum-${eventId}`).emit(eventName, payload);
  }
};

// Get interact messages (general discussions)
export const getInteractMessages = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user is registered for this event (if participant)
    if (req.user.role === "participant") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });

      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event to view the forum"
        });
      }
    } else if (req.user.role === "organizer") {
      const event = await Event.findById(eventId);
      if (event.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only view forums for your own events"
        });
      }
    }

    const skip = (page - 1) * limit;

    // Get pinned messages (top-level only)
    const pinnedMessages = await ForumMessage.find({
      event: eventId,
      parentMessage: null,
      messageType: "message",
      isPinned: true,
      isDeleted: false
    })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    // Get regular messages (top-level only, not replies)
    const messages = await ForumMessage.find({
      event: eventId,
      parentMessage: null,
      messageType: "message",
      isDeleted: false
    })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ForumMessage.countDocuments({
      event: eventId,
      parentMessage: null,
      messageType: "message",
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      messages,
      pinnedMessages,
      total,
      page,
      limit,
      hasMore: skip + messages.length < total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching interact messages",
      error: error.message
    });
  }
};

// Get Q&A questions
export const getQAQuestions = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    // Check if user has access to this event
    if (req.user.role === "participant") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });

      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event"
        });
      }
    } else if (req.user.role === "organizer") {
      const event = await Event.findById(eventId);
      if (event.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only view forums for your own events"
        });
      }
    }

    const skip = (page - 1) * limit;

    // Get all questions with their answers
    const questions = await ForumMessage.find({
      event: eventId,
      messageType: "question",
      isDeleted: false
    })
      .populate("author", "firstName lastName")
      .sort({ isAnswered: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // For each question, get its answers
    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await ForumMessage.find({
          event: eventId,
          messageType: "answer",
          parentMessage: question._id,
          isDeleted: false
        })
          .populate("author", "firstName lastName")
          .sort({ createdAt: 1 });

        return {
          ...question.toObject(),
          answers
        };
      })
    );

    const total = await ForumMessage.countDocuments({
      event: eventId,
      messageType: "question",
      isDeleted: false
    });

    res.status(200).json({
      success: true,
      questions: questionsWithAnswers,
      total,
      page,
      limit,
      hasMore: skip + questions.length < total
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching questions",
      error: error.message
    });
  }
};

// Get announcements
export const getAnnouncements = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.id;

    // Check if user has access
    if (req.user.role === "participant") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });

      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event"
        });
      }
    }

    const announcements = await ForumMessage.find({
      event: eventId,
      messageType: "announcement",
      isDeleted: false
    })
      .populate("author", "firstName lastName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      announcements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching announcements",
      error: error.message
    });
  }
};

// Post message with type specification
export const postForumMessage = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content, messageType = "message", parentMessageId } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    // Validate messageType
    const validTypes = ["message", "question", "answer", "announcement"];
    if (!validTypes.includes(messageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid message type"
      });
    }

    // Only organizers and admins can post announcements
    if (messageType === "announcement") {
      if (req.user.role !== "organizer" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only organizers and admins can post announcements"
        });
      }

      const event = await Event.findById(eventId);
      if (req.user.role === "organizer" && event.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only post announcements for your own events"
        });
      }
    }

    // Only organizers and admins can post answers
    if (messageType === "answer") {
      if (req.user.role !== "organizer" && req.user.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Only organizers and admins can post answers"
        });
      }

      if (!parentMessageId) {
        return res.status(400).json({
          success: false,
          message: "Parent question ID is required for answers"
        });
      }

      // Verify parent is a question
      const parentQuestion = await ForumMessage.findById(parentMessageId);
      if (!parentQuestion || parentQuestion.messageType !== "question") {
        return res.status(404).json({
          success: false,
          message: "Parent question not found"
        });
      }

      // Check organizer owns event
      const event = await Event.findById(eventId);
      if (req.user.role === "organizer" && event.organizer.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: "You can only answer questions in your own events"
        });
      }
    }

    // Participants must be registered
    if (messageType === "message" || messageType === "question") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });

      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event to post messages"
        });
      }
    }

    // If replying to a thread, validate parent
    if (parentMessageId && messageType !== "answer") {
      const parentMessage = await ForumMessage.findById(parentMessageId);
      if (!parentMessage || parentMessage.event.toString() !== eventId) {
        return res.status(404).json({
          success: false,
          message: "Parent message not found"
        });
      }
    }

    const newMessage = new ForumMessage({
      event: eventId,
      author: userId,
      authorRole: req.user.role,
      content: content.trim(),
      parentMessage: parentMessageId || null,
      messageType,
      isPinned: messageType === "announcement" ? true : false,
      isQuestion: messageType === "question"
    });

    await newMessage.save();
    await newMessage.populate("author", "firstName lastName");

    const payload = {
      ...newMessage.toObject(),
      eventId,
      parentMessageId: parentMessageId || null
    };

    if (messageType === "announcement") {
      emitForumEvent(req, eventId, "new-announcement", payload);
    } else if (messageType === "question") {
      emitForumEvent(req, eventId, "new-question", payload);
    } else if (messageType === "answer") {
      emitForumEvent(req, eventId, "new-answer", payload);
    } else {
      emitForumEvent(req, eventId, "new-message", payload);
    }

    res.status(201).json({
      success: true,
      message: "Message posted successfully",
      data: newMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error posting message",
      error: error.message
    });
  }
};

// Mark question as answered
// Get message replies (threading)
export const getMessageReplies = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const userId = req.user.id;

    // Check authorization
    if (req.user.role === "participant") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });
      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event"
        });
      }
    }

    const replies = await ForumMessage.find({
      event: eventId,
      parentMessage: messageId,
      isDeleted: false
    })
      .populate("author", "firstName lastName")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      replies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching replies",
      error: error.message
    });
  }
};

// Add or remove reaction
export const toggleReaction = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user.id;

    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: "Emoji is required"
      });
    }

    // Check authorization
    if (req.user.role === "participant") {
      const participation = await Participation.findOne({
        event: eventId,
        participant: userId
      });
      if (!participation) {
        return res.status(403).json({
          success: false,
          message: "You must be registered for this event"
        });
      }
    }

    const message = await ForumMessage.findById(messageId);
    if (!message || message.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    // Find or create reaction for this emoji
    let emojiReaction = message.reactions.find(r => r.emoji === emoji);

    if (emojiReaction) {
      // Check if user already reacted
      const userReacted = emojiReaction.users.includes(userId);
      if (userReacted) {
        // Remove reaction
        emojiReaction.users = emojiReaction.users.filter(id => id.toString() !== userId);
        if (emojiReaction.users.length === 0) {
          message.reactions = message.reactions.filter(r => r.emoji !== emoji);
        }
      } else {
        // Add reaction
        emojiReaction.users.push(userId);
      }
    } else {
      // Create new reaction
      message.reactions.push({
        emoji,
        users: [userId]
      });
    }

    await message.save();
    await message.populate("author", "firstName lastName");

    emitForumEvent(req, eventId, "reaction-updated", {
      eventId,
      messageId,
      reactions: message.reactions
    });

    res.status(200).json({
      success: true,
      message: "Reaction updated",
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating reaction",
      error: error.message
    });
  }
};

// Delete message (organizer/admin only)
export const deleteForumMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const reason = req.body?.reason;
    const userId = req.user.id;

    // Only organizer and admin can delete
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizers and admins can delete messages"
      });
    }

    // Check if organizer owns the event
    if (req.user.role === "organizer") {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      // Compare both as strings to avoid ObjectId comparison issues
      const eventOwnerId = event.organizer.toString();
      const currentUserId = userId.toString();
      
      if (eventOwnerId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "You can only moderate messages in your own events"
        });
      }
    }

    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    message.isDeleted = true;
    message.deletedBy = userId;
    message.deletionReason = reason || "No reason provided";
    await message.save();

    emitForumEvent(req, eventId, "message-deleted", {
      eventId,
      messageId
    });

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
      data: message
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message
    });
  }
};

// Pin/Unpin message (organizer/admin only)
export const togglePinMessage = async (req, res) => {
  try {
    const { eventId, messageId } = req.params;
    const userId = req.user.id;

    // Only organizer and admin can pin
    if (req.user.role !== "organizer" && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Only organizers and admins can pin messages"
      });
    }

    // Check if organizer owns the event
    if (req.user.role === "organizer") {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: "Event not found"
        });
      }
      
      // Compare both as strings to avoid ObjectId comparison issues
      const eventOwnerId = event.organizer.toString();
      const currentUserId = userId.toString();
      
      if (eventOwnerId !== currentUserId) {
        return res.status(403).json({
          success: false,
          message: "You can only manage messages in your own events"
        });
      }
    }

    const message = await ForumMessage.findById(messageId);
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found"
      });
    }

    message.isPinned = !message.isPinned;
    await message.save();
    await message.populate("author", "firstName lastName");

    emitForumEvent(req, eventId, "message-pinned", {
      eventId,
      messageId,
      isPinned: message.isPinned
    });

    res.status(200).json({
      success: true,
      message: message.isPinned ? "Message pinned" : "Message unpinned",
      data: message
    });
  } catch (error) {
    console.error("Pin message error:", error);
    res.status(500).json({
      success: false,
      message: "Error toggling pin",
      error: error.message
    });
  }
};

// Post announcement (organizer/admin only)

