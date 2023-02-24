const mongoose = require("mongoose");

const OptionSchema = new mongoose.Schema(
  {
    option_name: {
      type: String,
      required: true,
    },
    option_choices: {
      type: Array,
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

module.exports = mongoose.model("Option", OptionSchema);
