const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const liveClassSchema = new Schema({
    courseId: {
        type: Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    topic: { type: String, required: true, minlength: 5 },
    section: { type: String, required: true },
    liveRoom: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    duration: { type: String, required: true },
    assignTo: { type: String, required: true },
    noteToStudents: { type: String, required: true, maxlength: 500 },

}, {
    timestamps: true
});



module.exports = mongoose.model('LiveClass', liveClassSchema);
