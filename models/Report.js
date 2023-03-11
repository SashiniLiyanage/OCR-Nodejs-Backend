const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    patient_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Patient",
      required: true,
    },
    report_name: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", ReportSchema);
