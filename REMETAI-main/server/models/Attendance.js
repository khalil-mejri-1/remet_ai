const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionId: { type: String, required: true },

    nameSession: { type: String, required: true },
    timeSession: { type: String, required: true },

    fullName: { type: String, required: true },
    email: { type: String, required: true },
    class: { type: String, default: null },
    phone: { type: String, default: null },

    checkInTime: { type: Date, default: null },
    checkOutTime: { type: Date, default: null },

    // Kept for backward compatibility or general tracking
    scanTime: { type: Date, default: Date.now }
}, { timestamps: true });

attendanceSchema.index({ userId: 1, sessionId: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
