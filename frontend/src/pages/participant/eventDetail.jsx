import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const EventDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userParticipantType, setUserParticipantType] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    if (token && id) {
      fetchEventDetails();
      fetchUserProfile();
      checkRegistrationStatus();
    }
  }, [token, id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get("/events/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundEvent = response.data.events?.find(e => e._id === id);
      setEvent(foundEvent);
    } catch (error) {
      console.error("Error fetching event details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/participants/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserParticipantType(response.data.participant?.participantType || "");
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.get("/participants/my-events", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allRegistrations = [
        ...(response.data.upcoming || []),
        ...(response.data.completed || []),
        ...(response.data.cancelled || [])
      ];
      
      const registered = allRegistrations.some(p => p.event._id === id);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration", error);
    }
  };

  const handleRegister = async () => {
    if (registering) return;

    const confirmMsg = `Do you want to register for "${event.eventName}"?`;
    if (!window.confirm(confirmMsg)) return;

    setRegistering(true);
    try {
      const response = await api.post(
        `/participants/register/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Successfully registered for ${event.eventName}!\nTicket ID: ${response.data.ticketId}`);
      setIsRegistered(true);
      await checkRegistrationStatus();
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data?.message || "Failed to register for event";
      alert(`❌ ${errorMsg}`);
    } finally {
      setRegistering(false);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!event) return <div style={{ padding: "30px" }}>Event not found</div>;

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isLimitReached = event.registrationLimit > 0 && participantCount >= event.registrationLimit;
  
  const isEligible = 
    (event.eligibility === "ALL") ||
    (event.eligibility === "IIIT_ONLY" && userParticipantType === "IIIT") ||
    (event.eligibility === "NON_IIIT_ONLY" && userParticipantType === "NON_IIIT");

  const canRegister = !isRegistered && !isDeadlinePassed && !isLimitReached && isEligible;

  let registrationMessage = "";
  if (isRegistered) registrationMessage = "You are already registered for this event";
  else if (isDeadlinePassed) registrationMessage = "Registration deadline has passed";
  else if (!isEligible) registrationMessage = "You are not eligible for this event";
  else if (isLimitReached) registrationMessage = "Registration limit reached";

  return (
    <>
      <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
        <button onClick={() => navigate("/browse")} style={backButton}>
          ← Back to Browse
        </button>

        <div style={mainCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <h1 style={{ marginTop: 0 }}>{event.eventName}</h1>
            <span style={typeBadge}>{event.eventType}</span>
          </div>

          <p style={{ fontSize: "16px", color: "#555", lineHeight: "1.6", marginBottom: "30px" }}>
            {event.eventDescription}
          </p>

          <div style={infoGrid}>
            <div style={infoItem}>
              <strong>👥 Organizer</strong>
              <p>{event.organizer.firstName} {event.organizer.lastName}</p>
            </div>

            <div style={infoItem}>
              <strong>📅 Start Date</strong>
              <p>{new Date(event.eventStartDate).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>📅 End Date</strong>
              <p>{new Date(event.eventEndDate).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>⏰ Registration Deadline</strong>
              <p>{new Date(event.registrationDeadline).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>💰 Registration Fee</strong>
              <p>₹{event.registrationFee || 0}</p>
            </div>

            <div style={infoItem}>
              <strong>📝 Capacity</strong>
              <p>{event.registrationLimit || "Unlimited"}</p>
            </div>

            <div style={infoItem}>
              <strong>👤 Eligibility</strong>
              <p>{event.eligibility === "IIIT_ONLY" ? "IIIT Only" : event.eligibility === "NON_IIIT_ONLY" ? "Non-IIIT Only" : "All"}</p>
            </div>

            <div style={infoItem}>
              <strong>📊 Status</strong>
              <p style={{ textTransform: "capitalize" }}>{event.status}</p>
            </div>
          </div>

          {event.eventTags && event.eventTags.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <strong>🏷️ Tags:</strong>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                {event.eventTags.map((tag, idx) => (
                  <span key={idx} style={tagBadge}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {event.eventType === "MERCHANDISE" && event.merchandiseDetails && (
            <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <h3>Merchandise Details</h3>
              {event.merchandiseDetails.sizes && event.merchandiseDetails.sizes.length > 0 && (
                <p><strong>Available Sizes:</strong> {event.merchandiseDetails.sizes.join(", ")}</p>
              )}
              {event.merchandiseDetails.colors && event.merchandiseDetails.colors.length > 0 && (
                <p><strong>Available Colors:</strong> {event.merchandiseDetails.colors.join(", ")}</p>
              )}
              {event.merchandiseDetails.stock && (
                <p><strong>Stock:</strong> {event.merchandiseDetails.stock}</p>
              )}
              {event.merchandiseDetails.purchaseLimitPerUser && (
                <p><strong>Purchase Limit:</strong> {event.merchandiseDetails.purchaseLimitPerUser} per person</p>
              )}
            </div>
          )}

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            {registrationMessage && (
              <p style={{ 
                padding: "12px", 
                backgroundColor: isRegistered ? "#d4edda" : "#f8d7da",
                color: isRegistered ? "#155724" : "#721c24",
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                {registrationMessage}
              </p>
            )}

            <button
              onClick={handleRegister}
              disabled={!canRegister || registering}
              style={{
                ...registerButton,
                backgroundColor: isRegistered ? "#28a745" : "#2E1A47",
                opacity: canRegister ? 1 : 0.6,
                cursor: canRegister ? "pointer" : "not-allowed"
              }}
            >
              {isRegistered ? "✓ Registered" : registering ? "Registering..." : "Register Now"}
            </button>
          </div>
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

const mainCard = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const typeBadge = {
  backgroundColor: "#2E1A47",
  color: "white",
  padding: "6px 16px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500"
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px"
};

const infoItem = {
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const tagBadge = {
  backgroundColor: "#17a2b8",
  color: "white",
  padding: "6px 12px",
  borderRadius: "12px",
  fontSize: "12px"
};

const registerButton = {
  padding: "15px 40px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  minWidth: "200px"
};

export default EventDetail;
