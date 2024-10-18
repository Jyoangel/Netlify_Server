const mongoose = require('mongoose');
const { Schema } = mongoose;

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true
    },
    eventDate: {
        type: Date,
        required: true
    },
    eventTime: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    organizerName: {
        type: String,
        required: true
    },
    organizerId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'organizerModel'
    },
    organizerModel: {
        type: String,
        required: true,
        enum: ['TeacherDetail', 'StaffDetail']
    }
}, { timestamps: true });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
