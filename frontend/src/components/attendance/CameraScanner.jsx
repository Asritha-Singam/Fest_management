import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

const CameraScanner = ({ onScanSuccess, onScanError, isActive }) => {
  const scannerRef = useRef(null);
  const [cameras, setCameras] = useState([]);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          // Prefer back camera for mobile
          const backCamera = devices.find(device => 
            device.label.toLowerCase().includes('back') || 
            device.label.toLowerCase().includes('rear')
          );
          setSelectedCamera(backCamera ? backCamera.id : devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras:', err);
        setPermissionDenied(true);
      });
  }, []);

  useEffect(() => {
    if (!isActive || !selectedCamera) return;

    const html5QrCode = new Html5Qrcode('qr-reader');
    scannerRef.current = html5QrCode;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    html5QrCode
      .start(
        selectedCamera,
        config,
        (decodedText) => {
          onScanSuccess(decodedText);
          // Stop scanning after successful scan
          html5QrCode.stop().then(() => {
            setIsScanning(false);
          }).catch((err) => {
            console.error('Error stopping scanner:', err);
          });
        },
        (errorMessage) => {
          // Scanning errors are frequent, only log occasionally
        }
      )
      .then(() => {
        setIsScanning(true);
      })
      .catch((err) => {
        console.error('Error starting camera:', err);
        onScanError('Failed to start camera: ' + err);
        setPermissionDenied(true);
      });

    return () => {
      if (html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => {
            setIsScanning(false);
          })
          .catch((err) => {
            console.error('Error stopping scanner on cleanup:', err);
          });
      }
    };
  }, [isActive, selectedCamera, onScanSuccess, onScanError]);

  if (permissionDenied) {
    return (
      <div style={errorContainer}>
        <div style={errorIcon}>📷</div>
        <h3 style={errorTitle}>Camera Access Denied</h3>
        <p style={errorText}>
          Please allow camera access in your browser settings to scan QR codes.
        </p>
        <button 
          onClick={() => window.location.reload()} 
          style={retryButton}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={container}>
      {cameras.length > 1 && (
        <div style={cameraSelect}>
          <label htmlFor="camera-select" style={label}>
            Select Camera:
          </label>
          <select
            id="camera-select"
            value={selectedCamera || ''}
            onChange={(e) => setSelectedCamera(e.target.value)}
            disabled={isScanning}
            style={selectInput}
          >
            {cameras.map((camera) => (
              <option key={camera.id} value={camera.id}>
                {camera.label || `Camera ${camera.id}`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div id="qr-reader" style={readerContainer}></div>

      <div style={instructionBox}>
        <p style={instruction}>
          📱 Position the QR code within the frame
        </p>
        <p style={instructionSmall}>
          The scanner will automatically detect and process the code
        </p>
      </div>
    </div>
  );
};

// Styles
const container = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  gap: '20px',
};

const cameraSelect = {
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
};

const label = {
  fontSize: '14px',
  fontWeight: '500',
  color: '#333',
};

const selectInput = {
  padding: '10px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  fontSize: '14px',
  backgroundColor: '#fff',
  cursor: 'pointer',
};

const readerContainer = {
  width: '100%',
  maxWidth: '500px',
  border: '2px solid #4CAF50',
  borderRadius: '12px',
  overflow: 'hidden',
};

const instructionBox = {
  textAlign: 'center',
  padding: '15px',
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  width: '100%',
};

const instruction = {
  margin: '0 0 8px 0',
  fontSize: '16px',
  color: '#333',
  fontWeight: '500',
};

const instructionSmall = {
  margin: 0,
  fontSize: '14px',
  color: '#666',
};

const errorContainer = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  textAlign: 'center',
};

const errorIcon = {
  fontSize: '64px',
  marginBottom: '20px',
};

const errorTitle = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '10px',
};

const errorText = {
  fontSize: '14px',
  color: '#666',
  marginBottom: '20px',
  lineHeight: '1.5',
};

const retryButton = {
  padding: '10px 24px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
};

export default CameraScanner;
