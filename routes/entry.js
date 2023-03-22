const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const TeleConEntry = require("../models/TeleConEntry");
const Image = require("../models/Image");
const Report = require("../models/Report");
const User = require("../models/User");
const Role = require("../models/Role");
const Assignment = require("../models/Assignment");

const { authenticateToken, checkPermissions } = require("../middleware/auth");

// add a teleconsultation entry
router.post("/add/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
      const patient = await Patient.findOne({ clinician_id: req._id, _id: req.params.id });
  
      if (patient) {
        
          const newEntry = new TeleConEntry({
            patient: patient._id,
            clinician_id: req._id,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            complaint: req.body.complaint,
            findings: req.body.findings,
            current_habits: req.body.current_habits
          });
  
          const savedEntry = await newEntry.save();
          res.status(200).json(savedEntry);

        } else {
          return res.status(404).json({ message: "Patient is not registered" });
        }

    } catch (error) {
      res.status(500).json({ error: error, message: error.message });
    }
});


// get all entries
router.get("/get", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    const pageSize = 20;
    const page = req.query.page? req.query.page: 1;

    var filter = {};

    if(req.query.filter && req.query.filter === "Created Date"){
        filter = {createdAt: -1}
    }else if(req.query.filter && req.query.filter === "Updated Date"){
        filter = {UpdatedAt: -1}
    }else{
        filter = {createdAt: -1}
    }

    try {
        const entries = await TeleConEntry.find(
            {clinician_id: req._id},
            {_id:1, reveiwers:1, reveiwes:1, patient:1, createdAt:1, updatedAt: 1, updated:1, images:1}
        )
        .populate('reviewers', 'username') // Only select the name
        .populate('patient', 'patient_id patient_name') // Only select the name
        .sort(filter).skip((page-1)*pageSize).limit(pageSize);

        return res.status(200).json(entries);
            
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// get all entries
router.get("/get/patient/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    const pageSize = 20;
    const page = req.query.page? req.query.page: 1;

    var filter = {};

    if(req.query.filter && req.query.filter === "Updated Date"){
        filter = {UpdatedAt: -1}
    }else{
        filter = {createdAt: -1}
    }

    try {
        const entries = await TeleConEntry.find(
            {clinician_id: req._id, patient: req.params.id},
            {_id:1, reveiwers:1, reveiwes:1, patient:1, createdAt:1, updatedAt: 1, updated:1, images:1}
        )
        .populate('reviewers', 'username') // Only select the name
        .populate('patient', 'patient_id patient_name') // Only select the name
        .sort(filter).skip((page-1)*pageSize).limit(pageSize);

        return res.status(200).json(entries);
            
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});


// get one entry
router.get("/get/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
        const entry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id},
            {}
        )
        .populate('reviewers', "username _id reg_no")
        .populate('patient', "patient_name patient_id _id")
        .populate('images')
        .populate('reports')

        if(entry){
            return res.status(200).json(entry);
        }else{
            return res.status(404).json({message:"Entry not found"});
        }
        
            
    } catch (err) {
        console.log(err)
        return res.status(500).json({ message: err });
    }
});

// add a reviewers
router.post("/reviewer/add/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
      const entry = await TeleConEntry.findOne({ clinician_id: req._id, _id: req.params.id });
  
      if (entry) {

        if(entry.reviewers.includes(req.body.reviewer_id)){
            const updatedEntry = await TeleConEntry.findOne(
                {clinician_id: req._id, _id:req.params.id},
                {}
            )
            .populate('reviewers', "username _id reg_no")
            .populate('patient', "patient_name patient_id _id")
            .populate('images')
            .populate('reports')
            return res.status(200).json(updatedEntry);
        }

        const newAssignement = new Assignment({
            telecon_entry_id: req.params.id,
            reviewer_id: req.body.reviewer_id,
            checked: false,
            reveiwed: false
        });
  
        const savedAssignement = await newAssignement.save();

        entry.reviewers.push(req.body.reviewer_id);
        entry.save();
    
        const updatedEntry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id},
            {}
        )
        .populate('reviewers', "username _id reg_no")
        .populate('patient', "patient_name patient_id _id")
        .populate('images')
        .populate('reports')

        return res.status(200).json(updatedEntry);
        
    } else {
        return res.status(404).json({ message: "Entry is not found" });
    }

    } catch (error) {
      res.status(500).json({ error: error, message: error.message });
    }
});

// remove a reviewers
router.post("/reviewer/remove/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
      const entry = await TeleConEntry.findOne({ clinician_id: req._id, _id: req.params.id });
  
      if (entry) {

        await Assignment.deleteOne({telecon_entry_id : req.params.id, reviewer_id:req.body.reviewer_id});

        
        const update = await TeleConEntry.findByIdAndUpdate(entry._id,{
           $pullAll:{reviewers:[req.body.reviewer_id]}
        })
    
        const updatedEntry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id},
            {}
        )
        .populate('reviewers', "username _id reg_no")
        .populate('patient', "patient_name patient_id _id")
        .populate('images')
        .populate('reports')
        return res.status(200).json(updatedEntry);

        } else {
          return res.status(404).json({ message: "Entry is not found" });
        }

    } catch (error) {
      res.status(500).json({ error: error, message: error.message });
    }
});

// delete an entry
router.post("/delete/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
      const entry = await TeleConEntry.findOne({ clinician_id: req._id, _id: req.params.id });

        const hours = (new Date() - new Date(entry.createdAt))/ (3600 * 1000);
        if(hours >= 24){
            return res.status(401).json({ message: "Unauthorized access"});
        }

        if (entry) {

            await Assignment.deleteMany({telecon_entry_id : req.params.id});
            await Image.deleteMany({telecon_entry_id : req.params.id});
            await Report.deleteMany({telecon_entry_id : req.params.id});
            await TeleConEntry.findByIdAndDelete(req.params.id)

            return res.status(200).json({ message: "Entry is deleted successfully" });

        } else {
            return res.status(404).json({ message: "Entry not found" });
        }

    } catch (error) {
      res.status(500).json({ error: error, message: error.message });
    }
});


module.exports = router;