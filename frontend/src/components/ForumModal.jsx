import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import InteractTab from "./InteractTab";
import QATab from "./QATab";
import AnnouncementsTab from "./AnnouncementsTab";

const ForumModal = ({ eventId, eventName, onClose, isOrganizer }) => {
  const { token } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("interact");
  const [socket, setSocket] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [tabAlerts, setTabAlerts] = useState({
    interact: 0,
    qa: 0,
    announcements: 0
  });

  // Initialize Socket.IO connection
  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const newSocket = io(backendUrl, {
      auth: {
        token
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    newSocket.on("connect", () => {
      console.log("Connected to forum server");
      newSocket.emit("join-forum", eventId);
      setIsConnecting(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      setIsConnecting(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from forum server");
      setIsConnecting(true);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.emit("leave-forum", eventId);
        newSocket.disconnect();
      }
    };
  }, [eventId, token]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = () => {
      if (activeTab !== "interact") {
        setTabAlerts(prev => ({ ...prev, interact: prev.interact + 1 }));
      }
    };

    const handleNewQuestion = () => {
      if (activeTab !== "qa") {
        setTabAlerts(prev => ({ ...prev, qa: prev.qa + 1 }));
      }
    };

    const handleNewAnswer = () => {
      if (activeTab !== "qa") {
        setTabAlerts(prev => ({ ...prev, qa: prev.qa + 1 }));
      }
    };

    const handleNewAnnouncement = () => {
      if (activeTab !== "announcements") {
        setTabAlerts(prev => ({ ...prev, announcements: prev.announcements + 1 }));
      }
    };

    socket.on("new-message", handleNewMessage);
    socket.on("new-question", handleNewQuestion);
    socket.on("new-answer", handleNewAnswer);
    socket.on("new-announcement", handleNewAnnouncement);

    return () => {
      socket.off("new-message", handleNewMessage);
      socket.off("new-question", handleNewQuestion);
      socket.off("new-answer", handleNewAnswer);
      socket.off("new-announcement", handleNewAnnouncement);
    };
  }, [socket, activeTab]);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setTabAlerts(prev => ({
      ...prev,
      [tab]: 0
    }));
  };

  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    display: "flex",
    justifyContent: "flex-end",
    zIndex: 1000,
    animation: "slideIn 0.3s ease-out"
  };

  const modalStyle = {
    width: "450px",
    height: "100vh",
    backgroundColor: "#fff",
    display: "flex",
    flexDirection: "column",
    boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.2)",
    animation: "slideInRight 0.3s ease-out"
  };

  const headerStyle = {
    padding: "16px",
    borderBottom: "1px solid #e0e0e0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexShrink: 0
  };

  const titleStyle = {
    margin: 0,
    fontSize: "18px",
    fontWeight: "600",
    color: "#333"
  };

  const subtitleStyle = {
    margin: "4px 0 0 0",
    fontSize: "12px",
    color: "#999"
  };

  const closeButtonStyle = {
    backgroundColor: "transparent",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    color: "#666",
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  const tabsContainerStyle = {
    display: "flex",
    borderBottom: "2px solid #e0e0e0",
    backgroundColor: "#fafafa",
    flexShrink: 0
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: "12px 16px",
    border: "none",
    backgroundColor: isActive ? "#fff" : "transparent",
    borderBottom: isActive ? "3px solid #007bff" : "none",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: isActive ? "600" : "500",
    color: isActive ? "#007bff" : "#666",
    transition: "all 0.2s ease"
  });

  const contentStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden"
  };

  const statusStyle = {
    padding: "8px 12px",
    fontSize: "11px",
    color: isConnecting ? "#dc3545" : "#28a745",
    backgroundColor: isConnecting ? "#fff5f5" : "#f0fff0",
    justifyContent: "center",
    display: isConnecting ? "flex" : "none",
    alignItems: "center",
    gap: "6px"
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={titleStyle}>💬 Event Forum</h2>
            <p style={subtitleStyle}>{eventName}</p>
          </div>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close forum">
            ✕
          </button>
        </div>

        {/* Connection Status */}
        {isConnecting && (
          <div style={statusStyle}>
            <span>⚠️</span>
            <span>Connecting to forum...</span>
          </div>
        )}

        {!isConnecting && (
          <div style={{ ...statusStyle, display: "flex", color: "#28a745", backgroundColor: "#f0fff0" }}>
            <span>✓</span>
            <span>Real-time connected</span>
          </div>
        )}

        {/* Tabs */}
        <div style={tabsContainerStyle}>
          <button
            style={tabButtonStyle(activeTab === "interact")}
            onClick={() => handleTabSwitch("interact")}
          >
            💬 Interact{tabAlerts.interact > 0 ? ` (${tabAlerts.interact})` : ""}
          </button>
          <button
            style={tabButtonStyle(activeTab === "qa")}
            onClick={() => handleTabSwitch("qa")}
          >
            ❓ Q&A{tabAlerts.qa > 0 ? ` (${tabAlerts.qa})` : ""}
          </button>
          <button
            style={tabButtonStyle(activeTab === "announcements")}
            onClick={() => handleTabSwitch("announcements")}
          >
            📢 Announcements{tabAlerts.announcements > 0 ? ` (${tabAlerts.announcements})` : ""}
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {activeTab === "interact" && (
            <InteractTab eventId={eventId} socket={socket} isOrganizer={isOrganizer} />
          )}

          {activeTab === "qa" && (
            <QATab eventId={eventId} socket={socket} isOrganizer={isOrganizer} />
          )}

          {activeTab === "announcements" && (
            <AnnouncementsTab eventId={eventId} socket={socket} isOrganizer={isOrganizer} />
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ForumModal;
