const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['link', 'file'],
        required: true
    },
    url: {
        type: String, // Stores URL for links or file path (filename) for files
        required: true
    },
    originalName: {
        type: String // To store original filename if it's a file
    },
    fileData: {
        type: Buffer, // Store the file content specifically
    },
    contentType: {
        type: String, // MIME type like 'application/pdf'
    },
    visible: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Resource', resourceSchema);
