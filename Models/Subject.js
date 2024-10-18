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

const subjectSchema = new mongoose.Schema({
    class: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: { type: Date, default: getCurrentDateIST },  // IST date
    time: { type: String, default: getCurrentTimeIST }, // IST time
});

const Subject = mongoose.model('Subject', subjectSchema);

module.exports = Subject;
