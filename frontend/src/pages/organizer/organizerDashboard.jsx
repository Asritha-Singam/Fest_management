import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import OrganizerNavbar from "../../components/organizerNavbar";
import { Link } from "react-router-dom";
import ForumButton from "../../components/ForumButton";
import PaymentApprovalTab from "../../components/PaymentApprovalTab";

const OrganizerDashboard = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/organizer/events",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setEvents(res.data.events);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };

    const fetchAnalytics = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/organizer/dashboard/analytics",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setAnalytics(res.data.analytics);
      } catch (error) {
        console.error("Error fetching analytics", error);
      } finally {
        setLoadingAnalytics(false);
      }
    };

    fetchEvents();
    fetchAnalytics();
  }, [token]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'draft': return '#6c757d';
      case 'published': return '#007bff';
      case 'ongoing': return '#28a745';
      case 'completed': return '#17a2b8';

      default: return '#6c757d';
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <div style={containerStyle}>
        <h1 style={titleStyle}>Organizer Dashboard</h1>

        {/* Tab Navigation */}
        <div style={tabNavigationStyle}>
          <button 
            style={{ ...tabButtonStyle, ...(activeTab === 'overview' ? activeTabButtonStyle : {}) }}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            style={{ ...tabButtonStyle, ...(activeTab === 'payments' ? activeTabButtonStyle : {}) }}
            onClick={() => setActiveTab('payments')}
          >
            Payment Approvals
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
        <>
        {/* Event Analytics Section */}
        <section style={analyticsSection}>
          <h2 style={sectionTitleStyle}>Event Analytics</h2>
          {loadingAnalytics ? (
            <p>Loading analytics...</p>
          ) : analytics && analytics.totalCompletedEvents > 0 ? (
            <>
              <div style={statsGrid}>
                <div style={statCard}>
                  <h3 style={statValue}>{analytics.totalCompletedEvents}</h3>
                  <p style={statLabel}>Completed Events</p>
                </div>
                <div style={statCard}>
                  <h3 style={statValue}>{analytics.totalRegistrations}</h3>
                  <p style={statLabel}>Total Registrations</p>
                </div>
                <div style={statCard}>
                  <h3 style={statValue}>₹{analytics.totalRevenue}</h3>
                  <p style={statLabel}>Total Revenue</p>
                </div>
                <div style={statCard}>
                  <h3 style={statValue}>{analytics.totalAttendance}</h3>
                  <p style={statLabel}>Total Attendance</p>
                </div>
              </div>

              {/* Event Breakdown Table */}
              <div style={{ marginTop: "30px" }}>
                <h3>Event-wise Breakdown</h3>
                <table style={tableStyle}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Event Name</th>
                      <th style={thStyle}>Type</th>
                      <th style={thStyle}>Registrations</th>
                      <th style={thStyle}>Revenue</th>
                      <th style={thStyle}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.eventBreakdown.map((event) => (
                      <tr key={event.eventId}>
                        <td style={tdStyle}>{event.eventName}</td>
                        <td style={tdStyle}>{event.eventType}</td>
                        <td style={tdStyle}>{event.registrations}</td>
                        <td style={tdStyle}>₹{event.revenue}</td>
                        <td style={tdStyle}>{event.attendance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <p style={{ textAlign: "center", padding: "40px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              No completed events yet. Analytics will appear once events are completed.
            </p>
          )}
        </section>

        {/* Events Carousel Section */}
        <section style={eventsSection}>
          <h2 style={sectionTitleStyle}>My Events</h2>
          {events.length === 0 ? (
            <p style={{ textAlign: "center", padding: "40px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              No events created yet. <Link to="/organizer/create-event" style={{ color: "#007bff" }}>Create your first event</Link>
            </p>
          ) : (
            <div style={eventsGrid}>
              {events.map(event => (
                <div key={event._id} style={eventCard}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "15px" }}>
                    <h3 style={{ margin: 0, fontSize: "18px" }}>{event.eventName}</h3>
                    <span style={{
                      ...statusBadge,
                      backgroundColor: getStatusColor(event.status)
                    }}>
                      {event.status}
                    </span>
                  </div>
                  <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                    <strong>Type:</strong> {event.eventType}
                  </p>
                  <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                    <strong>Start:</strong> {new Date(event.eventStartDate).toLocaleDateString()}
                  </p>
                  <p style={{ fontSize: "14px", color: "#666", margin: "5px 0" }}>
                    <strong>Registrations:</strong> {event.registrationCount || 0} / {event.registrationLimit || '∞'}
                  </p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                    <Link 
                      to={`/organizer/events/${event._id}`}
                      style={viewDetailsButton}
                    >
                      View Details →
                    </Link>
                    <ForumButton 
                      eventId={event._id} 
                      eventName={event.eventName}
                      isOrganizer={true}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
        </>
        )}

        {activeTab === 'payments' && (
          <PaymentApprovalTab />
        )}
      </div>
    </>
  );
};

const containerStyle = {
  padding: "30px",
  maxWidth: "1400px",
  margin: "0 auto"
};

const titleStyle = {
  marginBottom: "30px",
  color: "#2E1A47"
};

const sectionTitleStyle = {
  borderBottom: "2px solid #2E1A47",
  paddingBottom: "10px",
  marginBottom: "20px",
  color: "#2E1A47"
};

const analyticsSection = {
  marginBottom: "50px"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  marginBottom: "20px"
};

const statCard = {
  backgroundColor: "white",
  padding: "25px",
  borderRadius: "12px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  textAlign: "center",
  border: "1px solid #e0e0e0"
};

const statValue = {
  fontSize: "32px",
  margin: "0 0 10px 0",
  color: "#2E1A47",
  fontWeight: "bold"
};

const statLabel = {
  fontSize: "14px",
  color: "#666",
  margin: 0,
  textTransform: "uppercase",
  letterSpacing: "0.5px"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  borderRadius: "8px",
  overflow: "hidden"
};

const thStyle = {
  backgroundColor: "#2E1A47",
  color: "white",
  padding: "15px",
  textAlign: "left",
  fontWeight: "600"
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #e0e0e0"
};

const eventsSection = {
  marginTop: "50px"
};

const eventsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px"
};

const eventCard = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  transition: "transform 0.2s, box-shadow 0.2s"
};

const statusBadge = {
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "600",
  color: "white",
  textTransform: "capitalize"
};

const viewDetailsButton = {
  display: "inline-block",
  marginTop: "15px",
  padding: "8px 16px",
  backgroundColor: "#2E1A47",
  color: "white",
  textDecoration: "none",
  borderRadius: "6px",
  fontSize: "14px",
  fontWeight: "500"
};

const tabNavigationStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "30px",
  borderBottom: "2px solid #e0e0e0"
};

const tabButtonStyle = {
  padding: "12px 20px",
  border: "none",
  backgroundColor: "transparent",
  color: "#666",
  fontSize: "16px",
  fontWeight: "600",
  cursor: "pointer",
  borderBottom: "3px solid transparent",
  transition: "all 0.3s"
};

const activeTabButtonStyle = {
  color: "#2E1A47",
  borderBottomColor: "#2E1A47"
};

export default OrganizerDashboard;
