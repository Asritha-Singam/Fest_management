import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import AdminNavbar from "../../components/adminNavbar";

const CreateOrganizer = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: ""
  });

  const [generatedPassword, setGeneratedPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      setError("First name is required");
      return;
    }
    if (!formData.lastName.trim()) {
      setError("Last name is required");
      return;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        "/api/admin/organizers",
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Store generated password for display
      setGeneratedPassword(response.data.generatedPassword);
      setFormData({
        firstName: "",
        lastName: "",
        email: ""
      });
    } catch (err) {
      console.error("Error creating organizer:", err);
      setError(
        err.response?.data?.message ||
        "Failed to create organizer. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
        <h1>Create New Organizer</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Add a new event organizer to the system. Password will be auto-generated.
        </p>

        {error && (
          <div style={{
            backgroundColor: "#f8d7da",
            color: "#721c24",
            padding: "12px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #f5c6cb"
          }}>
            {error}
          </div>
        )}

        {generatedPassword && (
          <div style={{
            backgroundColor: "#d4edda",
            color: "#155724",
            padding: "15px",
            borderRadius: "4px",
            marginBottom: "20px",
            border: "1px solid #c3e6cb"
          }}>
            <h4 style={{ margin: "0 0 10px 0" }}>Organizer Created Successfully!</h4>
            <p style={{ margin: "0 0 10px 0", fontWeight: "bold" }}>
              {formData.firstName} {formData.lastName}
            </p>
            <p style={{ margin: "0 0 10px 0" }}>
              <strong>Email:</strong> {formData.email}
            </p>
            <p style={{ margin: "0 0 10px 0" }}>
              <strong>Generated Password:</strong> 
              <code style={{ 
                backgroundColor: "#fff", 
                padding: "5px 10px", 
                borderRadius: "3px",
                marginLeft: "8px",
                fontFamily: "monospace"
              }}>
                {generatedPassword}
              </code>
            </p>
            <p style={{ margin: "0", fontSize: "12px", color: "#0c5460" }}>
              Please share these credentials with the organizer. They can change their password after logging in.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              First Name *
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Last Name *
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
              style={inputStyle}
              required
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="organizer@example.com"
              style={inputStyle}
              required
            />
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                ...buttonStyle,
                backgroundColor: loading ? "#999" : "#28a745",
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading ? "Creating..." : "Create Organizer"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/admin/dashboard")}
              style={{ ...buttonStyle, backgroundColor: "#6c757d" }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const inputStyle = {
  width: "100%",
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
  fontSize: "14px"
};

export default CreateOrganizer;
