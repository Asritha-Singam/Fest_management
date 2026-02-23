import express from 'express';
import {
    createOrder,
    uploadPaymentProof,
    getPendingPayments,
    approvePayment,
    rejectPayment,
    getMyOrders,
    getEventPurchasedQuantity
} from '../controllers/paymentControllers.js';
import authMiddleware from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Participant routes - require authentication
router.use(authMiddleware);

// Create order (participant)
router.post('/orders', authorizeRoles('participant'), createOrder);

// Get my orders (participant)
router.get('/orders', authorizeRoles('participant'), getMyOrders);

// Upload payment proof (participant)
router.post('/payment/upload', authorizeRoles('participant'), uploadPaymentProof);

// Get purchased quantity for event (accessible to all authenticated users)
router.get('/event/:eventId/purchased-quantity', getEventPurchasedQuantity);

// Organizer routes - require authentication and organizer role
// Get pending payments for approval (organizer)
router.get('/pending', authorizeRoles('organizer'), getPendingPayments);

// Approve payment (organizer)
router.post('/:paymentId/approve', authorizeRoles('organizer'), approvePayment);

// Reject payment (organizer)
router.post('/:paymentId/reject', authorizeRoles('organizer'), rejectPayment);

export default router;
