import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const AdminNavbar = () => {
  const { role, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  if (role !== "admin") return null;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav style={navStyle}>
      <div style={navContainerStyle}>
        <h2 style={logoStyle}>Admin Panel</h2>
        <div style={linksStyle}>
          <Link to="/admin/dashboard" style={linkStyle}>Dashboard</Link>
          <Link to="/admin/create-organizer" style={linkStyle}>Create Organizer</Link>
          <button onClick={handleLogout} style={logoutButtonStyle}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const navStyle = {
  backgroundColor: "#2E1A47",
  padding: "0",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
};

const navContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "15px 30px"
};

const logoStyle = {
  color: "white",
  margin: "0",
  fontSize: "24px",
  fontWeight: "bold"
};

const linksStyle = {
  display: "flex",
  gap: "20px",
  alignItems: "center"
};

const linkStyle = {
  color: "#9bc4ff",
  textDecoration: "none",
  fontWeight: "500",
  transition: "color 0.3s"
};

const logoutButtonStyle = {
  backgroundColor: "#dc3545",
  color: "white",
  border: "none",
  padding: "8px 16px",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "500"
};

export default AdminNavbar;
