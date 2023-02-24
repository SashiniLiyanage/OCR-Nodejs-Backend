// this will act as a log for all the reviews made by reviewers on respective patients
const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    teleConEntry_Id: {
      type: mongoose.Types.ObjectId,
      ref: "TeleConEntry",
      required: true,
    },
    review_text: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", ReviewSchema);
