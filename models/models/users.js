const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Pour éviter les doublons d'email
    },
   
    age: {
        type: Number,  // Âge de l'utilisateur pour les restrictions d'âge
        required: true
    },

    password: {
        type: String,
        required: true,
        unique: true // Pour éviter les doublons de mot de passe
    },
   
  
    
   
});

const User = mongoose.model("User", userSchema);

module.exports = User;