const AttendanceStats = ({ statistics }) => {
  const { totalParticipants, checkedIn, notScanned, manualOverrides, checkInPercentage } = statistics;

  return (
    <div style={container}>
      <div style={statCard}>
        <div style={statIcon}></div>
        <div style={statContent}>
          <div style={statValue}>{totalParticipants}</div>
          <div style={statLabel}>Total Participants</div>
        </div>
      </div>

      <div style={{ ...statCard, ...successCard }}>
        <div style={statIcon}></div>
        <div style={statContent}>
          <div style={statValue}>{checkedIn}</div>
          <div style={statLabel}>Checked In</div>
        </div>
      </div>

      <div style={{ ...statCard, ...warningCard }}>
        <div style={statIcon}></div>
        <div style={statContent}>
          <div style={statValue}>{notScanned}</div>
          <div style={statLabel}>Not Scanned</div>
        </div>
      </div>

      <div style={{ ...statCard, ...infoCard }}>
        <div style={statIcon}></div>
        <div style={statContent}>
          <div style={statValue}>{manualOverrides}</div>
          <div style={statLabel}>Manual Overrides</div>
        </div>
      </div>

      <div style={{ ...statCard, ...percentageCard }}>
        <div style={statIcon}></div>
        <div style={statContent}>
          <div style={statValue}>{checkInPercentage}%</div>
          <div style={statLabel}>Check-in Rate</div>
        </div>
      </div>
    </div>
  );
};

// Styles
const container = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
  gap: '15px',
  marginBottom: '30px',
};

const statCard = {
  backgroundColor: '#fff',
  padding: '20px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
  border: '2px solid #e0e0e0',
  transition: 'transform 0.2s, box-shadow 0.2s',
  cursor: 'default',
};

const successCard = {
  borderColor: '#4CAF50',
};

const warningCard = {
  borderColor: '#ff9800',
};

const infoCard = {
  borderColor: '#2196F3',
};

const percentageCard = {
  borderColor: '#9c27b0',
};

const statIcon = {
  fontSize: '36px',
};

const statContent = {
  flex: 1,
};

const statValue = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#333',
  marginBottom: '4px',
};

const statLabel = {
  fontSize: '13px',
  color: '#666',
  fontWeight: '500',
};

export default AttendanceStats;
