const express = require("express");
const router = express.Router();
const User = require("../models/users"); // Assurez-vous que le chemin vers le modèle est correct

// Récupérer tous les utilisateurs (GET /users)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération des utilisateurs." });
    }
});

// Ajouter un utilisateur (POST /users)
router.post("/users", async (req, res) => {
    try {
        const { name, email, age, password} = req.body;

        if (!name || !email || !age || !password) {
            return res.status(400).json({ error: "Données manquantes ou invalides." });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "L'utilisateur existe déjà." });
        }

        const newUser = new User({ name, email, age, password });
        await newUser.save();
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la création de l'utilisateur." });
    }
});

// Mettre à jour un utilisateur (PUT /users/:userId)
router.put("/users/:userId", async (req, res) => {
    const { userId } = req.params;
    const { name, email, age } = req.body;

    try {
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { name, email, age },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la mise à jour de l'utilisateur." });
    }
});

// Supprimer un utilisateur (DELETE /users/:userId)
router.delete("/users/:userId", async (req, res) => {
    const { userId } = req.params;

    try {
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: "Utilisateur introuvable." });
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la suppression de l'utilisateur." });
    }
});

module.exports = router;







