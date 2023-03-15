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
    }
},
{
    versionKey: false,
    timestamps:true
}
);

module.exports = mongoose.model("Assignment",AssignentSchema,"assignments")