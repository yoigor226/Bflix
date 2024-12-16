//importation des modules necessaire

const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const bodyParser = require('body-parser');
const Video = require('./models/videos');
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
        res.status(500).json({ error: 'Erreur lors de l\'ajout de la vidéo' });
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



//*******************API pour enregistrer(incrementation---) les likes des videos***************************************
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
