import mongoose from "mongoose";
import Participant from "./participant.js";
import Event from "./events.js";
const participationSchema = new mongoose.Schema({
    participant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    event: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    ticketId: {
        type: String,
        unique: true,
        sparse: true  // Allows multiple null values
    },
    qrCodeData: {
        type: String
    },
    status: {
        type: String,
        enum: ["Registered", "Cancelled", "Completed"],
        default: "Registered"
    },
    registrationDate: {
        type: Date,
        default: Date.now
    },
    paymentStatus: {
        type: String,
        enum: ["Not Required", "Pending", "Paid"],
        default: "Not Required"
    },
    // For merchandise events
    merchandiseSelection: {
        size: String,
        color: String
    },
    // For normal events with custom form fields
    customFieldResponses: [{
        fieldName: String,
        fieldValue: String
    }]
}, {
    timestamps: true
});
participationSchema.index({ participant: 1, event: 1 }, { unique: true });

const Participation = mongoose.model("Participation", participationSchema);

export default Participation;
