const mongoose = require("mongoose");

const TeleConEntrySchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: true,
    },
    assignees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reviewer",
      },
    ],
    images: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Image",
      },
    ],
    complaint: {
      type: String,
      default: "",
    },
    startTime: {
      type: Date,
      default: Date.now(),
      // required: true,
    },
    endTime: {
      type: Date,
      default: Date.now(),
      // required: true,
    },
    findings: {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("TeleConEntry", TeleConEntrySchema);
