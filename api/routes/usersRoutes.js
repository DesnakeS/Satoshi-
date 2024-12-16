// userRoutes.js
const express = require('express');
const router = express.Router();
const usersControllers = require('../controllers/usersControllers'); // Importer le controller des utilisateurs

router.post('/', usersControllers.createUsers);
router.get('/', usersControllers.getAllUsers);
router.get('/:id', usersControllers.getUsersById);
router.put('/:id', usersControllers.updateUsers);
router.delete('/:id', usersControllers.deleteUsers);

module.exports = router;