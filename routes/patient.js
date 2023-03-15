const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const User = require("../models/User");
const { authenticateToken, checkPermissions } = require("../middleware/auth");

// add new patient
router.post("/add", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  try {
    const patient = await Patient.findOne({
      patient_id: req.body.patient_id,
      clinician_id: req._id,
    });

    if (patient) {
      const others = patient._doc;
      others["message"] = "Patient already exists";
      return res.status(200).json(others);
    } else {
      const newPatient = new Patient({
        patient_id: req.body.patient_id,
        clinician_id: req._id,
        patient_name: req.body.patient_name,
        risk_factors: req.body.risk_factors,
        DOB: req.body.DOB,
        gender: req.body.gender,
        histo_diagnosis: req.body.histo_diagnosis,
        medical_history: req.body.medical_history,
        family_history: req.body.family_history,
        systemic_disease: req.body.systemic_disease,
        contact_no: req.body.contact_no

      });

      const patient = await newPatient.save();
      const others = patient._doc;
      others["message"] = "Successfully added";
      res.status(200).json(others);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//update patient details
router.post("/update/:id", async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      clinician_id: req._id
    });

    if (!patient) {
      return res.status(401).json({ messsage: "Patient ID doesnt exists!" });
    } else {
      const update = await Patient.findOneAndUpdate(
        { _id: req.params.id, clinician_id: req._id},
        {
          patient_name: req.body.patient_name,
          gender: req.body.gender,
          DOB: req.body.DOB,
          risk_factors: req.body.risk_factors,
          histo_diagnosis: req.body.histo_diagnosis,
          contact_no: req.body.contact_no,
          systemic_disease: req.body.systemic_disease,
          family_history: req.body.family_history,
          medical_history: req.body.medical_history
        }
      );

      const updatedPatient = await Patient.findById(req.params.id);
      const others = updatedPatient._doc;
      others["message"] = "Successfully added";
      res.status(200).json(others);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/search", async (req, res) => {
  console.log(req.query.field);
  try {
    let result = await Patient.aggregate([
      {
        $search: {
          autocomplete: {
            query: `${req.query.query}`,
            path: `${req.query.field}`,
            fuzzy: {
              maxEdits: 2,
              prefixLength: 3,
            },
          },
        },
      },
    ]);
    res.send(result);
  } catch (e) {
    res.status(500).send({ message: e.message });
  }
});

// get all patients
router.get("/all", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  try {
    const patients = await Patient.find(
      {clinician_id: req._id},
      { _id: 1, gender: 1, category: 1, patient_id: 1, age: 1 }
    );

    return res.status(200).json({ patients: patients });
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// get one patient
router.get("/:id", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }
  try {
    const patient = await Patient.findOne({
      _id: req.params.id,
      clinician_id: req._id
    });

    if (patient) {
      return res.status(200).json(patient);
    } else {
      return res.status(404).json({ message: "Patient not found" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
