const router = require("express").Router();
const User = require("../../models/User");
const Image = require("../../models/Image");
const Patient = require("../../models/Patient");

const { authenticateToken, checkPermissions } = require("../../middleware/auth");


require("dotenv").config();

// add the auth token
router.get("/percentages", async (req, res) => {
 
  Patient.aggregate(
    [
      { $unwind: "$risk_factors" },
      { $group: { _id: "$risk_factors.habit", count: { $sum: 1 } } },
      { $project: { _id: 0, item: "$_id", count: 1 } },
    ],
    function (err, results) {
      if (err) {
        return res.send(err);
      } else {
        Patient.countDocuments({}, function (err, count) {
          if (err) {
            return res.send(err);
          } else {
            const arr = [];
            results.forEach((result) => {
              const percentage = (result.count / count) * 100;
              arr.push(`${result.item}: ${percentage}%`);
            });

            return res.send(arr);
          }
        });
      }
    }
  );
});


// GET route to get the total number of doctors and patients
router.get("/totals", async (req, res) => {
  try {
    const patients = await Patient.countDocuments();
    const doctors = await User.countDocuments();
    const images = await Image.countDocuments();

    res
      .status(200)
      .json({ doctors: doctors, patients: patients, images: images });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route to get the total number of doctors
router.get("/doctors", async (req, res) => {
  try {
    User.countDocuments({}, function (err, count) {
      if (err) throw err;

      res.status(200).json({ count: count });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route to get the total number of doctors
router.get("/patients", async (req, res) => {
  try {
    Patient.countDocuments({}, function (err, count) {
      if (err) throw err;

      res.status(200).json({ count: count });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET route to get the total number of doctors
router.get("/images", async (req, res) => {
  try {
    Image.countDocuments({}, function (err, count) {
      if (err) throw err;

      res.status(200).json({ count: count });
    });
  } catch (err) {
    res.status(500).json(err);
  }
});


module.exports = router;