import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import { createOrder, uploadPaymentProof, getMyOrders } from "../../services/paymentServices";
import ForumButton from "../../components/ForumButton";

const EventDetail = () => {
  const { id } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [event, setEvent] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [userParticipantType, setUserParticipantType] = useState("");
  const [participantCount, setParticipantCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);

  // Payment proof upload state
  const [paymentProof, setPaymentProof] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('Card');
  const [uploadingPayment, setUploadingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null); // Store order with payment info

  // Form data for merchandise or custom fields
  const [merchandiseSelection, setMerchandiseSelection] = useState({
    size: "",
    color: ""
  });
  const [customFieldResponses, setCustomFieldResponses] = useState([]);

  useEffect(() => {
    if (token && id) {
      fetchEventDetails();
      fetchUserProfile();
      checkRegistrationStatus();
      fetchOrderStatus();
    }
  }, [token, id]);

  const fetchEventDetails = async () => {
    try {
      const response = await api.get("/api/events/all", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const foundEvent = response.data.events?.find(e => e._id === id);
      setEvent(foundEvent);
    } catch (error) {
      console.error("Error fetching event details", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await api.get("/api/participants/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserParticipantType(response.data.participant?.participantType || "");
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const response = await api.get("/api/participants/my-events", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const allRegistrations = [
        ...(response.data.upcoming || []),
        ...(response.data.completed || []),
        ...(response.data.cancelled || [])
      ];
      
      const registered = allRegistrations.some(p => p.event._id === id);
      setIsRegistered(registered);
    } catch (error) {
      console.error("Error checking registration", error);
    }
  };

  const fetchOrderStatus = async () => {
    try {
      const response = await getMyOrders({ page: 1, limit: 100 });
      const eventOrder = response.data.orders?.find(order => order.eventId?._id === id);
      setOrderStatus(eventOrder || null);
    } catch (error) {
      console.error("Error fetching order status:", error);
    }
  };

  const handleRegister = async () => {
    if (registering) return;

    // For merchandise or events with custom fields, show the form first
    if ((event.eventType === "MERCHANDISE") || 
        (event.eventType === "NORMAL" && event.customFormFields?.length > 0)) {
      setShowRegistrationForm(true);
      return;
    }

    // For simple events without additional info needed
    const confirmMsg = `Do you want to register for "${event.eventName}"?`;
    if (!window.confirm(confirmMsg)) return;

    await submitRegistration({});
  };

  const submitRegistration = async (registrationData) => {
    setRegistering(true);
    try {
      const response = await api.post(
        `/participants/register/${id}`,
        registrationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`✅ Successfully registered for ${event.eventName}!\nTicket ID: ${response.data.ticketId}`);
      setIsRegistered(true);
      setShowRegistrationForm(false);
      await checkRegistrationStatus();
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data?.message || "Failed to register for event";
      alert(`❌ ${errorMsg}`);
    } finally {
      setRegistering(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Validate merchandise selection
    if (event.eventType === "MERCHANDISE") {
      if (!merchandiseSelection.size || !merchandiseSelection.color) {
        alert("Please select both size and color");
        return;
      }
      submitRegistration({ merchandiseSelection });
    }

    // Validate custom fields
    if (event.eventType === "NORMAL" && event.customFormFields?.length > 0) {
      // Check required fields
      for (const field of event.customFormFields) {
        if (field.required) {
          const response = customFieldResponses.find(r => r.fieldName === field.fieldName);
          if (!response || !response.fieldValue) {
            alert(`${field.fieldName} is required`);
            return;
          }
        }
      }
      submitRegistration({ customFieldResponses });
    }
  };

  const handleCustomFieldChange = (fieldName, value) => {
    setCustomFieldResponses(prev => {
      const existing = prev.find(r => r.fieldName === fieldName);
      if (existing) {
        return prev.map(r => 
          r.fieldName === fieldName ? { ...r, fieldValue: value } : r
        );
      } else {
        return [...prev, { fieldName, fieldValue: value }];
      }
    });
  };

  const handlePaymentProofUpload = async (e) => {
    e.preventDefault();
    if (!paymentProof) {
      setPaymentError('Please select a payment proof image');
      return;
    }

    setUploadingPayment(true);
    setPaymentError(null);
    setPaymentSuccess(false);

    try {
      // First create order
      const orderResponse = await createOrder(id, 1);
      const orderId = orderResponse.data.orderId;

      // Then upload payment proof
      await uploadPaymentProof(orderId, paymentMethod, paymentProof);
      setPaymentSuccess(true);
      setPaymentProof(null);
      setPaymentMethod('Card');
      setTimeout(() => setPaymentSuccess(false), 5000);
      
      // Refresh order status after upload
      await fetchOrderStatus();
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Failed to upload payment proof');
    } finally {
      setUploadingPayment(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setPaymentError('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        // Compress image before storing
        const img = new Image();
        img.src = reader.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set max dimensions
          let width = img.width;
          let height = img.height;
          const maxDim = 800;
          
          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Compress to JPEG with quality 0.8
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
          setPaymentProof(compressedBase64);
          setPaymentError(null);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) return <div style={{ padding: "30px" }}>Loading...</div>;
  if (!event) return <div style={{ padding: "30px" }}>Event not found</div>;

  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline);
  const isLimitReached = event.registrationLimit > 0 && participantCount >= event.registrationLimit;
  
  const isEligible = 
    (event.eligibility === "ALL") ||
    (event.eligibility === "IIIT_ONLY" && userParticipantType === "IIIT") ||
    (event.eligibility === "NON_IIIT_ONLY" && userParticipantType === "NON_IIIT");

  const canRegister = !isRegistered && !isDeadlinePassed && !isLimitReached && isEligible;

  let registrationMessage = "";
  if (isRegistered) registrationMessage = "You are already registered for this event";
  else if (isDeadlinePassed) registrationMessage = "Registration deadline has passed";
  else if (!isEligible) registrationMessage = "You are not eligible for this event";
  else if (isLimitReached) registrationMessage = "Registration limit reached";

  return (
    <>
      <div style={{ padding: "30px", maxWidth: "900px", margin: "0 auto" }}>
        <button onClick={() => navigate("/browse")} style={backButton}>
          ← Back to Browse
        </button>

        <div style={mainCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "12px" }}>
            <h1 style={{ marginTop: 0 }}>{event.eventName}</h1>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={typeBadge}>{event.eventType}</span>
              {isRegistered && (
                <ForumButton
                  eventId={event._id}
                  eventName={event.eventName}
                  isOrganizer={false}
                />
              )}
            </div>
          </div>

          {/* Description Section - More Prominent */}
          {event.eventDescription && (
            <div style={{ 
              backgroundColor: "#f8f9fa", 
              padding: "20px", 
              borderRadius: "8px", 
              marginBottom: "30px",
              borderLeft: "4px solid #2E1A47"
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "10px", color: "#2E1A47" }}>About This Event</h3>
              <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.8", margin: 0 }}>
                {event.eventDescription}
              </p>
            </div>
          )}

          <div style={infoGrid}>
            <div style={infoItem}>
              <strong>👥 Organizer</strong>
              <p>{event.organizer.firstName} {event.organizer.lastName}</p>
            </div>

            <div style={infoItem}>
              <strong>📅 Start Date</strong>
              <p>{new Date(event.eventStartDate).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>📅 End Date</strong>
              <p>{new Date(event.eventEndDate).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>⏰ Registration Deadline</strong>
              <p>{new Date(event.registrationDeadline).toLocaleString()}</p>
            </div>

            <div style={infoItem}>
              <strong>💰 Registration Fee</strong>
              <p>₹{event.registrationFee || 0}</p>
            </div>

            <div style={infoItem}>
              <strong>📝 Capacity</strong>
              <p>{event.registrationLimit || "Unlimited"}</p>
            </div>

            <div style={infoItem}>
              <strong>👤 Eligibility</strong>
              <p>{event.eligibility === "IIIT_ONLY" ? "IIIT Only" : event.eligibility === "NON_IIIT_ONLY" ? "Non-IIIT Only" : "All"}</p>
            </div>

            <div style={infoItem}>
              <strong>📊 Status</strong>
              <p style={{ textTransform: "capitalize" }}>{event.status}</p>
            </div>
          </div>

          {event.eventTags && event.eventTags.length > 0 && (
            <div style={{ marginTop: "20px" }}>
              <strong>🏷️ Tags:</strong>
              <div style={{ display: "flex", gap: "8px", marginTop: "10px", flexWrap: "wrap" }}>
                {event.eventTags.map((tag, idx) => (
                  <span key={idx} style={tagBadge}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          {event.eventType === "MERCHANDISE" && event.merchandiseDetails && (
            <div style={{ marginTop: "30px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <h3>Merchandise Details</h3>
              {event.merchandiseDetails.sizes && event.merchandiseDetails.sizes.length > 0 && (
                <p><strong>Available Sizes:</strong> {event.merchandiseDetails.sizes.join(", ")}</p>
              )}
              {event.merchandiseDetails.colors && event.merchandiseDetails.colors.length > 0 && (
                <p><strong>Available Colors:</strong> {event.merchandiseDetails.colors.join(", ")}</p>
              )}
              {event.merchandiseDetails.stock && (
                <p><strong>Stock:</strong> {event.merchandiseDetails.stock}</p>
              )}
              {event.merchandiseDetails.purchaseLimitPerUser && (
                <p><strong>Purchase Limit:</strong> {event.merchandiseDetails.purchaseLimitPerUser} per person</p>
              )}
            </div>
          )}

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            {registrationMessage && (
              <p style={{ 
                padding: "12px", 
                backgroundColor: isRegistered ? "#d4edda" : "#f8d7da",
                color: isRegistered ? "#155724" : "#721c24",
                borderRadius: "6px",
                marginBottom: "15px"
              }}>
                {registrationMessage}
              </p>
            )}

            <button
              onClick={handleRegister}
              disabled={!canRegister || registering}
              style={{
                ...registerButton,
                backgroundColor: isRegistered ? "#28a745" : "#2E1A47",
                opacity: canRegister ? 1 : 0.6,
                cursor: canRegister ? "pointer" : "not-allowed"
              }}
            >
              {isRegistered ? "✓ Registered" : registering ? "Registering..." : "Register Now"}
            </button>

            {isRegistered && event.eventType === "MERCHANDISE" && (
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: orderStatus?.paymentStatus === 'Approved' ? '#d4edda' : '#fff3cd', borderRadius: '8px', border: orderStatus?.paymentStatus === 'Approved' ? '1px solid #28a745' : '1px solid #ffc107' }}>
                <p style={{ margin: '0 0 15px 0', color: orderStatus?.paymentStatus === 'Approved' ? '#155724' : '#856404', fontWeight: '600' }}>
                  📋 Payment Status: 
                  <span style={{ color: orderStatus?.paymentStatus === 'Approved' ? '#28a745' : orderStatus?.paymentStatus === 'Rejected' ? '#dc3545' : '#ffc107' }}>
                    {orderStatus?.paymentStatus === 'Approved' ? '✓ Approved' : orderStatus?.paymentStatus === 'Rejected' ? '✗ Rejected' : orderStatus?.payment ? 'Pending Approval' : 'Not Uploaded'}
                  </span>
                </p>
                
                {paymentError && (
                  <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', border: '1px solid #ef5350' }}>
                    {paymentError}
                  </div>
                )}

                {paymentSuccess && (
                  <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', border: '1px solid #66bb6a' }}>
                    ✓ Payment proof uploaded successfully! Awaiting organizer approval.
                  </div>
                )}

                {orderStatus?.paymentStatus === 'Rejected' && orderStatus?.rejectionReason && (
                  <div style={{ padding: '10px', marginBottom: '15px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', border: '1px solid #ef5350' }}>
                    <strong>Rejection Reason:</strong> {orderStatus.rejectionReason}
                  </div>
                )}

                {(!orderStatus || !orderStatus.payment) && (
                <form onSubmit={handlePaymentProofUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Payment Method
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="Card">Credit/Debit Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>
                      Upload Payment Proof Screenshot
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      style={{
                        display: 'block',
                        marginBottom: '10px'
                      }}
                    />
                    {paymentProof && (
                      <div style={{ marginTop: '10px' }}>
                        <img src={paymentProof} alt="Payment Proof Preview" style={{ maxWidth: '150px', borderRadius: '4px', border: '1px solid #ddd' }} />
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={uploadingPayment || !paymentProof}
                    style={{
                      padding: '12px',
                      backgroundColor: uploadingPayment || !paymentProof ? '#ccc' : '#2E1A47',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '16px',
                      fontWeight: '600',
                      cursor: uploadingPayment || !paymentProof ? 'not-allowed' : 'pointer',
                      transition: 'background 0.3s'
                    }}
                  >
                    {uploadingPayment ? 'Uploading...' : 'Submit Payment Proof'}
                  </button>
                </form>
                )}

                {orderStatus?.paymentStatus === 'Approved' && (
                  <div style={{ padding: '15px', marginTop: '15px', backgroundColor: '#e8f5e9', color: '#2e7d32', borderRadius: '4px', border: '1px solid #66bb6a', textAlign: 'center' }}>
                    <p style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>✓ Your payment has been approved!</p>
                    <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>You can now access your ticket.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Registration Form Modal */}
        {showRegistrationForm && (
          <div style={modalOverlay}>
            <div style={modalContent}>
              <h2>Complete Your Registration</h2>
              <form onSubmit={handleFormSubmit}>
                
                {/* Merchandise Selection */}
                {event.eventType === "MERCHANDISE" && (
                  <>
                    {event.merchandiseDetails?.sizes?.length > 0 && (
                      <div style={formGroup}>
                        <label style={label}>Select Size *</label>
                        <select
                          value={merchandiseSelection.size}
                          onChange={(e) => setMerchandiseSelection({
                            ...merchandiseSelection,
                            size: e.target.value
                          })}
                          style={selectInput}
                          required
                        >
                          <option value="">-- Select Size --</option>
                          {event.merchandiseDetails.sizes.map((size) => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {event.merchandiseDetails?.colors?.length > 0 && (
                      <div style={formGroup}>
                        <label style={label}>Select Color *</label>
                        <select
                          value={merchandiseSelection.color}
                          onChange={(e) => setMerchandiseSelection({
                            ...merchandiseSelection,
                            color: e.target.value
                          })}
                          style={selectInput}
                          required
                        >
                          <option value="">-- Select Color --</option>
                          {event.merchandiseDetails.colors.map((color) => (
                            <option key={color} value={color}>{color}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </>
                )}

                {/* Custom Form Fields */}
                {event.eventType === "NORMAL" && event.customFormFields?.map((field, idx) => (
                  <div key={idx} style={formGroup}>
                    <label style={label}>
                      {field.fieldName} {field.required && "*"}
                    </label>
                    <input
                      type={field.fieldType || "text"}
                      required={field.required}
                      onChange={(e) => handleCustomFieldChange(field.fieldName, e.target.value)}
                      style={textInput}
                      placeholder={`Enter ${field.fieldName}`}
                    />
                  </div>
                ))}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button
                    type="submit"
                    disabled={registering}
                    style={{
                      ...formButton,
                      backgroundColor: "#2E1A47",
                      opacity: registering ? 0.6 : 1
                    }}
                  >
                    {registering ? "Submitting..." : "Submit Registration"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRegistrationForm(false)}
                    disabled={registering}
                    style={{
                      ...formButton,
                      backgroundColor: "#6c757d"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const backButton = {
  backgroundColor: "white",
  border: "1px solid #ddd",
  padding: "8px 16px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "14px",
  marginBottom: "20px"
};

const mainCard = {
  backgroundColor: "white",
  padding: "40px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
};

const typeBadge = {
  backgroundColor: "#2E1A47",
  color: "white",
  padding: "6px 16px",
  borderRadius: "12px",
  fontSize: "13px",
  fontWeight: "500"
};

const infoGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
  padding: "20px",
  backgroundColor: "#f8f9fa",
  borderRadius: "8px"
};

const infoItem = {
  display: "flex",
  flexDirection: "column",
  gap: "5px"
};

const tagBadge = {
  backgroundColor: "#17a2b8",
  color: "white",
  padding: "6px 12px",
  borderRadius: "12px",
  fontSize: "12px"
};

const registerButton = {
  padding: "15px 40px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontSize: "16px",
  fontWeight: "600",
  minWidth: "200px"
};

const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000
};

const modalContent = {
  backgroundColor: "white",
  padding: "30px",
  borderRadius: "12px",
  maxWidth: "500px",
  width: "90%",
  maxHeight: "80vh",
  overflowY: "auto",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)"
};

const formGroup = {
  marginBottom: "20px"
};

const label = {
  display: "block",
  marginBottom: "8px",
  fontWeight: "500",
  color: "#333"
};

const selectInput = {
  width: "100%",
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px",
  backgroundColor: "white"
};

const textInput = {
  width: "100%",
  padding: "10px",
  fontSize: "14px",
  border: "1px solid #ddd",
  borderRadius: "6px"
};

const formButton = {
  flex: 1,
  padding: "12px 20px",
  border: "none",
  borderRadius: "6px",
  color: "white",
  fontSize: "14px",
  fontWeight: "600",
  cursor: "pointer"
};

export default EventDetail;
