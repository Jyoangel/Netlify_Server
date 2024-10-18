const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const scheduleSchema = new Schema({
    classDays: {
        type: [String],
        required: true,

    },
    classTime: {
        type: String,
        required: true,

    },
    startDate: {
        type: Date,
        required: true,

    },
    endDate: {
        type: Date,
        required: true,

    }
}, {
    _id: false
});

module.exports = scheduleSchema;
