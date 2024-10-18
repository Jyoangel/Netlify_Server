const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const moment = require('moment-timezone');

// Function to get the current time in IST (Asia/Kolkata)
const getCurrentTimeIST = () => {
    return moment.tz('Asia/Kolkata').format('hh:mm a'); // 12-hour format with AM/PM
};

// Function to get the current date in IST (Asia/Kolkata)
const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};

const hotelSchema = new mongoose.Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'StudentDetail',
        required: true
    },
    typeOfRoom: {
        type: String,
        required: true,
    },
    floor: {
        type: Number,
        required: true,
    },
    zone: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    date: { type: Date, default: getCurrentDateIST },  // IST date
    time: { type: String, default: getCurrentTimeIST }, // IST time
});

const Hotel = mongoose.model('Hotel', hotelSchema);

module.exports = Hotel;
