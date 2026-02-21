import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ForumMessageInput from "./ForumMessageInput";

const AnnouncementsTab = ({ eventId, socket, isOrganizer }) => {
  const { token } = useContext(AuthContext);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAnnouncements();

    // Socket.IO listener for new announcements
    if (socket) {
      socket.on("new-announcement", (newAnnouncement) => {
        if (newAnnouncement.eventId === eventId) {
          setAnnouncements(prev => [newAnnouncement, ...prev]);
        }
      });

      socket.on("message-deleted", (data) => {
        if (data.eventId === eventId) {
          setAnnouncements(prev =>
            prev.filter(a => a._id !== data.messageId)
          );
        }
      });

      return () => {
        socket.off("new-announcement");
        socket.off("message-deleted");
      };
    }
  }, [eventId, socket]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/events/${eventId}/forum/announcements`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAnnouncements(response.data.announcements);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handlePostAnnouncement = async (content) => {
    try {
      const response = await api.post(
        `/api/events/${eventId}/forum/messages`,
        {
          content,
          messageType: "announcement"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const useRealtime = Boolean(socket && socket.connected);
      if (!useRealtime) {
        setAnnouncements(prev => [response.data.data, ...prev]);
      }

    } catch (err) {
      setError(err.response?.data?.message || "Failed to post announcement");
    }
  };

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      try {
        await api.delete(
          `/api/events/${eventId}/forum/messages/${announcementId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setAnnouncements(prev =>
          prev.filter(a => a._id !== announcementId)
        );

      } catch (err) {
        setError(err.response?.data?.message || "Failed to delete announcement");
      }
    }
  };

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    gap: "15px"
  };

  const announcementsContainerStyle = {
    flex: 1,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column-reverse",
    gap: "12px",
    paddingRight: "5px"
  };

  const announcementCardStyle = {
    backgroundColor: "#fff9e6",
    padding: "15px",
    borderRadius: "8px",
    border: "2px solid #ffc107",
    borderTop: "4px solid #ffc107"
  };

  const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
  };

  const authorStyle = {
    fontSize: "13px",
    fontWeight: "600",
    color: "#333"
  };

  const badgeStyle = {
    display: "inline-block",
    backgroundColor: "#ffc107",
    color: "#333",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    marginLeft: "8px"
  };

  const contentStyle = {
    fontSize: "14px",
    color: "#333",
    margin: "0",
    lineHeight: "1.5",
    whiteSpace: "pre-wrap"
  };

  const timestampStyle = {
    fontSize: "11px",
    color: "#999",
    marginTop: "8px"
  };

  const deleteButtonStyle = {
    fontSize: "12px",
    color: "#dc3545",
    backgroundColor: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "4px 8px"
  };

  const inputContainerStyle = {
    borderTop: "2px solid #ffc107",
    paddingTop: "15px",
    flexShrink: 0
  };

  const noAnnouncementsStyle = {
    textAlign: "center",
    color: "#999",
    padding: "30px 20px",
    fontSize: "14px"
  };

  return (
    <div style={containerStyle}>
      {error && (
        <div style={{
          color: "red",
          fontSize: "12px",
          backgroundColor: "#ffe0e0",
          padding: "10px",
          borderRadius: "5px"
        }}>
          {error}
        </div>
      )}

      <div style={announcementsContainerStyle}>
        {loading ? (
          <p style={{ textAlign: "center", color: "#999" }}>Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <div style={noAnnouncementsStyle}>
            📢 No announcements yet
          </div>
        ) : (
          announcements.map(announcement => (
            <div key={announcement._id} style={announcementCardStyle}>
              <div style={headerStyle}>
                <div>
                  <span style={authorStyle}>
                    📢 {announcement.author?.firstName} {announcement.author?.lastName}
                  </span>
                  <span style={badgeStyle}>
                    {announcement.authorRole.toUpperCase()}
                  </span>
                </div>
                {isOrganizer && (
                  <button
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                    style={deleteButtonStyle}
                  >
                    Delete
                  </button>
                )}
              </div>

              <p style={contentStyle}>
                {announcement.content}
              </p>

              <div style={timestampStyle}>
                {new Date(announcement.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      {isOrganizer && (
        <div style={inputContainerStyle}>
          <p style={{ fontSize: "12px", color: "#666", margin: "0 0 10px 0", fontWeight: "600" }}>
            📢 Post Announcement
          </p>
          <ForumMessageInput
            onSubmit={handlePostAnnouncement}
            placeholder="Important announcement for all participants..."
          />
        </div>
      )}

      {!isOrganizer && (
        <div style={inputContainerStyle}>
          <p style={{ fontSize: "12px", color: "#999", margin: "0" }}>
            You can view announcements from the organizer here.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnnouncementsTab;
