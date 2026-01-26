const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    eventDate: { type: Date, required: true }, // The ACTUAL day of the festival
    startDate: { type: Date, required: true }, // 10 days prior
    endDate: { type: Date, required: true },   // Last day to show content
    description: String,
    keywords: [String],
    suggestedImages: [String],
    templateType: { 
        type: String, 
        enum: ['patriotic', 'harvest', 'spring', 'spiritual', 'standard'],
        default: 'standard'
    }
}, { timestamps: true });

module.exports = mongoose.model('Festival', festivalSchema);
