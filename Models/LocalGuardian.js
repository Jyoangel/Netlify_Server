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
const localGuardianSchema = new Schema({
    guardianName: {
        type: String,
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    relationWithStudent: {
        type: String,
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    guardianContactNumber: {
        type: String,

        match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number'],
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    guardianAadharNumber: {
        type: String,

        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    guardianOccupation: {
        type: String,

    },
    guardianAddress: {
        type: String,

    }
}, { _id: false });

module.exports = localGuardianSchema;