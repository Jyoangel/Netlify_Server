const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment-timezone');

const calendarSchema = new Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    duration: { type: String, required: true },
    description: { type: String, required: true },
}, { timestamps: true });
// Pre-save middleware to set startDate and endDate based on IST timezone
calendarSchema.pre('save', function (next) {
    const doc = this;
    const timezone = 'Asia/Kolkata';

    // Create a full start date using date and startTime
    const startDateTimeString = `${moment(doc.date).format('YYYY-MM-DD')} ${doc.startTime}`;
    doc.startDate = moment.tz(startDateTimeString, 'YYYY-MM-DD HH:mm', timezone).toDate();

    // Create a full end date using date and endTime
    const endDateTimeString = `${moment(doc.date).format('YYYY-MM-DD')} ${doc.endTime}`;
    doc.endDate = moment.tz(endDateTimeString, 'YYYY-MM-DD HH:mm', timezone).toDate();

    next();
});

module.exports = mongoose.model('Calendar', calendarSchema);
