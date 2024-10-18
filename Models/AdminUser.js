// models/AdminUser.js

const mongoose = require('mongoose');

const AdminUserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true, // Ensure each admin user is stored only once
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    roles: {
        type: [String], // Array of roles, e.g., ['Admin']
        required: true,
    },
    picture: {
        type: String, // Store the URL of the user's profile picture
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now, // Store when the admin user was added
    },
});

const AdminUser = mongoose.model('AdminUser', AdminUserSchema);

module.exports = AdminUser;
