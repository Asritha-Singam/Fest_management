import Participation from '../models/participation.js';
import Event from '../models/events.js';
import User from '../models/User.js';
import { decodeQRData, verifyQRData } from '../utils/qrCodeUtils.js';

const getDisplayName = (user) => {
    if (!user) {
        return '';
    }

    const first = user.firstName || '';
    const last = user.lastName || '';
    const full = `${first} ${last}`.trim();

    return full || user.email || '';
};

// Scan QR Code and Mark Attendance
export const scanQRCode = async (req, res) => {
    try {
        const { qrData, eventId } = req.body;
        const organizerId = req.user.id;

        if (!qrData || !eventId) {
            return res.status(400).json({ 
                success: false, 
                message: 'QR data and event ID are required' 
            });
        }

        // Decode QR code data
        let decodedData;
        try {
            decodedData = decodeQRData(qrData);
        } catch (error) {
            return res.status(400).json({ 
                success: false, 
                message: `Invalid QR code format: ${error.message}` 
            });
        }

        // Verify QR data authenticity
        if (!verifyQRData(decodedData)) {
            return res.status(400).json({ 
                success: false, 
                message: 'QR code verification failed' 
            });
        }

        const { ticketId, participantEmail, participantName } = decodedData;

        // Find the participation record
        const participation = await Participation.findOne({ 
            ticketId: ticketId 
                }).populate('participant', 'firstName lastName email')
                    .populate('event', 'eventName eventStartDate eventEndDate organizer');

        if (!participation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ticket not found' 
            });
        }

        // Verify event match
        if (participation.event._id.toString() !== eventId) {
            return res.status(400).json({ 
                success: false, 
                message: 'This ticket is not valid for this event' 
            });
        }

        // Verify organizer has permission to scan for this event
        if (participation.event.organizer.toString() !== organizerId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to check-in participants for this event' 
            });
        }

        // Verify participant email matches
        if (participation.participant.email !== participantEmail) {
            return res.status(400).json({ 
                success: false, 
                message: 'Participant email mismatch' 
            });
        }

        // Check if ticket is cancelled
        if (participation.status === 'Cancelled') {
            return res.status(400).json({ 
                success: false, 
                message: 'This ticket has been cancelled' 
            });
        }

        // Check if payment is required but not completed
        if (participation.paymentStatus === 'Pending') {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment pending - ticket not valid yet' 
            });
        }

        // Check for duplicate scan
        if (participation.attendanceStatus === 'checked-in') {
            return res.status(400).json({ 
                success: false, 
                message: 'Ticket already scanned',
                alreadyScanned: true,
                checkInTime: participation.checkInTime,
                checkInBy: participation.checkInBy 
            });
        }

        // Mark attendance
        participation.attendanceStatus = 'checked-in';
        participation.checkInTime = new Date();
        participation.checkInBy = organizerId;
        participation.scanCount = (participation.scanCount || 0) + 1;
        participation.status = 'Completed';

        await participation.save();

        const fallbackName = getDisplayName(participation.participant);
        const resolvedName = participantName || fallbackName;

        return res.status(200).json({
            success: true,
            message: 'Check-in successful',
            data: {
                participantName: resolvedName,
                participantEmail: participation.participant.email,
                eventName: participation.event.eventName,
                checkInTime: participation.checkInTime,
                ticketId: participation.ticketId
            }
        });

    } catch (error) {
        console.error('Error scanning QR code:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during check-in' 
        });
    }
};

// Manual Check-in with Override
export const manualCheckIn = async (req, res) => {
    try {
        const { participationId, reason } = req.body;
        const organizerId = req.user.id;

        if (!participationId || !reason) {
            return res.status(400).json({ 
                success: false, 
                message: 'Participation ID and reason are required' 
            });
        }

        if (reason.trim().length < 10) {
            return res.status(400).json({ 
                success: false, 
                message: 'Reason must be at least 10 characters' 
            });
        }

        // Find participation
        const participation = await Participation.findById(participationId)
            .populate('participant', 'firstName lastName email')
            .populate('event', 'eventName eventStartDate eventEndDate organizer');

        if (!participation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Participation record not found' 
            });
        }

        // Verify organizer permission
        if (participation.event.organizer.toString() !== organizerId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to check-in participants for this event' 
            });
        }

        // Check if already checked in (allow override)
        const wasAlreadyCheckedIn = participation.attendanceStatus === 'checked-in';

        // Update participation
        participation.attendanceStatus = 'checked-in';
        participation.checkInTime = new Date();
        participation.checkInBy = organizerId;
        participation.manualOverride = true;
        participation.overrideReason = reason;
        participation.overrideBy = organizerId;
        participation.overrideTimestamp = new Date();
        participation.status = 'Completed';
        participation.scanCount = (participation.scanCount || 0) + 1;

        await participation.save();

        return res.status(200).json({
            success: true,
            message: wasAlreadyCheckedIn ? 'Manual override successful' : 'Manual check-in successful',
            data: {
                participantName: getDisplayName(participation.participant),
                participantEmail: participation.participant.email,
                eventName: participation.event.eventName,
                checkInTime: participation.checkInTime,
                manualOverride: true
            }
        });

    } catch (error) {
        console.error('Error in manual check-in:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error during manual check-in' 
        });
    }
};

// Get Live Attendance Dashboard for an Event
export const getAttendanceDashboard = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user.id;

        // Verify event exists and organizer has permission
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        if (event.organizer.toString() !== organizerId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to view attendance for this event' 
            });
        }

        // Get all participations for the event
        const participations = await Participation.find({ 
            event: eventId,
            status: { $ne: 'Cancelled' },
            paymentStatus: { $in: ['Paid', 'Not Required'] }
        })
        .populate('participant', 'firstName lastName email')
        .populate('checkInBy', 'firstName lastName email')
        .sort({ checkInTime: -1 });

        // Calculate statistics
        const totalParticipants = participations.length;
        const checkedIn = participations.filter(p => p.attendanceStatus === 'checked-in').length;
        const notScanned = totalParticipants - checkedIn;
        const manualOverrides = participations.filter(p => p.manualOverride).length;

        // Format participant list
        const participantList = participations.map(p => ({
            id: p._id,
            participantName: getDisplayName(p.participant),
            participantEmail: p.participant.email,
            ticketId: p.ticketId,
            attendanceStatus: p.attendanceStatus,
            checkInTime: p.checkInTime,
            checkInByName: p.checkInBy ? getDisplayName(p.checkInBy) : null,
            manualOverride: p.manualOverride,
            overrideReason: p.overrideReason
        }));

        return res.status(200).json({
            success: true,
            data: {
                eventName: event.eventName,
                eventDate: event.eventStartDate,
                statistics: {
                    totalParticipants,
                    checkedIn,
                    notScanned,
                    manualOverrides,
                    checkInPercentage: totalParticipants > 0 
                        ? ((checkedIn / totalParticipants) * 100).toFixed(1) 
                        : 0
                },
                participants: participantList
            }
        });

    } catch (error) {
        console.error('Error fetching attendance dashboard:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error fetching attendance data' 
        });
    }
};

// Get Single Participation Attendance Status
export const getParticipationStatus = async (req, res) => {
    try {
        const { participationId } = req.params;
        const userId = req.user.id;

        const participation = await Participation.findById(participationId)
            .populate('participant', 'firstName lastName email')
            .populate('event', 'eventName eventStartDate eventEndDate organizer')
            .populate('checkInBy', 'firstName lastName email');

        if (!participation) {
            return res.status(404).json({ 
                success: false, 
                message: 'Participation record not found' 
            });
        }

        // Check if user is the participant or the event organizer
        const isParticipant = participation.participant._id.toString() === userId;
        const isOrganizer = participation.event.organizer.toString() === userId;

        if (!isParticipant && !isOrganizer) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to view this attendance record' 
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                participantName: getDisplayName(participation.participant),
                eventName: participation.event.eventName,
                attendanceStatus: participation.attendanceStatus,
                checkInTime: participation.checkInTime,
                checkInBy: participation.checkInBy ? getDisplayName(participation.checkInBy) : null,
                manualOverride: participation.manualOverride
            }
        });

    } catch (error) {
        console.error('Error fetching participation status:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error fetching status' 
        });
    }
};

// Export Attendance Report as CSV
export const exportAttendanceCSV = async (req, res) => {
    try {
        const { eventId } = req.params;
        const organizerId = req.user.id;

        // Verify event and permission
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ 
                success: false, 
                message: 'Event not found' 
            });
        }

        if (event.organizer.toString() !== organizerId) {
            return res.status(403).json({ 
                success: false, 
                message: 'You are not authorized to export attendance for this event' 
            });
        }

        // Get all participations
        const participations = await Participation.find({ 
            event: eventId,
            status: { $ne: 'Cancelled' },
            paymentStatus: { $in: ['Paid', 'Not Required'] }
        })
        .populate('participant', 'firstName lastName email')
        .populate('checkInBy', 'firstName lastName email')
        .sort({ checkInTime: -1 });

        // Generate CSV content
        const csvHeader = 'Ticket ID,Participant Name,Email,Phone,Attendance Status,Check-in Time,Checked-in By,Manual Override,Override Reason\n';
        
        const csvRows = participations.map(p => {
            const checkInTime = p.checkInTime 
                ? new Date(p.checkInTime).toLocaleString() 
                : 'N/A';
            const checkInBy = p.checkInBy ? getDisplayName(p.checkInBy) : 'N/A';
            const phone = 'N/A';
            const participantEmail = p.participant?.email || 'N/A';
            const participantName = getDisplayName(p.participant) || 'N/A';
            
            return `"${p.ticketId || 'N/A'}","${participantName}","${participantEmail}","${phone}","${p.attendanceStatus}","${checkInTime}","${checkInBy}","${p.manualOverride ? 'Yes' : 'No'}","${p.overrideReason || 'N/A'}"`;
        }).join('\n');

        const csv = csvHeader + csvRows;

        // Set headers for file download
        const eventName = event.eventName || event.name || 'event';
        const safeEventName = String(eventName).replace(/[^a-z0-9]/gi, '_');
        const filename = `attendance_${safeEventName}_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

        return res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting attendance CSV:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Server error exporting attendance data' 
        });
    }
};
