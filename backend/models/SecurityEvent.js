import mongoose from "mongoose";

const securityEventSchema = new mongoose.Schema({
    eventType: {
        type: String,
        enum: ["FAILED_LOGIN", "BLOCKED_IP", "SUSPICIOUS_ACTIVITY", "SUCCESSFUL_LOGIN", "RATE_LIMIT_EXCEEDED"],
        required: true
    },
    ipAddress: {
        type: String,
        required: true,
        index: true
    },
    email: {
        type: String,
        index: true
    },
    userAgent: String,
    details: {
        type: String
    },
    severity: {
        type: String,
        enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        default: "LOW"
    },
    blocked: {
        type: Boolean,
        default: false
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

// Index for quick queries
securityEventSchema.index({ timestamp: -1 });
securityEventSchema.index({ ipAddress: 1, timestamp: -1 });
securityEventSchema.index({ eventType: 1, timestamp: -1 });

const SecurityEvent = mongoose.model("SecurityEvent", securityEventSchema);

export default SecurityEvent;
