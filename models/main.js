//importation des modules necessaire

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require('body-parser');
const Video = require('./models/videos');
const User = require('./models/users');
const path = require('path');

const port = 5000||4000;
const mongodb_uri = "mongodb://localhost:27017/admin"
const app = express();

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'web')));

//connection a la base de donnee
mongoose.connect(mongodb_uri, {useNewUrlParser: true, useUnifiedTopology: true});
const db = mongoose.connection;
db.on('error', (Error)=>console.log(Error));
db.once('open',()=> console.log("connecter a la base de donnee avec sucsses"));


//
app.use(express.urlencoded({extended: false}));
app.use(express.json());

app.use(
    session({
        secret: "code",
        saveUninitialized: true,
        resave: false,
    })
);

app.use((req, res, next)=>{
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

//Template engine
app.set('view engine', 'ejs');


// app.get("/", (req, res)=>{
//     res.send("hello world");
// });

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

//*******************API pour ajouter une vidéo dans la base de donne********************************

app.post('/api/videos/save', async (req, res) => {
    const { title, description, url, thumbnail, isFreemium, category, likes, comments, date } = req.body;

    try {
        const newVideo = new Video({
            title,
            description,
            url,
            thumbnail,
            isFreemium,
            category,
            date
        });

        await newVideo.save();//enregistre dans la base de donne

        res.status(201).json(newVideo);// renvoie le code 201 si la video est enregistrer

    } catch (error) {
        res.status(550).json({ error: 'Erreur lors de l\'ajout de la vidéo' });
    }
});
//**********************************************************************************************************/


//*******************API pour reucuper les vidéo dans la base de donne***************************************
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await Video.find();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des vidéos' });
    }
});
//*********************************************************************************************************/


//*******************API pour rechercher les vidéos dans la base de donne***************************************
app.get('/api/videos/search', async (req, res) => {
    const query = req.query.q;
    try {
        const videos = await Video.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la recherche des vidéos' });
    }
});
//**********************************************************************************************************/



//*******************API pour enregistrer(incrementation) les likes des videos***************************************
app.post('/api/videos/like/:id', async (req, res) => {
    const videoId = req.params.id;
    try {
        const video = await Video.findById(videoId);
        video.likes += 1;
        await video.save();
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du like de la vidéo' });
    }
});
//**********************************************************************************************************/



//*******************API pour decrementer les likes d'une video***************************************
app.post('/api/videos/unlike/:id', async (req, res) => {
    const videoId = req.params.id;
    try {
        const video = await Video.findById(videoId);
        video.likes -= 1;
        await video.save();
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors du délike de la vidéo' });
    }
});
//**********************************************************************************************************/



//*******************API pour recuperer les videos en fonction de leur tendance. Le plus liker au moins liker***************************************
app.get('/api/videos/trending', async (req, res) => {
    try {
        const videos = await Video.find().sort({ likes: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des vidéos tendances' });
    }
});
//**********************************************************************************************************/


//*******************API pour classer les vidéos du plus nouveau au plus ancien***************************************
app.get('/api/videos/new', async (req, res) => {
    try {
        const videos = await Video.find().sort({ date: -1 });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des nouvelles vidéos' });
    }
});
//**********************************************************************************************************/


//*******************API pour classer les vidéos par category***************************************
app.get('/api/videos/category/:category', async (req, res) => {
    const category = req.params.category;
    try {
        const videos = await Video.find({ category: category });
        res.json(videos);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de la récupération des vidéos par catégorie' });
    }
});
//**********************************************************************************************************/



//*******************API pour enregistrer les commentaire d'une video***************************************
app.post('/api/videos/comment/:id', async (req, res) => {
    const videoId = req.params.id;
    const { username, text } = req.body;
    try {
        const video = await Video.findById(videoId);
        video.comments.push({ username, text });
        await video.save();
        res.json(video);
    } catch (error) {
        res.status(500).json({ error: 'Erreur lors de l\'ajout du commentaire' });
    }
});
//**********************************************************************************************************/





//*******************API pour rechercher les vidéos dans la base de donne***************************************
//**********************************************************************************************************/


//*******************API pour rechercher les vidéos dans la base de donne***************************************
//**********************************************************************************************************/

//app.use("", require('./routes/routes'));

app.listen(port, ()=>{
    console.log("server demmarrer");
    
});




//*******************API pour creer un compte***************************************

app.post('/api/users/register', async (req, res) => {
    try {
        console.log("Requête reçue : ", req.body); // Log le corps de la requête
        const { name, email, age, password } = req.body;

        if (!name || !email || !age || !password) {
            return res.status(400).json({ error: "Données manquantes ou invalides." });
        }

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "L'utilisateur existe déjà." });
        }

        const existingpasse = await User.findOne({ password });
        if (existingpasse) {
            return res.status(400).json({ error: "Le mot de passe existe déjà." });
        }

        // Créer un nouvel utilisateur
        const newUser = new User({ name, email, age, password });

        // Sauvegarder dans la base
        await newUser.save();
        console.log("Utilisateur créé avec succès : ", newUser); // Log le succès

        res.status(201).json(newUser);
    } catch (error) {
        console.error("Erreur lors de la création de l'utilisateur : ", error); // Log les erreurs
        res.status(599).json({ error: "Erreur quand on cree le compte." });
    }
});



// **************************************pour se connecter******************************
app.post('/api/users/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Vérifier que l'email et le mot de passe sont fournis
        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis." });
        }

        // Rechercher l'utilisateur dans la base de données
        const user = await User.findOne({ email });

        // Si l'utilisateur n'existe pas
        if (!user) {
            return res.status(404).json({ error: "Utilisateur non trouvé." });
        }

        // Vérification du mot de passe (pour cet exemple, on suppose que le mot de passe est en clair)
        // Si vous avez utilisé un hachage (ex : bcrypt), utilisez bcrypt.compare(password, user.password)
        if (password !== user.password) {
            return res.status(401).json({ error: "Mot de passe incorrect." });
        }

        // Si tout est correct, retournez une réponse de succès
        res.status(200).json({
            message: "Connexion réussie.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            }
        });
    } catch (error) {
        // En cas d'erreur inattendue
        console.error("Erreur lors de la tentative de connexion :", error);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
});


//*************************** */ pour se deconnecter********************************
app.post('/api/users/logout', (req, res) => {
    // Logique de déconnexion (par exemple, supprimer le token d'authentification)
    res.status(200).json({ message: "Déconnexion réussie" });
});



//************************* */ Pour modifier le profil**************************
app.put('/api/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, email, password, image } = req.body;
    
    // Mettre à jour l'utilisateur dans la base de données
    const updatedUser = await User.findByIdAndUpdate(userId, { name, email, password, image }, { new: true });
    res.status(200).json(updatedUser);
});



// ************************Pour modifier le mot de passe*****************
app.post('/api/users/reset-password', async (req, res) => {
    const { email } = req.body;
    // Logique pour envoyer un lien de réinitialisation du mot de passe
    res.status(200).json({ message: "Un lien de réinitialisation a été envoyé à votre email." });
});

//********************Pour gerer les abonnements*********************************
app.post('/api/users/:userId/subscribe', async (req, res) => {
    const { userId } = req.params;
    const { plan } = req.body;  // Plan d'abonnement choisi par l'utilisateur
    
    // Logique pour l'abonnement à un plan spécifique
    const user = await User.findById(userId);
    user.subscription = plan;  // Mise à jour du plan d'abonnement
    await user.save();
    
    res.status(200).json({ message: `Vous êtes maintenant abonné au plan ${plan}.` });
});

// Sauvegarder l'utilisateur dans la base de données