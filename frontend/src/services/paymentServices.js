import API from './api.js';

// Participant: Create order for merchandise
export const createOrder = (eventId, quantity) =>
    API.post('/payments/orders', { eventId, quantity });

// Participant: Get their orders
export const getMyOrders = (params) =>
    API.get('/payments/orders', { params });

// Participant: Upload payment proof
export const uploadPaymentProof = (orderId, paymentMethod, paymentProofImage) =>
    API.post('/payments/payment/upload', { orderId, paymentMethod, paymentProofImage });

// Organizer: Get pending payments for approval
export const getPendingPayments = (params) =>
    API.get('/payments/pending', { params });

// Organizer: Approve payment
export const approvePayment = (paymentId) =>
    API.post(`/payments/${paymentId}/approve`);

// Organizer: Reject payment
export const rejectPayment = (paymentId, rejectionReason) =>
    API.post(`/payments/${paymentId}/reject`, { rejectionReason });
