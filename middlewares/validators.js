
// middlewares/validators.js
const { body, validationResult } = require('express-validator');

exports.validateRegistration = [
    body('email').isEmail().withMessage('Veuillez fournir un email valide'),
    body('motDePasse').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('nom').trim().notEmpty().withMessage('Le nom est requis'),
    body('prenom').trim().notEmpty().withMessage('Le prénom est requis'),
    body('role').isIn(['client', 'artisan']).withMessage('Le rôle doit être client ou artisan'),
    body('role').custom((value, { req }) => {
      // Si le rôle est artisan, vérifier les champs spécifiques
      if (value === 'artisan') {
        const { typeArtisan, nomEntreprise, categories } = req.body;
        
        // Vérifier le type d'artisan
        if (!typeArtisan) {
          throw new Error('Le type d\'artisan est requis (entreprise ou freelance)');
        }
        
        if (!['entreprise', 'freelance'].includes(typeArtisan)) {
          throw new Error('Le type d\'artisan doit être "entreprise" ou "freelance"');
        }
        
        // Si c'est une entreprise, vérifier le nom de l'entreprise
        if (typeArtisan === 'entreprise' && (!nomEntreprise || nomEntreprise.trim() === '')) {
          throw new Error('Le nom de l\'entreprise est requis pour les artisans de type entreprise');
        }
        
        // Vérifier les catégories
        if (!categories || !Array.isArray(categories) || categories.length === 0) {
          throw new Error('Au moins une catégorie doit être spécifiée');
        }
      }
      return true;
    }),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }
      next();
    }
  ];

exports.validateLogin = [
  body('email').isEmail().withMessage('Veuillez fournir un email valide'),
  body('motDePasse').notEmpty().withMessage('Le mot de passe est requis'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];
