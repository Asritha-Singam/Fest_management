import { useLocation } from "react-router-dom";
import { useState } from "react";

const TicketPage = () => {
  const location = useLocation();
  const data = location.state;
  const [isQrOpen, setIsQrOpen] = useState(false);

  if (!data) return <p>No ticket data</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{data.event.eventName}</h2>
      <p>Ticket ID: {data.ticketId}</p>
      <p>Date: {new Date(data.event.eventStartDate).toDateString()}</p>
      <p>Status: {data.status}</p>

      {data.qrCodeData && (
        <div style={{ marginTop: "20px" }}>
          <button
            type="button"
            onClick={() => setIsQrOpen(true)}
            style={{ display: "inline-block", border: "none", background: "transparent", padding: 0 }}
            aria-label="Open larger QR code"
          >
            <img
              src={data.qrCodeData}
              alt="Ticket QR code"
              style={{
                width: "240px",
                height: "240px",
                objectFit: "contain",
                border: "1px solid #e3e3e3",
                borderRadius: "12px",
                boxShadow: "0 4px 14px rgba(0, 0, 0, 0.12)",
                cursor: "zoom-in"
              }}
            />
          </button>
          <p style={{ marginTop: "8px", color: "#666" }}>Click the QR to open full size for scanning.</p>
        </div>
      )}

      {data.qrCodeData && isQrOpen && (
        <div style={qrOverlay} onClick={() => setIsQrOpen(false)}>
          <div style={qrModal} onClick={(event) => event.stopPropagation()}>
            <img src={data.qrCodeData} alt="Ticket QR code" style={qrModalImage} />
            <button type="button" onClick={() => setIsQrOpen(false)} style={qrCloseButton}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Display merchandise selection if available */}
      {data.merchandiseSelection && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Merchandise Details</h3>
          {data.merchandiseSelection.size && (
            <p><strong>Size:</strong> {data.merchandiseSelection.size}</p>
          )}
          {data.merchandiseSelection.color && (
            <p><strong>Color:</strong> {data.merchandiseSelection.color}</p>
          )}
        </div>
      )}

      {/* Display custom field responses if available */}
      {data.customFieldResponses && data.customFieldResponses.length > 0 && (
        <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
          <h3>Registration Details</h3>
          {data.customFieldResponses.map((field, idx) => (
            <p key={idx}>
              <strong>{field.fieldName}:</strong> {field.fieldValue}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketPage;

const qrOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0, 0, 0, 0.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
  padding: "20px"
};

const qrModal = {
  background: "#fff",
  borderRadius: "16px",
  padding: "24px",
  boxShadow: "0 12px 30px rgba(0, 0, 0, 0.2)",
  textAlign: "center",
  maxWidth: "90vw"
};

const qrModalImage = {
  width: "480px",
  height: "480px",
  maxWidth: "80vw",
  maxHeight: "80vw",
  objectFit: "contain",
  display: "block",
  margin: "0 auto"
};

const qrCloseButton = {
  marginTop: "16px",
  padding: "10px 16px",
  borderRadius: "8px",
  border: "none",
  background: "#2E1A47",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600
};
