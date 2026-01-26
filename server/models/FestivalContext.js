const mongoose = require('mongoose');

const festivalContextSchema = new mongoose.Schema({
    festival_name: String,
    detected: Boolean,
    mood: [String],
    festival_wishes: String,
    product_keywords: [String],
    special_offers: [{
        label: String,
        discount_percentage: Number,
        discount_code: String,
        min_spend: Number,
        expires_at: Date
    }],
    editorial_content: {
        title: String,
        description: String,
        cta_text: String,
        image_url: String
    },
    templateType: String,
    vfx_type: [String], // Array of effects: ['diyas', 'fireworks'], etc.
    image_prompt: String,
    applicable_date: String, // To track which date this was generated for
    related_products: [mongoose.Schema.Types.Mixed], 
    expires_at: Date // Overall expiration for this specific context
}, { timestamps: true });

// Index for quick lookup of active context
festivalContextSchema.index({ expires_at: 1 });

module.exports = mongoose.model('FestivalContext', festivalContextSchema);
