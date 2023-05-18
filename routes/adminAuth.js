const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

// only to add initial admin
// admin sign up
router.post("/signup", async (req, res) => {
  try {
    let username = null;
    let useremail = null;
    try {
      username = await User.findOne({ username: req.body.username });
      useremail = await User.findOne({ email: req.body.email });
    } catch (err) {
      return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }

    if (username) {
      res.status(401).json({ message: "User name is taken" });
    } else if (useremail) {
      res.status(401).json({ message: "The email address is already in use" });
    } else {
      const newUser = new User({
        reg_no: req.body.reg_no,
        username: req.body.username,
        email: req.body.email,
        hospital: req.body.hospital,
        role: "System Admin",
      });
      const user = await newUser.save();
      const details = user._doc;
      details["message"] = "Successfully signed in";
      res.status(200).json(details);
    }
  } catch (err) {
    return res.status(500).json({ error: err, message: "Internal Server Error!" });
  }
});

module.exports = router;
