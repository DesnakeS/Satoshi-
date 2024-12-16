const express = require('express');
const stripeControllers = require('../controllers/stripeControllers');
const router = express.Router();

// Route pour créer une session de paiement Stripe
router.post('/create-checkout-session',stripeControllers.createCheckoutSession);

module.exports = router;
 