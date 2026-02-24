const ScanResultModal = ({ isOpen, onClose, result, type }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';
  const isError = type === 'error';
  const isDuplicate = type === 'duplicate';

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        {isSuccess && (
          <>
            <div style={successIcon}></div>
            <h2 style={title}>Check-in Successful!</h2>
            <div style={detailsContainer}>
              <div style={detailRow}>
                <span style={detailLabel}>Participant:</span>
                <span style={detailValue}>{result.participantName}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Email:</span>
                <span style={detailValue}>{result.participantEmail}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Event:</span>
                <span style={detailValue}>{result.eventName}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Ticket ID:</span>
                <span style={detailValue}>{result.ticketId}</span>
              </div>
              <div style={detailRow}>
                <span style={detailLabel}>Time:</span>
                <span style={detailValue}>
                  {new Date(result.checkInTime).toLocaleString()}
                </span>
              </div>
            </div>
          </>
        )}

        {isError && (
          <>
            <div style={errorIcon}></div>
            <h2 style={titleError}>Check-in Failed</h2>
            <p style={message}>{result.message || 'An error occurred'}</p>
          </>
        )}

        {isDuplicate && (
          <>
            <div style={warningIcon}></div>
            <h2 style={titleWarning}>Already Checked In</h2>
            <p style={message}>
              This ticket was already scanned
              {result.checkInTime && (
                <> at {new Date(result.checkInTime).toLocaleString()}</>
              )}
            </p>
          </>
        )}

        <button onClick={onClose} style={closeButton}>
          {isSuccess ? 'Scan Next' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

// Styles
const overlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: '20px',
};

const modal = {
  backgroundColor: '#fff',
  borderRadius: '16px',
  padding: '40px 30px',
  maxWidth: '500px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  animation: 'slideUp 0.3s ease-out',
};

const successIcon = {
  fontSize: '72px',
  marginBottom: '20px',
  animation: 'scaleIn 0.5s ease-out',
};

const errorIcon = {
  fontSize: '72px',
  marginBottom: '20px',
};

const warningIcon = {
  fontSize: '72px',
  marginBottom: '20px',
};

const title = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#4CAF50',
  marginBottom: '25px',
  marginTop: 0,
};

const titleError = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#f44336',
  marginBottom: '15px',
  marginTop: 0,
};

const titleWarning = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#ff9800',
  marginBottom: '15px',
  marginTop: 0,
};

const detailsContainer = {
  backgroundColor: '#f8f9fa',
  borderRadius: '12px',
  padding: '20px',
  marginBottom: '25px',
  textAlign: 'left',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '10px 0',
  borderBottom: '1px solid #e0e0e0',
};

const detailLabel = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#666',
};

const detailValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  textAlign: 'right',
  maxWidth: '60%',
  wordBreak: 'break-word',
};

const message = {
  fontSize: '16px',
  color: '#666',
  marginBottom: '25px',
  lineHeight: '1.5',
};

const closeButton = {
  padding: '14px 32px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  width: '100%',
  maxWidth: '200px',
};

export default ScanResultModal;
