const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path'); // Import pour gérer les chemins
const multer = require('multer');

// Importations des routes 
const stripeRoutes = require('./routes/stripeRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const contactRoutes = require('./routes/contactRoutes');
const productRoute = require('./routes/productRoute');
const authRoutes = require('./routes/authRoute');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const usersRoutes = require('./routes/usersRoutes');
const categoriesRoutes = require('./routes/categoriesRoutes');

const PORT = process.env.PORT || 8808;

// Middleware pour application
const app = express();

// Middleware pour parser les requêtes JSON
app.use(express.json());

// Configurer CORS pour permettre les requêtes de vos frontends
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Autorise les requêtes de ces URLs
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true // Si vous avez besoin d'envoyer des cookies
}));

// Configuration de Multer pour les uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "../client/public/upload"); // Dossier cible pour les fichiers uploadés
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname);
    },
});

const upload = multer({ storage });

// Route pour gérer les uploads
app.post("/api/upload", upload.single("file"), function (req, res) {
    const file = req.file;
    res.status(200).json(file.filename);
});

// Configuration des routes API
app.use("/api/settings", settingsRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/product", productRoute);
app.use("/api/auth", authRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/categories", categoriesRoutes);
app.use('/api/stripe', stripeRoutes);

// Configurer pour servir les fichiers statiques du dossier "dist"
const distPath = path.join(__dirname, '../frontend/dist'); // Chemin vers le dossier "dist"
app.use(express.static(distPath));

// Route catch-all pour rediriger vers index.html (React SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});


// Définir une route pour la racine
app.get('/', (req, res) => {
    res.send('Bienvenue sur mon backend!');
  });
// Démarrage du serveur
app.listen(PORT, () => {
    console.log(`Serveur s'exécute sur http://localhost:${PORT}`);
});
// Ajoutez à la fin de votre fichier
module.exports = app; // Pour Vercel
