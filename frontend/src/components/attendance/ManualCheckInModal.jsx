import { useState } from 'react';

const ManualCheckInModal = ({ isOpen, onClose, participant, onSubmit }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !participant) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(participant.id, reason);
      setReason('');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to perform manual check-in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReason('');
      setError('');
      onClose();
    }
  };

  return (
    <div style={overlay} onClick={handleClose}>
      <div style={modal} onClick={(e) => e.stopPropagation()}>
        <div style={header}>
          <h2 style={title}>Manual Check-In</h2>
          <button onClick={handleClose} style={closeButton} disabled={isSubmitting}>
            ✕
          </button>
        </div>

        <div style={participantInfo}>
          <div style={infoRow}>
            <span style={infoLabel}>Participant:</span>
            <span style={infoValue}>{participant.participantName}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Email:</span>
            <span style={infoValue}>{participant.participantEmail}</span>
          </div>
          <div style={infoRow}>
            <span style={infoLabel}>Ticket ID:</span>
            <span style={infoValue}>{participant.ticketId || 'N/A'}</span>
          </div>
        </div>

        <div style={warningBox}>
          <div style={warningIcon}>⚠️</div>
          <div style={warningText}>
            Manual check-ins are logged for audit purposes. Please provide a detailed reason.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={formGroup}>
            <label htmlFor="reason" style={label}>
              Reason for Manual Check-In <span style={required}>*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="e.g., QR code not working, phone battery dead, printed ticket damaged..."
              rows="4"
              style={textarea}
              disabled={isSubmitting}
              required
            />
            <div style={charCount}>
              {reason.length} / 10 minimum characters
            </div>
          </div>

          {error && <div style={errorMessage}>{error}</div>}

          <div style={buttonGroup}>
            <button
              type="button"
              onClick={handleClose}
              style={cancelButton}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                ...submitButton,
                ...(isSubmitting || reason.trim().length < 10 ? disabledButton : {}),
              }}
              disabled={isSubmitting || reason.trim().length < 10}
            >
              {isSubmitting ? 'Processing...' : 'Confirm Check-In'}
            </button>
          </div>
        </form>
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
  padding: '0',
  maxWidth: '550px',
  width: '100%',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  maxHeight: '90vh',
  overflowY: 'auto',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '25px 30px',
  borderBottom: '1px solid #e0e0e0',
};

const title = {
  fontSize: '22px',
  fontWeight: '600',
  color: '#333',
  margin: 0,
};

const closeButton = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  color: '#999',
  cursor: 'pointer',
  padding: '0',
  width: '30px',
  height: '30px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const participantInfo = {
  padding: '20px 30px',
  backgroundColor: '#f8f9fa',
  borderBottom: '1px solid #e0e0e0',
};

const infoRow = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '8px 0',
};

const infoLabel = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#666',
};

const infoValue = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
};

const warningBox = {
  display: 'flex',
  gap: '12px',
  padding: '15px 30px',
  backgroundColor: '#fff3cd',
  borderBottom: '1px solid #ffc107',
};

const warningIcon = {
  fontSize: '20px',
};

const warningText = {
  fontSize: '13px',
  color: '#856404',
  lineHeight: '1.5',
};

const formGroup = {
  padding: '25px 30px',
};

const label = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '8px',
};

const required = {
  color: '#f44336',
};

const textarea = {
  width: '100%',
  padding: '12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  fontFamily: 'inherit',
  resize: 'vertical',
  minHeight: '100px',
  boxSizing: 'border-box',
};

const charCount = {
  fontSize: '12px',
  color: '#999',
  marginTop: '6px',
  textAlign: 'right',
};

const errorMessage = {
  padding: '0 30px 10px',
  color: '#f44336',
  fontSize: '14px',
  fontWeight: '500',
};

const buttonGroup = {
  display: 'flex',
  gap: '12px',
  padding: '0 30px 30px',
};

const cancelButton = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#fff',
  color: '#666',
  border: '2px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s',
};

const submitButton = {
  flex: 1,
  padding: '12px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s',
};

const disabledButton = {
  backgroundColor: '#ccc',
  cursor: 'not-allowed',
};

export default ManualCheckInModal;
