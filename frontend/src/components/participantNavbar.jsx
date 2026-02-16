import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const ParticipantNavbar = () => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Felicity</h2>

      <div style={styles.links}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/browse">Browse Events</Link>
        <Link to="/organizers">Clubs/Organizers</Link>
        <Link to="/profile">Profile</Link>
        <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    padding: "15px 30px",
    backgroundColor: "#2E1A47",
    color: "white"
  },
  links: {
    display: "flex",
    gap: "20px",
    alignItems: "center"
  },
  logo: {
    margin: 0
  },
  logoutButton: {
    backgroundColor: "#dc3545",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  }
};

export default ParticipantNavbar;
