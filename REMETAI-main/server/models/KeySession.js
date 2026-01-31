const mongoose = require('mongoose');

const keySessionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 250
  },
  speaker: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: ''
  },
  iconType: {
    type: String,
    enum: ['brain', 'learn'], // فقط أنواع الأيقونات المسموح بها
    default: 'brain'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('KeySession', keySessionSchema);
