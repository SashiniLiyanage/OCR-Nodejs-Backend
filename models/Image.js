const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
    reg_no:{
        type: String,
        required: true,
    },
    patient_id:{
        type: mongoose.Schema.ObjectId,
        required: true,
    },
    image_id:{
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
    }

},
{
    timestamps:true
}
);

module.exports = mongoose.model("Image",ImageSchema)