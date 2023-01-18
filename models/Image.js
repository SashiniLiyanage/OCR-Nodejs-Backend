const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    patient_id:{
        type: String,
        required: true,
    },
    folder:{
        type: String,
        default: ""                                    
    },
    location:{
        type: String,
        default: "" 
    },
    clinical_diagnosis:{
        type: String,
        default: ""
    },
    lesions_appear:{
        type: Boolean,
        default: false
    },
    annotation:{
        type: Object,
        default: {}
    },
    predicted_cat:{
        type: String,
        default: ""
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Image",ImageSchema)