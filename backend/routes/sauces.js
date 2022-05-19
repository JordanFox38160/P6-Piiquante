const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth')

const saucesCtrl = require('../controllers/sauces');
const multer = require('../middleware/multer-config');

router.get('/', auth, saucesCtrl.getAllSauces);
router.post('/', auth, multer, saucesCtrl.createSauces);
router.get('/:id', auth, saucesCtrl.getOneSauce);
router.put('/:id', auth, multer, saucesCtrl.modifySauces);
router.delete('/:id', auth, saucesCtrl.deleteSauces);

router.post("/:id/like",  auth, multer, saucesCtrl.likeSauce);

module.exports = router;