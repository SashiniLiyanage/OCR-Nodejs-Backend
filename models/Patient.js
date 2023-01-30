const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    patient_id:{
        type: String,
        required: true,
    },
    risk_factors:{
        type: Object,
        default: {
            smoking: false,
            alcohol: false,
            betel: false
        }
    },
    age:{
        type: Number,
        default: 0,
    },
    gender:{
        type: String,
        default: "",
    },
    histo_diagnosis:{
        type: String,
        default: ""
    },
    category:{
        type: String,
        default: "Unknown"
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Patient",PatientSchema)