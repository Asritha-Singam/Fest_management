import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const OrganizerNavbar = () => {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (role !== "organizer") return null;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav style={{ padding: "10px", background: "#eee" }}>
      <Link to="/organizer/dashboard">Dashboard</Link> |{" "}
      <Link to="/organizer/create-event">Create Event</Link> |{" "}
      <Link to="/organizer/ongoing">Ongoing Events</Link> |{" "}
      <Link to="/organizer/profile">Profile</Link> |{" "}
      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
};

export default OrganizerNavbar;
