import express from 'express';
import {
    getSecurityEvents,
    getSecurityStats,
    getBlockedIPs,
    blockIP,
    unblockIP,
    clearOldSecurityEvents
} from '../controllers/securityControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import authorizeRoles from '../middleware/roleMiddleware.js';

const router = express.Router();

// All security routes require admin authentication
router.use(authMiddleware);
router.use(authorizeRoles("admin"));

// GET /api/admin/security/events - Get all security events with filtering
router.get('/events', getSecurityEvents);

// GET /api/admin/security/stats - Get security statistics
router.get('/stats', getSecurityStats);

// GET /api/admin/security/blocked-ips - Get all blocked IPs
router.get('/blocked-ips', getBlockedIPs);

// POST /api/admin/security/block-ip - Manually block an IP
router.post('/block-ip', blockIP);

// DELETE /api/admin/security/unblock-ip/:ipAddress - Unblock an IP
router.delete('/unblock-ip/:ipAddress', unblockIP);

// DELETE /api/admin/security/clear-old-events - Clear old security events
router.delete('/clear-old-events', clearOldSecurityEvents);

export default router;
