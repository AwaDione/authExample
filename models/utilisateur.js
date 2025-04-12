// models/utilisateur.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const utilisateurSchema = new Schema({
  email: { type: String, required: true, unique: true },
  motDePasse: { type: String, required: true },
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  telephone: { type: String },
  dateInscription: { type: Date, default: Date.now },
  adresse: {
    rue: String,
    codePostal: String,
    ville: String,
    pays: { type: String, default: 'France' }
  },
  role: { type: String, enum: ['visiteur', 'client', 'artisan', 'administrateur'], default: 'visiteur' },
  dernierConnexion: { type: Date },
  actif: { type: Boolean, default: true }
});

// Méthode pour hacher le mot de passe avant de l'enregistrer
utilisateurSchema.pre('save', async function(next) {
  if (!this.isModified('motDePasse')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.motDePasse = await bcrypt.hash(this.motDePasse, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer le mot de passe
utilisateurSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.motDePasse);
};

const Utilisateur = mongoose.model('Utilisateur', utilisateurSchema);
module.exports = Utilisateur;