const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const scheduleSchema = require('./Schedule');


const courseSchema = new Schema({
    courseName: {
        type: String,
        required: true,
        trim: true
    },
    courseCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    courseDescription: {
        type: String,
        required: true,
        trim: true
    },
    primaryInstructorname: {
        type: String,
        required: true,
        trim: true
    },
    instructorEmail: {
        type: String,
        required: true,
        trim: true,
        match: [/.+\@.+\..+/, 'Please fill a valid email address']
    },
    schedule: {
        type: scheduleSchema,
        required: [true, 'Schedule information is required']
    },
    courseObjectives: {
        type: String,
        required: true,
        trim: true
    },
    supplementaryMaterials: {
        type: String,
        trim: true
    },
    onlineResources: {
        type: String,
        trim: true
    },
    uploadCourse: {
        type: String,  // assuming this is a URL or file path

    },
    liveClasses: [{
        type: Schema.Types.ObjectId,
        ref: 'LiveClass'
    }]

}, {
    timestamps: true
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
