const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    details:{
        type: String,
        default: ""
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Hospital",HospitalSchema)