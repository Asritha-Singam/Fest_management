import QRCode from 'qrcode';

// Generate QR code for ticket
export const generateQRCode = async (ticketData) => {
    try {
        // Convert ticket data to JSON string
        const dataToEncode = JSON.stringify(ticketData);
        
        // Generate QR code as data URL
        const qrCodeDataURL = await QRCode.toDataURL(dataToEncode, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return qrCodeDataURL;
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Generate QR code as PNG buffer (for file storage)
export const generateQRCodeBuffer = async (ticketData) => {
    try {
        const dataToEncode = JSON.stringify(ticketData);
        
        const buffer = await QRCode.toBuffer(dataToEncode, {
            errorCorrectionLevel: 'H',
            type: 'image/png',
            quality: 0.95,
            margin: 1,
            width: 300,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        return buffer;
    } catch (error) {
        console.error('Error generating QR code buffer:', error);
        throw new Error('Failed to generate QR code');
    }
};

// Generate ticket object with QR code
export const generateTicket = async (orderId, participantEmail, eventName) => {
    try {
        const ticketData = {
            ticketId: orderId,
            participantEmail,
            eventName,
            generatedAt: new Date().toISOString(),
            valid: true
        };

        const qrCodeDataURL = await generateQRCode(ticketData);

        return {
            ...ticketData,
            qrCode: qrCodeDataURL
        };
    } catch (error) {
        console.error('Error generating ticket:', error);
        throw error;
    }
};

// Decode QR code data
export const decodeQRData = (qrData) => {
    try {
        // QR data is already JSON string, just parse it
        const decoded = typeof qrData === 'string' ? JSON.parse(qrData) : qrData;
        
        // Validate required fields
        if (!decoded.ticketId || !decoded.participantEmail || !decoded.eventName) {
            throw new Error('Missing required fields in QR data');
        }
        
        return decoded;
    } catch (error) {
        console.error('Error decoding QR data:', error.message);
        throw new Error('Invalid QR code data format');
    }
};

// Verify QR data authenticity and validity
export const verifyQRData = (decodedData) => {
    try {
        // Check if QR data has required fields
        if (!decodedData.ticketId || !decodedData.participantEmail) {
            return false;
        }

        // Check if marked as valid
        if (decodedData.valid !== true) {
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error verifying QR data:', error);
        return false;
    }
};
