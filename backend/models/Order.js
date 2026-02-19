import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
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
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["Pending Approval", "Approved", "Rejected"],
        default: "Pending Approval",
        index: true
    },
    orderStatus: {
        type: String,
        enum: ["Processing", "Successful", "Cancelled"],
        default: "Processing",
        index: true
    },
    qrCode: {
        type: String,
        default: null
    },
    ticketId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Ticket",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    approvedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null
    }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
