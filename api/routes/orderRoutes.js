const express = require('express');
const router = express.Router();
const orderControllers = require('../controllers/orderControllers'); // Assurez-vous que ce chemin est correct



router.post('/',  orderControllers.placeOrder);
router.get('/', orderControllers.getAllOrder);
router.get('/:id', orderControllers.getOrderById);
router.put('/:id', orderControllers.updateOrder);
router.delete('/:id', orderControllers.deleteOrder);




   
module.exports = router;
