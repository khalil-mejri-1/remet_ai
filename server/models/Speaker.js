const mongoose = require('mongoose');

const speakerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    expertType: { type: String, enum: ['ia', 'expert'], default: 'ia' },
    image: { type: String, default: '' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Speaker', speakerSchema);
