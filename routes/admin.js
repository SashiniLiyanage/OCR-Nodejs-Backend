const router = require('express').Router();
const User = require('../models/User');
const Request = require('../models/Request');
const {authenticateToken} = require('../middleware/auth')
const emailService = require("../utils/emailService");

require('dotenv').config()

// get all requests
router.get('/requests', authenticateToken, async(req, res)=>{
    try{
        const requests = await Request.find({},{_id:true,username:true,reg_no:true})
        return res.status(200).json(requests)


    }catch(err){
        return res.status(500).json({message: err})
    }
})

router.get('/requests/:id', authenticateToken, async(req, res)=>{
    try{
        const request = await Request.findById(req.params.id)

        if(request){
            request.password = undefined;
            return res.status(200).json(request);
                
        }else{
            return res.status(404).json({message:"Request not found"})
        } 

    }catch(err){
        return res.status(500).json({message: err})
    }
})


// delete requests
router.post("/requests/:id", authenticateToken,async(req,res)=>{
    try{
        const request = await Request.findById(req.params.id)
        
        if(request){
            try{
                await Request.findByIdAndDelete(req.params.id)
            
                emailService.sendEmail(request.email, "REJECT", req.body.reason, request.username).then(response=>{
                    res.status(200).json({message: "Request has been deleted!"});
                }).catch(error =>{
                    res.status(200).json({message: "Request has been deleted! Error: Email notification Failed"});
                    return res.status(200).json(others);
                })
                
            }catch(error){
                return res.status(500).json({message:"Request deletion failed"});
            }
            
        }else{
            return res.status(404).json({message:"Request not found"})
        } 
    }catch(error){
        return res.status(500).json({message: error})
    } 
})

// accept requests
router.post("/accept/:id", authenticateToken,async(req,res)=>{
    try{
        const request = await Request.findById(req.params.id)

        if(request){

            const regno = await User.findOne({reg_no: request.reg_no})
            if(regno){return res.status(401).json({message:'Reg No already in use'})}

            const user = await User.findOne({email: request.email})
            if(user){return res.status(401).json({message:'Email address already in use'})}

            const newUser = new User({
                username: req.body.username,
                email: request.email,
                password: request.password,
                reg_no: request.reg_no,
                role: req.body.role
            })

            try{
                const adduser = await newUser.save();
                const {password,...others} = adduser._doc;
                await Request.findByIdAndDelete(req.params.id)

                emailService.sendEmail(request.email, "ACCEPT", req.body.reason, request.username).then(response=>{
                    others["message"] = "User registration successful!";
                    return res.status(200).json(others);
                }).catch(error =>{
                    others["message"] = "Error: Email notification Failed. User registration successful!";
                    return res.status(200).json(others);
                })
                
                
            }catch (error) {
                return res.status(500).json({message:"User registration failed"});
            }
            
        }else{
            return res.status(404).json({message:"Request not found"})
        } 
    }catch(error){
        return res.status(500).json({message: error})
    } 
})


module.exports = router;