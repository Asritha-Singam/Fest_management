import { useParams } from "react-router-dom";
import { useEffect, useState, useContext } from "react";
import OrganizerNavbar from "../../components/organizerNavbar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchEventData();
  }, []);

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
      const response = await fetch(
        `http://localhost:5000/api/organizer/events/${id}/export`,
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
    try {
      await api.patch(
        `/organizer/events/${id}`,
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditMode(false);
      setEditData({});
      fetchEventData();
      alert('Event updated successfully');
    } catch (error) {
      console.error(error);
      alert('Failed to update event');
    }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <>
      <OrganizerNavbar />

      <h2>{event.eventName}</h2>
      <p>Status: {event.status}</p>
      <p>Type: {event.eventType}</p>
      <p>Fee: ₹{event.registrationFee}</p>

      <button onClick={() => setEditMode(!editMode)}>
        {editMode ? "Cancel" : "Edit Event"}
      </button>

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

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setEditData({ ...editData, status: e.target.value });
                  }
                }}
                style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
              >
                <option value="">Change Status</option>
                <option value="closed">Close Draft Event</option>
              </select>
            </>
          )}

          {/* Published → limited edit */}
          {event.status === "published" && (
            <>
              <textarea
                placeholder="Update Description"
                defaultValue={event.eventDescription}
                onChange={(e) =>
                  setEditData({ ...editData, eventDescription: e.target.value })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "10px", height: "100px", boxSizing: "border-box" }}
              />

              <label style={{ display: "block", marginBottom: "10px" }}>
                Registration Deadline:
                <input
                  type="datetime-local"
                  onChange={(e) =>
                    setEditData({ ...editData, registrationDeadline: e.target.value })
                  }
                  style={{ width: "100%", padding: "10px", boxSizing: "border-box" }}
                />
              </label>

              <input
                type="number"
                placeholder="Increase Registration Limit"
                onChange={(e) =>
                  setEditData({ ...editData, registrationLimit: parseInt(e.target.value) })
                }
                style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
              />

              <select
                onChange={(e) => {
                  if (e.target.value) {
                    setEditData({ ...editData, status: e.target.value });
                  }
                }}
                style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
              >
                <option value="">Change Status</option>
                <option value="closed">Close Event</option>
              </select>
            </>
          )}

          {/* Ongoing → status only */}
          {event.status === "ongoing" && (
            <select
              onChange={(e) =>
                setEditData({ ...editData, status: e.target.value })
              }
              style={{ width: "100%", padding: "10px", marginBottom: "10px", boxSizing: "border-box" }}
            >
              <option value="">Change Status</option>
              <option value="completed">Mark Completed</option>
              <option value="closed">Close Event</option>
            </select>
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

      {event.status === "draft" && (
        <button onClick={handlePublish}>Publish Event</button>
      )}

      <h3>Analytics</h3>
      {analytics && (
        <>
          <p>Total Registrations: {analytics.totalRegistrations}</p>
          <p>Total Revenue: ₹{analytics.totalRevenue}</p>
        </>
      )}

      <h3>Participants</h3>
      <button onClick={handleExport}>Export CSV</button>

      {participants.map(p => (
        <div key={p._id}>
          <p>
            {p.participant.firstName} {p.participant.lastName} – {p.participant.email}
          </p>
        </div>
      ))}
    </>
  );
};

export default OrganizerEventDetail;
