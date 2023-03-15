const express = require('express')
const router = express.Router()
const Image = require('../models/Image');
const Patient = require('../models/Patient');
const User = require('../models/User');
const {authenticateToken} = require('../middleware/auth')

/*
 * 
 * 
 * need to modify
 * 
 * 
 */

router.get('/all', authenticateToken, async(req, res)=>{
    try{
    
        const images = await Image.find({email: req.email});
        return res.status(200).json({images});       

    }catch(err){
        return res.status(500).json(err)
    }
})

router.get('/:id', authenticateToken, async(req, res)=>{
    try{
        const patient = await Patient.findOne({_id:req.params.id})

        if(patient){
            
            const images = await Image.find({patient_id: req.params.id, email: req.email})
            return res.status(200).json({images});

        }else{
            return res.status(404).json({message:"Patient ID not found"})
        } 

    }catch(err){
        return res.status(500).json(err)
    }
})

router.post('/data/update', authenticateToken, async(req, res)=>{
    try{
        const image = await Image.findOne({_id:req.body._id, email: req.email});

        if(image){
            
            const images = await Image.findByIdAndUpdate(req.body._id, {
                location: req.body.location,
                clinical_diagnosis: req.body.clinical_diagnosis,
                lesions_appear: req.body.lesions_appear,
                annotation: req.body.annotation
            });

            return res.status(200).json({message:"Image data uploaded successfully"});

        }else{
            return res.status(404).json({message:"Image not found"})
        } 

    }catch(err){
        return res.status(500).json(err)
    }
})

module.exports = router ;