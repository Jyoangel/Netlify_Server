// models/Class.js

const mongoose = require('mongoose');

const moment = require('moment-timezone');

// Function to get the current time in IST (Asia/Kolkata)
const getCurrentTimeIST = () => {
    return moment.tz('Asia/Kolkata').format('hh:mm a'); // 12-hour format with AM/PM
};

// Function to get the current date in IST (Asia/Kolkata)
const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};

const classSchema = new mongoose.Schema({
    className: {
        type: String,
        required: true,

    },
    date: { type: Date, default: getCurrentDateIST },  // IST date
    time: { type: String, default: getCurrentTimeIST }, // IST time
});

const Class = mongoose.model('Class', classSchema);

module.exports = Class;
