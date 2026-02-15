import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [events, setEvents] = useState({
    upcoming: [],
    completed: [],
    cancelled: []
  });

  const [activeTab, setActiveTab] = useState("completed");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(
        "http://localhost:5000/api/participants/my-events",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = await res.json();
      if (data.success) {
        setEvents(data);
      }
    };

    fetchEvents();
  }, []);

  const renderHistory = () => {
    let list = [];

    if (activeTab === "completed") list = events.completed;
    if (activeTab === "cancelled") list = events.cancelled;

    if (list.length === 0) return <p>No events</p>;

    return list.map((p) => (
      <div key={p._id}>
        <strong>{p.event.eventName}</strong>
      </div>
    ));
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>My Events Dashboard</h1>

      {/* Upcoming Section */}
      <h2>Upcoming Events</h2>
      {events.upcoming.length === 0 ? (
        <p>No upcoming events</p>
      ) : (
        events.upcoming.map((p) => (
          <div key={p._id} style={{ marginBottom: "15px" }}>
            <h3>{p.event.eventName}</h3>
            <p>Type: {p.event.eventType}</p>
            <p>Ticket ID: {p.ticketId}</p>
            <button
              onClick={() =>
                navigate(`/ticket/${p._id}`, { state: p })
              }
            >
              View Ticket
            </button>
          </div>
        ))
      )}

      {/* History Tabs */}
      <h2>Participation History</h2>

      <div>
        <button onClick={() => setActiveTab("completed")}>
          Completed
        </button>
        <button onClick={() => setActiveTab("cancelled")}>
          Cancelled
        </button>
      </div>

      {renderHistory()}
    </div>
  );
};

export default Dashboard;
