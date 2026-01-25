const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    time: { type: String, required: true },
    title: { type: String, required: true },
    ledBy: { type: String, default: '' },
    icon: { type: String, default: '🎤' },
    type: { type: String, default: 'session' },
    attendanceEnabled: { type: Boolean, default: true },
    id: { type: Number, required: true }
});

const programSchema = new mongoose.Schema({
    day: { type: String, required: true, unique: true },
    sessions: [sessionSchema]
}, { timestamps: true });

module.exports = mongoose.model('Program', programSchema);
