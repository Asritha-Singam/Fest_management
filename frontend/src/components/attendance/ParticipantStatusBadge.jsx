const ParticipantStatusBadge = ({ status, manualOverride }) => {
  const isCheckedIn = status === 'checked-in';

  return (
    <div style={container}>
      <span
        style={{
          ...badge,
          ...(isCheckedIn ? checkedInBadge : notScannedBadge),
        }}
      >
        {isCheckedIn ? 'Checked In' : 'Not Scanned'}
      </span>
      {manualOverride && (
        <span style={overrideBadge} title="Manual Override">
          Manual
        </span>
      )}
    </div>
  );
};

// Styles
const container = {
  display: 'flex',
  gap: '8px',
  alignItems: 'center',
};

const badge = {
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: '600',
  display: 'inline-block',
  whiteSpace: 'nowrap',
};

const checkedInBadge = {
  backgroundColor: '#d4edda',
  color: '#155724',
};

const notScannedBadge = {
  backgroundColor: '#f8d7da',
  color: '#721c24',
};

const overrideBadge = {
  padding: '4px 8px',
  borderRadius: '12px',
  fontSize: '11px',
  fontWeight: '600',
  backgroundColor: '#fff3cd',
  color: '#856404',
};

export default ParticipantStatusBadge;
