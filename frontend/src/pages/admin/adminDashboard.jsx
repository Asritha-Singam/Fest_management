import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import AdminNavbar from "../../components/adminNavbar";

const AdminDashboard = () => {
  const { token } = useContext(AuthContext);
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchOrganizers();
  }, [token]);

  const fetchOrganizers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/organizers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(res.data.organizers || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching organizers:", err);
      setError("Failed to fetch organizers");
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (id, currentStatus) => {
    try {
      setLoading(true);
      const newStatus = !currentStatus; // Toggle boolean
      const response = await api.patch(
        `/admin/organizers/${id}/disable`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log("Update response:", response.data);
      
      setLoading(false);
      fetchOrganizers();
      alert(`Organizer ${newStatus ? "enabled" : "disabled"} successfully`);
    } catch (err) {
      setLoading(false);
      console.error("Error updating organizer:", err.response?.data || err.message);
      alert(`Failed to update organizer: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(
          `/admin/organizers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchOrganizers();
        alert("Organizer deleted successfully");
      } catch (err) {
        console.error("Error deleting organizer:", err);
        alert("Failed to delete organizer");
      }
    }
  };

  const handleResetPassword = async (id, name) => {
    if (window.confirm(`Are you sure you want to reset password for ${name}?`)) {
      try {
        const response = await api.patch(
          `/admin/organizers/${id}/reset-password`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert(`Password reset successfully!\n\nNew Password: ${response.data.newPassword}\n\nPlease share this with the organizer.`);
      } catch (err) {
        console.error("Error resetting password:", err);
        alert("Failed to reset password");
      }
    }
  };

  if (loading) return <div style={{ padding: "20px" }}>Loading...</div>;

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "30px" }}>
        <h1>Admin Dashboard - Manage Organizers</h1>

        {error && (
          <div style={{ color: "red", marginBottom: "20px", padding: "10px", backgroundColor: "#ffe6e6", borderRadius: "4px" }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: "30px" }}>
          <h2>Organizers ({organizers.length})</h2>
          <p style={{ color: "#666" }}>Manage all event organizers in the system</p>
        </div>

        {organizers.length === 0 ? (
          <div style={{ 
            padding: "40px", 
            textAlign: "center", 
            backgroundColor: "#f5f5f5", 
            borderRadius: "8px",
            color: "#666"
          }}>
            <p>No organizers found</p>
          </div>
        ) : (
          <div style={gridStyle}>
            {organizers.map((organizer) => (
              <div key={organizer._id} style={cardStyle}>
                <div style={{ marginBottom: "15px" }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>
                    {organizer.firstName} {organizer.lastName}
                  </h3>
                  <p style={{ margin: "0px", color: "#666", fontSize: "14px" }}>
                    {organizer.email}
                  </p>
                </div>

                <div style={{ marginBottom: "15px" }}>
                  <span style={{
                    ...badgeStyle,
                    backgroundColor: organizer.isActive ? "#28a745" : "#dc3545"
                  }}>
                    {organizer.isActive ? "ACTIVE" : "DISABLED"}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <button
                    onClick={() => handleDisable(organizer._id, organizer.isActive)}
                    style={{
                      ...buttonStyle,
                      backgroundColor: organizer.isActive ? "#ffc107" : "#28a745"
                    }}
                  >
                    {organizer.isActive ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={() => handleResetPassword(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                    style={{ ...buttonStyle, backgroundColor: "#17a2b8" }}
                  >
                    Reset Password
                  </button>

                  <button
                    onClick={() => handleDelete(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                    style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "20px"
};

const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "20px",
  backgroundColor: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  fontWeight: "bold"
};

const buttonStyle = {
  padding: "8px 16px",
  border: "none",
  borderRadius: "4px",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

export default AdminDashboard;
