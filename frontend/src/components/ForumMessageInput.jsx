import { useState } from "react";

const ForumMessageInput = ({ 
  onSubmit, 
  onCancel, 
  placeholder = "Type your message...",
  isLoading = false 
}) => {
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      return;
    }

    try {
      setIsPosting(true);
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      console.error("Error posting message:", err);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle}>
      <div style={inputWrapperStyle}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder}
          disabled={isPosting || isLoading}
          style={textareaStyle}
          rows={3}
        />
        <div style={buttonContainerStyle}>
          <button
            type="submit"
            disabled={isPosting || isLoading || !content.trim()}
            style={{
              ...submitButtonStyle,
              opacity: isPosting || isLoading || !content.trim() ? 0.6 : 1,
              cursor: isPosting || isLoading || !content.trim() ? "not-allowed" : "pointer"
            }}
          >
            {isPosting ? "Posting..." : "Post"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={cancelButtonStyle}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </form>
  );
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  width: "100%"
};

const inputWrapperStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px"
};

const textareaStyle = {
  padding: "10px",
  border: "1px solid #d0d0d0",
  borderRadius: "6px",
  fontSize: "13px",
  fontFamily: "Arial, sans-serif",
  resize: "vertical",
  backgroundColor: "#fff",
  color: "#333",
  minHeight: "60px"
};

const buttonContainerStyle = {
  display: "flex",
  gap: "8px",
  justifyContent: "flex-end"
};

const submitButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "13px"
};

const cancelButtonStyle = {
  padding: "8px 16px",
  backgroundColor: "#e9ecef",
  color: "#333",
  border: "1px solid #dee2e6",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: 500,
  fontSize: "13px"
};

export default ForumMessageInput;
