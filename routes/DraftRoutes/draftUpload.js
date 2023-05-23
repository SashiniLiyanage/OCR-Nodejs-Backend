const express = require("express");
const router = express.Router();
const DraftReport = require("../../models/draftModels/DraftReport");
const DraftImage = require("../../models/draftModels/DraftImage");
const path = require("path");
const DraftEntry = require("../../models/draftModels/DraftEntry");
const multer = require("multer");
const fs = require("fs");
const { authenticateToken, checkPermissions } = require("../../middleware/auth");

let imageStorage = multer.diskStorage({
destination: function (req, file, cb) {
    let dest = path.join(__dirname, "../../Storage/images");
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
    let dest = path.join(__dirname, "../../Storage/reports");
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

// image routes
router.post("/images/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }
    
    try {
        // check for the existence of the entry
        const draftEntry = await DraftEntry.findOne({ _id: req.params.id});
        if (draftEntry && draftEntry.clinician_id !== req._id) {
            // upload images
            uploadImages(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: err, message: "Internal Server Error!" });
            } else if (err) {
                return res.status(500).json({ error: err, message: "Internal Server Error!" });
            } else {
                // extract form data from the request body
                const { files, ...others } = req.body;

                const data = JSON.parse(others.data)
                // images are created in bulk below
                DraftImage.insertMany(data, function (error, docs) {
                if (error) {
                    return res.status(500).json({ error: error, message: "Internal Server Error!" });
                } else {
                    docs.forEach((doc) => {
                        draftEntry.images.push(doc._id);
                    });
                    draftEntry.save();
                    return res.status(200).json({ docs, message: "Images Uploaded Successfully" });
                }
                });
            }
            });
        } else {
            return res.status(404).json({ message: "Entry Not Found" });
        }
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
}
);

// document routes
router.post("/reports/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }
    
    try {
        // check for the existence of the entry
        const draftEntry = await DraftEntry.findOne({ _id: req.params.id});
        if (draftEntry && draftEntry.clinician_id !== req._id) {
            // upload images
            uploadDocuments(req, res, function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(500).json({ error: err, message: "Internal Server Error!" });
            } else if (err) {
                return res.status(500).json({ error: err, message: "Internal Server Error!" });
            } else {
                
                // extract form data from the request body
                const { files, ...others } = req.body;
                const data = JSON.parse(others.data)
                // reports are created in bulk below
                DraftReport.insertMany(data, function (error, docs) {
                if (error) {
                    return res.status(500).json({ error: error, message: "Internal Server Error!" });
                } else {
                    docs.forEach((doc) => {
                        draftEntry.reports.push(doc._id);
                    });
                    draftEntry.save();
                    return res.status(200).json({ docs, message: "reports Uploaded Successfully" });
                }
                });
            }
            });
        } else {
            return res.status(404).json({ message: "No Entry found" });
        }
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
}
);

module.exports = router;