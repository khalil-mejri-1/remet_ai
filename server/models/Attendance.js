const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', default: null },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    class: { type: String, default: null },

    scanTime: { type: Date, default: Date.now }
}, { timestamps: true });

// Empêche la double présence pour le même utilisateur sur la même session
attendanceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
