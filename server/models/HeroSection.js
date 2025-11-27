const mongoose = require('mongoose');

const HeroSectionSchema = new mongoose.Schema({
    sectionName: { type: String, default: 'main_hero', unique: true }, // Ensures only one hero exists
    title: { type: String, default: "L'Intelligence Au Service de l'Humain." },
    description: { type: String, default: "Nous fusionnons algorithmes avancés et design intuitif." },
    imageUrl: { type: String, required: true }
});
module.exports = mongoose.model('HeroSection', HeroSectionSchema);