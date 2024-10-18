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

const assignmentSchema = new mongoose.Schema({
    assignmentCode: { type: String, required: true },
    assignmentTitle: { type: String, required: true },
    dueDate: { type: Date, required: true },
    attachments: { type: String, required: true },
    submissionMethod: { type: String, required: true },
    marks: { type: Number, required: true },
    additionalInstruction: { type: String, required: true },
    class: { type: String, required: true },
    assignTo: { type: String, required: true },
    courseDescription: { type: String, required: true },
    date: { type: Date, default: getCurrentDateIST },  // IST date
    time: { type: String, default: getCurrentTimeIST }, // IST time
    createdBy: { type: String, required: true },
    uploadAssignment: {
        type: String,  // assuming this is a URL or file path
        required: true
    }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;
