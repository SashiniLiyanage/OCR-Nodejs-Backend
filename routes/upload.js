const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Report = require("../models/Report");
const Image = require("../models/Image");
const path = require("path");
const TeleConEntry = require("../models/TeleConEntry");
const multer = require("multer");
const fs = require("fs");
const { authenticateToken, checkPermissions } = require("../middleware/auth");

let imageStorage = multer.diskStorage({
destination: function (req, file, cb) {
    let dest = path.join(__dirname, "../Storage/images");
    let stat = null;
    try {
    stat = fs.statSync(dest);
    } catch (err) {
    fs.mkdirSync(dest);
    }
    if (stat && !stat.isDirectory()) {
    throw new Error("Directory cannot be created");
    }
    cb(null, dest);
},
filename: (req, file, cb) => {
    cb(null, file.originalname);
},
});

let reportStorage = multer.diskStorage({
destination: function (req, file, cb) {
    let dest = path.join(__dirname, "../Storage/reports");
    let stat = null;
    try {
    stat = fs.statSync(dest);
    } catch (err) {
    fs.mkdirSync(dest);
    }
    if (stat && !stat.isDirectory()) {
    throw new Error("Directory cannot be created");
    }
    cb(null, dest);
},
filename: (req, file, cb) => {
    cb(null, file.originalname);
},
});

let consentFormStorage = multer.diskStorage({
destination: function (req, file, cb) {
    let dest = path.join(__dirname, "../Storage/consentform");
    let stat = null;
    try {
    stat = fs.statSync(dest);
    } catch (err) {
    fs.mkdirSync(dest);
    }
    if (stat && !stat.isDirectory()) {
    throw new Error("Directory cannot be created");
    }
    cb(null, dest);
},
filename: (req, file, cb) => {
    cb(null, file.originalname);
},
});


const uploadImages = multer({ storage: imageStorage }).array("files", 12);
const uploadDocuments = multer({ storage: reportStorage }).array("files", 3);
const uploadConsentForm = multer({ storage: consentFormStorage }).single("files");

// image routes
router.post("/images/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }
    
    try {
    // check for the existence of the entry
    const teleConEntry = await TeleConEntry.findOne({ _id: req.params.id});
    if (teleConEntry && teleConEntry.clinician_id !== req._id) {
        // upload images
        uploadImages(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        } else {
            // extract form data from the request body
            const { files, ...others } = req.body;

            const data = JSON.parse(others.data)
            // images are created in bulk below
            Image.insertMany(data, function (error, docs) {
            if (error) {
                console.log(error)
                return res.status(500).json(err);
            } else {
                docs.forEach((doc) => {
                teleConEntry.images.push(doc._id);
                });
                teleConEntry.save();
                return res.status(200).json({ docs, message: "Images Uploaded Successfully" });
            }
            });
        }
        });
    } else {
        return res.status(404).json({ message: "No Entry found" });
    }
    } catch (error) {
    res.status(500).json(error);
    console.log(error);
    }
}
);

// document routes
router.post("/reports/:id", authenticateToken, async (req, res) => {
    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }
    
    try {
    // check for the existence of the entry
    const teleConEntry = await TeleConEntry.findOne({ _id: req.params.id});
    if (teleConEntry && teleConEntry.clinician_id !== req._id) {
        // upload images
        uploadDocuments(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(500).json(err);
        } else if (err) {
            return res.status(500).json(err);
        } else {
            
            // extract form data from the request body
            const { files, ...others } = req.body;
            const data = JSON.parse(others.data)
            // reports are created in bulk below
            Report.insertMany(data, function (error, docs) {
            if (error) {
                return res.status(500).json(err.message);
            } else {
                docs.forEach((doc) => {
                teleConEntry.reports.push(doc._id);
                });
                teleConEntry.save();
                return res.status(200).json({ docs, message: "reports Uploaded Successfully" });
            }
            });
        }
        });
    } else {
        return res.status(404).json({ message: "No Entry found" });
    }
    } catch (error) {
    res.status(500).json(error);
    console.log(error);
    }
}
);

// add new user
router.post("/patient", authenticateToken, async (req, res) => {
    if(!checkPermissions(req.permissions, 300)){
        return res.status(401).json({ message: "Unauthorized access"});
    }
    
    try {
    // check for the existence of the entry
    const patient = await Patient.findOne({
        patient_id: req.body.patient_id,
        clinician_id: req._id,
    });
  
    if (patient) {
        return res.status(401).json({message:"Patient ID already exists"});
    }
    // upload images
    uploadConsentForm(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
    } else if (err) {
        return res.status(500).json(err);
    } else {
        
        // extract form data from the request body
        const { files, ...others } = req.body;
        const data = JSON.parse(others.data)
        data.clinician_id = req._id

        const newEntry = new Patient(data);
  
        const savedPatient = await newEntry.save();
        res.status(200).json(savedPatient);
    }
    });
    
    } catch (error) {
    res.status(500).json(error);
    console.log(error);
    }
}
);

module.exports = router;