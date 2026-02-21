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
      const res = await api.get("/api/admin/organizers", {
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

  const handleArchive = async (id, name) => {
    if (window.confirm(`Archive ${name}? They will not be able to log in.`)) {
      try {
        await api.patch(
          `/admin/organizers/${id}/disable`,
          { isActive: false },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchOrganizers();
        alert(`${name} has been archived. They cannot log in.`);
      } catch (err) {
        console.error("Error archiving organizer:", err);
        alert("Failed to archive organizer");
      }
    }
  };

  const handleReactivate = async (id, name) => {
    if (window.confirm(`Reactivate ${name}? They will be able to log in again.`)) {
      try {
        await api.patch(
          `/admin/organizers/${id}/disable`,
          { isActive: true },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchOrganizers();
        alert(`${name} has been reactivated.`);
      } catch (err) {
        console.error("Error reactivating organizer:", err);
        alert("Failed to reactivate organizer");
      }
    }
  };

  const handlePermanentlyDelete = async (id, name) => {
    if (window.confirm(`PERMANENTLY DELETE ${name}? This cannot be undone. All their events and data will be deleted.`)) {
      try {
        await api.delete(
          `/admin/organizers/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        fetchOrganizers();
        alert(`${name} has been permanently deleted.`);
      } catch (err) {
        console.error("Error deleting organizer:", err);
        alert("Failed to delete organizer");
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
                  {organizer.isActive ? (
                    <>
                      <button
                        onClick={() => handleArchive(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                        style={{ ...buttonStyle, backgroundColor: "#ffc107" }}
                      >
                        Archive (Disable)
                      </button>

                      <button
                        onClick={() => handlePermanentlyDelete(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                        style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                      >
                        Delete Permanently
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleReactivate(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                        style={{ ...buttonStyle, backgroundColor: "#28a745" }}
                      >
                        Reactivate
                      </button>

                      <button
                        onClick={() => handlePermanentlyDelete(organizer._id, `${organizer.firstName} ${organizer.lastName}`)}
                        style={{ ...buttonStyle, backgroundColor: "#dc3545" }}
                      >
                        Delete Permanently
                      </button>
                    </>
                  )}
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
