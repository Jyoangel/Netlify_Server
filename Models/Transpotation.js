const mongoose = require('mongoose');
const moment = require('moment-timezone'); // Import moment-timezone
const Schema = mongoose.Schema;

const TransportationSchema = new Schema({
    studentID: {
        type: Schema.Types.ObjectId,
        ref: 'StudentDetail',
        required: true
    },
    pickupLocation: {
        type: String,
        required: true
    },
    dropLocation: {
        type: String,
        required: true
    },
    transportationFee: {
        type: Number,
        required: true
    },
    pickupTime: {
        type: String,
        required: true
    },
    dropTime: {
        type: String,
        required: true
    }
});

// Middleware to format pickupTime and dropTime to IST before saving
TransportationSchema.pre('save', function (next) {
    const transportation = this;

    // Format pickupTime and dropTime to IST using moment-timezone
    if (transportation.pickupTime) {
        transportation.pickupTime = moment(transportation.pickupTime, "HH:mm")
            .tz("Asia/Kolkata")
            .format("HH:mm");
    }

    if (transportation.dropTime) {
        transportation.dropTime = moment(transportation.dropTime, "HH:mm")
            .tz("Asia/Kolkata")
            .format("HH:mm");
    }

    next();
});

module.exports = mongoose.model('Transportation', TransportationSchema);
