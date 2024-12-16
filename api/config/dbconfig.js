const mysql = require('mysql');
require('dotenv').config();
// Créer la connexion à la base de données
const db = mysql.createConnection({
    host: mysql.railway.internal,
    port:3306,
    user:root,
    password:weTrdAfIyAXcbSQrgmySnAQnrFMJNPKH,
    database: railway
    
});

// Connexion à la base de données
db.connect(err => {
    if (err) {
        console.error('Erreur de connexion à la base de données :', err);  // Correction ici
    } else {
        console.log('Connecté à la base de données MySQL');
    }
});

module.exports = db;  // Pour pouvoir utiliser cette connexion ailleurs
