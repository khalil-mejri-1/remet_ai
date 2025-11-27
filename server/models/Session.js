const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },

    // Le code secret tapé par l'admin (ex: REMET-AI-SESSION-01)
    secretCode: { type: String, unique: true, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
