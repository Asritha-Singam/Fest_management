import { useState, useEffect } from 'react';
import AttendanceStats from './AttendanceStats';
import AttendanceList from './AttendanceList';
import ManualCheckInModal from './ManualCheckInModal';
import { getAttendanceDashboard, manualCheckIn } from '../../services/attendanceServices';

const AttendanceDashboard = ({ eventId, eventName }) => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, [eventId, refreshKey]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAttendanceDashboard(eventId);
      
      if (response.success) {
        setDashboardData(response.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      setError(err.message || 'Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleManualCheckIn = (participant) => {
    setSelectedParticipant(participant);
    setIsManualModalOpen(true);
  };

  const handleManualCheckInSubmit = async (participationId, reason) => {
    try {
      await manualCheckIn(participationId, reason);
      setIsManualModalOpen(false);
      setSelectedParticipant(null);
      // Refresh dashboard data
      fetchDashboardData();
    } catch (err) {
      throw new Error(err.message || 'Failed to perform manual check-in');
    }
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div style={loadingContainer}>
        <div style={spinner}></div>
        <p style={loadingText}>Loading attendance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={errorContainer}>
        <div style={errorIcon}></div>
        <h3 style={errorTitle}>Failed to Load Dashboard</h3>
        <p style={errorText}>{error}</p>
        <button onClick={fetchDashboardData} style={retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return null;
  }

  return (
    <div style={container}>
      <div style={header}>
        <div>
          <h2 style={title}>Attendance Dashboard</h2>
          <p style={subtitle}>{eventName || dashboardData.eventName}</p>
          {dashboardData.eventDate && (
            <p style={eventDate}>
              {new Date(dashboardData.eventDate).toLocaleDateString()}
            </p>
          )}
        </div>
        <div style={headerActions}>
          <span style={lastUpdated}>
            Last updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      <AttendanceStats statistics={dashboardData.statistics} />

      <AttendanceList
        participants={dashboardData.participants}
        onManualCheckIn={handleManualCheckIn}
        onRefresh={handleRefresh}
      />

      <ManualCheckInModal
        isOpen={isManualModalOpen}
        onClose={() => {
          setIsManualModalOpen(false);
          setSelectedParticipant(null);
        }}
        participant={selectedParticipant}
        onSubmit={handleManualCheckInSubmit}
      />
    </div>
  );
};

// Styles
const container = {
  maxWidth: '1600px',
  margin: '0 auto',
  padding: '20px',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '30px',
};

const title = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#333',
  marginBottom: '8px',
};

const subtitle = {
  fontSize: '18px',
  color: '#666',
  marginBottom: '4px',
};

const eventDate = {
  fontSize: '14px',
  color: '#999',
  margin: 0,
};

const headerActions = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
  gap: '8px',
};

const lastUpdated = {
  fontSize: '12px',
  color: '#999',
  fontStyle: 'italic',
};

const loadingContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
};

const spinner = {
  width: '50px',
  height: '50px',
  border: '4px solid #f3f3f3',
  borderTop: '4px solid #4CAF50',
  borderRadius: '50%',
  animation: 'spin 1s linear infinite',
};

const loadingText = {
  marginTop: '20px',
  fontSize: '16px',
  color: '#666',
};

const errorContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '400px',
  padding: '40px',
};

const errorIcon = {
  fontSize: '64px',
  marginBottom: '20px',
};

const errorTitle = {
  fontSize: '24px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '10px',
};

const errorText = {
  fontSize: '16px',
  color: '#666',
  marginBottom: '20px',
  textAlign: 'center',
};

const retryButton = {
  padding: '12px 24px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
};

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-attendance-animations]')) {
  style.setAttribute('data-attendance-animations', 'true');
  document.head.appendChild(style);
}

export default AttendanceDashboard;
