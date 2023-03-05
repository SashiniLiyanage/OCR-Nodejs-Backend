const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
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
    image_name: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    clinical_diagnosis: {
      type: String,
      default: "",
    },
    lesions_appear: {
      type: Boolean,
      default: false,
    },
    annotation: {
      type: Array,
      default: [],
    },
    predicted_cat: {
      type: String,
      default: "",
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Image", ImageSchema);
