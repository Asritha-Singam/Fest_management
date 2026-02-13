import mongoose from "mongoose";

const participantSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participantType: {
      type: String,
      enum: ["IIIT", "NON_IIIT"],
      required: true,
    },

    collegeOrOrg: {
      type: String,
      required: true,
    },

    contactNumber: {
      type: String,
      required: true,
    },

    interests: {
      type: [String],
      default: [],
    },

    followedOrganizers: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "Organizer",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Participant = mongoose.model("Participant", participantSchema);

export default Participant;
