const mysql = require('mysql');
require('dotenv').config();
// Créer la connexion à la base de données
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
  port: process.env.MYSQLPORT,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
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
