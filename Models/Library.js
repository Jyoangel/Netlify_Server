// LibraryItem.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};

const librarySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: getCurrentDateIST,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    uploadedBy: {
        type: String,
        required: true
    },
    uploadBookPdf: {
        type: String,  // assuming this is a URL or file path
        required: true
    }

});

module.exports = mongoose.model('Library', librarySchema);
