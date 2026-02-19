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
