// models/Enquiry.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const enquirySchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    enquiryRelated: {
        type: String,
        required: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
