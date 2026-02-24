import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import AdminNavbar from "../../components/adminNavbar";

const PasswordResetRequests = () => {
  const { token } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("pending"); // pending, approved, rejected, all

  useEffect(() => {
    fetchPasswordResets();
  }, [token, filterStatus]);

  const fetchPasswordResets = async () => {
    try {
      setLoading(true);
      console.log("Fetching password reset requests from: /admin/password-reset-requests");
      
      // Always fetch all requests, filter on client side
      const res = await api.get("/api/admin/password-reset-requests", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log("Response received:", res.data);
      let filteredRequests = res.data.requests || [];
      
      // Client-side filtering based on selected filter
      if (filterStatus === "pending") {
        filteredRequests = filteredRequests.filter(r => r.status === "pending");
      } else if (filterStatus === "approved") {
        filteredRequests = filteredRequests.filter(r => r.status === "approved");
      } else if (filterStatus === "rejected") {
        filteredRequests = filteredRequests.filter(r => r.status === "rejected");
      }
      // "all" shows everything - no additional filtering
      
      console.log("Filtered requests:", filteredRequests);
      setRequests(filteredRequests);
      setError(null);
    } catch (err) {
      console.error("Error fetching password reset requests:", err);
      setError("Failed to fetch password reset requests: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    if (window.confirm("Approve this password reset request? A new password will be generated.")) {
      try {
        const comment = window.prompt("Add a comment for the organizer (optional):");
        const response = await api.patch(
          `/api/admin/password-reset-requests/${requestId}/approve`,
          { comment: comment || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert(`Password Reset Approved!\n\nNew Password: ${response.data.newPassword}\n\nPlease share this with the user.`);
        fetchPasswordResets();
      } catch (err) {
        console.error("Error approving request:", err);
        alert("Failed to approve password reset request");
      }
    }
  };

  const handleReject = async (requestId) => {
    const reason = prompt("Reason for rejection (optional):");
    if (reason !== null) {
      try {
        const comment = window.prompt("Add a comment for the organizer (optional):");
        await api.patch(
          `/api/admin/password-reset-requests/${requestId}/reject`,
          { reason: reason || null, comment: comment || null },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        alert("Password reset request rejected");
        fetchPasswordResets();
      } catch (err) {
        console.error("Error rejecting request:", err);
        alert("Failed to reject password reset request");
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'pending': return '#ffc107';
      case 'approved': return '#28a745';
      case 'rejected': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (loading && requests.length === 0) {
    return (
      <>
        <AdminNavbar />
        <div style={{ padding: "30px" }}>
          <p>Loading password reset requests...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminNavbar />
      <div style={{ padding: "30px", minHeight: "100vh", backgroundColor: "#fff" }}>
        <h1>Password Reset Requests</h1>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Manage password reset requests from organizers
        </p>

        {error && (
          <div style={{ 
            color: "red", 
            marginBottom: "20px", 
            padding: "15px", 
            backgroundColor: "#ffe6e6", 
            borderRadius: "4px",
            border: "1px solid #f5c6cb"
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading && requests.length === 0 && (
          <div style={{
            padding: "20px",
            backgroundColor: "#f0f0f0",
            borderRadius: "4px",
            textAlign: "center"
          }}>
            Loading password reset requests...
          </div>
        )}

        {!loading && (
          <>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ marginRight: "15px", fontWeight: "500" }}>
                Filter by Status:
              </label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "4px",
                  border: "1px solid #ddd",
                  fontSize: "14px",
                  cursor: "pointer"
                }}
              >
                <option value="pending">Pending Only</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="all">All Requests</option>
              </select>
            </div>

            {requests.length === 0 ? (
              <div style={{ 
                padding: "40px", 
                textAlign: "center", 
                backgroundColor: "#f5f5f5", 
                borderRadius: "8px",
                color: "#666"
              }}>
                <p>No {filterStatus === 'all' ? '' : filterStatus} password reset requests found</p>
              </div>
            ) : (
              <div style={tableContainerStyle}>
            <table style={tableStyle}>
              <thead>
                <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #ddd" }}>
                  <th style={thStyle}>Club Name</th>
                  <th style={thStyle}>Email</th>
                  <th style={thStyle}>Reason</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Requested</th>
                  <th style={thStyle}>Approved By</th>
                  <th style={thStyle}>Admin Comment</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id} style={{ borderBottom: "1px solid #ddd" }}>
                    <td style={tdStyle}>
                      <strong>{request.clubName || `${request.firstName} ${request.lastName}`}</strong>
                    </td>
                    <td style={tdStyle}>{request.email}</td>
                    <td style={tdStyle}>{request.reason || "-"}</td>
                    <td style={tdStyle}>
                      <span style={{
                        ...badgeStyle,
                        backgroundColor: getStatusBadgeColor(request.status)
                      }}>
                        {request.status?.toUpperCase()}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {new Date(request.createdAt).toLocaleDateString()}
                    </td>
                    <td style={tdStyle}>
                      {request.approvedBy 
                        ? `${request.approvedBy.firstName} ${request.approvedBy.lastName}`
                        : "-"
                      }
                    </td>
                    <td style={tdStyle}>{request.adminComment || "-"}</td>
                    <td style={tdStyle}>
                      {request.status === 'pending' ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => handleApprove(request._id)}
                            style={{ ...actionButtonStyle, backgroundColor: "#28a745" }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(request._id)}
                            style={{ ...actionButtonStyle, backgroundColor: "#dc3545" }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: "#999", fontSize: "12px" }}>
                          {request.status === 'rejected' && request.rejectionReason 
                            ? `Reason: ${request.rejectionReason}`
                            : 'No action needed'
                          }
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

const tableContainerStyle = {
  overflowX: "auto",
  marginTop: "20px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  maxWidth: "1400px",
  margin: "20px auto 0 auto"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
  fontSize: "14px"
};

const thStyle = {
  padding: "12px 15px",
  textAlign: "left",
  fontWeight: "600",
  color: "#333"
};

const tdStyle = {
  padding: "12px 15px",
  textAlign: "left",
  color: "#666"
};

const badgeStyle = {
  display: "inline-block",
  padding: "6px 12px",
  borderRadius: "20px",
  color: "white",
  fontSize: "12px",
  fontWeight: "bold"
};

const actionButtonStyle = {
  padding: "6px 12px",
  border: "none",
  borderRadius: "4px",
  color: "white",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: "500"
};

export default PasswordResetRequests;
