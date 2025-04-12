// controllers/categorieController.js
const Categorie = require('../models/categorie');

// Récupérer toutes les catégories
exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await Categorie.find({ active: true }).sort('nom');
    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Créer une nouvelle catégorie (admin uniquement)
exports.createCategorie = async (req, res, next) => {
  try {
    const { nom, description, imageUrl } = req.body;
    
    // Vérifier si la catégorie existe déjà
    const existingCategorie = await Categorie.findOne({ nom });
    if (existingCategorie) {
      const error = new Error('Cette catégorie existe déjà');
      error.statusCode = 400;
      throw error;
    }
    
    const nouvelleCategorie = new Categorie({
      nom,
      description,
      imageUrl
    });
    
    await nouvelleCategorie.save();
    
    res.status(201).json({
      success: true,
      data: nouvelleCategorie
    });
  } catch (error) {
    next(error);
  }
};

// Mettre à jour une catégorie (admin uniquement)
exports.updateCategorie = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nom, description, imageUrl, active } = req.body;
    
    // Vérifier si la catégorie existe
    const categorie = await Categorie.findById(id);
    if (!categorie) {
      const error = new Error('Catégorie non trouvée');
      error.statusCode = 404;
      throw error;
    }
    
    // Vérifier si le nouveau nom existe déjà (sauf s'il s'agit du même)
    if (nom && nom !== categorie.nom) {
      const existingCategorie = await Categorie.findOne({ nom });
      if (existingCategorie) {
        const error = new Error('Ce nom de catégorie est déjà utilisé');
        error.statusCode = 400;
        throw error;
      }
    }
    
    // Mettre à jour les champs
    if (nom) categorie.nom = nom;
    if (description !== undefined) categorie.description = description;
    if (imageUrl) categorie.imageUrl = imageUrl;
    if (active !== undefined) categorie.active = active;
    
    await categorie.save();
    
    res.status(200).json({
      success: true,
      data: categorie
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer une catégorie (admin uniquement)
exports.deleteCategorie = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const categorie = await Categorie.findById(id);
    if (!categorie) {
      const error = new Error('Catégorie non trouvée');
      error.statusCode = 404;
      throw error;
    }
    
    // Au lieu de supprimer, désactiver la catégorie
    categorie.active = false;
    await categorie.save();
    
    res.status(200).json({
      success: true,
      message: 'Catégorie désactivée avec succès'
    });
  } catch (error) {
    next(error);
  }
};