const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true
    },
    examTitle: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    instruction: {
        type: String,
        required: true
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    uploadQuestionPaper: {
        type: String,  // assuming this is a URL or file path

    }
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
