import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const OrganizerDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [organizer, setOrganizer] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    if (token && id) {
      fetchOrganizerDetails();
      fetchOrganizerEvents();
    }
  }, [token, id]);

  const fetchOrganizerDetails = async () => {
    try {
      const response = await api.get("/participants/organizers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const org = response.data.organizers?.find(o => o._id === id);
      setOrganizer(org);
    } catch (error) {
      console.error("Error fetching organizer details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrganizerEvents = async () => {
    try {
      const response = await api.get(`/events/organizer/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allEvents = response.data.events || [];

      const now = new Date();
      const upcoming = allEvents.filter(e => new Date(e.eventStartDate) > now);
      const past = allEvents.filter(e => new Date(e.eventEndDate) < now);

      setEvents({ upcoming, past });
    } catch (error) {
      console.error("Error fetching organizer events", error);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!organizer) return <div style={{ padding: "30px" }}>Organizer not found</div>;

  const displayEvents = activeTab === "upcoming" ? events.upcoming : events.past;

  return (
    <>
      <div style={{ padding: "30px" }}>
        <button onClick={() => navigate("/organizers")} style={backButton}>
          ← Back to Organizers
        </button>

        <div style={headerCard}>
          <h1 style={{ marginTop: 0 }}>
            {organizer.firstName} {organizer.lastName}
          </h1>

          {organizer.category && (
            <div style={{ marginBottom: "15px" }}>
              <span style={categoryBadge}>{organizer.category}</span>
            </div>
          )}

          <p style={{ fontSize: "16px", color: "#555", marginBottom: "15px" }}>
            {organizer.description || "No description available"}
          </p>

          <div style={{ display: "flex", gap: "20px", fontSize: "14px", color: "#666", flexWrap: "wrap" }}>
            <p style={{ margin: 0 }}>
              <strong>📧 Email:</strong> {organizer.contactEmail || "-"}
            </p>
            <p style={{ margin: 0 }}>
              <strong>📞 Contact:</strong> {organizer.contactNumber || "-"}
            </p>
          </div>
        </div>

        <div style={{ marginTop: "40px" }}>
          <h2>Events by this Organizer</h2>

          <div style={tabContainer}>
            <button
              onClick={() => setActiveTab("upcoming")}
              style={{
                ...tabButton,
                borderBottom: activeTab === "upcoming" ? "3px solid #2E1A47" : "none"
              }}
            >
              Upcoming ({events.upcoming?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("past")}
              style={{
                ...tabButton,
                borderBottom: activeTab === "past" ? "3px solid #2E1A47" : "none"
              }}
            >
              Past ({events.past?.length || 0})
            </button>
          </div>

          {displayEvents?.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#666" }}>
              No {activeTab} events found
            </p>
          ) : (
            <div style={gridStyle}>
              {displayEvents?.map((event) => (
                <div key={event._id} style={cardStyle}>
                  <h3 style={{ marginTop: 0 }}>{event.eventName}</h3>
                  
                  <p style={{ fontSize: "14px", color: "#666", minHeight: "40px" }}>
                    {event.eventDescription}
                  </p>

                  <div style={{ marginTop: "15px", fontSize: "13px" }}>
                    <p style={{ margin: "5px 0" }}>
                      <strong>📅 Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>💰 Fee:</strong> ₹{event.registrationFee || 0}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>📝 Type:</strong> {event.eventType}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/event/${event._id}`)}
                    style={viewEventButton}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const backButton = {
  backgroundColor: "white",
  border: "1px solid #ddd",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  marginBottom: "20px"
};

const headerCard = {
  backgroundColor: "#f8f9fa",
  padding: "30px",
  borderRadius: "8px",
  border: "1px solid #ddd"
};

const categoryBadge = {
  backgroundColor: "#17a2b8",
  color: "white",
  padding: "6px 14px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500"
};

const tabContainer = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
  borderBottom: "1px solid #ddd"
};

const tabButton = {
  backgroundColor: "transparent",
  border: "none",
  padding: "12px 20px",
  cursor: "pointer",
  fontSize: "15px",
  fontWeight: "500",
  color: "#2E1A47"
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const viewEventButton = {
  width: "100%",
  padding: "10px",
  marginTop: "15px",
  backgroundColor: "#2E1A47",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

export default OrganizerDetail;
