const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const User = require("../models/User");
const Role = require("../models/Role");
const { authenticateToken, checkPermissions } = require("../middleware/auth");


//update patient details
router.post("/update/:id", authenticateToken ,async (req, res) => {

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
router.get("/get", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  const pageSize = 20;
  const page = req.query.page? req.query.page: 1;
  const search = req.query.search? req.query.search: "";
  const sort = req.query.sort === 'false'? -1: 1;

  var filter = {};
  
  if(req.query.filter && req.query.filter === "ID"){
    filter = {patient_id: sort}
  }else if(req.query.filter && req.query.filter === "Name"){
    filter = {patient_name: sort}
  }else if(req.query.filter && req.query.filter === "Age"){
    filter = {DOB: sort}
  }else if(req.query.filter && req.query.filter === "Gender"){
    filter = {gender: sort}
  }else if(req.query.filter && req.query.filter === "Created Date"){
    filter = {createdAt: sort}
  }else if(req.query.filter && req.query.filter === "Updated Date"){
    filter = {UpdatedAt: sort}
  }else{
    filter = {patient_id: sort}
  }

  try {
    if(search !==""){
      const patients = await Patient.find(
        {clinician_id: req._id, 
          $or: [
            { patient_id: { $regex: search, $options: 'i' } },
            { patient_name: { $regex: search, $options: 'i' } },
            { gender: { $regex: search, $options: 'i' } }
          ]
        },
        { _id: 1, gender: 1, patient_name: 1, patient_id: 1, DOB: 1 }
      ).sort(filter).skip((page-1)*pageSize).limit(pageSize);
  
      return res.status(200).json({ patients: patients });

    }else{
      const patients = await Patient.find(
        {clinician_id: req._id},
        { _id: 1, gender: 1, patient_name: 1, patient_id: 1, DOB: 1 }
      ).sort(filter).skip((page-1)*pageSize).limit(pageSize);
  
      return res.status(200).json({ patients: patients });
    }
    
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

// check a patients
router.post("/check", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  try {
    const patients = await Patient.findOne(
      {clinician_id: req._id, patient_id:req.body.patient_id},
      { _id: 1}
    );

    if(patients){
      return res.status(200).json({ exists: true});
    }else{
      return res.status(200).json({ exists: false});
    }

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

// get available reviewers
router.get("/reviewer/all", authenticateToken, async (req, res) => {

  if(!checkPermissions(req.permissions, 300)){
    return res.status(401).json({ message: "Unauthorized access"});
  }

  try {

    const roles = await Role.find({ "permissions": { $in: [200] } },
    { role: 1})

    const roleArray = []
    roles.forEach(element => {
      roleArray.push(element.role)
    });
    const reviwers = await User.find({ "role": { $in: roleArray }, "availability":true},{username:1,reg_no:1});

    if (reviwers) {
      return res.status(200).json(reviwers);
    } else {
      return res.status(404).json({ message: "Reviwers not found" });
    }
  } catch (err) {
    return res.status(500).json(err);
  }
});

module.exports = router;
