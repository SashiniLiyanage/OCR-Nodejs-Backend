const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
    patient_id:{
        type: String,
        required: true,
        default:""
    },
    risk_factors:{
        type: Object,
        default: {}
    },
    age:{
        type: Number,
        default: 0,
    },
    gender:{
        type: String,
        default:"",
    },
    histo_diagnosis:{
        type: String,
        default: ""
    },
    category:{
        type: String,
        default: ""
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Patient",PatientSchema)