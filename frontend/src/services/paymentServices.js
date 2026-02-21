import API from './api.js';

// Participant: Create order for merchandise
export const createOrder = (eventId, quantity) =>
    API.post('/api/payments/orders', { eventId, quantity });

// Participant: Get their orders
export const getMyOrders = (params) =>
    API.get('/api/payments/orders', { params });

// Participant: Upload payment proof
export const uploadPaymentProof = (orderId, paymentMethod, paymentProofImage) =>
    API.post('/api/payments/payment/upload', { orderId, paymentMethod, paymentProofImage });

// Organizer: Get pending payments for approval
export const getPendingPayments = (params) =>
    API.get('/api/payments/pending', { params });

// Organizer: Approve payment
export const approvePayment = (paymentId) =>
    API.post(`/api/payments/${paymentId}/approve`);

// Organizer: Reject payment
export const rejectPayment = (paymentId, rejectionReason) =>
    API.post(`/api/payments/${paymentId}/reject`, { rejectionReason });
