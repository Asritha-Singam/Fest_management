import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Event from "../models/events.js";
import Participation from "../models/participation.js";
import { sendEmail } from "../utils/sendEmail.js";
import QRCode from "qrcode";
import { logSecurityEvent } from "../middleware/securityMiddleware.js";

// Participant: Place order for merchandise
export const createOrder = async (req, res) => {
    try {
        const { eventId, quantity } = req.body;
        const participantId = req.user.id;

        if (!eventId || !quantity || quantity < 1) {
            return res.status(400).json({ message: "Invalid event ID or quantity" });
        }

        // Get event details to fetch registration fee
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Calculate total amount based on event registration fee
        const pricePerItem = event.registrationFee || 100; // Use event fee or default to 100
        const totalAmount = quantity * pricePerItem;

        const order = await Order.create({
            participantId,
            eventId,
            quantity,
            totalAmount,
            paymentStatus: "Pending Approval",
            orderStatus: "Processing"
        });

        // Log security event
        await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
            details: `Order created: ${order._id}`,
            severity: 'LOW'
        });

        res.status(201).json({
            message: "Order created successfully",
            orderId: order._id,
            totalAmount: order.totalAmount
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Participant: Upload payment proof
export const uploadPaymentProof = async (req, res) => {
    try {
        const { orderId, paymentMethod, paymentProofImage } = req.body;
        const participantId = req.user.id;

        if (!orderId || !paymentMethod || !paymentProofImage) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Verify order exists and belongs to participant
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (order.participantId.toString() !== participantId) {
            return res.status(403).json({ message: "Unauthorized access to this order" });
        }

        if (order.paymentStatus !== "Pending Approval") {
            return res.status(400).json({ message: "Cannot upload proof for this order" });
        }

        // Create or update payment record
        let payment = await Payment.findOne({ orderId });

        if (payment) {
            // Update existing payment
            payment.paymentProofImage = paymentProofImage;
            payment.paymentMethod = paymentMethod;
            payment.status = "Pending";
            await payment.save();
        } else {
            // Create new payment
            payment = await Payment.create({
                orderId,
                participantId,
                eventId: order.eventId,
                amount: order.totalAmount,
                paymentProofImage,
                paymentMethod,
                status: "Pending"
            });
        }

        // Log event
        await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
            details: `Payment proof uploaded for order: ${orderId}`,
            severity: 'LOW'
        });

        res.status(200).json({
            message: "Payment proof uploaded successfully",
            paymentId: payment._id
        });
    } catch (error) {
        console.error('Error uploading payment proof:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Organizer: Get pending payments for approval
export const getPendingPayments = async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        // Get pending payments with populated references
        const payments = await Payment.find({ status: "Pending" })
            .populate({
                path: 'orderId',
                select: 'quantity totalAmount'
            })
            .populate({
                path: 'participantId',
                model: 'User',
                select: 'email firstName lastName'
            })
            .populate({
                path: 'eventId',
                select: 'eventName'
            })
            .sort({ uploadedAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .exec();

        const total = await Payment.countDocuments({ status: "Pending" });

        res.status(200).json({
            payments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting pending payments:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Organizer: Approve payment
export const approvePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const organizerId = req.user.id;

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status !== "Pending") {
            return res.status(400).json({ message: "Payment already processed" });
        }

        // Update payment status
        payment.status = "Approved";
        payment.approvedBy = organizerId;
        payment.approvedAt = new Date();
        await payment.save();

        // Get participant and event details
        const participant = await User.findById(payment.participantId);
        const event = await Event.findById(payment.eventId);
        
        if (!participant || !event) {
            return res.status(404).json({ message: "Participant or event not found" });
        }

        // Find the participation record
        const participation = await Participation.findOne({
            participant: payment.participantId,
            event: payment.eventId
        });

        if (!participation) {
            return res.status(404).json({ message: "Participation record not found" });
        }

        // Generate ticket ID if not already generated (merchandise events)
        let ticketId = participation.ticketId;
        if (!ticketId) {
            const random = Math.floor(100000 + Math.random() * 900000);
            ticketId = `FEL-${payment.eventId.toString().slice(-6)}-${random}`;
            participation.ticketId = ticketId;
        }

        // Generate QR code for the ticket
        const qrCodePayload = `Ticket ID: ${ticketId}`;
        let qrCodeDataUrl = null;
        let qrCodeBuffer = null;

        try {
            qrCodeDataUrl = await QRCode.toDataURL(qrCodePayload);
            qrCodeBuffer = await QRCode.toBuffer(qrCodePayload);
            
            // Update participation with ticket ID and QR code
            participation.qrCodeData = qrCodeDataUrl;
            await participation.save();
        } catch (qrError) {
            console.error("Failed to generate QR code:", qrError);
            return res.status(500).json({ message: "Failed to generate QR code" });
        }

        // Update order status with QR code
        const order = await Order.findByIdAndUpdate(
            payment.orderId,
            {
                paymentStatus: "Approved",
                orderStatus: "Successful",
                approvedAt: new Date(),
                qrCode: qrCodeDataUrl
            },
            { new: true }
        );

        // Send approval email with QR code
        try {
            await sendEmail(
                participant.email,
                "Payment Approved - Event Ticket",
                `
                    <h2>Payment Approved!</h2>
                    <p>Hello ${participant.firstName} ${participant.lastName},</p>
                    <p>Your payment for <strong>${event.eventName}</strong> has been approved!</p>
                    <p><strong>Order ID:</strong> ${order._id}</p>
                    <p><strong>Ticket ID:</strong> ${ticketId}</p>
                    <p><strong>Amount Paid:</strong> ₹${payment.amount}</p>
                    <p><strong>Event Date:</strong> ${new Date(event.eventStartDate).toLocaleDateString()}</p>
                    <p>Please find your event QR code below:</p>
                    <img src="cid:qrcode" alt="Event QR Code" style="width:200px; height:200px;" />
                    <p>Show this QR code at the event entrance.</p>
                    <p>Thank you for your registration!</p>
                `,
                [
                    {
                        filename: 'qrcode.png',
                        content: qrCodeBuffer,
                        cid: 'qrcode'
                    }
                ]
            );
        } catch (emailError) {
            console.error("Failed to send approval email:", emailError);
            // Don't fail the approval if email fails
        }

        // Log event
        await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
            details: `Payment approved: ${paymentId}, QR code generated and sent to ${participant.email}`,
            severity: 'LOW'
        });

        res.status(200).json({
            message: "Payment approved successfully. QR code generated and sent to participant.",
            order
        });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Organizer: Reject payment
export const rejectPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { rejectionReason } = req.body;
        const organizerId = req.user.id;

        if (!rejectionReason) {
            return res.status(400).json({ message: "Rejection reason is required" });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        if (payment.status !== "Pending") {
            return res.status(400).json({ message: "Payment already processed" });
        }

        // Update payment status
        payment.status = "Rejected";
        payment.rejectionReason = rejectionReason;
        payment.approvedBy = organizerId;
        await payment.save();

        // Update order status
        const order = await Order.findByIdAndUpdate(
            payment.orderId,
            {
                paymentStatus: "Rejected",
                orderStatus: "Cancelled",
                rejectionReason
            },
            { new: true }
        );

        // Send rejection email
        const participant = await User.findById(payment.participantId);
        if (participant) {
            await sendEmail(
                participant.email,
                "Payment Rejected",
                `Your payment for the order has been rejected.\nReason: ${rejectionReason}`
            );
        }

        // Log event
        await logSecurityEvent('SUSPICIOUS_ACTIVITY', req, {
            details: `Payment rejected: ${paymentId}. Reason: ${rejectionReason}`,
            severity: 'LOW'
        });

        res.status(200).json({
            message: "Payment rejected successfully",
            order
        });
    } catch (error) {
        console.error('Error rejecting payment:', error);
        res.status(500).json({ message: "Server error" });
    }
};

// Participant: View their orders and payment status
export const getMyOrders = async (req, res) => {
    try {
        const participantId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const orders = await Order.find({ participantId })
            .populate('eventId', 'title')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .lean();

        // Get payment info for each order
        const ordersWithPayment = await Promise.all(
            orders.map(async (order) => {
                const payment = await Payment.findOne({ orderId: order._id }).lean();
                return { ...order, payment };
            })
        );

        const total = await Order.countDocuments({ participantId });

        res.status(200).json({
            orders: ordersWithPayment,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error getting orders:', error);
        res.status(500).json({ message: "Server error" });
    }
};
