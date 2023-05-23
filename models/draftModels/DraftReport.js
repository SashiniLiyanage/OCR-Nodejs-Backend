const mongoose = require("mongoose");

const DraftReportSchema = new mongoose.Schema(
  {
    telecon_entry_id: {
      type: mongoose.Types.ObjectId,
      ref: "DraftEntry",
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

module.exports = mongoose.model("DraftReport", DraftReportSchema, "draftreports");
