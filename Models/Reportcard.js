const mongoose = require('mongoose');
const AdmitCard = require('./AdmitCaard'); // Assuming AdmitCard schema is in another file
const StudentDetail = require('./StudentDetails'); // Reference to the StudentDetail schema

const moment = require('moment-timezone');

// Function to get the current time in IST (Asia/Kolkata)
const getCurrentTimeIST = () => {
    return moment.tz('Asia/Kolkata').format('hh:mm a'); // 12-hour format with AM/PM
};

// Function to get the current date in IST (Asia/Kolkata)
const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};

// Subject Schema
const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    marks: { type: Number, required: true },
});

// ReportCard Schema
const reportCardSchema = new mongoose.Schema({
    admitCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmitCaard', required: true },
    studentID: { type: mongoose.Schema.Types.ObjectId, ref: 'StudentDetail', required: true }, // Reference to StudentDetail
    type: { type: String, required: true },  // Examination Type
    rollNumber: { type: String, required: true }, // From AdmitCard
    subjects: [subjectSchema],  // Subjects fetched from AdmitCard
    classTeacher: { type: String, required: true },
    principleSignature: { type: String, required: true, default: 'Principal Default Signature' }, // Default principal signature
    status: { type: String, enum: ['Pass', 'Fail'], required: true, default: 'Fail' },
    ReportCard: { type: String, default: 'Report card' },
    date: { type: Date, default: getCurrentDateIST },  // IST date
    time: { type: String, default: getCurrentTimeIST }, // IST time
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to calculate percentage
reportCardSchema.virtual('percentage').get(function () {
    const totalMarks = this.subjects.reduce((acc, subject) => acc + subject.marks, 0);
    return (totalMarks / (this.subjects.length * 100)) * 100;
});

// Pre-save hook to set status based on percentage
reportCardSchema.pre('save', function (next) {
    const percentage = this.percentage;
    this.status = percentage >= 33 ? 'Pass' : 'Fail';
    next();
});

// Static method to create ReportCard from AdmitCard and Student
reportCardSchema.statics.createFromAdmitCard = async function (admitCardId, reportCardData) {
    try {
        // Find AdmitCard by ID
        const admitCard = await AdmitCard.findById(admitCardId);
        if (!admitCard) {
            throw new Error('Admit Card not found');
        }

        // Find StudentDetail by studentID
        const student = await StudentDetail.findById(admitCard.studentID);
        if (!student) {
            throw new Error('Student not found');
        }

        // Create the ReportCard using AdmitCard and StudentDetail data
        const reportCard = new this({
            admitCardId,
            studentID: student._id, // Referencing student details
            type: admitCard.examination, // Examination type from AdmitCard
            rollNumber: admitCard.examination_roll_number, // From AdmitCard
            subjects: admitCard.examsubjects.map(subject => ({
                subjectName: subject.subject,
                marks: reportCardData.marks[subject.subject] || 0, // Marks provided in reportCardData
            })),
            classTeacher: reportCardData.classTeacher, // Provided in reportCardData
            principleSignature: reportCardData.principleSignature || 'Principal Default Signature', // Default if not provided
        });

        // Save the report card and return it
        return await reportCard.save();
    } catch (error) {
        throw new Error(`Error creating report card: ${error.message}`);
    }
};

module.exports = mongoose.model('ReportCard', reportCardSchema);


{

    /*

const mongoose = require('mongoose');
const AdmitCard = require('./AdmitCaard'); // Assuming AdmitCard schema is in another file

// Helper function to get the current time
const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p:m' : 'a:m';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
};

// Subject Schema
const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    marks: { type: Number, required: true },
});

// ReportCard Schema
const reportCardSchema = new mongoose.Schema({
    admitCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdmitCaard', required: true },
    type: { type: String, required: true },  // Examination Type
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    rollNumber: { type: String, required: true },
    class: { type: String, required: true },
    session: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    subjects: [subjectSchema],  // Fetched from AdmitCard
    classTeacher: { type: String, required: true },
    principleSignature: { type: String, required: true, default: 'Principal Default Signature' }, // Default principal signature
    status: { type: String, enum: ['Pass', 'Fail'], required: true, default: 'Fail' },
    ReportCard: { type: String, default: 'Report card' },
    date: { type: Date, default: () => new Date() },
    time: { type: String, default: getCurrentTime },
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to calculate percentage
reportCardSchema.virtual('percentage').get(function () {
    const totalMarks = this.subjects.reduce((acc, subject) => acc + subject.marks, 0);
    return (totalMarks / (this.subjects.length * 100)) * 100;  // No need for numberOfSubjects
});



// Pre-save hook to set status based on percentage
reportCardSchema.pre('save', function (next) {
    const percentage = this.percentage;
    this.status = percentage >= 33 ? 'Pass' : 'Fail';
    next();
});

// Static method to create ReportCard from AdmitCard
reportCardSchema.statics.createFromAdmitCard = async function (admitCardId, reportCardData) {
    try {
        // Find AdmitCard by ID
        const admitCard = await AdmitCard.findById(admitCardId);
        if (!admitCard) {
            throw new Error('Admit Card not found');
        }

        // Create the ReportCard using AdmitCard data and the provided marks
        const reportCard = new this({
            admitCardId,
            type: admitCard.examination, // Examination type provided as input
            name: admitCard.student_name, // Fetched from AdmitCard
            fatherName: admitCard.fatherName, // Fetched from AdmitCard
            rollNumber: admitCard.examination_roll_number, // Fetched from AdmitCard
            class: admitCard.class, // Fetched from AdmitCard
            session: admitCard.session, // Fetched from AdmitCard
            dateOfBirth: admitCard.dateOfBirth, // Fetched from AdmitCard
            subjects: admitCard.examsubjects.map(subject => ({
                subjectName: subject.subject,
                marks: reportCardData.marks[subject.subject] || 0, // Marks for each subject provided in reportCardData
            })),
            classTeacher: reportCardData.classTeacher, // Provided in reportCardData
            principleSignature: reportCardData.principleSignature || 'Principal Default Signature', // Default signature if not provided
        });

        // Save the report card and return it
        return await reportCard.save();
    } catch (error) {
        throw new Error(`Error creating report card: ${error.message}`);
    }
};

module.exports = mongoose.model('ReportCard', reportCardSchema);


{/*const mongoose = require('mongoose');

const getCurrentTime = () => {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'p:m' : 'a:m';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedTime = `${hours}:${minutes} ${ampm}`;
    return formattedTime;
};

const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    marks: { type: Number, required: true },
});

const reportCardSchema = new mongoose.Schema({
    type: { type: String, required: true },
    name: { type: String, required: true },
    fatherName: { type: String, required: true },
    session: { type: String, required: true },
    rollNumber: { type: String, required: true },
    class: { type: String, required: true },
    dateOfBirth: { type: Date, required: true },
    numberOfSubjects: { type: Number, required: true },
    subjects: [subjectSchema],
    classTeacher: { type: String, required: true },
    principleSignature: { type: String, required: true },
    status: { type: String, enum: ['Pass', 'Fail'], required: true, default: 'Fail' },
    ReportCard: {
        type: String,
        default: 'Report card'
    },
    date: { type: Date, default: () => new Date() },
    time: { type: String, default: getCurrentTime }, // Add status field
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add virtual for percentage
reportCardSchema.virtual('percentage').get(function () {
    const totalMarks = this.subjects.reduce((acc, subject) => acc + subject.marks, 0);
    return (totalMarks / (this.numberOfSubjects * 100)) * 100;
});

// Pre-save hook to set status based on percentage
reportCardSchema.pre('save', function (next) {
    const percentage = this.percentage;
    this.status = percentage >= 33 ? 'Pass' : 'Fail';
    next();
});

module.exports = mongoose.model('ReportCard', reportCardSchema);
*/}
