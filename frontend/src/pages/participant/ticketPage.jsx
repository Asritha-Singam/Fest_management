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
    </div>
  );
};

export default TicketPage;
