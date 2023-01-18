const express = require('express')
const router = express.Router()
const Patient = require('../models/Patient');
const User = require('../models/User');
const authenticateToken = require('../middleware/auth')

router.post("/add", async(req,res)=>{
    try{
    
        const patientid = await Patient.findOne({patient_id: req.body.patient_id});
        if(patientid){return res.status(401).json({message:`The patient id is already registered`});}
        
        
            const newPatient = new Patient({
                patient_id: req.body.patient_id,
                gender: req.body.gender,
                age: req.body.age,
                risk_factors: req.body.risk_factors,
                histo_diagnosis: req.body.histo_diagnosis,
                category: req.body.category,
            })
            const patient = await newPatient.save();
            const others = patient._doc;
            others["message"] = "Successfully added";
            res.status(200).json(others);

    }catch(error){
        res.status(500).json(error);
    }
})

// get all patients
router.get('/all', authenticateToken, async(req, res)=>{
    try{
        const patients = await Patient.find()

        return res.status(200).json({patients: patients})


    }catch(err){
        return res.status(500).json({message: err})
    }
})



module.exports = router ;