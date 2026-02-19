# Security Features Implementation

## Overview
Comprehensive security features have been implemented including rate limiting, IP-based blocking, security event logging, and an admin dashboard for monitoring security events.

## Backend Implementation

### 1. Models

#### SecurityEvent Model (`backend/models/SecurityEvent.js`)
Tracks all security-related events with the following fields:
- **eventType**: FAILED_LOGIN, BLOCKED_IP, SUSPICIOUS_ACTIVITY, SUCCESSFUL_LOGIN, RATE_LIMIT_EXCEEDED
- **ipAddress**: Client IP address (indexed for quick queries)
- **email**: Associated email if applicable
- **userAgent**: Browser/client information
- **details**: Additional information about the event
- **severity**: LOW, MEDIUM, HIGH, CRITICAL
- **blocked**: Whether the action was blocked
- **timestamp**: When the event occurred

#### BlockedIP Model (`backend/models/BlockedIP.js`)
Manages IP blocking with:
- **ipAddress**: The blocked IP (unique, indexed)
- **reason**: Why the IP was blocked
- **blockedAt**: When the block was created
- **expiresAt**: When the block expires (indexed for auto-cleanup)
- **failedAttempts**: Number of failed attempts that triggered the block
- **permanent**: Whether the block is permanent
- **blockedBy**: SYSTEM or ADMIN

### 2. Security Middleware (`backend/middleware/securityMiddleware.js`)

#### Key Functions:

**`getClientIP(req)`**
- Extracts real client IP from request (handles proxies)

**`logSecurityEvent(eventType, req, additionalData)`**
- Helper function to log security events to database

**`checkBlockedIP`** (Middleware)
- Checks if incoming request is from a blocked IP
- Returns 403 if blocked
- Logs blocked IP attempts

**`loginRateLimiter`** (Middleware)
- Limits login attempts to 5 per 15 minutes per IP
- After 3 rate limit violations in 1 hour, automatically blocks IP for 24 hours
- Skips rate limiting for admin email (configurable)

**`generalRateLimiter`** (Middleware)
- Limits general API requests to 100 per 15 minutes per IP
- Applied to all routes

**`trackFailedLogin`** (Function)
- Logs failed login attempts
- Automatically blocks IPs with 10+ failed attempts in 30 minutes
- Tracks suspicious activity (8+ failed attempts per email in 1 hour)

**`trackSuccessfulLogin`** (Function)
- Logs successful logins for monitoring

### 3. Security Controllers (`backend/controllers/securityControllers.js`)

#### Endpoints:

**GET `/api/admin/security/events`**
- Retrieves security events with filtering and pagination
- Filters: eventType, severity, ipAddress, email, startDate, endDate
- Pagination: page, limit

**GET `/api/admin/security/stats`**
- Returns comprehensive security statistics:
  - Failed logins (24h and 7d)
  - Active blocked IPs
  - Rate limit violations (24h)
  - Suspicious activity (24h)
  - Top offending IPs
  - Events by type
  - Recent events

**GET `/api/admin/security/blocked-ips`**
- Lists all blocked IPs (active or all)
- Pagination supported

**POST `/api/admin/security/block-ip`**
- Manually block an IP address
- Body: `{ ipAddress, reason, duration, permanent }`
- Logs the manual block action

**DELETE `/api/admin/security/unblock-ip/:ipAddress`**
- Removes an IP from the blocked list
- Logs the unblock action

**DELETE `/api/admin/security/clear-old-events`**
- Maintenance endpoint to clear old security events
- Query param: `days` (default: 30)

### 4. Routes Configuration

#### Auth Routes (`backend/routes/authroutes.js`)
- Login: `checkBlockedIP` → `loginRateLimiter` → `loginUser`
- Register: `checkBlockedIP` → `registerParticipant`

#### Security Routes (`backend/routes/securityRoutes.js`)
- All routes require admin authentication
- Mounted at `/api/admin/security`

#### App Configuration (`backend/app.js`)
- `app.set('trust proxy', 1)` - Enables proper IP detection behind proxies
- `generalRateLimiter` applied to all routes

### 5. Updated Auth Controller (`backend/controllers/authcontrollers.js`)
- Tracks failed login attempts on invalid credentials
- Tracks successful logins
- Logs suspicious activity (disabled account access attempts)

## Frontend Implementation

### 1. Security Services (`frontend/src/services/securityServices.js`)
API service functions for:
- `getSecurityEvents(params)`
- `getSecurityStats()`
- `getBlockedIPs(params)`
- `blockIP(data)`
- `unblockIP(ipAddress)`
- `clearOldSecurityEvents(days)`

### 2. Security Dashboard (`frontend/src/pages/admin/securityDashboard.jsx`)

#### Features:

**Overview Tab**
- Statistics cards showing:
  - Failed logins (24h and 7d)
  - Active blocked IPs
  - Rate limit violations
  - Suspicious activity
- Top offending IPs table
- Events by type breakdown
- Recent security events feed

**Security Events Tab**
- Filterable table of all security events
- Filters by event type and severity
- Pagination support
- Shows: timestamp, type, severity, IP, email, details

**Blocked IPs Tab**
- Table of all currently blocked IPs
- Shows: IP, reason, blocked at, expires at, failed attempts, blocked by
- Unblock button for each IP

**Block IP Tab**
- Form to manually block an IP
- Fields: IP address, reason, duration (1h to 30d), permanent option

### 3. Styling (`frontend/src/pages/admin/securityDashboard.css`)
- Modern, responsive design
- Color-coded severity badges
- Tab-based navigation
- Responsive tables and cards

### 4. Navigation Updates

**App.jsx**
- Added route: `/admin/security` → `<SecurityDashboard />`

**Admin Navbar**
- Added "Security" link to admin navigation

## Security Features Summary

### Rate Limiting
✅ **Login Route**: 5 attempts per 15 minutes
✅ **General API**: 100 requests per 15 minutes
✅ **Automatic Escalation**: 3 rate limit violations → 24h block

### IP Blocking
✅ **Automatic Blocking**: 10 failed logins in 30 minutes → 24h block
✅ **Manual Blocking**: Admin can block any IP with custom duration
✅ **Temporary or Permanent**: Support for both block types
✅ **Auto-Expiry**: Expired blocks automatically removed from database

### Security Monitoring
✅ **Event Logging**: All security events logged with timestamps
✅ **Severity Levels**: LOW, MEDIUM, HIGH, CRITICAL
✅ **Email Tracking**: Track suspicious activity per email
✅ **IP Tracking**: Track suspicious activity per IP

### Admin Dashboard
✅ **Real-time Stats**: Current security status at a glance
✅ **Event Filtering**: Filter by type, severity, IP, email, date range
✅ **Block Management**: View, block, and unblock IPs
✅ **Analytics**: Top offending IPs, events by type

## Usage

### Starting the Application
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

### Accessing Security Dashboard
1. Login as admin (admin@felicity.com / admin123)
2. Navigate to `/admin/security`
3. View security statistics and events

### Testing Rate Limiting
Try logging in with wrong credentials 5+ times to trigger rate limiting and eventual IP blocking.

### Manual IP Blocking
1. Go to Security Dashboard → Block IP tab
2. Enter IP address and reason
3. Select duration or mark as permanent
4. Submit to block

### Viewing Security Events
1. Security Dashboard → Security Events tab
2. Use filters to narrow down events
3. View detailed information for each event

## Environment Variables
No additional environment variables needed. The system uses existing:
- `JWT_SECRET`: For token generation
- `JWT_EXPIRES_IN`: For token expiration  
- `ADMIN_EMAIL`: To skip rate limiting for admin (optional)

## Database Indexes
The following indexes are automatically created for performance:
- SecurityEvent: `timestamp`, `ipAddress + timestamp`, `eventType + timestamp`
- BlockedIP: `ipAddress` (unique), `expiresAt` (with TTL for auto-cleanup)

## Security Best Practices Implemented
✅ IP-based rate limiting
✅ Automatic threat detection and blocking
✅ Comprehensive audit logging
✅ Admin monitoring and alerting capabilities
✅ Manual intervention tools
✅ Graduated response (rate limit → temporary block → permanent block)
✅ Proxy-aware IP detection

## Future Enhancements (Optional)
- Email notifications for security events
- CAPTCHA challenges after failed attempts
- Whitelist functionality
- Geolocation-based blocking
- Machine learning for anomaly detection
- Export security reports (CSV/PDF)
- Real-time WebSocket updates for security dashboard
