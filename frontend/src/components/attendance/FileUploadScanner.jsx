import { Html5Qrcode } from 'html5-qrcode';

const FileUploadScanner = ({ onScanSuccess, onScanError }) => {
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    
    if (!file) {
      return;
    }

    // Validate file type
    const validTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/bmp', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      onScanError('Please select a valid image file (PNG, JPG, JPEG, GIF, BMP, WEBP)');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      onScanError('File size must be less than 10MB');
      return;
    }

    const html5QrCode = new Html5Qrcode('file-qr-reader');

    html5QrCode
      .scanFile(file, true)
      .then((decodedText) => {
        onScanSuccess(decodedText);
      })
      .catch((err) => {
        console.error('Error scanning file:', err);
        onScanError('Could not detect QR code in the image. Please try another image.');
      })
      .finally(() => {
        html5QrCode.clear();
        // Reset file input
        event.target.value = '';
      });
  };

  return (
    <div style={container}>
      <div id="file-qr-reader" style={{ display: 'none' }}></div>

      <div style={dropzone}>
        <p style={dropzoneText}>
          Upload a QR code image
        </p>

        <input
          type="file"
          accept="image/png,image/jpg,image/jpeg,image/gif,image/bmp,image/webp"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="qr-file-input"
        />
        
        <label htmlFor="qr-file-input" style={uploadButton}>
          Choose File
        </label>

        <p style={fileInfo}>
          Supported formats: PNG, JPG, JPEG, GIF, BMP, WEBP (Max: 10MB)
        </p>
      </div>

      <div style={instructionBox}>
        <h4 style={instructionTitle}>How to upload:</h4>
        <ul style={instructionList}>
          <li>Take a clear photo of the QR code</li>
          <li>Make sure the QR code is fully visible</li>
          <li>Avoid glare or shadows on the code</li>
          <li>Ensure good lighting for best results</li>
        </ul>
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

const dropzone = {
  border: '2px dashed #ccc',
  borderRadius: '12px',
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: '#fafafa',
  width: '100%',
  minHeight: '250px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const uploadIcon = {
  fontSize: '64px',
  marginBottom: '20px',
};

const dropzoneText = {
  fontSize: '16px',
  fontWeight: '500',
  color: '#333',
  marginBottom: '10px',
};

const uploadButton = {
  display: 'inline-block',
  padding: '12px 28px',
  backgroundColor: '#4CAF50',
  color: '#fff',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  marginTop: '10px',
  transition: 'background-color 0.3s',
};

const fileInfo = {
  fontSize: '12px',
  color: '#999',
  marginTop: '15px',
};

const instructionBox = {
  backgroundColor: '#f8f9fa',
  padding: '20px',
  borderRadius: '8px',
  width: '100%',
};

const instructionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#333',
  marginBottom: '12px',
  marginTop: 0,
};

const instructionList = {
  margin: 0,
  paddingLeft: '20px',
  fontSize: '14px',
  color: '#666',
  lineHeight: '1.8',
};

export default FileUploadScanner;
