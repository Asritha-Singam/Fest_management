import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const predefinedInterests = [
  "Web Development",
  "Mobile Development",
  "AI/ML",
  "Cybersecurity",
  "Data Science",
  "Cloud Computing",
  "Blockchain",
  "IoT",
  "Game Development",
  "UI/UX Design",
  "DevOps",
  "Robotics"
];

const Profile = () => {
  const { token } = useContext(AuthContext);
  
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    contactNumber: "",
    collegeOrOrg: "",
  });

  const [selectedInterests, setSelectedInterests] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [followedOrganizers, setFollowedOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowSection, setShowFollowSection] = useState(false);
  
  // Password change state
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (token) {
      loadProfile();
      fetchOrganizers();
    }
  }, [token]);

  const loadProfile = async () => {
    if (!token) {
      console.error("No token available");
      setLoading(false);
      return;
    }
    
    try {
      console.log("Loading profile with token:", token ? "Token exists" : "No token");
      const response = await api.get("/api/participants/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Profile response:", response.data);

      const { user, participant } = response.data;

      if (!user) {
        console.error("No user data received");
        setLoading(false);
        return;
      }

      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        contactNumber: participant?.contactNumber || "",
        collegeOrOrg: participant?.collegeOrOrg || ""
      });

      setSelectedInterests(participant?.interests || []);
      setFollowedOrganizers(participant?.followedOrganizers?.map(org => org._id) || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading profile:", error);
      console.error("Error details:", error.response?.data);
      alert("Failed to load profile. Please check if backend is running.");
      setLoading(false);
    }
  };

  const fetchOrganizers = async () => {
    if (!token) return;
    
    try {
      const response = await api.get("/api/participants/organizers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrganizers(response.data.organizers || []);
    } catch (error) {
      console.error("Error fetching organizers:", error);
    }
  };

  const toggleInterest = (interest) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const toggleOrganizer = (organizerId) => {
    setFollowedOrganizers(prev => 
      prev.includes(organizerId)
        ? prev.filter(id => id !== organizerId)
        : [...prev, organizerId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.put(
        "/api/participants/profile",
        {
          ...form,
          interests: selectedInterests,
          followedOrganizers: followedOrganizers
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert("New password must be at least 6 characters");
      return;
    }

    try {
      await api.post(
        "/api/participants/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      alert("Password changed successfully!");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setShowPasswordSection(false);
    } catch (error) {
      console.error("Error changing password:", error);
      const errorMsg = error.response?.data?.message || "Failed to change password";
      alert(errorMsg);
    }
  };

  if (loading) {
    return <div style={{ padding: "20px" }}>Loading...</div>;
  }

  return (
    <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
      <h1 style={{ color: "#2E1A47", marginBottom: "10px" }}>My Profile</h1>
      <p style={{ color: "#666", marginBottom: "30px" }}>
        Manage your personal information and preferences
      </p>

      <form onSubmit={handleSubmit}>
        {/* Basic Information */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Basic Information</h2>
          <div style={styles.formGrid}>
            <div>
              <label style={styles.label}>First Name</label>
              <input
                style={styles.input}
                value={form.firstName}
                placeholder="First Name"
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
              />
            </div>

            <div>
              <label style={styles.label}>Last Name</label>
              <input
                style={styles.input}
                value={form.lastName}
                placeholder="Last Name"
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
              />
            </div>

            <div>
              <label style={styles.label}>Contact Number</label>
              <input
                style={styles.input}
                value={form.contactNumber}
                placeholder="Contact Number"
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
              />
            </div>

            <div>
              <label style={styles.label}>College / Organization</label>
              <input
                style={styles.input}
                value={form.collegeOrOrg}
                placeholder="College / Org"
                onChange={(e) =>
                  setForm({ ...form, collegeOrOrg: e.target.value })
                }
              />
            </div>
          </div>
        </div>

        {/* Interests Section */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Areas of Interest</h2>
          <p style={styles.helperText}>
            Select topics you're interested in to get personalized event recommendations
          </p>
          <div style={styles.interestsGrid}>
            {predefinedInterests.map(interest => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                style={{
                  ...styles.interestButton,
                  backgroundColor: selectedInterests.includes(interest) ? "#2E1A47" : "white",
                  color: selectedInterests.includes(interest) ? "white" : "#2E1A47"
                }}
              >
                {interest}
              </button>
            ))}
          </div>
          <p style={styles.selectedCount}>
            {selectedInterests.length} interest(s) selected
          </p>
        </div>

        {/* Followed Organizers Section */}
        <div style={styles.section}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 style={styles.sectionTitle}>Followed Organizers</h2>
              <p style={styles.helperText}>
                {followedOrganizers.length} organizer(s) followed
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowFollowSection(!showFollowSection)}
              style={styles.toggleButton}
            >
              {showFollowSection ? "Hide" : "Manage Follows"}
            </button>
          </div>

          {showFollowSection && (
            <div style={styles.organizersList}>
              {organizers.length === 0 ? (
                <p style={styles.noData}>No organizers available</p>
              ) : (
                organizers.map(organizer => (
                  <div
                    key={organizer._id}
                    onClick={() => toggleOrganizer(organizer._id)}
                    style={{
                      ...styles.organizerCard,
                      borderColor: followedOrganizers.includes(organizer._id) ? "#2E1A47" : "#ddd",
                      backgroundColor: followedOrganizers.includes(organizer._id) ? "#f0ebf5" : "white"
                    }}
                  >
                    <div style={styles.checkbox}>
                      {followedOrganizers.includes(organizer._id) && "✓"}
                    </div>
                    <div>
                      <h3 style={styles.organizerName}>
                        {organizer.firstName} {organizer.lastName}
                      </h3>
                      {organizer.category && (
                        <p style={styles.organizerCategory}>{organizer.category}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <button type="submit" style={styles.saveButton}>
          Save Changes
        </button>
      </form>

      {/* Password Change Section */}
      <div style={{ ...styles.section, marginTop: "30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={styles.sectionTitle}>Security Settings</h2>
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            style={styles.toggleButton}
          >
            {showPasswordSection ? "Cancel" : "Change Password"}
          </button>
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordChange} style={{ backgroundColor: "#f8f9fa", padding: "20px", borderRadius: "8px" }}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Current Password *</label>
              <input
                type="password"
                placeholder="Enter current password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>New Password * (min 6 characters)</label>
              <input
                type="password"
                placeholder="Enter new password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                style={styles.input}
                required
                minLength={6}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Confirm New Password *</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                style={styles.input}
                required
              />
            </div>

            <button type="submit" style={{ ...styles.saveButton, marginTop: "15px", backgroundColor: "#dc3545" }}>
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  section: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "8px",
    marginBottom: "25px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
  },
  sectionTitle: {
    fontSize: "20px",
    marginBottom: "10px",
    color: "#2E1A47"
  },
  helperText: {
    fontSize: "14px",
    color: "#666",
    marginBottom: "20px"
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "20px"
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: "500",
    color: "#333"
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    fontSize: "14px",
    boxSizing: "border-box"
  },
  interestsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
    gap: "12px"
  },
  interestButton: {
    padding: "10px 16px",
    border: "2px solid #2E1A47",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.2s"
  },
  selectedCount: {
    marginTop: "15px",
    fontSize: "14px",
    color: "#666",
    fontStyle: "italic"
  },
  toggleButton: {
    padding: "8px 20px",
    backgroundColor: "#2E1A47",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500"
  },
  organizersList: {
    maxHeight: "400px",
    overflowY: "auto",
    marginTop: "20px"
  },
  organizerCard: {
    display: "flex",
    alignItems: "flex-start",
    padding: "12px",
    border: "2px solid",
    borderRadius: "6px",
    marginBottom: "10px",
    cursor: "pointer",
    transition: "all 0.2s"
  },
  checkbox: {
    width: "24px",
    height: "24px",
    border: "2px solid #2E1A47",
    borderRadius: "4px",
    marginRight: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    flexShrink: 0
  },
  organizerName: {
    margin: "0 0 5px 0",
    fontSize: "15px",
    color: "#2E1A47"
  },
  organizerCategory: {
    margin: 0,
    fontSize: "12px",
    color: "#666",
    fontWeight: "bold"
  },
  noData: {
    textAlign: "center",
    color: "#999",
    padding: "30px"
  },
  saveButton: {
    width: "100%",
    padding: "14px",
    backgroundColor: "#2E1A47",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "600",
    marginTop: "10px"
  }
};

export default Profile;
