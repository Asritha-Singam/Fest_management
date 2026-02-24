import { useState } from 'react';
import CameraScanner from './CameraScanner';
import FileUploadScanner from './FileUploadScanner';
import ScanResultModal from './ScanResultModal';
import axios from 'axios';

const QRScanner = ({ eventId, onScanComplete }) => {
  const [scanMode, setScanMode] = useState('camera'); // 'camera' or 'file'
  const [isScanning, setIsScanning] = useState(false);
  const [modalState, setModalState] = useState({
    isOpen: false,
    result: null,
    type: null, // 'success', 'error', 'duplicate'
  });

  const handleScanSuccess = async (decodedText) => {
    if (isScanning) return; // Prevent multiple simultaneous scans
    
    setIsScanning(true);

    try {
      // Parse QR data
      let qrData;
      try {
        qrData = JSON.parse(decodedText);
      } catch (e) {
        // If not JSON, use as-is
        qrData = decodedText;
      }

      // Call backend API to validate and mark attendance
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.post(
        `${apiUrl}/api/attendance/scan`,
        {
          qrData: typeof qrData === 'string' ? qrData : JSON.stringify(qrData),
          eventId: eventId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setModalState({
          isOpen: true,
          result: response.data.data,
          type: 'success',
        });

        // Notify parent component
        if (onScanComplete) {
          onScanComplete(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error processing scan:', error);

      const errorMessage = error.response?.data?.message || 'Failed to process scan';
      const isDuplicate = error.response?.data?.alreadyScanned || false;

      setModalState({
        isOpen: true,
        result: {
          message: errorMessage,
          checkInTime: error.response?.data?.checkInTime,
        },
        type: isDuplicate ? 'duplicate' : 'error',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleScanError = (errorMessage) => {
    setModalState({
      isOpen: true,
      result: { message: errorMessage },
      type: 'error',
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      result: null,
      type: null,
    });
  };

  return (
    <div style={container}>
      <div style={header}>
        <h2 style={title}>QR Code Scanner</h2>
        <p style={subtitle}>Scan participant tickets to mark attendance</p>
      </div>

      {/* Mode Toggle */}
      <div style={modeToggle}>
        <button
          onClick={() => setScanMode('camera')}
          style={{
            ...toggleButton,
            ...(scanMode === 'camera' ? toggleButtonActive : {}),
          }}
          disabled={isScanning}
        >
          Camera
        </button>
        <button
          onClick={() => setScanMode('file')}
          style={{
            ...toggleButton,
            ...(scanMode === 'file' ? toggleButtonActive : {}),
          }}
          disabled={isScanning}
        >
          Upload File
        </button>
      </div>

      {/* Scanner Area */}
      <div style={scannerArea}>
        {scanMode === 'camera' ? (
          <CameraScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            isActive={!isScanning}
          />
        ) : (
          <FileUploadScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />
        )}
      </div>

      {isScanning && (
        <div style={loadingOverlay}>
          <div style={spinner}></div>
          <p style={loadingText}>Processing scan...</p>
        </div>
      )}

      {/* Result Modal */}
      <ScanResultModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        result={modalState.result}
        type={modalState.type}
      />
    </div>
  );
};

// Styles
const container = {
  maxWidth: '1000px',
  margin: '0 auto',
  padding: '20px',
};

const header = {
  textAlign: 'center',
  marginBottom: '30px',
};

const title = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#333',
  marginBottom: '8px',
};

const subtitle = {
  fontSize: '16px',
  color: '#666',
  margin: 0,
};

const modeToggle = {
  display: 'flex',
  gap: '12px',
  marginBottom: '30px',
  justifyContent: 'center',
};

const toggleButton = {
  flex: 1,
  maxWidth: '200px',
  padding: '12px 20px',
  border: '2px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
  fontSize: '16px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.3s',
  color: '#666',
};

const toggleButtonActive = {
  borderColor: '#4CAF50',
  backgroundColor: '#4CAF50',
  color: '#fff',
};

const scannerArea = {
  backgroundColor: '#fff',
  borderRadius: '12px',
  padding: '30px',
  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  minHeight: '400px',
};

const loadingOverlay = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 999,
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
  fontSize: '18px',
  fontWeight: '500',
  color: '#333',
};

// Add keyframe animations via style tag
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes scaleIn {
    from {
      transform: scale(0);
    }
    to {
      transform: scale(1);
    }
  }
`;
document.head.appendChild(style);

export default QRScanner;
