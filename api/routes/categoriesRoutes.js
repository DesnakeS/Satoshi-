// routes/categoryRoutes.js
const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesControllers');

// Route pour obtenir toutes les catégories principales
router.get('/', categoriesController.getCategories);

// Route pour obtenir les sous-catégories d'une catégorie
router.get('/:categoryId/subcategories', categoriesController.getSubcategories);

module.exports = router;