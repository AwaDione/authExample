// routes/categorieRoutes.js
const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const { isAuth, isAdmin } = require('../middleware/authMiddleware');

// Routes publiques
router.get('/', categorieController.getAllCategories);

// Routes protégées (admin seulement)
router.post('/',  categorieController.createCategorie);
router.put('/:id', isAuth, isAdmin, categorieController.updateCategorie);
router.delete('/:id', isAuth, isAdmin, categorieController.deleteCategorie);

module.exports = router;