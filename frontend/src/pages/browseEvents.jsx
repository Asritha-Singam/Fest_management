import { useEffect, useState } from "react";
import ParticipantNavbar from "../components/participantNavbar";

const BrowseEvents = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [eventType, setEventType] = useState("");


    useEffect(() => {
      fetchEvents();
    }, []);

    const fetchEvents = async (searchQuery = "", type = "") => {
    try {
        const response = await fetch(
        `http://localhost:5000/api/events/all?search=${searchQuery}&type=${type}`
        );
        const data = await response.json();
        setEvents(data.events);
    } catch (error) {
        console.error("Error fetching events", error);
    }
    };


    const handleSearch = () => {
       fetchEvents(search, eventType);
   };

   return (
    <div>
      <ParticipantNavbar />

      <div style={{ padding: "30px" }}>
        <h2>Browse Events</h2>

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
              marginRight: "10px"
            }}
          />
            <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                style={{ padding: "10px", marginRight: "10px" }}
                >
                <option value="">All Types</option>
                <option value="NORMAL">Normal</option>
                <option value="MERCHANDISE">Merchandise</option>
            </select>

          <button onClick={handleSearch}>
            Search
          </button>
        </div>

        <div style={gridStyle}>
        {events.map((event) => (
            <div key={event._id} style={cardStyle}>
            <h3>{event.eventName}</h3>
            <p>{event.eventDescription}</p>
            <p>
                Organizer: {event.organizer.firstName}{" "}
                {event.organizer.lastName}
            </p>
            <span style={badgeStyle}>
                {event.eventType}
            </span>
            </div>
        ))}
        </div>

      </div>
    </div>
  );
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  marginBottom: "15px",
  borderRadius: "8px"
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
