const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors = require("cors");
const connectDB = require('./config/dbconfig');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const multer  = require('multer');
const Image = require('./models/Image')
const {authenticateToken} = require('./middleware/auth')

//const PORT = process.env.PORT || 8000;
const PORT = 5000;

dotenv.config();
app.use(express.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use(cors({credentials: true, origin: "http://localhost:3000"}));

// connect to the db
connectDB();

// listen on port
app.listen(PORT, () => {
    console.log(`Server is running on localhost:${PORT}`);
});


app.get('/',(req, res) => {
  res.send("Welcome to server!")
});


// import routes
const userAuthRoute = require('./routes/userAuth');
app.use("/api/auth",userAuthRoute);

const adminAuthRoute = require('./routes/adminAuth');
app.use("/api/admin/auth",adminAuthRoute);

// const researcherAuthRoute = require('./routes/researcher_auth');
// app.use("/api/researcher/auth",researcherAuthRoute);

const adminRoute = require('./routes/admin');
app.use("/api/admin", adminRoute);

const patientRoute = require('./routes/patient');
app.use("/api/user/patient", patientRoute);


let storage = multer.diskStorage({
    destination: function(req, file, cb) {
      let dest = path.join(__dirname, '/Storage/images');
      let stat = null;
      try {
        stat = fs.statSync(dest);
      }
      catch (err) {
        fs.mkdirSync(dest);
      }
      if (stat && !stat.isDirectory()) {
        throw new Error('Directory cannot be created');
      } 
      cb(null, dest);
    },
    filename:(req,file,cb)=>{
        cb(null, file.originalname);   
    }
  });


const upload = multer({storage:storage}).array('files', 12)

app.post("/api/user/patient/images/:id", authenticateToken, async(req,res)=>{
  try{
    
      upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
          return res.status(500).json(err);
        } else if (err) {
          return res.status(500).json(err);
        }

          Image.insertMany(JSON.parse(req.body.data))
          .then(()=>{
            return res.status(200).json("Images Uploaded Successfully");
          })
          .catch((err)=>{
            console.log(err)
            return res.status(500).json(err);
          })
      })


  }catch(error){
      res.status(500).json(error);
      console.log(error)
  }
})
