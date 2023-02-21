
const router = require('express').Router();
const Hospital = require('../models/Hospital');
const {authenticateToken} = require('../middleware/auth');

require('dotenv').config()

router.get('/hospitals', async(req, res)=>{
    try{
        const hospital = await Hospital.find();
        return res.status(200).json(hospital);
                
    }catch(err){
        return res.status(500).json(err)
    }
})

//change the password
router.post("/password", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });

    if (user) {
      const validate = await bcrypt.compare(req.body.cpassword, user.password);
      if (!validate)
        return res.status(400).json({ message: "Incorrect password!" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.npassword, salt);

      const update = await User.findOneAndUpdate(
        { email: req.email },
        {
          password: hashedPassword,
        }
      );

      return res
        .status(200)
        .json({ message: "Password is changed successfully" });
    } else {
      return res.status(401).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

//update user details
router.post("/update", authenticateToken, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.email });

    if (user) {
      const update = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.username,
        }
      );

      const user = await User.findOne({ email: req.email });

      const { password, ...others } = user._doc;
      others["message"] = "User details updated succesfully";
      return res.status(200).json(user);
    } else {
      return res.status(401).json({ message: "User Not Found" });
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
