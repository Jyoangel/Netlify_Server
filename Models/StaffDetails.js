const mongoose = require('mongoose');
const { Schema } = mongoose;
const emergencyContactSchema = require('./EmergencyContact');

const onlyAlphabets = (value) => /^[A-Za-z\s]+$/.test(value);
// Aadhar number validation to check for invalid sequences
const validAadharNumber = (value) => {
    if (/(\d)\1{11}/.test(value)) {
        return false; // Invalid if all digits are the same
    }
    return /^\d{12}$/.test(value); // Ensure it's exactly 12 digits
};

// Contact number validation to ensure no repetitive digits
const validContactNumber = (value) => {
    if (/(\d)\1{9}/.test(value)) {
        return false; // Invalid if all digits are the same
    }
    return /^\d{10}$/.test(value); // Ensure it's exactly 10 digits
};
const staffSchema = new Schema({
    staffID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    education: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    position: {
        type: String,
        required: true
    },
    employmentType: {
        type: String,
        required: true
    },
    emergencyContact: {
        type: emergencyContactSchema,
        required: true
    },
    nationality: {
        type: String,
        required: true
    },
    languageSpoken: {
        type: String,
        required: true
    },
    salary: {
        type: Number,
        required: true
    },
    selected: {
        type: Boolean,
        default: false
    },
}, { timestamps: true });

const Staff = mongoose.model('StaffDetail', staffSchema);

module.exports = Staff;

