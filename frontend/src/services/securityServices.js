import API from './api.js';

// Security Events
export const getSecurityEvents = (params) => 
    API.get('/api/admin/security/events', { params });

export const getSecurityStats = () => 
    API.get('/api/admin/security/stats');

// Blocked IPs
export const getBlockedIPs = (params) => 
    API.get('/api/admin/security/blocked-ips', { params });

export const blockIP = (data) => 
    API.post('/api/admin/security/block-ip', data);

export const unblockIP = (ipAddress) => 
    API.delete(`/api/admin/security/unblock-ip/${ipAddress}`);

// Maintenance
export const clearOldSecurityEvents = (days) => 
    API.delete('/api/admin/security/clear-old-events', { params: { days } });
