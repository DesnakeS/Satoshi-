const express = require('express');
const router = express.Router();

// Importation des contrôleurs de panier
const cartControllers = require('../controllers/cartControllers');

// Importer le middleware pour vérifier le token


// Routes pour les paniers avec vérification du token
router.get('/',  cartControllers.getAllCart);  // Obtenir tous les paniers
router.get('/:id',  cartControllers.getCartById); // Obtenir un panier par ID
router.post('/',  cartControllers.addCart);  // Ajouter un produit au panier
router.put('/:id',  cartControllers.updateCart);  // Mettre à jour un produit dans le panier
router.delete('/:id' ,cartControllers.deleteCart);  // Supprimer un produit du panier

module.exports = router;
