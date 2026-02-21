import { useEffect, useState, useContext } from "react";
import OrganizerNavbar from "../../components/organizerNavbar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { Link } from "react-router-dom";

const OngoingEvents = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/api/organizer/events", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const ongoing = res.data.events.filter(
          (e) => e.status === "ongoing"
        );

        setEvents(ongoing);

      } catch (error) {
        console.error(error);
      }
    };

    fetchEvents();
  }, [token]);

  return (
    <>
      <OrganizerNavbar />
      <h2>Ongoing Events</h2>

      {events.length === 0 && <p>No ongoing events.</p>}

      {events.map((event) => (
        <div key={event._id} style={{ border: "1px solid gray", padding: "10px", margin: "10px" }}>
          <h3>{event.eventName}</h3>
          <p>Status: {event.status}</p>
          <Link to={`/organizer/events/${event._id}`}>
            View Details
          </Link>
        </div>
      ))}
    </>
  );
};

export default OngoingEvents;
