const express = require('express');
const app = express();
const dotenv = require('dotenv');
const cors=require("cors");
const connectDB = require('./config/dbconfig');
//const PORT = process.env.PORT || 8000;
const PORT = 5000;

dotenv.config();
app.use(express.json());
app.use(cors())

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

// const imageRoute = require('./routes/image');
// app.use("/api/user/image",imageRoute);
