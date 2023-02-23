const express = require('express')
const router = express.Router()
const Patient = require('../models/Patient');
const User = require('../models/User');
const {authenticateToken} = require('../middleware/auth')

// add new patient
router.post("/add", async(req,res)=>{
    try{
    
        const patient = await Patient.findOne({patient_id: req.body.patient_id});

        if(patient){

            const others = patient._doc;
            others["message"] = "Patient Id already exists";
            return res.status(200).json(others);

        }else{

            const newPatient = new Patient({
                patient_id: req.body.patient_id,
            })
            
            const patient = await newPatient.save();
            const others = patient._doc;
            others["message"] = "Successfully added";
            res.status(200).json(others);

        }

    }catch(error){
        res.status(500).json(error);
    }
})

//update patient details
router.post("/update/:id", async(req,res)=>{
    try{
    
        const patient = await Patient.findById(req.params.id);

        if(!patient){
            return res.status(401).json({messsage:"Patient ID doesnt exists!"});
        }else{

            const update = await Patient.findOneAndUpdate({_id:req.params.id}, {
                gender: req.body.gender,
                age: req.body.age,
                risk_factors: req.body.risk_factors,
                histo_diagnosis: req.body.histo_diagnosis,
                category: req.body.category,
            });

            const updatedPatient = await Patient.findById(req.params.id);
            const others = updatedPatient._doc;
            others["message"] = "Successfully added";
            res.status(200).json(others);
        }

    }catch(error){
        res.status(500).json(error);
    }
})

router.get("/search", async(req, res) => {
    console.log(req.query.field);
    try{
        let result = await Patient.aggregate([
            {
                "$search": {
                    "autocomplete": {
                        "query": `${req.query.query}`,
                        "path" : `${req.query.field}`,
                        "fuzzy": {
                            "maxEdits": 2,
                            "prefixLength": 3
                        }
                    }
                }
            }
        ]);
        res.send(result);
    } catch(e) {
        res.status(500).send({ message : e.message});
    }
});

// get all patients
router.get('/all', authenticateToken, async(req, res)=>{
    try{
        const patients = await Patient.find({},{_id:1, gender:1, category:1, patient_id:1, age:1});

        return res.status(200).json({patients: patients})


    }catch(err){
        return res.status(500).json({message: err})
    }
})



router.get('/:id', authenticateToken, async(req, res)=>{
    try{
        const patient = await Patient.findById(req.params.id)

        if(patient){
            return res.status(200).json(patient);
        }else{
            return res.status(404).json({message:"Patient ID not found"})
        } 

    }catch(err){
        return res.status(500).json(err)
    }
})

module.exports = router ;