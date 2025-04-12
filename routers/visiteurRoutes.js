
// routes/visiteurRoutes.js
const express = require('express');
const router = express.Router();
const artisanController = require('../controllers/artisanController');
const categorieController = require('../controllers/categorieController');
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middlewares/validators');
const { optionalAuth } = require('../middlewares/auth');

// Routes pour les cas d'utilisation visiteur

// Lister les artisans
router.get('/artisans', optionalAuth, artisanController.getAllArtisans);

// Voir les informations d'un artisan
router.get('/artisans/:id', optionalAuth, artisanController.getArtisanById);

// Lister les catégories d'emploi
router.get('/categories', optionalAuth, categorieController.getAllCategories);

// Filtrer les artisans par catégorie
router.get('/artisans/categorie/:categorieId', optionalAuth, artisanController.getArtisansByCategorie);

// S'inscrire en tant que client ou artisan
router.post('/auth/register', validateRegistration, authController.register);

// Se connecter
router.post('/auth/login', validateLogin, authController.login);

module.exports = router;