const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const bcrypt = require("bcrypt");

// testing purpose

router.post("/testend", async (req, res) => {

    try {
        let username = null;
        let useremail = null;
        try {

            console.log("Name : ", req.body.username, "Email : ", req.body.email);


            username = await User.findOne({ username: req.body.username });
            useremail = await User.findOne({ email: req.body.email });
            console.log("User test: ", username, useremail);
            //return res.status(200).json({  message: "Touch the end point!" });

        } catch (err) {
            return res.status(500).json({ error: err, message: "Internal Server Error0!" });
        }

        if (username) {
            console.log("Iam here 1");
            res.status(401).json({ message: "User name is taken" });
        } else if (useremail) {
            res.status(401).json({ message: "The email address is already in use" });
        } else {
            console.log("Iam here 4");
            const newUser = new User({
                reg_no: req.body.reg_no,
                username: req.body.username,
                email: req.body.email,
                hospital: req.body.hospital,
                role: "System Admin",
            });
            console.log("Iam here 5");
            const user = await newUser.save();
            const details = user._doc;
            details["message"] = "Successfully signed in";
            res.status(200).json(details);

        }



    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error2!" });
    }
});

router.post("/roles", async (req, res) => {
  try {

    //case insensitive search
    const role = await Role.findOne({role: {$regex: `^${req.body.role}$`, $options: "i"}});
    
    if(!role){

      const newRole = new Role({
        role: req.body.role,
        permissions: req.body.permissions
      });
  
      try {
        const addrole = await newRole.save();
        return res.status(200).json({ message: "New role added successfully"});
      }catch(err){
        return res.status(500).json({ message: "New role insertion failed" });
      }


    }else{
        return res.status(401).json({message:"Role already exists"});
    }
  } catch (err) {
    return res.status(500).json({ error: err, message: "Internal Server Error!" });
  }
});
module.exports = router;
