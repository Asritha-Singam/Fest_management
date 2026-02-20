import express from 'express';
import {
    scanQRCode,
    manualCheckIn,
    getAttendanceDashboard,
    getParticipationStatus,
    exportAttendanceCSV
} from '../controllers/attendanceControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Scan QR code and mark attendance (Organizers only)
router.post('/scan', authorizeRoles('organizer'), scanQRCode);

// Manual check-in with override (Organizers only)
router.post('/manual-checkin', authorizeRoles('organizer'), manualCheckIn);

// Get live attendance dashboard for an event (Organizers only)
router.get('/dashboard/:eventId', authorizeRoles('organizer'), getAttendanceDashboard);

// Get attendance status for a specific participation (Participant or Organizer)
router.get('/status/:participationId', getParticipationStatus);

// Export attendance report as CSV (Organizers only)
router.get('/export/:eventId', authorizeRoles('organizer'), exportAttendanceCSV);

export default router;
