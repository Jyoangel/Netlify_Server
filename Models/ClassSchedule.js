const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const classScheduleSchema = new Schema({
    class: {
        type: String,
        required: true, // This field is required to associate the schedule with a class
    },
    subject: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
    },
    endTime: {
        type: String,
        required: true,
    },
    day: {
        type: String,
        required: true,
    },
    period: {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

const ClassSchedule = mongoose.model('ClassSchedule', classScheduleSchema);

module.exports = ClassSchedule;
