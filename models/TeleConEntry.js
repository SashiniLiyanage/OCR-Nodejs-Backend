const mongoose = require("mongoose");

const TeleConEntrySchema = new mongoose.Schema(
  {
    patient_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },
    clinician_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    complaint: {
      type: String,
      default: "",
    },
    startTime: {
      type: Date,
      default: Date.now(),
    },
    endTime: {
      type: Date,
      default: Date.now(),
    },
    findings: {
      type: String,
      default: "",
    },
    currentHabits: {
      type: Array,
      default: [],
    },
    updated:{
      type: Boolean,
      default:false
    }
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("TeleConEntry", TeleConEntrySchema, "teleconentries");
