import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// Scan QR Code
export const scanQRCode = async (qrData, eventId) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/scan`,
      { qrData, eventId },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to scan QR code' };
  }
};

// Manual Check-in
export const manualCheckIn = async (participationId, reason) => {
  try {
    const response = await axios.post(
      `${API_URL}/api/attendance/manual-checkin`,
      { participationId, reason },
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to perform manual check-in' };
  }
};

// Get Attendance Dashboard
export const getAttendanceDashboard = async (eventId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/attendance/dashboard/${eventId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch attendance dashboard' };
  }
};

// Get Participation Status
export const getParticipationStatus = async (participationId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/attendance/status/${participationId}`,
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to fetch participation status' };
  }
};

// Export Attendance CSV
export const exportAttendanceCSV = async (eventId) => {
  try {
    const response = await axios.get(
      `${API_URL}/api/attendance/export/${eventId}`,
      {
        ...getAuthHeader(),
        responseType: 'blob', // Important for file download
      }
    );
    
    // Create a blob URL and trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `attendance_${eventId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return { success: true, message: 'CSV downloaded successfully' };
  } catch (error) {
    throw error.response?.data || { message: 'Failed to export attendance' };
  }
};

export default {
  scanQRCode,
  manualCheckIn,
  getAttendanceDashboard,
  getParticipationStatus,
  exportAttendanceCSV,
};
