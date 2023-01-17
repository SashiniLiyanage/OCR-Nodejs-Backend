const router = require('express').Router();
const jwt = require('jsonwebtoken')
const User = require('../models/User');
const Request = require('../models/Request');
const bcrypt = require('bcrypt');


// user sign up
// add to request list
router.post("/signup",async(req,res)=>{
    try{
        const user = await Request.findOne({reg_no: req.body.reg_no});
        const userregno = await User.findOne({reg_no: req.body.reg_no});
        const email = await User.findOne({email: req.body.email});
        
        if(userregno){return res.status(401).json({message:'The Reg No is already registered'});}

        if(email){return res.status(401).json({message:'Email address is already registered'});}
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password,salt);

        if(user){
            const update = Request.findOne({reg_no: req.body.reg_no},{
                $set : {
                    username: req.body.username,
                    email: req.body.email,
                    password: hashedPassword
                }
            });
            return res.status(200).json({message:"The Request sent successfully"});
        }else{
            const newUser = new Request({
                reg_no: req.body.reg_no,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword
            })
            const user = await newUser.save();
            const {password,...others} = user._doc;
            others["message"] = "Successfully signed in";
            return res.status(200).json(others);
        }

    }catch(error){
        res.status(500).json(error);
    }
})

// sign in
router.post("/login",async(req,res)=>{
    try{
        const user = await User.findOne({email: req.body.email})
        if(!user) return res.status(400).json({message:"Wrong credentials!"})
        const validate = await bcrypt.compare(req.body.password,user.password)
        if(!validate) return res.status(400).json({message:"Wrong credentials!"})

        const access_token = jwt.sign({ sub: user.email, role: user.role }, process.env.ACCESS_SECRET, { expiresIn: process.env.REFRESH_TIME })

        // send the user data and refresh, access tokens
        const {password,...others} = user._doc;
        others["access_token"] = access_token;
        others["message"] = "Successfuly logged in";
        res.status(200).json(others)
        
    }catch(error){
        res.status(500).json(error)
    }
})

module.exports = router;