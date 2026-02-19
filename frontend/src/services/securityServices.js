import API from './api.js';

// Security Events
export const getSecurityEvents = (params) => 
    API.get('/admin/security/events', { params });

export const getSecurityStats = () => 
    API.get('/admin/security/stats');

// Blocked IPs
export const getBlockedIPs = (params) => 
    API.get('/admin/security/blocked-ips', { params });

export const blockIP = (data) => 
    API.post('/admin/security/block-ip', data);

export const unblockIP = (ipAddress) => 
    API.delete(`/admin/security/unblock-ip/${ipAddress}`);

// Maintenance
export const clearOldSecurityEvents = (days) => 
    API.delete('/admin/security/clear-old-events', { params: { days } });
