import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ForumMessageCard from "./ForumMessageCard";

const ForumMessageList = ({ messages, onMessagesUpdate, eventId }) => {
  const { token } = useContext(AuthContext);
  const [expandedReplies, setExpandedReplies] = useState({});

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        const reason = window.prompt("Reason for deletion (optional):");
        await api.delete(
          `/events/${eventId}/forum/messages/${messageId}`,
          {
            data: { reason: reason || null },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // Update message to show as deleted
        setMessages(messages =>
          messages.map(m =>
            m._id === messageId ? { ...m, isDeleted: true } : m
          )
        );
      } catch (error) {
        alert(error.response?.data?.message || "Failed to delete message");
      }
    }
  };

  const handlePinMessage = async (messageId) => {
    try {
      await api.patch(
        `/events/${eventId}/forum/messages/${messageId}/pin`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update message state
      onMessagesUpdate(messages =>
        messages.map(m =>
          m._id === messageId ? { ...m, isPinned: !m.isPinned } : m
        )
      );
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update message");
    }
  };

  const handleAddReaction = async (messageId, emoji) => {
    try {
      const res = await api.post(
        `/events/${eventId}/forum/messages/${messageId}/reaction`,
        { emoji },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        // Update message with new reactions
        onMessagesUpdate(messages =>
          messages.map(m =>
            m._id === messageId ? res.data.data : m
          )
        );
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const setMessages = onMessagesUpdate;

  return (
    <div style={messageListStyle}>
      {messages.map((message) => (
        <div key={message._id} style={messageContainerStyle}>
          <ForumMessageCard
            message={message}
            onDelete={handleDeleteMessage}
            onPin={handlePinMessage}
            onReaction={handleAddReaction}
            eventId={eventId}
          />

          {/* Replies section can be expanded here later */}
        </div>
      ))}
    </div>
  );
};

const messageListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px"
};

const messageContainerStyle = {
  borderBottom: "1px solid #f0f0f0",
  paddingBottom: "12px"
};

export default ForumMessageList;
