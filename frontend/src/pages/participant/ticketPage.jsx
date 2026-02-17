import { useLocation } from "react-router-dom";

const TicketPage = () => {
  const location = useLocation();
  const data = location.state;

  if (!data) return <p>No ticket data</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>{data.event.eventName}</h2>
      <p>Ticket ID: {data.ticketId}</p>
      <p>Date: {new Date(data.event.eventStartDate).toDateString()}</p>
      <p>Status: {data.status}</p>

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
