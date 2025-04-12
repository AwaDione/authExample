// models/categorie.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const categorieSchema = new Schema({
  nom: { type: String, required: true, unique: true },
  description: String,
  imageUrl: String,
  active: { type: Boolean, default: true }
});

const Categorie = mongoose.model('Categorie', categorieSchema);
module.exports = Categorie;