import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import ForumButton from "../../components/ForumButton";

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });

  const [activeTab, setActiveTab] = useState("normal");
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      if (!token) return;

      try {
        const res = await api.get("/participants/my-events", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setEvents(res.data);
        }
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };

    fetchEvents();
  }, [token]);

  const handleCancelRegistration = async (participationId) => {
    if (!window.confirm("Are you sure you want to cancel this registration?")) {
      return;
    }

    setCancellingId(participationId);
    try {
      const res = await api.delete(`/participants/cancel-registration/${participationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        alert("Registration cancelled successfully");
        // Refresh the events list
        const refreshRes = await api.get("/participants/my-events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (refreshRes.data.success) {
          setEvents(refreshRes.data);
        }
      }
    } catch (error) {
      console.error("Error cancelling registration", error);
      alert(error.response?.data?.message || "Failed to cancel registration");
    } finally {
      setCancellingId(null);
    }
  };

  const categorizeEvents = (eventList) => {
    const normal = eventList.filter(p => p.event.eventType === "NORMAL");
    const merchandise = eventList.filter(p => p.event.eventType === "MERCHANDISE");
    return { normal, merchandise };
  };

  const renderEventCard = (participation) => (
    <div key={participation._id} style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>{participation.event.eventName}</h3>
      
      <div style={{ fontSize: "14px", color: "#666", marginBottom: "15px" }}>
        <p style={{ margin: "5px 0" }}>
          <strong>Type:</strong> {participation.event.eventType}
        </p>
        <p style={{ margin: "5px 0" }}>
          <strong>Organizer:</strong> {participation.event.organizer?.firstName} {participation.event.organizer?.lastName}
        </p>
        <p style={{ margin: "5px 0" }}>
          <strong>Date:</strong> {new Date(participation.event.eventStartDate).toLocaleDateString()} - {new Date(participation.event.eventEndDate).toLocaleDateString()}
        </p>
        <p style={{ margin: "5px 0" }}>
          <strong>Ticket ID:</strong> {participation.ticketId}
        </p>
        {participation.teamName && (
          <p style={{ margin: "5px 0" }}>
            <strong>Team:</strong> {participation.teamName}
          </p>
        )}
      </div>

      <div style={cardFooter}>
        <div style={{ display: "flex", gap: "10px", flex: 1 }}>
          <button
            onClick={() => navigate(`/ticket/${participation._id}`, { state: participation })}
            style={viewTicketButton}
          >
            View Ticket
          </button>
          <button
            onClick={() => handleCancelRegistration(participation._id)}
            disabled={cancellingId === participation._id}
            style={{
              ...cancelButton,
              opacity: cancellingId === participation._id ? 0.6 : 1,
              cursor: cancellingId === participation._id ? "not-allowed" : "pointer"
            }}
          >
            {cancellingId === participation._id ? "Cancelling..." : "Cancel"}
          </button>
        </div>
        <ForumButton 
          eventId={participation.event._id} 
          eventName={participation.event.eventName}
          isOrganizer={false}
        />
        {participation.qrCodeData && (
          <button
            type="button"
            onClick={() => navigate(`/ticket/${participation._id}`, { state: participation })}
            style={qrPreviewButton}
            aria-label="View ticket QR code"
          >
            <img
              src={participation.qrCodeData}
              alt="Ticket QR code"
              style={qrPreviewImage}
            />
          </button>
        )}
      </div>
    </div>
  );

  const renderHistory = () => {
    let list = [];

    if (activeTab === "normal") {
      list = [...events.completed, ...events.cancelled].filter(p => p.event.eventType === "NORMAL");
    } else if (activeTab === "merchandise") {
      list = [...events.completed, ...events.cancelled].filter(p => p.event.eventType === "MERCHANDISE");
    } else if (activeTab === "completed") {
      list = events.completed;
    } else if (activeTab === "cancelled") {
      list = events.cancelled;
    }

    if (list.length === 0) return <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>No events in this category</p>;

    return (
      <div style={gridStyle}>
        {list.map((p) => (
          <div key={p._id} style={cardStyle}>
            <h4 style={{ marginTop: 0 }}>{p.event.eventName}</h4>
            <p style={{ fontSize: "13px", color: "#666" }}>
              Type: {p.event.eventType}
            </p>
            <p style={{ fontSize: "13px", color: "#666" }}>
              Status: <span style={{ 
                color: p.status === "Cancelled" ? "#dc3545" : "#28a745",
                fontWeight: "500"
              }}>{p.status}</span>
            </p>
            <p style={{ fontSize: "13px", color: "#666" }}>
              Ticket ID: {p.ticketId}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div style={{ padding: "30px" }}>
        <h1>My Events Dashboard</h1>

        {/* Upcoming Section */}
        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ borderBottom: "2px solid #2E1A47", paddingBottom: "10px" }}>
            Upcoming Events
          </h2>
          {events.upcoming.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", backgroundColor: "#f8f9fa", borderRadius: "8px", color: "#666" }}>
              No upcoming events. <a href="/browse" style={{ color: "#2E1A47" }}>Browse events</a> to register!
            </p>
          ) : (
            <div style={gridStyle}>
              {events.upcoming.map(renderEventCard)}
            </div>
          )}
        </section>

        {/* History Tabs */}
        <section>
          <h2 style={{ borderBottom: "2px solid #2E1A47", paddingBottom: "10px" }}>
            Participation History
          </h2>

          <div style={tabContainer}>
            <button 
              onClick={() => setActiveTab("normal")}
              style={{
                ...tabButton,
                backgroundColor: activeTab === "normal" ? "#2E1A47" : "white",
                color: activeTab === "normal" ? "white" : "#2E1A47"
              }}
            >
              Normal Events
            </button>
            <button 
              onClick={() => setActiveTab("merchandise")}
              style={{
                ...tabButton,
                backgroundColor: activeTab === "merchandise" ? "#2E1A47" : "white",
                color: activeTab === "merchandise" ? "white" : "#2E1A47"
              }}
            >
              Merchandise
            </button>
            <button 
              onClick={() => setActiveTab("completed")}
              style={{
                ...tabButton,
                backgroundColor: activeTab === "completed" ? "#2E1A47" : "white",
                color: activeTab === "completed" ? "white" : "#2E1A47"
              }}
            >
              Completed
            </button>
            <button 
              onClick={() => setActiveTab("cancelled")}
              style={{
                ...tabButton,
                backgroundColor: activeTab === "cancelled" ? "#2E1A47" : "white",
                color: activeTab === "cancelled" ? "white" : "#2E1A47"
              }}
            >
              Cancelled/Rejected
            </button>
          </div>

          <div style={{ marginTop: "20px" }}>
            {renderHistory()}
          </div>
        </section>
      </div>
    </>
  );
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const cardFooter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "16px"
};

const qrPreviewButton = {
  border: "1px solid #e3e3e3",
  borderRadius: "10px",
  padding: "6px",
  background: "#fff",
  cursor: "pointer",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)"
};

const qrPreviewImage = {
  display: "block",
  width: "90px",
  height: "90px",
  objectFit: "contain"
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const viewTicketButton = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#2E1A47",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const cancelButton = {
  flex: 1,
  padding: "10px",
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s"
};

const tabContainer = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
  flexWrap: "wrap"
};

const tabButton = {
  padding: "10px 20px",
  border: "2px solid #2E1A47",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500",
  transition: "all 0.2s"
};

export default Dashboard;
