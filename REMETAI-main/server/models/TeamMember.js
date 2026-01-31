const mongoose = require('mongoose');

const TeamMemberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    image: { type: String, default: 'https://via.placeholder.com/400' }
});
module.exports = mongoose.model('TeamMember', TeamMemberSchema);