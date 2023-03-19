const router = require("express").Router();
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const Patient = require("../models/Patient");
const TeleConEntry = require("../models/TeleConEntry");
const { authenticateToken } = require("../middleware/auth");

require("dotenv").config();

// get hospital list on signup page
router.get("/hospitals", async (req, res) => {
  try {
    const hospital = await Hospital.find();
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

// get a teleconsultation entry
router.get(
  "/entry/get/:patientID/:entryID",
  authenticateToken,
  async (req, res) => {
    try {
      // get the clinincian who requested the entry addition
      const requestedClinician = await User.findOne({ email: req.email });

      if (requestedClinician) {
        const releventPatient = await Patient.findOne({
          patient_id: req.params.patientID,
          clinician_id: requestedClinician._id,
        });
        // check whether the patient exists under the clinician
        if (releventPatient) {
          const requestedEntry = await TeleConEntry.findOne({
            patient_id: releventPatient._id,
            _id: req.params.entryID,
          });
          // check whether the entry exists
          if (requestedEntry) {
            const responseDoc = requestedEntry._doc;
            responseDoc["message"] = "Entry retrieved successfully!";
            res.status(200).json(responseDoc);
          } else {
            return res.status(404).json({ message: "Entry not found" });
          }
        } else {
          return res.status(404).json({ message: "Patient is not registered" });
        }
      } else {
        return res.status(404).json({ message: "Unauthorized Access" });
      }
    } catch (error) {
      res.status(500).json({ error: error, message: error.message });
    }
  }
);

// get all teleconsultation entries under a patient/clinician pair
router.get("/entry/get/:patientID", authenticateToken, async (req, res) => {
  try {
    // get the clinincian who requested the entry addition
    const requestedClinician = await User.findOne({ email: req.email });

    if (requestedClinician) {
      const releventPatient = await Patient.findOne({
        patient_id: req.params.patientID,
        clinician_id: requestedClinician._id,
      });
      // check whether the patient exists under the clinician
      if (releventPatient) {
        const entries = await TeleConEntry.find({
          patient_id: releventPatient._id,
        });
        if (entries) {
          res.status(200).json({
            response: entries,
            message: "Entries retrieved successfully!",
          });
        } else {
          return res.status(404).json({ message: "No entries found!" });
        }
      } else {
        return res.status(404).json({ message: "Patient is not registered" });
      }
    } else {
      return res.status(404).json({ message: "Unauthorized Access" });
    }
  } catch (error) {
    res.status(500).json({ error: error, message: error.message });
  }
});

module.exports = router;
