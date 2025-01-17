const express = require('express')
const router = express.Router()
const Image = require('../models/Image');
const fs = require('fs');
const path = require("path");
const TeleConEntry = require('../models/TeleConEntry');
const {authenticateToken, checkPermissions} = require('../middleware/auth');

let imagePath = path.join(__dirname, "../Storage/images/");

// id is image id 
router.post('/update/:id', authenticateToken, async(req, res)=>{
    try{
       
        const images = await Image.findByIdAndUpdate(req.params.id, {
            location: req.body.location,
            clinical_diagnosis: req.body.clinical_diagnosis,
            annotation: req.body.annotation
        });

        if(images){
            return res.status(200).json({message:"Image data uploaded successfully"});
        }else{
            return res.status(404).json({message:"Image Not Found"});
        }


    }catch(err){
        return res.status(500).json(err)
    }
})

//get images of one entry
router.get("/get/draft/:id", authenticateToken, async (req, res) => {

    if(!checkPermissions(req.permissions, [300])){
        return res.status(401).json({ message: "Unauthorized access"});
    }

    try {
        const entry = await TeleConEntry.findOne(
            {clinician_id: req._id, _id:req.params.id, status:'draft'},
            {}
        )
        .populate("images")

        if(entry){
            return res.status(200).json(entry);
        }else{
            return res.status(404).json({message:"Entry not found"});
        }
        
            
    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});


//delete image from an entry
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
            { $pull: { images: req.body.image_id } },
            { new: true }
        );

        try {
            const deletedImage = await Image.findByIdAndDelete(req.body.image_id);
            
            fs.unlink(imagePath + deletedImage.image_name, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
            });
            
            console.log('Image deleted:', deletedImage.image_name);
        } catch (error) {
            console.error('Error deleting image:', error);
        }
          
        return res.status(200).json({message: "Image deletion successful!"});

    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error!" });
    }
});

module.exports = router ;