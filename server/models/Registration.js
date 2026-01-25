const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    institution: { type: String },
    class: { type: String },
    phone: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Registration', registrationSchema);