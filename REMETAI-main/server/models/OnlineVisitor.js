const mongoose = require('mongoose');

const OnlineVisitorSchema = new mongoose.Schema({
    visitorId: { type: String, required: true, unique: true },
    lastActive: { type: Date, default: Date.now, expires: 300 } // Auto-delete after 5 minutes (300s)
});

module.exports = mongoose.model('OnlineVisitor', OnlineVisitorSchema);
