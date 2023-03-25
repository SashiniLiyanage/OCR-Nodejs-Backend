const router = require("express").Router();
const User = require("../../models/User");
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

module.exports = router;