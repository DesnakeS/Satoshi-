const express = require('express');
const router = express.Router();
const productControllers = require('../controllers/productControllers'); 

// Route pour obtenir les produits par catégorie
router.get('/categorie/:categorie', productControllers.getProductByCategorie);

// Route pour obtenir tous les produits
router.get('/', productControllers.getAllProducts);

// Route pour obtenir un produit par ID
router.get('/:id', productControllers.getProductById);

router.get('/:categorie/:productId', productControllers.getProductDetailsByCategory);

// Autres routes
router.post('/', productControllers.addProduct);
router.put('/:id', productControllers.updateProduct);
router.delete('/:id', productControllers.deleteProduct);

module.exports = router;