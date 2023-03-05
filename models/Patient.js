const mongoose = require("mongoose");

const PatientSchema = new mongoose.Schema(
  {
    patient_id: {
      type: String,
      required: true,
    },
    clinician_id: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    risk_factors: {
      type: Array,
      default: [],
    },
    DOB: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      default: "",
    },
    histo_diagnosis: {
      type: String,
      default: "",
    },
    consent_form: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Patient", PatientSchema);
