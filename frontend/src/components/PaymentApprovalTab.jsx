import { useState, useEffect } from 'react';
import { getPendingPayments, approvePayment, rejectPayment } from '../services/paymentServices';
import './paymentApprovalTab.css';

const PaymentApprovalTab = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [rejectingPaymentId, setRejectingPaymentId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [viewingProofImage, setViewingProofImage] = useState(null);

    useEffect(() => {
        fetchPendingPayments();
    }, [page]);

    const fetchPendingPayments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getPendingPayments({ page, limit: 20 });
            setPayments(response.data.payments);
            setTotalPages(response.data.pagination.pages);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch payments');
            console.error('Error fetching payments:', err);
        }
        setLoading(false);
    };

    const removePaymentFromList = (paymentId) => {
        setPayments(prevPayments => prevPayments.filter(payment => payment._id !== paymentId));
    };

    const handleApprovePayment = async (paymentId) => {
        if (!window.confirm('Are you sure you want to approve this payment?')) return;

        try {
            await approvePayment(paymentId);
            alert('Payment approved successfully!');
            removePaymentFromList(paymentId);
            if (payments.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                fetchPendingPayments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error approving payment');
        }
    };

    const handleRejectPayment = async (paymentId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason');
            return;
        }

        try {
            await rejectPayment(paymentId, rejectionReason);
            alert('Payment rejected successfully!');
            setRejectingPaymentId(null);
            setRejectionReason('');
            removePaymentFromList(paymentId);
            if (payments.length === 1 && page > 1) {
                setPage(prev => prev - 1);
            } else {
                fetchPendingPayments();
            }
        } catch (err) {
            alert(err.response?.data?.message || 'Error rejecting payment');
        }
    };

    if (loading) return <div className="loading">Loading pending payments...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="payment-approval-tab">
            <h2>Payment Approval Management</h2>

            {payments.length === 0 ? (
                <div className="no-payments">
                    <p>No pending payments for approval</p>
                </div>
            ) : (
                <>
                    <table className="payments-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Participant</th>
                                <th>Email</th>
                                <th>Event</th>
                                <th>Quantity</th>
                                <th>Amount</th>
                                <th>Payment Method</th>
                                <th>Proof</th>
                                <th>Uploaded At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map((payment) => (
                                <tr key={payment._id}>
                                    <td className="order-id">{payment.orderId?._id?.substring(0, 8)}...</td>
                                    <td>
                                        {payment.participantId?.firstName} {payment.participantId?.lastName}
                                    </td>
                                    <td>{payment.participantId?.email}</td>
                                    <td>{payment.eventId?.eventName}</td>
                                    <td className="quantity">{payment.orderId?.quantity || 1}</td>
                                    <td className="amount">₹{payment.amount}</td>
                                    <td>{payment.paymentMethod}</td>
                                    <td>
                                        <button
                                            onClick={() => setViewingProofImage(payment.paymentProofImage)}
                                            className="view-proof-btn"
                                            style={{ cursor: 'pointer', textDecoration: 'none', background: 'none', border: 'none', padding: 0 }}
                                        >
                                            📨 View Proof
                                        </button>
                                    </td>
                                    <td>{new Date(payment.uploadedAt).toLocaleDateString()}</td>
                                    <td className="actions">
                                        <button
                                            onClick={() => handleApprovePayment(payment._id)}
                                            className="approve-btn"
                                        >
                                            ✓ Approve
                                        </button>
                                        <button
                                            onClick={() => setRejectingPaymentId(payment._id)}
                                            className="reject-btn"
                                        >
                                            ✗ Reject
                                        </button>

                                        {rejectingPaymentId === payment._id && (
                                            <div className="rejection-modal">
                                                <div className="rejection-content">
                                                    <h4>Rejection Reason</h4>
                                                    <textarea
                                                        value={rejectionReason}
                                                        onChange={(e) => setRejectionReason(e.target.value)}
                                                        placeholder="Enter reason for rejection"
                                                    />
                                                    <div className="rejection-buttons">
                                                        <button
                                                            onClick={() => handleRejectPayment(payment._id)}
                                                            className="confirm-reject-btn"
                                                        >
                                                            Confirm Reject
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                setRejectingPaymentId(null);
                                                                setRejectionReason('');
                                                            }}
                                                            className="cancel-btn"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="pagination">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span>Page {page} of {totalPages}</span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}

            {/* Payment Proof Image Modal */}
            {viewingProofImage && (
                <div
                    className="image-modal-overlay"
                    onClick={() => setViewingProofImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        zIndex: 1000,
                    }}
                >
                    <div
                        className="image-modal-content"
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            backgroundColor: 'white',
                            borderRadius: '8px',
                            padding: '20px',
                            maxWidth: '90%',
                            maxHeight: '90%',
                            overflow: 'auto',
                        }}
                    >
                        <button
                            onClick={() => setViewingProofImage(null)}
                            style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px',
                                height: '32px',
                                fontSize: '18px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            ✕
                        </button>
                        <img
                            src={viewingProofImage}
                            alt="Payment Proof"
                            style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                borderRadius: '4px',
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default PaymentApprovalTab;
