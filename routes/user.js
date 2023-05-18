const router = require("express").Router();
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

require("dotenv").config();

// get a user 
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req._id);

    if (user) {
      return res.status(200).json(user);
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    return res.status(500).json({ error: err, message: "Internal Server Error!" });
  }
});

// get hospital list on signup page
router.get("/hospitals", async (req, res) => {
  try {
    const hospital = await Hospital.find();
    return res.status(200).json(hospital);
  } catch (err) {
    return res.status(500).json({ error: err, message: "Internal Server Error!" });
  }
});

//update user details
router.post("/update", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req._id);

    if (user) {
      const updateUsername = await User.findByIdAndUpdate(req._id,
        {
          username: req.body.username,
          hospital: req.body.hospital,
          contact_no: req.body.contact_no,
          availability: req.body.availability,
        }
      );

      try{
        const user = await User.findById(req._id);
        const details = user._doc;
        details["message"] = "User details updated succesfully";
        return res.status(200).json(details);

      }catch(err){
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
      }
      
    } else {
      return res.status(401).json({ message: "User Not Found" });
    }

  } catch (err) {
    return res.status(500).json({ error: err, message: "Internal Server Error!" });
  }
});

module.exports = router;
