const router = require("express").Router();
const Hospital = require("../models/Hospital");
const User = require("../models/User");
const { authenticateToken } = require("../middleware/auth");

require("dotenv").config();

router.get("/hospitals", async (req, res) => {
  try {
    const hospital = await Hospital.find();
    return res.status(200).json(hospital);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.get("/hospitals/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    return res.status(200).json(hospital);
  } catch (err) {
    return res.status(500).json(err);
  }
});

router.post("/hospitals/update", async (req, res) => {
  const body = req.body;
  const data = req.body.data;
  try{
    const hospital = await Hospital.findById(data._id);
    if(hospital){
      const updatename = await Hospital.findOneAndUpdate(
        { _id: data._id },
        {
          name: body.name,
        }
      );
      const updatecategory = await Hospital.findOneAndUpdate(
        { _id: data._id },
        {
          category: body.category,
        }
      );
      const updatecity = await Hospital.findOneAndUpdate(
        { _id: data._id },
        {
          city: body.city,
        }
      );
      const updateaddress = await Hospital.findOneAndUpdate(
        { _id: data._id },
        {
          address: body.address,
        }
      );
      const updatecontact_no = await Hospital.findOneAndUpdate(
        { _id: data._id },
        {
          contact_no: body.contact_no,
        }
      );

      const hospital = await Hospital.findById(data._id)

      res.status(200).json(hospital);
    }else{
      return res.status(401).json({ message: "Hospital Not Found" });
    }
  }catch(err){
    res.status(500).json(err);
  }
});

router.post("/hospitals/delete", authenticateToken, async (req, res) => {
  try{
    const hospital = Hospital.findById(req.id);
    if(hospital){
      const result = await Hospital.deleteOne({
        _id: req.id
      });
      if (result==1){
        return res.status(200).json({ message: "Succesfuly deleted the hospital" });
      }
    }
  }catch{
    return res.status(401).json({ message: "Hospital Not Found" });
  }
});

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
      const updateUsername = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.username,
        }
      );
      const updateHospital = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.hospital,
        }
      );
      const updateContactNo = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.contact_no,
        }
      );
      const updateAvailability = await User.findOneAndUpdate(
        { email: req.email },
        {
          username: req.body.availability,
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
