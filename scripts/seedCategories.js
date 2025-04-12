// scripts/seedCategories.js
const mongoose = require('mongoose');
const Categorie = require('../models/categorie');
const config = require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });


const categories = [
  {
    nom: 'Maçon',
    description: 'Construction et rénovation de structures en maçonnerie',
    imageUrl: '/images/categories/macon.jpg'
  },
  {
    nom: 'Électricien',
    description: 'Installation et réparation de systèmes électriques',
    imageUrl: '/images/categories/electricien.jpg'
  },
  {
    nom: 'Plombier',
    description: 'Installation et réparation de systèmes de plomberie',
    imageUrl: '/images/categories/plombier.jpg'
  },
  {
    nom: 'Menuisier',
    description: 'Création et réparation d\'ouvrages en bois',
    imageUrl: '/images/categories/menuisier.jpg'
  },
  {
    nom: 'Peintre',
    description: 'Travaux de peinture intérieure et extérieure',
    imageUrl: '/images/categories/peintre.jpg'
  },
  {
    nom: 'Jardinier',
    description: 'Entretien et aménagement d\'espaces verts',
    imageUrl: '/images/categories/jardinier.jpg'
  },
  {
    nom: 'Couvreur',
    description: 'Installation et réparation de toitures',
    imageUrl: '/images/categories/couvreur.jpg'
  },
  {
    nom: 'Carreleur',
    description: 'Pose et réparation de carrelage',
    imageUrl: '/images/categories/carreleur.jpg'
  },
  {
    nom: 'Serrurier',
    description: 'Installation et réparation de serrures et systèmes de sécurité',
    imageUrl: '/images/categories/serrurier.jpg'
  },
  {
    nom: 'Chauffagiste',
    description: 'Installation et maintenance de systèmes de chauffage',
    imageUrl: '/images/categories/chauffagiste.jpg'
  },
  {
    nom: 'Vitrier',
    description: 'Installation et réparation de vitres et fenêtres',
    imageUrl: '/images/categories/vitrier.jpg'
  },
  {
    nom: 'Tapissier',
    description: 'Rénovation et création de mobilier rembourré',
    imageUrl: '/images/categories/tapissier.jpg'
  },
  {
    nom: 'Autre',
    description: 'Autres métiers de l\'artisanat',
    imageUrl: '/images/categories/autre.jpg'
  }
];

async function seedCategories() {
  try {
    // await mongoose.connect(config.MONGO_URI);
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Connecté à MongoDB');
    
    // Vérifier les catégories existantes
    for (const cat of categories) {
      const existing = await Categorie.findOne({ nom: cat.nom });
      if (!existing) {
        await Categorie.create(cat);
        console.log(`Catégorie "${cat.nom}" créée`);
      } else {
        console.log(`Catégorie "${cat.nom}" existe déjà`);
      }
    }
    
    console.log('Initialisation des catégories terminée');
    mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories:', error);
    mongoose.connection.close();
  }
}

seedCategories();