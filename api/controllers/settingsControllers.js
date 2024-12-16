// controllers/settingsController.js

const db = require('../config/dbconfig');

// Fonction pour enregistrer ou mettre à jour les paramètres

const saveSettings = (req, res) => {
    const { 
        storeName, 
        adminEmail, 
        notificationEmail, 
        orderMessage, 
        notifyNewOrder, 
        notifyStatusChange, 
        
    } = req.body;

    const sql = `
        INSERT INTO settings (
            storeName, 
            adminEmail, 
            notificationEmail, 
            orderMessage, 
            notifyNewOrder, 
            notifyStatusChange, 
            
        ) VALUES (?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            storeName = VALUES(storeName),
            adminEmail = VALUES(adminEmail),
            notificationEmail = VALUES(notificationEmail),
            orderMessage = VALUES(orderMessage),
            notifyNewOrder = VALUES(notifyNewOrder),
            notifyStatusChange = VALUES(notifyStatusChange),
            
    `;

    db.query(sql, [
        storeName, 
        adminEmail, 
        notificationEmail, 
        orderMessage, 
        notifyNewOrder, 
        notifyStatusChange, 
        
    ], (err, result) => {
        if (err) {
            console.error('Erreur SQL détaillée:', err);
            return res.status(500).json({ 
                message: "Erreur lors de l'enregistrement des paramètres", 
                error: err.sqlMessage 
            });
        }
        
        res.status(200).json({ 
            message: "Paramètres enregistrés avec succès", 
            result: result 
        });
    });
};

// Fonction pour obtenir les paramètres
const getSettings = (req, res) => {
    const sql = 'SELECT * FROM settings LIMIT 1';

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Erreur lors de la récupération des paramètres", error: err });
        }
        res.status(200).json({ message: "Paramètres récupérés avec succès", data: result });
    });
};

module.exports = { saveSettings, getSettings };
