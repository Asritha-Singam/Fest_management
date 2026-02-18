import { useEffect, useState, useContext } from "react";
import OrganizerNavbar from "../../components/organizerNavbar";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const OrganizerProfile = () => {
  const { token } = useContext(AuthContext);
  const [profile, setProfile] = useState({});
  const [editData, setEditData] = useState({});
  const [message, setMessage] = useState("");
  const [resetReason, setResetReason] = useState("");
  const [resetHistory, setResetHistory] = useState([]);

  useEffect(() => {
    fetchProfile();
    fetchResetHistory();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/organizer/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProfile(res.data.organizer);
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdate = async () => {
    try {
      await api.put(
        "/organizer/profile",
        editData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      fetchProfile();
      setEditData({});
      setMessage("Profile updated successfully");
      setTimeout(() => setMessage(""), 3000);

    } catch (error) {
      console.error(error);
      setMessage("Error updating profile");
    }
  };

  const handlePasswordResetRequest = async () => {
    if (!resetReason.trim()) {
      alert("Please provide a reason for the reset request.");
      return;
    }
    if (window.confirm("Request a password reset? Admin will review and reset your password.")) {
      try {
        const response = await api.post(
          "/organizer/request-password-reset",
          { reason: resetReason.trim() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert("Password reset request submitted successfully. Admin will review it shortly.");
        setMessage(response.data.message);
        setResetReason("");
        fetchResetHistory();
      } catch (error) {
        console.error(error);
        alert(error.response?.data?.message || "Failed to submit password reset request");
      }
    }
  };

  const fetchResetHistory = async () => {
    try {
      const res = await api.get("/organizer/password-reset-history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResetHistory(res.data.requests || []);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <OrganizerNavbar />
      <div style={containerStyle}>
        <h1>Organizer Profile</h1>

        {message && (
          <div style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #c3e6cb"
          }}>
            {message}
          </div>
        )}

        <div style={sectionStyle}>
          <h2 style={{ marginTop: "0" }}>Account Information</h2>
          <p><strong>Login Email:</strong> {profile.email}</p>

          <div style={{ marginTop: "16px" }}>
            <label style={{ display: "block", fontWeight: "600", marginBottom: "6px" }}>
              Reason for Password Reset
            </label>
            <textarea
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="Briefly explain why you need a reset"
              style={{ ...inputStyle, minHeight: "90px", fontFamily: "Arial, sans-serif" }}
            />
          </div>
          
          <button
            onClick={handlePasswordResetRequest}
            style={{
              ...buttonStyle,
              backgroundColor: "#17a2b8",
              marginBottom: "20px",
              marginTop: "12px"
            }}
          >
            Request Password Reset
          </button>
        </div>

        <div style={sectionStyle}>
          <h2 style={{ marginTop: "0" }}>Password Reset History</h2>
          {resetHistory.length === 0 ? (
            <p style={{ color: "#666" }}>No password reset requests yet.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={historyTableStyle}>
                <thead>
                  <tr>
                    <th style={historyThStyle}>Status</th>
                    <th style={historyThStyle}>Requested</th>
                    <th style={historyThStyle}>Reason</th>
                    <th style={historyThStyle}>Admin Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {resetHistory.map((request) => (
                    <tr key={request._id}>
                      <td style={historyTdStyle}>{request.status}</td>
                      <td style={historyTdStyle}>
                        {new Date(request.createdAt).toLocaleDateString()}
                      </td>
                      <td style={historyTdStyle}>{request.reason}</td>
                      <td style={historyTdStyle}>{request.adminComment || request.rejectionReason || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={sectionStyle}>
          <h2>Edit Profile</h2>

          <div style={formGroupStyle}>
            <label>First Name</label>
            <input
              type="text"
              placeholder="First Name"
              defaultValue={profile.firstName}
              onChange={(e) =>
                setEditData({ ...editData, firstName: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Last Name</label>
            <input
              type="text"
              placeholder="Last Name"
              defaultValue={profile.lastName}
              onChange={(e) =>
                setEditData({ ...editData, lastName: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Category</label>
            <input
              type="text"
              placeholder="Category"
              defaultValue={profile.category}
              onChange={(e) =>
                setEditData({ ...editData, category: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Description</label>
            <textarea
              placeholder="Description"
              defaultValue={profile.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              style={{...inputStyle, minHeight: "100px", fontFamily: "Arial, sans-serif"}}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Contact Email</label>
            <input
              type="email"
              placeholder="Contact Email"
              defaultValue={profile.contactEmail}
              onChange={(e) =>
                setEditData({ ...editData, contactEmail: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label>Contact Number</label>
            <input
              type="tel"
              placeholder="Contact Number"
              defaultValue={profile.contactNumber}
              onChange={(e) =>
                setEditData({ ...editData, contactNumber: e.target.value })
              }
              style={inputStyle}
            />
          </div>

          <button onClick={handleUpdate} style={{...buttonStyle, backgroundColor: "#28a745"}}>
            Save Changes
          </button>
        </div>
      </div>
    </>
  );
};

const containerStyle = {
  padding: "30px",
  maxWidth: "600px",
  margin: "0 auto"
};

const sectionStyle = {
  backgroundColor: "#f9f9f9",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px"
};

const formGroupStyle = {
  marginBottom: "15px",
  display: "flex",
  flexDirection: "column"
};

const inputStyle = {
  padding: "10px",
  border: "1px solid #ddd",
  borderRadius: "4px",
  fontSize: "14px",
  boxSizing: "border-box"
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  color: "white",
  fontWeight: "500",
  cursor: "pointer",
  fontSize: "14px"
};

const historyTableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "white",
  border: "1px solid #e5e5e5"
};

const historyThStyle = {
  textAlign: "left",
  padding: "10px",
  backgroundColor: "#f3f3f3",
  borderBottom: "1px solid #e5e5e5",
  fontSize: "13px"
};

const historyTdStyle = {
  padding: "10px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "13px",
  color: "#444"
};

export default OrganizerProfile;
