import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
        unique: true,
        index: true
    },
    participantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true,
        index: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentProofImage: {
        type: String,
        required: true,
        default: null
    },
    paymentMethod: {
        type: String,
        enum: ["UPI", "Card", "Bank Transfer", "Cash"],
        required: true
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    },
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    approvedAt: {
        type: Date,
        default: null
    }
}, { timestamps: true });

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
