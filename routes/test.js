const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
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

        let hashedPassword = null;
        if (username) {
            console.log("Iam here 1");
            res.status(401).json({ message: "User name is taken" });
        } else if (useremail) {
            res.status(401).json({ message: "The email address is already in use" });
        } else {

            try {
                console.log("Iam here 2");
                const salt = await bcrypt.genSalt(10);
                hashedPassword = await bcrypt.hash(req.body.password, salt);
                console.log("Iam here 3");
            } catch (err) {
                return res.status(500).json({ error: err, message: "Internal Server Error1!" });
            }

            console.log("Iam here 4");
            const newUser = new User({
                reg_no: req.body.reg_no,
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                hospital: req.body.hospital,
                role: "System Admin",
            });
            console.log("Iam here 5");
            const user = await newUser.save();
            const { password, ...others } = user._doc;
            others["message"] = "Successfully signed in";
            res.status(200).json(others);

        }



    } catch (err) {
        return res.status(500).json({ error: err, message: "Internal Server Error2!" });
    }
});

module.exports = router;