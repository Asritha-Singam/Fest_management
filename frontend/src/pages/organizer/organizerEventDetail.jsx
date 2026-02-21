import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import OrganizerNavbar from "../../components/organizerNavbar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import ForumButton from "../../components/ForumButton";

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchEventData();
  }, []);

  useEffect(() => {
    // Filter participants based on search term
    if (searchTerm) {
      const filtered = participants.filter(p => 
        p.participant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.participant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.participant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.ticketId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchTerm, participants]);

  const fetchEventData = async () => {
    try {
      const eventRes = await api.get(`/organizer/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const selectedEvent = eventRes.data.events.find(e => e._id === id);
      setEvent(selectedEvent);

      const participantsRes = await api.get(
        `/organizer/events/${id}/participants`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setParticipants(participantsRes.data.participants);

      const analyticsRes = await api.get(
        `/organizer/events/${id}/analytics`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAnalytics(analyticsRes.data.analytics);

    } catch (error) {
      console.error(error);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post(
        `/organizer/events/${id}/publish`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchEventData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(
        `${apiUrl}/api/organizer/events/${id}/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants-${id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting:', error);
      alert('Failed to export participants');
    }
  };

  const handleUpdate = async () => {
    if (Object.keys(editData).length === 0) {
      alert('No changes to save');
      return;
    }

    try {
      const response = await api.patch(
        `/organizer/events/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        alert('Event updated successfully');
        setEditMode(false);
        setEditData({});
        fetchEventData();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to update event');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <>
      <OrganizerNavbar />

      <div style={{ padding: "30px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
          <h2>{event.eventName}</h2>
          <ForumButton
            eventId={event._id}
            eventName={event.eventName}
            isOrganizer={true}
          />
        </div>
        
        {/* Overview Section */}
        <div style={{ marginBottom: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Overview</h3>
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Type:</strong> {event.eventType}</p>
          <p><strong>Fee:</strong> ₹{event.registrationFee}</p>
          <p><strong>Eligibility:</strong> {event.eligibility === "IIIT_ONLY" ? "IIIT Only" : event.eligibility === "NON_IIIT_ONLY" ? "Non-IIIT Only" : "All"}</p>
          <p><strong>Registration Deadline:</strong> {new Date(event.registrationDeadline).toLocaleString()}</p>
          <p><strong>Event Start Date:</strong> {new Date(event.eventStartDate).toLocaleString()}</p>
          <p><strong>Event End Date:</strong> {new Date(event.eventEndDate).toLocaleString()}</p>
          <p><strong>Registration Limit:</strong> {event.registrationLimit || "Unlimited"}</p>
        </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
        {event.status !== "completed" && (
          <button 
            onClick={() => setEditMode(!editMode)} 
            style={{ 
              padding: "10px 20px", 
              backgroundColor: editMode ? "#6c757d" : "#2E1A47", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              cursor: "pointer" 
            }}
          >
            {editMode ? "Cancel" : "Edit Event"}
          </button>
        )}
        
        {(event.status === "published" || event.status === "ongoing") && (
          <button 
            onClick={() => navigate(`/organizer/events/${id}/attendance`)}
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#4CAF50", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              cursor: "pointer",
              fontWeight: "600"
            }}
          >
            📷 Attendance Tracking
          </button>
        )}

        {event.status === "draft" && (
          <button 
            onClick={handlePublish} 
            style={{ 
              padding: "10px 20px", 
              backgroundColor: "#007bff", 
              color: "white", 
              border: "none", 
              borderRadius: "6px", 
              cursor: "pointer" 
            }}
          >
            Publish Event
          </button>
        )}
      </div>

      {editMode && (
        <div style={{ marginTop: "20px", padding: "20px", border: "1px solid #ddd", borderRadius: "5px", backgroundColor: "#f9f9f9" }}>
          <h4>Edit Event Details</h4>

          {/* Draft → full edit */}
          {event.status === "draft" && (
            <>
              <input
                placeholder="Event Name"
                defaultValue={event.eventName}
                onChange={(e) =>
                  setEditData({ ...editData, eventName: e.target.value })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
              />

              <textarea
                placeholder="Description"
                defaultValue={event.eventDescription}
                onChange={(e) =>
                  setEditData({ ...editData, eventDescription: e.target.value })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "10px", height: "100px", boxSizing: "border-box" }}
              />

              <input
                type="number"
                placeholder="Registration Fee"
                defaultValue={event.registrationFee}
                onChange={(e) =>
                  setEditData({ ...editData, registrationFee: e.target.value })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
              />

            </>
          )}

          {/* Published → limited edit */}
          {event.status === "published" && (
            <>
              <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                Description:
              </label>
              <textarea
                placeholder="Update Description"
                defaultValue={event.eventDescription}
                onChange={(e) =>
                  setEditData({ ...editData, eventDescription: e.target.value })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "15px", height: "100px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ddd" }}
              />

              <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                Extend Registration Deadline:
                <input
                  type="datetime-local"
                  onChange={(e) =>
                    setEditData({ ...editData, registrationDeadline: e.target.value })
                  }
                  style={{ width: "100%", padding: "10px", marginTop: "5px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ddd" }}
                />
                <small style={{ color: "#666" }}>Current: {new Date(event.registrationDeadline).toLocaleString()}</small>
              </label>

              <label style={{ display: "block", marginBottom: "10px", fontWeight: "500" }}>
                Increase Registration Limit:
              </label>
              <input
                type="number"
                min={event.registrationLimit || 0}
                placeholder={`Current: ${event.registrationLimit || "Unlimited"}`}
                onChange={(e) =>
                  setEditData({ ...editData, registrationLimit: parseInt(e.target.value) })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "15px", boxSizing: "border-box", borderRadius: "4px", border: "1px solid #ddd" }}
              />

              <button
                onClick={async () => {
                  if (window.confirm('Close registrations now? This will set the deadline to the current time.')) {
                    try {
                      const response = await api.patch(
                        `/organizer/events/${id}`,
                        { closeRegistrations: true },
                        { headers: { Authorization: `Bearer ${token}` } }
                      );

                      if (response.data.success) {
                        alert('Registrations closed successfully');
                        setEditMode(false);
                        setEditData({});
                        fetchEventData();
                      }
                    } catch (error) {
                      console.error(error);
                      alert(error.response?.data?.message || 'Failed to close registrations');
                    }
                  }
                }}
                style={{ 
                  width: "100%", 
                  padding: "10px", 
                  marginBottom: "10px", 
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px"
                }}
              >
                Close Registrations Now
              </button>
            </>
          )}

          {/* Ongoing → can only be marked as completed */}
          {event.status === "ongoing" && (
            <>
              <p style={{ marginBottom: "10px", color: "#666" }}>Ongoing events can only be marked as completed.</p>
              <button
                onClick={() => {
                  if (window.confirm('Mark this event as completed?')) {
                    setEditData({ ...editData, status: "completed" });
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "16px",
                  marginBottom: "10px"
                }}
              >
                Mark as Completed
              </button>
            </>
          )}

          {/* Completed → Cannot edit */}
          {event.status === "completed" && (
            <p style={{ color: "#dc3545", fontWeight: "500" }}>Completed events cannot be edited.</p>
          )}

          <button 
            onClick={handleUpdate} 
            style={{ 
              backgroundColor: "#28a745", 
              color: "white", 
              padding: "10px 20px", 
              cursor: "pointer",
              borderRadius: "4px",
              border: "none",
              fontSize: "16px"
            }}
          >
            Save Changes
          </button>

        </div>
      )}

      {/* Analytics Section */}
      <div style={{ marginBottom: "30px" }}>
        <h3>Analytics</h3>
        {analytics && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div style={{ padding: "15px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px" }}>
              <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>{analytics.totalRegistrations}</p>
              <p style={{ color: "#666", margin: "5px 0 0 0" }}>Total Registrations</p>
            </div>
            <div style={{ padding: "15px", backgroundColor: "#fff", border: "1px solid #ddd", borderRadius: "8px" }}>
              <p style={{ fontSize: "24px", fontWeight: "bold", margin: "0" }}>₹{analytics.totalRevenue}</p>
              <p style={{ color: "#666", margin: "5px 0 0 0" }}>Total Revenue</p>
            </div>
          </div>
        )}
      </div>

      {/* Participants Section */}
      <div style={{ marginBottom: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h3 style={{ margin: 0 }}>Participants ({filteredParticipants.length})</h3>
          <button onClick={handleExport} style={{ padding: "8px 16px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}>
            Export CSV
          </button>
        </div>

        {/* Search/Filter */}
        <input
          type="text"
          placeholder="Search by name, email, or ticket ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px", border: "1px solid #ddd", borderRadius: "6px", boxSizing: "border-box" }}
        />

        {/* Participants Table */}
        {filteredParticipants.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", backgroundColor: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ backgroundColor: "#2E1A47", color: "white" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Name</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Ticket ID</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Reg Date</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Payment</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map(p => (
                <tr key={p._id} style={{ borderBottom: "1px solid #e0e0e0" }}>
                  <td style={{ padding: "12px" }}>{p.participant.firstName} {p.participant.lastName}</td>
                  <td style={{ padding: "12px" }}>{p.participant.email}</td>
                  <td style={{ padding: "12px", fontFamily: "monospace", fontSize: "13px" }}>{p.ticketId}</td>
                  <td style={{ padding: "12px" }}>{new Date(p.registrationDate).toLocaleDateString()}</td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: p.paymentStatus === "Paid" ? "#d4edda" : p.paymentStatus === "Pending" ? "#fff3cd" : "#f8d7da",
                      color: p.paymentStatus === "Paid" ? "#155724" : p.paymentStatus === "Pending" ? "#856404" : "#721c24"
                    }}>
                      {p.paymentStatus}
                    </span>
                  </td>
                  <td style={{ padding: "12px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "12px",
                      backgroundColor: p.status === "Completed" ? "#d4edda" : p.status === "Cancelled" ? "#f8d7da" : "#cfe2ff",
                      color: p.status === "Completed" ? "#155724" : p.status === "Cancelled" ? "#721c24" : "#084298"
                    }}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ textAlign: "center", padding: "40px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
            {searchTerm ? "No participants found matching your search." : "No participants registered yet."}
          </p>
        )}
      </div>
      </div>
    </>
  );
};

export default OrganizerEventDetail;
