const express=require('express');
const router=express.Router();
const contactControllers=require('../controllers/contactControllers');

router.get('/',contactControllers.getAllContact);
router.get('/:id',contactControllers.getContactById);
router.post('/',contactControllers.addContact);
router.put('/:id',contactControllers.updateContact);
router.delete('/:id',contactControllers.deleteContact);

module.exports=router