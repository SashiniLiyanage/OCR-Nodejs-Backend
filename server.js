const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/dbconfig");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
const morgan = require("morgan");
const multer = require("multer");
const Image = require("./models/Image");
const Patient = require("./models/Patient");
const User = require("./models/User");
const { authenticateToken } = require("./middleware/auth");

//const PORT = process.env.PORT || 8000;
const PORT = 5000;

dotenv.config();
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// connect to the db
connectDB();

// listen on port
app.listen(PORT, () => {
  console.log(`Server is running on localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Welcome to server! this is server side test");
});

// import routes
const userAuthRoute = require("./routes/userAuth");
app.use("/api/auth", userAuthRoute);

const adminAuthRoute = require("./routes/adminAuth");
app.use("/api/admin/auth", adminAuthRoute);

const imagesRoute = require("./routes/image");
app.use("/api/image", imagesRoute);

const adminRoute = require("./routes/admin");
app.use("/api/admin", adminRoute);

const patientRoute = require("./routes/patient");
app.use("/api/user/patient", patientRoute);

const userRoute = require("./routes/user");
const TeleConEntry = require("./models/TeleConEntry");
app.use("/api/user", userRoute);

app.use("/Storage", express.static(path.join(__dirname, "/Storage")));
app.use(
  "/Storage/images",
  express.static(path.join(__dirname, "/Storage/images"))
);

let storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let dest = path.join(__dirname, "/Storage/images");
    let stat = null;
    try {
      stat = fs.statSync(dest);
    } catch (err) {
      fs.mkdirSync(dest);
    }
    if (stat && !stat.isDirectory()) {
      throw new Error("Directory cannot be created");
    }
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage }).array("files", 12);
const update = multer({ storage: storage }).single("files");

app.post(
  "/api/user/patient/images/:id",
  authenticateToken,
  async (req, res) => {
    try {
      // check for the existence of the entry
      const teleConEntry = await TeleConEntry.findOne({ _id: req.params.id });
      if (teleConEntry) {
        // check for the existence of the clinician
        const requestedClinician = await User.findOne({
          email: req.email,
          teleConEntry_id: { $in: [teleConEntry._id] },
        });
        if (requestedClinician) {
          // check for the existence of the patient
          const patient = await Patient.findOne({
            clinician_id: requestedClinician._id,
            _id: teleConEntry.patient_id,
          });
          if (patient) {
            // upload images middleware
            // NOTE: below the image has not been implemented, assuming ONLY images will be sent through the request
            upload(req, res, function (err) {
              if (err instanceof multer.MulterError) {
                return res.status(500).json(err);
              } else if (err) {
                return res.status(500).json(err);
              } else {
                // extract form data from the request body
                const { files, ...others } = req.body;
                // add patient id as an Object id
                others["patient_id"] = patient._id;

                // for now, assuming only common data for all the images has been sent as form data, once for all images,
                // here the data array is set to make the data fields for all the images using common data
                data = [];
                for (let i = 0; i < req.files.length; i++) {
                  data.push(others); // copies common data for all the images
                }

                // images are created in bulk below
                Image.insertMany(data, function (error, docs) {
                  if (error) {
                    return res.status(500).json(err.message);
                  } else {
                    // as the image name, original image name is given for now until instructed otherwise
                    for (let i = 0; i < req.files.length; i++) {
                      docs[i].image_name = req.files[i].originalname;
                      docs[i].save();
                    }
                    // ids of newly created images are pushed to the teleconsultation entry's image array
                    docs.forEach((doc) => {
                      teleConEntry.images.push(doc._id);
                    });
                    teleConEntry.save();
                    return res
                      .status(200)
                      .json({ docs, message: "Images Uploaded Successfully" });
                  }
                });
              }
            });
          } else {
            return res.status(404).json({ message: "No Patient found" });
          }
        } else {
          return res.status(404).json({ message: "Unauthorized access" });
        }
      } else {
        return res.status(404).json({ message: "No Entry found" });
      }
    } catch (error) {
      res.status(500).json(error);
      console.log(error);
    }
  }
);

app.post("/api/images/update", authenticateToken, async (req, res) => {
  try {
    update(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
        return res.status(500).json(err);
      } else if (err) {
        console.log(err);
        return res.status(500).json(err);
      } else {
        const data = JSON.parse(req.body.data);

        Image.findByIdAndUpdate(data._id, {
          annotation: [],
        })
          .then(() => {
            return res
              .status(200)
              .json({ message: "Image updated Successfully" });
          })
          .catch((err) => {
            return res.status(500).json(err);
          });
      }
    });
  } catch (error) {
    res.status(500).json(error);
    console.log(error);
  }
});
