const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({
    class: { type: String, required: true },
    subjects: { type: String, required: true },
    chapter: { type: String, required: true },
    homework: { type: String, required: true },
    submissionMethod: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    assignTo: { type: String, required: true },
    attachments: { type: String, required: true },
    description: { type: String, required: true },
    homeworkDone: { type: Number, default: 0 },
    uploadHomework: {
        type: String,  // assuming this is a URL or file path
        required: true
    },
    undoneHomework: { type: Number, default: function () { return this.assignTo; } }
});

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;
