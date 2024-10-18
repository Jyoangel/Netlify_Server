const mongoose = require('mongoose');
const { Schema } = mongoose;

const emergencyContactSchema = new Schema({
    contactNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number']
    },
    relationship: {
        type: String,
        required: true
    }
}, { _id: false });

module.exports = emergencyContactSchema;

