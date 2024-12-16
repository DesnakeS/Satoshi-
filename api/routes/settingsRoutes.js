// routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const settingsControllers = require('../controllers/settingsControllers');


// Route pour enregistrer ou mettre à jour les paramètres
router.post('/',  settingsControllers.saveSettings);

// Route pour obtenir les paramètres
router.get('/', settingsControllers.getSettings);

module.exports = router;
