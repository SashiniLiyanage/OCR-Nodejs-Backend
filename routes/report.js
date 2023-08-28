const express = require('express')
const router = express.Router();
const Report = require('../models/Report');
const fs = require('fs');
const path = require("path");
const TeleConEntry = require('../models/TeleConEntry');
const {authenticateToken, checkPermissions} = require('../middleware/auth');

let reportPath = path.join(__dirname, "../Storage/reports/");


//get reports of one entry
router.get("/get/draft/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
        const entry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id, status:'draft'},
            {}
        )
        .populate("reports")

        if(entry){
            return res.status(200).json(entry);
        }else{
            return res.status(404).json({message:"Entry not found"});
        }
        
            
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});


//delete report from an entry
router.post("/delete/draft/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {

        const entry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id, status:'draft'},
            {}
        )
        
        if(!entry){
            return res.status(404).json({message:"Entry not found"});
        }

        const updatedEntry = await TeleConEntry.findByIdAndUpdate(
            req.params.id,
            { $pull: { reports: req.body.report_id } },
            { new: true }
        );

        try {
            const deletedReport = await Report.findByIdAndDelete(req.body.report_id);
            
            fs.unlink(reportPath + deletedReport.report_name, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
            
            console.log('Report deleted:', deletedReport.report_name);
        } catch (error) {
            console.error('Error deleting report:', error);
        }
          
        return res.status(200).json({message: "Report deletion successful!"});

    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});

module.exports = router ;