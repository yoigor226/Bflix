const { name } = require("ejs");
const mongoose = require("mongoose");

const abonnementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    phone : {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    created:{
        type: Date,
        required: true,
        default: Date.now,
    
    }

});

module.exports = mongoose.model("Abonnement", abonnementSchema);