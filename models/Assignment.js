const mongoose = require('mongoose');

const AssignentSchema = new mongoose.Schema({
    reviewer_id:{
        type: mongoose.Types.ObjectId,
        ref: "User",
        required: true,
    },
    telecon_entry_id: {
        type: mongoose.Types.ObjectId,
        ref: "TeleConEntry",
        required: true,
    },
    checked:{
        type: Boolean,
        default:false
    },
    reveiwed:{
        type: Boolean,
        default:false
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Assignment",AssignentSchema,"assignments")