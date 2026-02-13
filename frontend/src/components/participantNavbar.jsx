import { Link } from "react-router-dom";

const ParticipantNavbar = () => {
  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>Felicity</h2>

      <div style={styles.links}>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/browse">Browse Events</Link>
        <Link to="/profile">Profile</Link>
        <Link to="/login">Logout</Link>
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
    gap: "20px"
  },
  logo: {
    margin: 0
  }
};

export default ParticipantNavbar;
