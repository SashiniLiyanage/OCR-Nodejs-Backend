const express = require("express");
const router = express.Router();
const Patient = require("../../models/Patient");
const DraftEntry = require("../../models/draftModels/DraftEntry");
const DraftImage = require("../../models/draftModels/DraftImage");
const DraftReport = require("../../models/draftModels/DraftReport");

// const Review = require("../models/Review");
// const Assignment = require("../models/Assignment");

const { authenticateToken, checkPermissions } = require("../../middleware/auth");

// add a draft teleconsultation entry
router.post("/add/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
      const patient = await Patient.findOne({ clinician_id: req._id, _id: req.params.id });
  
      if (patient) {
        
          const newDraftEntry = new DraftEntry({
            patient: patient._id,
            clinician_id: req._id,
            start_time: req.body.start_time,
            end_time: req.body.end_time,
            complaint: req.body.complaint,
            findings: req.body.findings,
            current_habits: req.body.current_habits
          });
          //console.log("new entry id is ",newDraftEntry._id);


          try{
            const savedEntry = await newDraftEntry.save();
            res.status(200).json(savedEntry);
          }catch(err){
            res.status(500).json({message: "Draft Tele consultation entry failed" });
          }

        } else {
          return res.status(404).json({ message: "Patient is not registered" });
        }

    } catch (error) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});


// get all draft entries added by user
router.get("/get", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    const pageSize = 20;
    const page = req.query.page? req.query.page: 1;

    var filter = {};

    if(req.query.filter && req.query.filter === "Created Date"){
        filter = {createdAt: -1}
    }else if(req.query.filter && req.query.filter === "Updated Date"){
        filter = {updatedAt: -1}
    }else{
        filter = {createdAt: -1}
    }

    var condition = {clinician_id: req._id}
    
    // if(req.query.filter && req.query.filter === "Assigned"){
    //     condition["reviewers.0"] = {"$exists": true}
    // }else if(req.query.filter && req.query.filter === "Unassigned"){
    //     condition["reviewers"] = { $size: 0 }
    // }else if(req.query.filter && req.query.filter === "Reviewed"){
    //     condition["reviews.0"] = {"$exists": true}
    // }else if(req.query.filter && req.query.filter === "Unreviewed"){
    //     condition["reviews"] = { $size: 0 }
    // }else if(req.query.filter && req.query.filter === "Newly Reviewed"){
    //     condition["updated"] = true
    // }

    try {
        const draftEntries = await DraftEntry.find(condition,{}
        )
        //.populate('reviewers', 'username') // Only select the name
        .populate('patient', 'patient_id patient_name') // Only select the name and id
        .sort(filter).skip((page-1)*pageSize).limit(pageSize);
        console.log(draftEntries);
        return res.status(200).json(draftEntries);
            
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});

// get patients entries
router.get("/get/patient/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    const pageSize = 20;
    const page = req.query.page? req.query.page: 1;

    var filter = {};

    if(req.query.filter && req.query.filter === "Updated Date"){
        filter = {updatedAt: -1}
    }else{
        filter = {createdAt: -1}
    }

    try {
        const entries = await TeleConEntry.find(
            {clinician_id: req._id, patient: req.params.id},
            {}
        )
       // .populate('reviewers', 'username') // Only select the name
        .populate('patient', 'patient_id patient_name') // Only select the name
        .sort(filter).skip((page-1)*pageSize).limit(pageSize);

        return res.status(200).json(entries);
            
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});


// get one entry details added by users
// id is entry _id
router.get("/get/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
        const draftEntry = await DraftEntry.findOne(
            {clinician_id: req._id, _id:req.params.id},
            {}
        )
       // .populate('reviewers', "username _id reg_no")
        .populate('patient', 'patient_name patient_id _id')
        .populate('images')
        .populate('reports')

        if(draftEntry){
            return res.status(200).json(draftEntry);
        }else{
            return res.status(404).json({message:"Draft Entry not found"});
        }
        
            
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
        
    }
});



// routes realted to reviewers, reviews, shared data are removed


module.exports = router;