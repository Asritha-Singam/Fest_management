import mongoose from "mongoose";

const blockedIPSchema = new mongoose.Schema({
    ipAddress: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    reason: {
        type: String,
        required: true
    },
    blockedAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        required: true
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    permanent: {
        type: Boolean,
        default: false
    },
    blockedBy: {
        type: String,
        enum: ["SYSTEM", "ADMIN"],
        default: "SYSTEM"
    }
}, { timestamps: true });

// Automatically remove expired blocks
blockedIPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const BlockedIP = mongoose.model("BlockedIP", blockedIPSchema);

export default BlockedIP;
