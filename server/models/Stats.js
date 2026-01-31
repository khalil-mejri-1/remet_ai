const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
    totalVisits: { type: Number, default: 0 }
});

module.exports = mongoose.model('Stats', StatsSchema);
