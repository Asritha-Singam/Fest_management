import { useState } from "react";
import ForumModal from "./ForumModal";

const ForumButton = ({ eventId, eventName, isOrganizer = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const handleOpenForum = async () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpenForum}
        style={forumButtonStyle}
        title="Open discussion forum"
      >
        💬
        {unreadCount > 0 && (
          <span style={badgeStyle}>{unreadCount}</span>
        )}
      </button>

      {isModalOpen && (
        <ForumModal
          eventId={eventId}
          eventName={eventName}
          onClose={() => setIsModalOpen(false)}
          isOrganizer={isOrganizer}
        />
      )}
    </>
  );
};

const forumButtonStyle = {
  position: "relative",
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #e3e3e3",
  background: "#fff",
  cursor: "pointer",
  fontSize: "18px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
  transition: "all 0.2s ease",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minWidth: "44px",
  height: "44px"
};

const badgeStyle = {
  position: "absolute",
  top: "-6px",
  right: "-6px",
  backgroundColor: "#dc3545",
  color: "white",
  borderRadius: "50%",
  width: "20px",
  height: "20px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "11px",
  fontWeight: "bold"
};

export default ForumButton;
