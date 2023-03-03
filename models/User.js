const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    reg_no: {
      type: String,
      required: true,
      unique: true,
    },
    hospital: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      default: "",
    },
    contact_no: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    teleConEntry_id: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "TeleConEntry",
      },
    ],
    role: {
      type: Array,
      required: true,
      default: [3],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// const ReviewerSchema = new mongoose.Schema({
//   availability: {
//     type: Boolean,
//     default: true,
//   },
// teleConEntry_id: [
//   {
//     type: mongoose.Schema.ObjectId,
//     ref: "TeleConEntry",
//   },
// ],
// }).extends(UserSchema);

module.exports = mongoose.model("User", UserSchema);
// module.exports = mongoose.model("Reviewer", ReviewerSchema);
