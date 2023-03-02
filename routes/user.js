const router = require("express").Router();
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const TeleConEntry = require("../models/TeleConEntry");
const { authenticateToken } = require("../middleware/auth");

require("dotenv").config();

router.get("/hospitals", async (req, res) => {
  try {
    const hospital = await Hospital.find();
    return res.status(200).json(hospital);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    return res.status(200).json(hospital);
  } catch (err) {
    return res.status(500).json(err);
  }
});

//change the password
router.post("/password", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });

    if (user) {
      const validate = await bcrypt.compare(req.body.cpassword, user.password);
      if (!validate)
        return res.status(400).json({ message: "Incorrect password!" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.npassword, salt);

      const update = await User.findOneAndUpdate(
        { email: req.email },
        {
          password: hashedPassword,
        }
      );

      return res
        .status(200)
        .json({ message: "Password is changed successfully" });
    } else {
      return res.status(401).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//update user details
router.post("/update", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });

    if (user) {
      const updateUsername = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.username,
          username: req.body.hospital,
          username: req.body.contact_no,
          username: req.body.availability,
        }
      );

      const user = await User.findOne({ email: req.email });

      const { password, ...others } = user._doc;
      others["message"] = "User details updated succesfully";
      return res.status(200).json(others);
    } else {
      return res.status(401).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// add a teleconsultation entry
router.post("entry/add", authenticateToken, async (req, res) => {
  try {
    // get the clinincian who requested the entry addition
    const requestedClinician = await User.findOne({ email: req.email });

    // create a new entry document
    if (requestedClinician) {
      const releventPatient = await Patient.findOne({
        patient_id: req.body.patient_id,
      });
      if (releventPatient) {
        const newEntry = new TeleConEntry({
          patient_id: req.body.patient_id,
          startTime: req.body.start_time,
          endTime: req.body.end_time,
          complaint: req.body.complaint,
          findings: req.body.findings,
          currentHabits: req.body.currentHabits,
          reports: req.body.reports,
          assignees: req.body.assignees,
          reviews: req.body.reviews,
        });

        const savedEntry = await newEntry.save();
        const responseDoc = savedEntry._doc;
        responseDoc["message"] = "Successfully created!";
        res.status(200).json(responseDoc);
      } else {
        return res.status(404).json({ message: "Patient is not registered" });
      }
    } else {
      return res.status(404).json({ message: "Unauthorized Access" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
