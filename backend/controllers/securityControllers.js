import SecurityEvent from "../models/SecurityEvent.js";
import BlockedIP from "../models/BlockedIP.js";

// Get all security events with filtering and pagination
export const getSecurityEvents = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 50, 
            eventType, 
            severity, 
            ipAddress,
            email,
            startDate,
            endDate
        } = req.query;

        const query = {};

        // Apply filters
        if (eventType) query.eventType = eventType;
        if (severity) query.severity = severity;
        if (ipAddress) query.ipAddress = ipAddress;
        if (email) query.email = { $regex: email, $options: 'i' };
        
        if (startDate || endDate) {
            query.timestamp = {};
            if (startDate) query.timestamp.$gte = new Date(startDate);
            if (endDate) query.timestamp.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;

        const [events, total] = await Promise.all([
            SecurityEvent.find(query)
                .sort({ timestamp: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            SecurityEvent.countDocuments(query)
        ]);

        res.status(200).json({
            events,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching security events:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get security statistics/dashboard data
export const getSecurityStats = async (req, res) => {
    try {
        const now = new Date();
        const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Get counts for different time periods
        const [
            failedLoginsLast24h,
            failedLoginsLast7d,
            blockedIPsActive,
            rateLimitExceeded24h,
            suspiciousActivity24h,
            recentEvents
        ] = await Promise.all([
            SecurityEvent.countDocuments({
                eventType: 'FAILED_LOGIN',
                timestamp: { $gte: last24Hours }
            }),
            SecurityEvent.countDocuments({
                eventType: 'FAILED_LOGIN',
                timestamp: { $gte: last7Days }
            }),
            BlockedIP.countDocuments({
                $or: [
                    { permanent: true },
                    { expiresAt: { $gt: now } }
                ]
            }),
            SecurityEvent.countDocuments({
                eventType: 'RATE_LIMIT_EXCEEDED',
                timestamp: { $gte: last24Hours }
            }),
            SecurityEvent.countDocuments({
                eventType: 'SUSPICIOUS_ACTIVITY',
                timestamp: { $gte: last24Hours }
            }),
            SecurityEvent.find()
                .sort({ timestamp: -1 })
                .limit(10)
                .lean()
        ]);

        // Get top offending IPs
        const topOffendingIPs = await SecurityEvent.aggregate([
            {
                $match: {
                    eventType: { $in: ['FAILED_LOGIN', 'RATE_LIMIT_EXCEEDED'] },
                    timestamp: { $gte: last24Hours }
                }
            },
            {
                $group: {
                    _id: '$ipAddress',
                    count: { $sum: 1 },
                    lastSeen: { $max: '$timestamp' }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);

        // Get events by type for last 24h
        const eventsByType = await SecurityEvent.aggregate([
            {
                $match: {
                    timestamp: { $gte: last24Hours }
                }
            },
            {
                $group: {
                    _id: '$eventType',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            summary: {
                failedLoginsLast24h,
                failedLoginsLast7d,
                blockedIPsActive,
                rateLimitExceeded24h,
                suspiciousActivity24h
            },
            topOffendingIPs,
            eventsByType,
            recentEvents
        });
    } catch (error) {
        console.error('Error fetching security stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all blocked IPs
export const getBlockedIPs = async (req, res) => {
    try {
        const { page = 1, limit = 20, active } = req.query;
        const skip = (page - 1) * limit;

        const query = {};
        
        // Filter for active blocks only
        if (active === 'true') {
            const now = new Date();
            query.$or = [
                { permanent: true },
                { expiresAt: { $gt: now } }
            ];
        }

        const [blockedIPs, total] = await Promise.all([
            BlockedIP.find(query)
                .sort({ blockedAt: -1 })
                .limit(parseInt(limit))
                .skip(skip)
                .lean(),
            BlockedIP.countDocuments(query)
        ]);

        res.status(200).json({
            blockedIPs,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching blocked IPs:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Manually block an IP
export const blockIP = async (req, res) => {
    try {
        const { ipAddress, reason, duration, permanent } = req.body;

        if (!ipAddress || !reason) {
            return res.status(400).json({ message: 'IP address and reason are required' });
        }

        const expiresAt = permanent 
            ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years for "permanent"
            : new Date(Date.now() + (duration || 24 * 60 * 60 * 1000)); // Default 24 hours

        const blockedIP = await BlockedIP.findOneAndUpdate(
            { ipAddress },
            {
                ipAddress,
                reason,
                expiresAt,
                permanent: permanent || false,
                blockedBy: 'ADMIN',
                blockedAt: new Date()
            },
            { upsert: true, new: true }
        );

        // Log the manual block
        await SecurityEvent.create({
            eventType: 'BLOCKED_IP',
            ipAddress,
            details: `Manually blocked by admin: ${reason}`,
            severity: 'HIGH',
            blocked: true,
            userAgent: 'Admin Action'
        });

        res.status(200).json({
            message: 'IP blocked successfully',
            blockedIP
        });
    } catch (error) {
        console.error('Error blocking IP:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Unblock an IP
export const unblockIP = async (req, res) => {
    try {
        const { ipAddress } = req.params;

        const result = await BlockedIP.findOneAndDelete({ ipAddress });

        if (!result) {
            return res.status(404).json({ message: 'IP not found in blocked list' });
        }

        // Log the unblock action
        await SecurityEvent.create({
            eventType: 'SUSPICIOUS_ACTIVITY',
            ipAddress,
            details: 'IP unblocked by admin',
            severity: 'LOW',
            userAgent: 'Admin Action'
        });

        res.status(200).json({ message: 'IP unblocked successfully' });
    } catch (error) {
        console.error('Error unblocking IP:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Clear old security events (maintenance)
export const clearOldSecurityEvents = async (req, res) => {
    try {
        const { days = 30 } = req.query;
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const result = await SecurityEvent.deleteMany({
            timestamp: { $lt: cutoffDate }
        });

        res.status(200).json({
            message: `Cleared ${result.deletedCount} old security events`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Error clearing old events:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
