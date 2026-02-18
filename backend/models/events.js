import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true
    },

    eventDescription: {
      type: String,
      required: true
    },

    eventType: {
      type: String,
      enum: ["NORMAL", "MERCHANDISE"],
      required: true
    },

    eligibility: {
      type: String,
      enum: ["IIIT_ONLY", "NON_IIIT_ONLY", "ALL"],
      default: "ALL"
    },

    registrationDeadline: {
      type: Date,
      required: true
    },

    eventStartDate: {
      type: Date,
      required: true
    },

    eventEndDate: {
      type: Date,
      required: true
    },

    registrationLimit: {
      type: Number,
      default: 0
    },

    registrationFee: {
      type: Number,
      default: 0
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    eventTags: [
      {
        type: String
      }
    ],

    // Merchandise-specific
    merchandiseDetails: {
      sizes: [String],
      colors: [String],
      stock: {
        type: Number,
        default: 0
      },
      purchaseLimitPerUser: {
        type: Number,
        default: 1
      }
    },

    // Normal event custom form builder
    customFormFields: [
      {
        fieldName: String,
        fieldType: String,
        required: Boolean
      }
    ],

    status: {
      type: String,
      enum: ["draft", "published", "ongoing", "completed"],
      default: "draft"
    }
  },
  { timestamps: true }
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
