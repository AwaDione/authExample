// controllers/artisanController.js
const Artisan = require('../models/artisan');
const Utilisateur = require('../models/utilisateur');
const Categorie = require('../models/categorie'); 
// Lister tous les artisans
exports.getAllArtisans = async (req, res, next) => {
  try {
    const artisans = await Artisan.find({ disponible: true })
      .populate('utilisateur', 'nom prenom')
      .populate('categories', 'nom');
    
    res.status(200).json({
      success: true,
      count: artisans.length,
      data: artisans
    });
  } catch (error) {
    next(error);
  }
};

// Obtenir les détails d'un artisan
exports.getArtisanById = async (req, res, next) => {
  try {
    const artisan = await Artisan.findById(req.params.id)
      .populate('utilisateur', 'nom prenom telephone')
      .populate('categories', 'nom description');
    
    if (!artisan) {
      const error = new Error('Artisan non trouvé');
      error.statusCode = 404;
      throw error;
    }
    
    res.status(200).json({
      success: true,
      data: artisan
    });
  } catch (error) {
    next(error);
  }
};


// Contrôleur pour récupérer les artisans par catégorie
exports.getArtisansByCategorie = async (req, res, next) => {
  try {
    const categorieId = req.params.categorieId;
    
    // Si vous avez une collection Categorie et que vous voulez convertir l'ID en nom
    const categorie = await Categorie.findById(categorieId);
    
    if (!categorie) {
      return res.status(404).json({
        success: false,
        message: 'Catégorie non trouvée'
      });
    }
    
    // Rechercher les artisans qui ont cette catégorie dans leur tableau de catégories
    const artisans = await Artisan.find({
      categories: categorie.nom // Utiliser le nom de la catégorie, pas l'ID
    }).populate('utilisateur', 'nom prenom email telephone');
    
    res.status(200).json({
      success: true,
      count: artisans.length,
      data: artisans
    });
  } catch (error) {
    next(error);
  }
};