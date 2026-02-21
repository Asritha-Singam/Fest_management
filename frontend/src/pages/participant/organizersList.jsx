import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const OrganizersList = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [organizers, setOrganizers] = useState([]);
  const [followedOrganizers, setFollowedOrganizers] = useState(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      fetchOrganizers();
      fetchUserProfile();
    }
  }, [token]);

  const fetchOrganizers = async () => {
    try {
      const response = await api.get("/api/participants/organizers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(response.data.organizers || []);
    } catch (error) {
      console.error("Error fetching organizers", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/participants/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const followed = response.data.participant?.followedOrganizers || [];
      setFollowedOrganizers(new Set(followed.map(org => org._id || org)));
    } catch (error) {
      console.error("Error fetching profile", error);
    }
  };

  const handleFollowToggle = async (organizerId) => {
    if (loading) return;

    setLoading(true);
    try {
      const isCurrentlyFollowed = followedOrganizers.has(organizerId);
      const newFollowed = new Set(followedOrganizers);

      if (isCurrentlyFollowed) {
        newFollowed.delete(organizerId);
      } else {
        newFollowed.add(organizerId);
      }

      await api.put(
        "/participants/profile",
        { followedOrganizers: Array.from(newFollowed) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFollowedOrganizers(newFollowed);
    } catch (error) {
      console.error("Error updating follow status", error);
      alert("Failed to update follow status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ padding: "30px" }}>
        <h1>Clubs / Organizers</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Browse all approved event organizers and follow them to get personalized recommendations
        </p>

        {organizers.length === 0 ? (
          <p>No organizers found</p>
        ) : (
          <div style={gridStyle}>
            {organizers.map((org) => (
              <div key={org._id} style={cardStyle}>
                <h3 style={{ marginTop: 0 }}>
                  {org.firstName} {org.lastName}
                </h3>
                
                {org.category && (
                  <div style={{ marginBottom: "10px" }}>
                    <span style={categoryBadge}>{org.category}</span>
                  </div>
                )}

                <p style={{ fontSize: "14px", color: "#666", minHeight: "60px" }}>
                  {org.description || "No description available"}
                </p>

                {org.contactEmail && (
                  <p style={{ fontSize: "13px", color: "#444" }}>
                    <strong>📧 Contact:</strong> {org.contactEmail}
                  </p>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                  <button
                    onClick={() => handleFollowToggle(org._id)}
                    disabled={loading}
                    style={{
                      ...followButton,
                      backgroundColor: followedOrganizers.has(org._id) ? "#28a745" : "#2E1A47"
                    }}
                  >
                    {followedOrganizers.has(org._id) ? "✓ Following" : "Follow"}
                  </button>

                  <button
                    onClick={() => navigate(`/organizer/${org._id}`)}
                    style={viewButton}
                  >
                    View Details
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
  gap: "20px"
};

const cardStyle = {
  border: "1px solid #ddd",
  padding: "20px",
  borderRadius: "8px",
  backgroundColor: "white",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
};

const categoryBadge = {
  backgroundColor: "#17a2b8",
  color: "white",
  padding: "4px 12px",
  borderRadius: "12px",
  fontSize: "12px",
  fontWeight: "500"
};

const followButton = {
  flex: 1,
  padding: "10px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

const viewButton = {
  flex: 1,
  padding: "10px",
  border: "1px solid #2E1A47",
  borderRadius: "6px",
  backgroundColor: "white",
  color: "#2E1A47",
  cursor: "pointer",
  fontSize: "14px",
  fontWeight: "500"
};

export default OrganizersList;
