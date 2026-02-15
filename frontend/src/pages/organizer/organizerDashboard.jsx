import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../../context/AuthContext";
import OrganizerNavbar from "../../components/organizerNavbar";
import { Link } from "react-router-dom";

const OrganizerDashboard = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);

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

    fetchEvents();
  }, [token]);

  return (
    <>
      <OrganizerNavbar />
      <h2>Organizer Dashboard</h2>

      {events.map(event => (
        <div key={event._id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{event.eventName}</h3>
          <p>Type: {event.eventType}</p>
          <p>Status: {event.status}</p>
          <Link to={`/organizer/events/${event._id}`}>
            View Details
          </Link>
        </div>
      ))}
    </>
  );
};

export default OrganizerDashboard;
