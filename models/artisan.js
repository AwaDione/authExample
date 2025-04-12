// models/artisan.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const artisanSchema = new Schema({
  utilisateur: { type: Schema.Types.ObjectId, ref: 'Utilisateur', required: true },
  typeArtisan: { 
    type: String, 
    enum: ['entreprise', 'freelance'], 
    required: true 
  },
  nomEntreprise: { 
    type: String,
    required: function() { return this.typeArtisan === 'entreprise'; }
  },
  categories: [String], // Stockage direct des noms de catégories
  description: { type: String, default: '' },
  experiences: [{
    titre: String,
    description: String,
    anneeDebut: Number,
    anneeFin: Number
  }],
  certifications: [String],
  zoneIntervention: [String],
  noteMoyenne: { type: Number, default: 0 },
  nbAvis: { type: Number, default: 0 },
  disponible: { type: Boolean, default: true },
  portfolio: [{
    titre: String,
    description: String,
    imageUrl: String
  }]
});

const Artisan = mongoose.model('Artisan', artisanSchema);
module.exports = Artisan;