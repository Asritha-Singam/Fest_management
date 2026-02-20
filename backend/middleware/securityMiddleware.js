import rateLimit from "express-rate-limit";
import BlockedIP from "../models/BlockedIP.js";
import SecurityEvent from "../models/SecurityEvent.js";

// Helper function to get client IP
export const getClientIP = (req) => {
    return req.ip || 
           req.headers['x-forwarded-for']?.split(',')[0].trim() || 
           req.headers['x-real-ip'] || 
           req.connection.remoteAddress || 
           'unknown';
};

// Helper function to log security events
export const logSecurityEvent = async (eventType, req, additionalData = {}) => {
    try {
        const ipAddress = getClientIP(req);
        const userAgent = req.headers['user-agent'] || 'Unknown';
        
        await SecurityEvent.create({
            eventType,
            ipAddress,
            email: additionalData.email || req.body?.email,
            userAgent,
            details: additionalData.details || '',
            severity: additionalData.severity || 'LOW',
            blocked: additionalData.blocked || false
        });
    } catch (error) {
        console.error('Error logging security event:', error);
    }
};

// Middleware to check if IP is blocked
export const checkBlockedIP = async (req, res, next) => {
    try {
        const ipAddress = getClientIP(req);
        
        const blockedIP = await BlockedIP.findOne({
            ipAddress,
            $or: [
                { permanent: true },
                { expiresAt: { $gt: new Date() } }
            ]
        });

        if (blockedIP) {
            await logSecurityEvent('BLOCKED_IP', req, {
                details: `Attempt from blocked IP: ${blockedIP.reason}`,
                severity: 'HIGH',
                blocked: true
            });

            return res.status(403).json({
                message: 'Access denied. Your IP has been blocked due to suspicious activity.',
                blockedUntil: blockedIP.permanent ? 'permanently' : blockedIP.expiresAt
            });
        }

        next();
    } catch (error) {
        console.error('Error checking blocked IP:', error);
        next();
    }
};

// Rate limiter for login attempts - 5 attempts per 15 minutes
export const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per windowMs
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
    handler: async (req, res) => {
        const ipAddress = getClientIP(req);
        
        // Log rate limit exceeded
        await logSecurityEvent('RATE_LIMIT_EXCEEDED', req, {
            details: 'Login rate limit exceeded',
            severity: 'MEDIUM'
        });

        // Check if we should block this IP (more than 3 rate limit violations)
        const recentEvents = await SecurityEvent.countDocuments({
            ipAddress,
            eventType: 'RATE_LIMIT_EXCEEDED',
            timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
        });

        if (recentEvents >= 3) {
            // Block IP for 24 hours
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
            
            await BlockedIP.findOneAndUpdate(
                { ipAddress },
                {
                    ipAddress,
                    reason: 'Multiple rate limit violations',
                    expiresAt,
                    failedAttempts: recentEvents,
                    blockedBy: 'SYSTEM'
                },
                { upsert: true, new: true }
            );

            await logSecurityEvent('BLOCKED_IP', req, {
                details: 'IP blocked due to multiple rate limit violations',
                severity: 'HIGH',
                blocked: true
            });

            return res.status(403).json({
                message: 'Your IP has been blocked due to excessive failed attempts. Please contact support.',
                blockedUntil: expiresAt
            });
        }

        res.status(429).json({
            message: 'Too many login attempts from this IP, please try again after 15 minutes',
            retryAfter: '15 minutes'
        });
    },
    skip: (req) => {
        // Skip rate limiting for admin emails (optional)
        return req.body?.email === process.env.ADMIN_EMAIL;
    }
});

// Rate limiter for general API requests - 100 requests per 15 minutes
export const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false
});

// Middleware to track failed login attempts
export const trackFailedLogin = async (req, res, next) => {
    const ipAddress = getClientIP(req);
    const email = req.body?.email;

    try {
        // Log failed login attempt
        await logSecurityEvent('FAILED_LOGIN', req, {
            email,
            details: 'Failed login attempt',
            severity: 'MEDIUM'
        });

        // Count recent failed attempts from this IP
        const recentFailures = await SecurityEvent.countDocuments({
            ipAddress,
            eventType: 'FAILED_LOGIN',
            timestamp: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
        });

        // Block IP if more than 10 failed attempts in 30 minutes
        if (recentFailures >= 10) {
            const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

            await BlockedIP.findOneAndUpdate(
                { ipAddress },
                {
                    ipAddress,
                    reason: `${recentFailures} failed login attempts in 30 minutes`,
                    expiresAt,
                    failedAttempts: recentFailures,
                    blockedBy: 'SYSTEM'
                },
                { upsert: true, new: true }
            );

            await logSecurityEvent('BLOCKED_IP', req, {
                email,
                details: `IP automatically blocked after ${recentFailures} failed attempts`,
                severity: 'CRITICAL',
                blocked: true
            });
        }

        // Also track failed attempts per email
        if (email) {
            const emailFailures = await SecurityEvent.countDocuments({
                email,
                eventType: 'FAILED_LOGIN',
                timestamp: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
            });

            if (emailFailures >= 8) {
                await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
                    email,
                    details: `${emailFailures} failed login attempts for email ${email}`,
                    severity: 'HIGH'
                });
            }
        }
    } catch (error) {
        console.error('Error tracking failed login:', error);
    }

    next();
};

// Middleware to track successful logins (for monitoring)
export const trackSuccessfulLogin = async (req, res, next) => {
    try {
        await logSecurityEvent('SUCCESSFUL_LOGIN', req, {
            email: req.body?.email,
            details: 'Successful login',
            severity: 'LOW'
        });
    } catch (error) {
        console.error('Error tracking successful login:', error);
    }
    next();
};
