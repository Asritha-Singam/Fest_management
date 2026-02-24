import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import OrganizerNavbar from '../../components/organizerNavbar';
import QRScanner from '../../components/attendance/QRScanner';
import AttendanceDashboard from '../../components/attendance/AttendanceDashboard';
import { AuthContext } from '../../context/AuthContext';
import { exportAttendanceCSV } from '../../services/attendanceServices';
import api from '../../services/api';

const EventAttendance = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' or 'dashboard'
  const [refreshKey, setRefreshKey] = useState(0);
  const [exportingCSV, setExportingCSV] = useState(false);

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const fetchEventData = async () => {
    try {
      const eventRes = await api.get(`/api/organizer/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const selectedEvent = eventRes.data.events.find((e) => e._id === id);
      setEvent(selectedEvent);
    } catch (error) {
      console.error('Error fetching event:', error);
    }
  };

  const handleScanComplete = (data) => {
    // Refresh dashboard when scan is successful
    setRefreshKey((prev) => prev + 1);
  };

  const handleExportCSV = async () => {
    try {
      setExportingCSV(true);
      await exportAttendanceCSV(id);
      alert('Attendance report downloaded successfully!');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Failed to export attendance report');
    } finally {
      setExportingCSV(false);
    }
  };

  if (!event) {
    return (
      <>
        <OrganizerNavbar />
        <div style={loadingContainer}>
          <div style={spinner}></div>
          <p style={loadingText}>Loading event data...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <OrganizerNavbar />
      <div style={container}>
        {/* Header */}
        <div style={header}>
          <div>
            <button onClick={() => navigate(-1)} style={backButton}>
              ← Back to Event
            </button>
            <h1 style={title}>Attendance Tracking</h1>
            <p style={eventName}>{event.eventName}</p>
            <p style={eventDate}>
              {new Date(event.eventStartDate).toLocaleDateString()} - {new Date(event.eventEndDate).toLocaleDateString()}
            </p>
          </div>
          <div style={headerActions}>
            <button
              onClick={handleExportCSV}
              disabled={exportingCSV}
              style={{
                ...exportButton,
                ...(exportingCSV ? disabledButton : {}),
              }}
            >
              {exportingCSV ? 'Exporting...' : 'Export CSV'}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={tabContainer}>
          <button
            onClick={() => setActiveTab('scanner')}
            style={{
              ...tab,
              ...(activeTab === 'scanner' ? activeTabStyle : inactiveTabStyle),
            }}
          >
            QR Scanner
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              ...tab,
              ...(activeTab === 'dashboard' ? activeTabStyle : inactiveTabStyle),
            }}
          >
            Dashboard
          </button>
        </div>

        {/* Content */}
        <div style={contentContainer}>
          {activeTab === 'scanner' ? (
            <div style={scannerSection}>
              <QRScanner eventId={id} onScanComplete={handleScanComplete} />
              <div style={scannerNote}>
                <div style={noteIcon}></div>
                <div>
                  <strong>Tip:</strong> After scanning tickets, switch to the Dashboard tab to
                  view attendance statistics and manage check-ins.
                </div>
              </div>
            </div>
          ) : (
            <AttendanceDashboard key={refreshKey} eventId={id} eventName={event.eventName} />
          )}
        </div>
      </div>
    </>
  );
};

// Styles
const container = {
  minHeight: '100vh',
  backgroundColor: '#f5f5f5',
  paddingBottom: '40px',
};

const loadingContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '60vh',
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

const header = {
  backgroundColor: '#fff',
  padding: '30px',
  borderBottom: '2px solid #e0e0e0',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: '20px',
};

const backButton = {
  padding: '8px 16px',
  backgroundColor: '#f5f5f5',
  color: '#333',
  border: '1px solid #ddd',
  borderRadius: '6px',
  fontSize: '14px',
  cursor: 'pointer',
  marginBottom: '15px',
  transition: 'background-color 0.3s',
};

const title = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#333',
  margin: '0 0 8px 0',
};

const eventName = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#4CAF50',
  margin: '0 0 4px 0',
};

const eventDate = {
  fontSize: '14px',
  color: '#666',
  margin: 0,
};

const headerActions = {
  display: 'flex',
  gap: '12px',
  alignItems: 'center',
};

const exportButton = {
  padding: '12px 24px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  whiteSpace: 'nowrap',
};

const disabledButton = {
  backgroundColor: '#ccc',
  cursor: 'not-allowed',
};

const tabContainer = {
  backgroundColor: '#fff',
  display: 'flex',
  borderBottom: '2px solid #e0e0e0',
  padding: '0 30px',
};

const tab = {
  padding: '15px 30px',
  border: 'none',
  backgroundColor: 'transparent',
  fontSize: '16px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.3s',
  borderBottom: '3px solid transparent',
  position: 'relative',
  top: '2px',
};

const activeTabStyle = {
  color: '#4CAF50',
  borderBottomColor: '#4CAF50',
};

const inactiveTabStyle = {
  color: '#999',
};

const contentContainer = {
  padding: '30px',
};

const scannerSection = {
  maxWidth: '900px',
  margin: '0 auto',
};

const scannerNote = {
  display: 'flex',
  gap: '15px',
  backgroundColor: '#e3f2fd',
  padding: '20px',
  borderRadius: '12px',
  marginTop: '30px',
  border: '1px solid #2196F3',
  fontSize: '14px',
  lineHeight: '1.6',
};

const noteIcon = {
  fontSize: '24px',
};

// Add keyframe animation
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
if (!document.querySelector('style[data-event-attendance-animations]')) {
  style.setAttribute('data-event-attendance-animations', 'true');
  document.head.appendChild(style);
}

export default EventAttendance;
