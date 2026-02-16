import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const BrowseEvents = () => {
    const { token } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [eventType, setEventType] = useState("");
    const [viewMode, setViewMode] = useState("recommended"); // "recommended" or "all"
    const [userInterests, setUserInterests] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState(new Set());
    const [loading, setLoading] = useState(false);
    const [userParticipantType, setUserParticipantType] = useState("");
    const [eventParticipantCounts, setEventParticipantCounts] = useState({});


    useEffect(() => {
      if (token) {
        fetchUserProfile();
        fetchMyRegistrations();
        fetchRecommendedEvents();
      }
    }, [token]);

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

    const fetchMyRegistrations = async () => {
      if (!token) return;
      
      try {
        const response = await api.get("/participants/my-events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const allRegistrations = [
          ...(response.data.upcoming || []),
          ...(response.data.completed || []),
          ...(response.data.cancelled || [])
        ];
        
        const eventIds = allRegistrations.map(participation => participation.event._id);
        setRegisteredEvents(new Set(eventIds));
      } catch (error) {
        console.error("Error fetching registered events", error);
      }
    };

    const fetchParticipantCounts = async (eventIds) => {
      try {
        // Fetch participant count for each event
        const counts = {};
        for (const eventId of eventIds) {
          const response = await api.get(`/organizer/events/${eventId}/participants`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          counts[eventId] = response.data.count || 0;
        }
        setEventParticipantCounts(counts);
      } catch (error) {
        console.error("Error fetching participant counts", error);
      }
    };

    const fetchRecommendedEvents = async () => {
      if (!token) return;
      
      try {
        const response = await api.get("/participants/recommended-events", {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEvents(response.data.events || []);
        setUserInterests(response.data.userInterests || []);
        setViewMode("recommended");
        
        // Fetch participant counts for these events
        if (response.data.events && response.data.events.length > 0) {
          fetchParticipantCounts(response.data.events.map(e => e._id));
        }
      } catch (error) {
        console.error("Error fetching recommended events", error);
        // Fallback to all events if recommendations fail
        fetchAllEvents();
      }
    };

    const fetchAllEvents = async (searchQuery = "", type = "") => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/events/all?search=${searchQuery}&type=${type}`
        );
        const data = await response.json();
        setEvents(data.events || []);
        setViewMode("all");
        
        // Fetch participant counts for these events
        if (data.events && data.events.length > 0) {
          fetchParticipantCounts(data.events.map(e => e._id));
        }
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };


    const handleSearch = () => {
       fetchAllEvents(search, eventType);
   };

   const handleRegister = async (eventId, eventName) => {
     if (loading) return;

     const confirmMsg = `Do you want to register for "${eventName}"?`;
     if (!window.confirm(confirmMsg)) return;

     setLoading(true);
     try {
       const response = await api.post(
         `/participants/register/${eventId}`,
         {},
         {
           headers: { Authorization: `Bearer ${token}` }
         }
       );

       alert(`✅ Successfully registered for ${eventName}!\nTicket ID: ${response.data.ticketId}`);
       setRegisteredEvents(prev => new Set([...prev, eventId]));
       
       // Refresh registered events to ensure persistence
       await fetchMyRegistrations();
     } catch (error) {
       console.error("Registration error:", error);
       const errorMsg = error.response?.data?.message || "Failed to register for event";
       alert(`❌ ${errorMsg}`);
     } finally {
       setLoading(false);
     }
   };

   return (
    <div>
      <div style={{ padding: "30px" }}>
        <div style={{ marginBottom: "30px" }}>
          <h2>Browse Events</h2>
          
          {/* View Mode Toggle */}
          <div style={styles.viewToggle}>
            <button
              onClick={fetchRecommendedEvents}
              style={{
                ...styles.toggleButton,
                backgroundColor: viewMode === "recommended" ? "#2E1A47" : "white",
                color: viewMode === "recommended" ? "white" : "#2E1A47"
              }}
            >
              🎯 For You
            </button>
            <button
              onClick={() => fetchAllEvents()}
              style={{
                ...styles.toggleButton,
                backgroundColor: viewMode === "all" ? "#2E1A47" : "white",
                color: viewMode === "all" ? "white" : "#2E1A47"
              }}
            >
              All Events
            </button>
          </div>

          {viewMode === "recommended" && userInterests.length > 0 && (
            <div style={styles.interestsBadge}>
              <span>Based on your interests: </span>
              {userInterests.slice(0, 3).map((interest, idx) => (
                <span key={idx} style={styles.badge}>
                  {interest}
                </span>
              ))}
              {userInterests.length > 3 && (
                <span style={styles.badge}>+{userInterests.length - 3} more</span>
              )}
            </div>
          )}
        </div>

        {/* 🔍 Search Input */}
        <div style={{ marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Search events or organizers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px",
              width: "300px",
              marginRight: "10px",
              border: "1px solid #ddd",
              borderRadius: "6px"
            }}
          />
            <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ 
                  padding: "10px", 
                  marginRight: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "6px"
                }}
                >
                <option value="">All Types</option>
                <option value="NORMAL">Normal</option>
                <option value="MERCHANDISE">Merchandise</option>
            </select>

          <button onClick={handleSearch} style={styles.searchButton}>
            Search
          </button>
        </div>

        {events.length === 0 ? (
          <div style={styles.noEvents}>
            <p>No events found</p>
            {viewMode === "recommended" && (
              <p style={{ fontSize: "14px", color: "#666" }}>
                Try updating your interests in your profile to get better recommendations
              </p>
            )}
          </div>
        ) : (
          <div style={gridStyle}>
            {events.map((event) => (
                <div key={event._id} style={cardStyle}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <h3 style={{ margin: 0 }}>{event.eventName}</h3>
                    {event.recommendationScore > 0 && viewMode === "recommended" && (
                      <span style={styles.scoreBadge} title="Recommendation score">
                        {event.recommendationScore}⭐
                      </span>
                    )}
                  </div>
                  
                  <p style={{ color: "#666", marginBottom: "12px", fontSize: "14px" }}>
                    {event.eventDescription}
                  </p>
                  
                  <div style={{ marginBottom: "12px" }}>
                    <p style={{ fontSize: "13px", margin: "4px 0", color: "#444" }}>
                      <strong>📅 Date:</strong> {new Date(event.eventStartDate).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize: "13px", margin: "4px 0", color: "#444" }}>
                      <strong>👥 Organizer:</strong> {event.organizer.firstName} {event.organizer.lastName}
                    </p>
                    <p style={{ fontSize: "13px", margin: "4px 0", color: "#444" }}>
                      <strong>💰 Fee:</strong> ₹{event.registrationFee || 0}
                    </p>
                    <p style={{ fontSize: "13px", margin: "4px 0", color: "#444" }}>
                      <strong>📝 Registered:</strong> {eventParticipantCounts[event._id] || 0} / {event.registrationLimit || "Unlimited"}
                    </p>
                    <p style={{ fontSize: "13px", margin: "4px 0", color: "#444" }}>
                      <strong>👤 Eligibility:</strong> {event.eligibility === "IIIT_ONLY" ? "IIIT Only" : event.eligibility === "NON_IIIT_ONLY" ? "Non-IIIT Only" : "All"}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "15px" }}>
                    <span style={badgeStyle}>
                      {event.eventType}
                    </span>
                    {event.eventTags && event.eventTags.length > 0 && (
                      event.eventTags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={styles.tagBadge}>
                          {tag}
                        </span>
                      ))
                    )}
                  </div>

                  {(() => {
                    const isRegistered = registeredEvents.has(event._id);
                    const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
                    const participantCount = eventParticipantCounts[event._id] || 0;
                    const isLimitReached = event.registrationLimit > 0 && participantCount >= event.registrationLimit;
                    
                    const isEligible = 
                      (event.eligibility === "ALL") ||
                      (event.eligibility === "IIIT_ONLY" && userParticipantType === "IIIT") ||
                      (event.eligibility === "NON_IIIT_ONLY" && userParticipantType === "NON_IIIT");

                    const isDisabled = loading || isRegistered || isDeadlinePassed || isLimitReached || !isEligible;
                    
                    let buttonText = "Register Now";
                    if (isRegistered) buttonText = "✓ Registered";
                    else if (isDeadlinePassed) buttonText = "Registration Closed";
                    else if (!isEligible) buttonText = "Not Eligible";
                    else if (isLimitReached) buttonText = "Event Full";
                    else if (loading) buttonText = "Registering...";

                    return (
                      <button
                        onClick={() => handleRegister(event._id, event.eventName)}
                        disabled={isDisabled}
                        style={{
                          ...styles.registerButton,
                          backgroundColor: isRegistered 
                            ? "#28a745" 
                            : (isDeadlinePassed || isLimitReached || !isEligible)
                            ? "#6c757d"
                            : "#2E1A47",
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.6 : 1
                        }}
                      >
                        {buttonText}
                      </button>
                    );
                  })()}
                </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

const styles = {
  viewToggle: {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    marginBottom: "20px"
  },
  toggleButton: {
    padding: "10px 20px",
    border: "2px solid #2E1A47",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  },
  interestsBadge: {
    backgroundColor: "#f0ebf5",
    padding: "12px",
    borderRadius: "6px",
    fontSize: "14px",
    marginTop: "10px"
  },
  badge: {
    backgroundColor: "#2E1A47",
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    marginLeft: "8px"
  },
  tagBadge: {
    backgroundColor: "#17a2b8",
    color: "white",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "11px"
  },
  scoreBadge: {
    backgroundColor: "#ffc107",
    color: "#000",
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "bold"
  },
  searchButton: {
    padding: "10px 20px",
    backgroundColor: "#2E1A47",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  registerButton: {
    width: "100%",
    padding: "12px",
    border: "none",
    borderRadius: "6px",
    color: "white",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s"
  },
  noEvents: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "8px"
  }
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  marginBottom: "15px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};
const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: "20px"
};

const badgeStyle = {
  backgroundColor: "#2E1A47",
  color: "white",
  padding: "5px 10px",
  borderRadius: "6px",
  fontSize: "12px"
};

export default BrowseEvents;
