import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

const ForumMessageCard = ({ 
  message, 
  onDelete, 
  onAddReaction, 
  onReply,
  onPin,
  isOrganizer = false,
  isReply = false,
  eventId 
}) => {
  const { user } = useContext(AuthContext);
  const [showReactions, setShowReactions] = useState(false);

  const isOwnMessage = user?.id === message.author?._id;
  const isOrganizerOrAdmin = isOrganizer || user?.role === "admin";
  const canDelete = Boolean(onDelete) && isOrganizerOrAdmin;
  const canPin = Boolean(onPin) && isOrganizerOrAdmin && !isReply;
  const canReact = Boolean(onAddReaction);
  const commonEmojis = ["👍", "❤️", "😂", "🔥", "✨", "👏"];

  if (message.isDeleted) {
    return (
      <div style={deletedMessageStyle}>
        <p style={{ margin: 0, color: "#999", fontSize: "13px", fontStyle: "italic" }}>
          [Message deleted]
        </p>
      </div>
    );
  }

  return (
    <div style={{ ...messageCardStyle, marginLeft: isReply ? "15px" : "0" }}>
      {/* Author info */}
      <div style={authorStyle}>
        <span style={{ fontWeight: 500, fontSize: "13px" }}>
          {message.author?.firstName} {message.author?.lastName}
        </span>
        {message.authorRole === "organizer" && (
          <span style={badgeStyle}>Organizer</span>
        )}
        {message.authorRole === "admin" && (
          <span style={{ ...badgeStyle, backgroundColor: "#dc3545" }}>Admin</span>
        )}
        <small style={{ color: "#999", marginLeft: "auto", fontSize: "12px" }}>
          {new Date(message.createdAt).toLocaleString()}
        </small>
      </div>

      {/* Message content */}
      <div style={contentStyle}>
        <p style={{ margin: 0, fontSize: "13px", lineHeight: "1.5", color: "#333" }}>
          {message.content}
        </p>
      </div>

      {/* Reactions */}
      {canReact && message.reactions && message.reactions.length > 0 && (
        <div style={reactionsDisplayStyle}>
          {message.reactions.map((reaction) => (
            <button
              key={reaction.emoji}
              onClick={() => onAddReaction(reaction.emoji)}
              style={reactionButtonStyle}
              type="button"
            >
              {reaction.emoji} {reaction.users.length}
            </button>
          ))}
        </div>
      )}

      {/* Actions */}
      <div style={actionsStyle}>
        <div style={actionButtonsStyle}>
          {canReact && (
            <button
              onClick={() => setShowReactions(!showReactions)}
              style={actionButton}
              type="button"
              title="React"
            >
              😊
            </button>
          )}

          {onReply && !isReply && (
            <button
              onClick={onReply}
              style={actionButton}
              type="button"
              title="Reply"
            >
              💬
            </button>
          )}

          {canPin && (
            <button
              onClick={() => onPin()}
              style={{ ...actionButton, color: message.isPinned ? "#ffc107" : "#666" }}
              type="button"
              title={message.isPinned ? "Unpin" : "Pin"}
            >
              {message.isPinned ? "📌" : "📍"}
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => onDelete()}
              style={{ ...actionButton, color: "#dc3545" }}
              type="button"
              title="Delete"
            >
              🗑️
            </button>
          )}
        </div>

        {/* Emoji picker */}
        {canReact && showReactions && (
          <div style={emojiPickerStyle}>
            {commonEmojis.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onAddReaction(emoji);
                  setShowReactions(false);
                }}
                style={emojiButtonStyle}
                type="button"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const messageCardStyle = {
  padding: "12px",
  backgroundColor: "#fff",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  marginBottom: "8px"
};

const deletedMessageStyle = {
  padding: "12px",
  backgroundColor: "#f5f5f5",
  borderRadius: "8px",
  border: "1px solid #e0e0e0",
  marginBottom: "8px"
};

const authorStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  marginBottom: "8px",
  flexWrap: "wrap"
};

const badgeStyle = {
  display: "inline-block",
  padding: "2px 8px",
  backgroundColor: "#007bff",
  color: "white",
  fontSize: "10px",
  borderRadius: "12px",
  fontWeight: 500
};

const contentStyle = {
  marginBottom: "8px"
};

const reactionsDisplayStyle = {
  display: "flex",
  gap: "6px",
  flexWrap: "wrap",
  marginBottom: "8px"
};

const reactionButtonStyle = {
  padding: "4px 8px",
  border: "1px solid #e0e0e0",
  borderRadius: "6px",
  background: "#f5f5f5",
  cursor: "pointer",
  fontSize: "12px",
  transition: "all 0.2s"
};

const actionsStyle = {
  position: "relative"
};

const actionButtonsStyle = {
  display: "flex",
  gap: "6px"
};

const actionButton = {
  padding: "4px 6px",
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: "14px",
  opacity: 0.6,
  transition: "opacity 0.2s"
};

const emojiPickerStyle = {
  display: "flex",
  gap: "4px",
  padding: "8px",
  backgroundColor: "#f5f5f5",
  borderRadius: "6px",
  marginTop: "8px",
  flexWrap: "wrap"
};

const emojiButtonStyle = {
  padding: "6px 8px",
  border: "none",
  borderRadius: "4px",
  background: "#fff",
  cursor: "pointer",
  fontSize: "16px",
  transition: "all 0.2s"
};

export default ForumMessageCard;
