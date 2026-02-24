import { useState } from 'react';
import ParticipantStatusBadge from './ParticipantStatusBadge';

const AttendanceList = ({ participants, onManualCheckIn, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'checked-in', 'not-scanned'
  const [sortBy, setSortBy] = useState('name'); // 'name', 'time', 'status'

  // Filter participants
  let filteredParticipants = (participants || []).filter((p) => {
    const pName = p?.participantName || '';
    const pEmail = p?.participantEmail || '';
    const pTicket = p?.ticketId || '';
    
    const matchesSearch =
      pName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pTicket && String(pTicket).toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'checked-in' && p?.attendanceStatus === 'checked-in') ||
      (filterStatus === 'not-scanned' && p?.attendanceStatus === 'not-scanned');

    return matchesSearch && matchesFilter;
  });

  // Sort participants
  filteredParticipants.sort((a, b) => {
    if (sortBy === 'name') {
      return (a?.participantName || '').localeCompare(b?.participantName || '');
    } else if (sortBy === 'time') {
      if (!a?.checkInTime && !b?.checkInTime) return 0;
      if (!a?.checkInTime) return 1;
      if (!b?.checkInTime) return -1;
      return new Date(b.checkInTime) - new Date(a.checkInTime);
    } else if (sortBy === 'status') {
      return (a?.attendanceStatus || '').localeCompare(b?.attendanceStatus || '');
    }
    return 0;
  });

  return (
    <div style={container}>
      <div style={header}>
        <div style={headerLeft}>
          <h3 style={title}>Participant List</h3>
          <span style={count}>
            Showing {filteredParticipants.length} of {participants.length}
          </span>
        </div>
        <button onClick={onRefresh} style={refreshButton} title="Refresh data">
          Refresh
        </button>
      </div>

      <div style={controls}>
        <div style={searchBox}>
          <span style={searchIcon}></span>
          <input
            type="text"
            placeholder="Search by name, email, or ticket ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={searchInput}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={clearButton}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div style={filters}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={select}
          >
            <option value="all">All Status</option>
            <option value="checked-in">Checked In</option>
            <option value="not-scanned">Not Scanned</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={select}
          >
            <option value="name">Sort by Name</option>
            <option value="time">Sort by Time</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      <div style={listContainer}>
        {filteredParticipants.length === 0 ? (
          <div style={emptyState}>
            <div style={emptyIcon}></div>
            <p style={emptyText}>
              {searchTerm || filterStatus !== 'all'
                ? 'No participants match your filters'
                : 'No participants registered yet'}
            </p>
          </div>
        ) : (
          <div style={table}>
            {/* Table Header */}
            <div style={tableHeader}>
              <div style={{ ...tableCell, ...nameCell }}>Participant</div>
              <div style={{ ...tableCell, ...emailCell }}>Email</div>
              <div style={{ ...tableCell, ...ticketCell }}>Ticket ID</div>
              <div style={{ ...tableCell, ...statusCell }}>Status</div>
              <div style={{ ...tableCell, ...timeCell }}>Check-In Time</div>
              <div style={{ ...tableCell, ...actionCell }}>Action</div>
            </div>

            {/* Table Body */}
            {filteredParticipants.map((participant) => (
              <div key={participant.id} style={tableRow}>
                <div style={{ ...tableCell, ...nameCell }}>
                  <div style={participantName}>{participant.participantName}</div>
                </div>
                <div style={{ ...tableCell, ...emailCell }}>
                  <div style={participantEmail}>{participant.participantEmail}</div>
                </div>
                <div style={{ ...tableCell, ...ticketCell }}>
                  <code style={ticketId}>{participant.ticketId || 'N/A'}</code>
                </div>
                <div style={{ ...tableCell, ...statusCell }}>
                  <ParticipantStatusBadge
                    status={participant.attendanceStatus}
                    manualOverride={participant.manualOverride}
                  />
                </div>
                <div style={{ ...tableCell, ...timeCell }}>
                  {participant.checkInTime ? (
                    <div>
                      <div style={checkInTime}>
                        {new Date(participant.checkInTime).toLocaleTimeString()}
                      </div>
                      <div style={checkInDate}>
                        {new Date(participant.checkInTime).toLocaleDateString()}
                      </div>
                      {participant.checkInByName && (
                        <div style={checkInBy}>by {participant.checkInByName}</div>
                      )}
                    </div>
                  ) : (
                    <span style={notCheckedIn}>—</span>
                  )}
                </div>
                <div style={{ ...tableCell, ...actionCell }}>
                  {participant.attendanceStatus === 'not-scanned' && (
                    <button
                      onClick={() => onManualCheckIn(participant)}
                      style={manualButton}
                      title="Manual check-in"
                    >
                      Manual
                    </button>
                  )}
                  {participant.manualOverride && participant.overrideReason && (
                    <button
                      style={viewReasonButton}
                      title={participant.overrideReason}
                    >
                      Reason
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Styles
const container = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  overflow: 'hidden',
};

const header = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 25px',
  borderBottom: '1px solid #e0e0e0',
};

const headerLeft = {
  display: 'flex',
  alignItems: 'center',
  gap: '15px',
};

const title = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#333',
  margin: 0,
};

const count = {
  fontSize: '14px',
  color: '#999',
  backgroundColor: '#f5f5f5',
  padding: '4px 12px',
  borderRadius: '12px',
};

const refreshButton = {
  padding: '8px 16px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
};

const controls = {
  padding: '20px 25px',
  borderBottom: '1px solid #e0e0e0',
  display: 'flex',
  gap: '15px',
  flexWrap: 'wrap',
};

const searchBox = {
  flex: '1 1 300px',
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
};

const searchIcon = {
  position: 'absolute',
  left: '12px',
  fontSize: '18px',
};

const searchInput = {
  width: '100%',
  padding: '10px 40px 10px 40px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const clearButton = {
  position: 'absolute',
  right: '8px',
  background: 'none',
  border: 'none',
  fontSize: '16px',
  color: '#999',
  cursor: 'pointer',
  padding: '4px 8px',
};

const filters = {
  display: 'flex',
  gap: '10px',
};

const select = {
  padding: '10px 12px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const listContainer = {
  maxHeight: '600px',
  overflowY: 'auto',
};

const table = {
  display: 'flex',
  flexDirection: 'column',
};

const tableHeader = {
  display: 'flex',
  backgroundColor: '#f8f9fa',
  padding: '15px 25px',
  fontWeight: '600',
  fontSize: '13px',
  color: '#666',
  textTransform: 'uppercase',
  position: 'sticky',
  top: 0,
  zIndex: 1,
};

const tableRow = {
  display: 'flex',
  padding: '15px 25px',
  borderBottom: '1px solid #f0f0f0',
  transition: 'background-color 0.2s',
  cursor: 'default',
};

const tableCell = {
  display: 'flex',
  alignItems: 'center',
  fontSize: '14px',
  padding: '0 8px',
};

const nameCell = { flex: '1.5', minWidth: '150px' };
const emailCell = { flex: '1.5', minWidth: '150px' };
const ticketCell = { flex: '1', minWidth: '120px' };
const statusCell = { flex: '1', minWidth: '120px' };
const timeCell = { flex: '1.2', minWidth: '140px' };
const actionCell = { flex: '0.8', minWidth: '100px', justifyContent: 'center' };

const participantName = {
  fontWeight: '600',
  color: '#333',
};

const participantEmail = {
  color: '#666',
  fontSize: '13px',
};

const ticketId = {
  backgroundColor: '#f5f5f5',
  padding: '4px 8px',
  borderRadius: '4px',
  fontSize: '12px',
  fontFamily: 'monospace',
};

const checkInTime = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#333',
};

const checkInDate = {
  fontSize: '12px',
  color: '#999',
};

const checkInBy = {
  fontSize: '11px',
  color: '#666',
  fontStyle: 'italic',
};

const notCheckedIn = {
  color: '#ccc',
  fontSize: '18px',
};

const manualButton = {
  padding: '6px 12px',
  backgroundColor: '#ff9800',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

const viewReasonButton = {
  padding: '6px 12px',
  backgroundColor: '#2196F3',
  color: '#fff',
  border: 'none',
  borderRadius: '6px',
  fontSize: '12px',
  fontWeight: '500',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
  marginLeft: '5px',
};

const emptyState = {
  textAlign: 'center',
  padding: '60px 20px',
};

const emptyIcon = {
  fontSize: '64px',
  marginBottom: '15px',
};

const emptyText = {
  fontSize: '16px',
  color: '#999',
};

export default AttendanceList;
