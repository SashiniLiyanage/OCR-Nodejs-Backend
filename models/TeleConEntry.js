const mongoose = require("mongoose");

const TeleConEntrySchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    assignees: {
      type: Array,
      default: [],
    },
    images: {
      type: Array,
      default: [],
    },
    complaint: {
      type: String,
      default: "",
    },
    duration: {
      type: mongoose.Schema.Types.Duration, // you can provide a duration value as a string in the format HH:mm:ss
      required: true,
    },
    Findings: {
      type: String,
      default: "",
    },
    currentHabits: {
      type: String,
      default: "",
    },
    reports: {
      type: Array,
      default: [],
    },
    reviews: [
      {
        reviewer: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Image", ImageSchema);
