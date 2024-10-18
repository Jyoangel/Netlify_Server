const mongoose = require('mongoose');
const { Schema } = mongoose;
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
const parentSchema = new Schema({
    fatherName: {
        type: String,
        required: true,
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    fatherContactNumber: {
        type: String,
        required: true,
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    fatherAadharNumber: {
        type: String,
        required: true,
        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    fatherOccupation: {
        type: String,
        required: true
    },
    motherName: {
        type: String,
        required: true,
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    motherContactNumber: {
        type: String,
        required: true,
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    motherAadharNumber: {
        type: String,
        required: true,
        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    motherOccupation: {
        type: String,
        required: true
    },
    annualIncome: {
        type: Number,

    },
    parentAddress: {
        type: String,
        required: true
    }
}, { _id: false });

module.exports = parentSchema;
