import { useState, useEffect } from 'react';
import { getSecurityStats, getSecurityEvents, getBlockedIPs, blockIP, unblockIP } from '../../services/securityServices';
import AdminNavbar from '../../components/adminNavbar';
import './securityDashboard.css';

const SecurityDashboard = () => {
    const [stats, setStats] = useState(null);
    const [events, setEvents] = useState([]);
    const [blockedIPs, setBlockedIPs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [filters, setFilters] = useState({
        eventType: '',
        severity: '',
        page: 1,
        limit: 20
    });
    const [blockIPForm, setBlockIPForm] = useState({
        ipAddress: '',
        reason: '',
        duration: 24 * 60 * 60 * 1000, // 24 hours in ms
        permanent: false
    });

    useEffect(() => {
        fetchSecurityData();
    }, [activeTab, filters]);

    const fetchSecurityData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'overview') {
                const statsRes = await getSecurityStats();
                setStats(statsRes.data);
            } else if (activeTab === 'events') {
                const eventsRes = await getSecurityEvents(filters);
                setEvents(eventsRes.data.events);
            } else if (activeTab === 'blocked-ips') {
                const blockedRes = await getBlockedIPs({ active: 'true' });
                setBlockedIPs(blockedRes.data.blockedIPs);
            }
        } catch (error) {
            console.error('Error fetching security data:', error);
        }
        setLoading(false);
    };

    const handleBlockIP = async (e) => {
        e.preventDefault();
        try {
            await blockIP(blockIPForm);
            alert('IP blocked successfully');
            setBlockIPForm({ ipAddress: '', reason: '', duration: 24 * 60 * 60 * 1000, permanent: false });
            fetchSecurityData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error blocking IP');
        }
    };

    const handleUnblockIP = async (ipAddress) => {
        if (!confirm(`Are you sure you want to unblock ${ipAddress}?`)) return;
        
        try {
            await unblockIP(ipAddress);
            alert('IP unblocked successfully');
            fetchSecurityData();
        } catch (error) {
            alert(error.response?.data?.message || 'Error unblocking IP');
        }
    };

    const getSeverityColor = (severity) => {
        const colors = {
            LOW: '#4caf50',
            MEDIUM: '#ff9800',
            HIGH: '#f44336',
            CRITICAL: '#9c27b0'
        };
        return colors[severity] || '#757575';
    };

    const getEventTypeLabel = (type) => {
        const labels = {
            FAILED_LOGIN: 'Failed Login',
            BLOCKED_IP: 'IP Blocked',
            SUSPICIOUS_ACTIVITY: 'Suspicious Activity',
            SUCCESSFUL_LOGIN: 'Successful Login',
            RATE_LIMIT_EXCEEDED: 'Rate Limit Exceeded'
        };
        return labels[type] || type;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleString();
    };

    const formatDuration = (ms) => {
        const hours = ms / (1000 * 60 * 60);
        if (hours < 24) return `${hours} hours`;
        const days = hours / 24;
        return `${Math.round(days)} days`;
    };

    return (
        <>
            <AdminNavbar />
            <div className="security-dashboard">
                <h1>Security Dashboard</h1>

            <div className="tabs">
                <button 
                    className={activeTab === 'overview' ? 'active' : ''} 
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button 
                    className={activeTab === 'events' ? 'active' : ''} 
                    onClick={() => setActiveTab('events')}
                >
                    Security Events
                </button>
                <button 
                    className={activeTab === 'blocked-ips' ? 'active' : ''} 
                    onClick={() => setActiveTab('blocked-ips')}
                >
                    Blocked IPs
                </button>
                <button 
                    className={activeTab === 'block-ip' ? 'active' : ''} 
                    onClick={() => setActiveTab('block-ip')}
                >
                    Block IP
                </button>
            </div>

            {loading ? (
                <div className="loading">Loading...</div>
            ) : (
                <>
                    {activeTab === 'overview' && stats && (
                        <div className="overview-tab">
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <h3>Failed Logins (24h)</h3>
                                    <div className="stat-value">{stats.summary.failedLoginsLast24h}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Failed Logins (7d)</h3>
                                    <div className="stat-value">{stats.summary.failedLoginsLast7d}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Active Blocked IPs</h3>
                                    <div className="stat-value">{stats.summary.blockedIPsActive}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Rate Limits Hit (24h)</h3>
                                    <div className="stat-value">{stats.summary.rateLimitExceeded24h}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Suspicious Activity (24h)</h3>
                                    <div className="stat-value">{stats.summary.suspiciousActivity24h}</div>
                                </div>
                            </div>

                            <div className="charts-section">
                                <div className="chart-card">
                                    <h3>Top Offending IPs (Last 24h)</h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>IP Address</th>
                                                <th>Failed Attempts</th>
                                                <th>Last Seen</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.topOffendingIPs.map((ip) => (
                                                <tr key={ip._id}>
                                                    <td>{ip._id}</td>
                                                    <td>{ip.count}</td>
                                                    <td>{formatDate(ip.lastSeen)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="chart-card">
                                    <h3>Events by Type (Last 24h)</h3>
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Event Type</th>
                                                <th>Count</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.eventsByType.map((event) => (
                                                <tr key={event._id}>
                                                    <td>{getEventTypeLabel(event._id)}</td>
                                                    <td>{event.count}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="recent-events">
                                <h3>Recent Security Events</h3>
                                <div className="events-list">
                                    {stats.recentEvents.map((event, index) => (
                                        <div key={index} className="event-item">
                                            <span className="event-type">{getEventTypeLabel(event.eventType)}</span>
                                            <span 
                                                className="event-severity" 
                                                style={{ backgroundColor: getSeverityColor(event.severity) }}
                                            >
                                                {event.severity}
                                            </span>
                                            <span className="event-ip">{event.ipAddress}</span>
                                            {event.email && <span className="event-email">{event.email}</span>}
                                            <span className="event-time">{formatDate(event.timestamp)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="events-tab">
                            <div className="filters">
                                <select 
                                    value={filters.eventType} 
                                    onChange={(e) => setFilters({...filters, eventType: e.target.value})}
                                >
                                    <option value="">All Event Types</option>
                                    <option value="FAILED_LOGIN">Failed Login</option>
                                    <option value="BLOCKED_IP">IP Blocked</option>
                                    <option value="SUSPICIOUS_ACTIVITY">Suspicious Activity</option>
                                    <option value="SUCCESSFUL_LOGIN">Successful Login</option>
                                    <option value="RATE_LIMIT_EXCEEDED">Rate Limit Exceeded</option>
                                </select>

                                <select 
                                    value={filters.severity} 
                                    onChange={(e) => setFilters({...filters, severity: e.target.value})}
                                >
                                    <option value="">All Severities</option>
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Time</th>
                                        <th>Type</th>
                                        <th>Severity</th>
                                        <th>IP Address</th>
                                        <th>Email</th>
                                        <th>Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {events.map((event, index) => (
                                        <tr key={index}>
                                            <td>{formatDate(event.timestamp)}</td>
                                            <td>{getEventTypeLabel(event.eventType)}</td>
                                            <td>
                                                <span 
                                                    className="severity-badge"
                                                    style={{ backgroundColor: getSeverityColor(event.severity) }}
                                                >
                                                    {event.severity}
                                                </span>
                                            </td>
                                            <td>{event.ipAddress}</td>
                                            <td>{event.email || '-'}</td>
                                            <td>{event.details || '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'blocked-ips' && (
                        <div className="blocked-ips-tab">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>IP Address</th>
                                        <th>Reason</th>
                                        <th>Blocked At</th>
                                        <th>Expires At</th>
                                        <th>Failed Attempts</th>
                                        <th>Blocked By</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {blockedIPs.map((ip) => (
                                        <tr key={ip._id}>
                                            <td>{ip.ipAddress}</td>
                                            <td>{ip.reason}</td>
                                            <td>{formatDate(ip.blockedAt)}</td>
                                            <td>{ip.permanent ? 'Permanent' : formatDate(ip.expiresAt)}</td>
                                            <td>{ip.failedAttempts}</td>
                                            <td>{ip.blockedBy}</td>
                                            <td>
                                                <button 
                                                    onClick={() => handleUnblockIP(ip.ipAddress)}
                                                    className="unblock-btn"
                                                >
                                                    Unblock
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'block-ip' && (
                        <div className="block-ip-tab">
                            <form onSubmit={handleBlockIP} className="block-ip-form">
                                <h3>Block IP Address</h3>
                                
                                <input
                                    type="text"
                                    placeholder="IP Address"
                                    value={blockIPForm.ipAddress}
                                    onChange={(e) => setBlockIPForm({...blockIPForm, ipAddress: e.target.value})}
                                    required
                                />

                                <textarea
                                    placeholder="Reason for blocking"
                                    value={blockIPForm.reason}
                                    onChange={(e) => setBlockIPForm({...blockIPForm, reason: e.target.value})}
                                    required
                                />

                                <select
                                    value={blockIPForm.duration}
                                    onChange={(e) => setBlockIPForm({...blockIPForm, duration: parseInt(e.target.value)})}
                                >
                                    <option value={60 * 60 * 1000}>1 hour</option>
                                    <option value={6 * 60 * 60 * 1000}>6 hours</option>
                                    <option value={24 * 60 * 60 * 1000}>24 hours</option>
                                    <option value={7 * 24 * 60 * 60 * 1000}>7 days</option>
                                    <option value={30 * 24 * 60 * 60 * 1000}>30 days</option>
                                </select>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={blockIPForm.permanent}
                                        onChange={(e) => setBlockIPForm({...blockIPForm, permanent: e.target.checked})}
                                    />
                                    Permanent Block
                                </label>

                                <button type="submit" className="block-btn">Block IP</button>
                            </form>
                        </div>
                    )}
                </>
            )}
        </div>
        </>
    );
};

export default SecurityDashboard;
