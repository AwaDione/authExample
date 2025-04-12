
// controllers/authController.js
const Utilisateur = require('../models/utilisateur');
const Artisan = require('../models/artisan');
const Categorie = require('../models/categorie');
const { createToken } = require('../middlewares/auth');

// Enregistrement d'un utilisateur (client ou artisan)
// Enregistrement d'un utilisateur (client ou artisan)
// Enregistrement d'un utilisateur (client ou artisan)
exports.register = async (req, res, next) => {
  let newUser = null;
  
  try {
    const { email, motDePasse, nom, prenom, telephone, adresse, role } = req.body;
    
    // Vérifier si l'utilisateur existe déjà
    const existingUser = await Utilisateur.findOne({ email });
    if (existingUser) {
      const error = new Error('Un utilisateur avec cet email existe déjà');
      error.statusCode = 400;
      throw error;
    }
    
    // Créer le nouvel utilisateur
    newUser = new Utilisateur({
      email,
      motDePasse,
      nom,
      prenom,
      telephone,
      adresse,
      role
    });
    
    await newUser.save();
    
    // Si l'utilisateur est un artisan, créer un profil artisan
    if (role === 'artisan') {
      const { typeArtisan, nomEntreprise, categories, description } = req.body;
      
      // Vérifier que le type d'artisan est spécifié
      if (!typeArtisan || !['entreprise', 'freelance'].includes(typeArtisan)) {
        await Utilisateur.findByIdAndDelete(newUser._id);
        const error = new Error('Le type d\'artisan doit être "entreprise" ou "freelance"');
        error.statusCode = 400;
        throw error;
      }
      
      // Si c'est une entreprise, vérifier que le nom de l'entreprise est fourni
      if (typeArtisan === 'entreprise' && (!nomEntreprise || nomEntreprise.trim() === '')) {
        await Utilisateur.findByIdAndDelete(newUser._id);
        const error = new Error('Le nom de l\'entreprise est requis pour les artisans de type entreprise');
        error.statusCode = 400;
        throw error;
      }
      
      // Vérifier que les catégories sont fournies
      if (!categories || !Array.isArray(categories) || categories.length === 0) {
        await Utilisateur.findByIdAndDelete(newUser._id);
        const error = new Error('Au moins une catégorie doit être spécifiée');
        error.statusCode = 400;
        throw error;
      }
      
      // Les catégories sont directement stockées comme strings
      const artisanData = {
        utilisateur: newUser._id,
        typeArtisan,
        categories,
        description: description || ''
      };
      
      // Ajouter le nom d'entreprise si c'est une entreprise
      if (typeArtisan === 'entreprise') {
        artisanData.nomEntreprise = nomEntreprise;
      }
      
      const newArtisan = new Artisan(artisanData);
      await newArtisan.save();
    }
    
    // Générer un token JWT
    const token = createToken(newUser._id, newUser.role);
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        nom: newUser.nom,
        prenom: newUser.prenom,
        role: newUser.role
      }
    });
  } catch (error) {
    // Si une erreur se produit et qu'un utilisateur a été créé, le supprimer
    if (newUser && newUser._id) {
      try {
        await Utilisateur.findByIdAndDelete(newUser._id);
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'utilisateur orphelin:', deleteError);
      }
    }
    next(error);
  }
};
// Connexion d'un utilisateur
exports.login = async (req, res, next) => {
  try {
    const { email, motDePasse } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await Utilisateur.findOne({ email });
    if (!user) {
      const error = new Error('Email ou mot de passe incorrect');
      error.statusCode = 401;
      throw error;
    }
    
    // Vérifier le mot de passe
    const isMatch = await user.comparePassword(motDePasse);
    if (!isMatch) {
      const error = new Error('Email ou mot de passe incorrect');
      error.statusCode = 401;
      throw error;
    }
    
    // Mettre à jour la date de dernière connexion
    user.dernierConnexion = Date.now();
    await user.save();
    
    // Générer un token JWT
    const token = createToken(user._id, user.role);
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        nom: user.nom,
        prenom: user.prenom,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};