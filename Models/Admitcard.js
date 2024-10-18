const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// ExamSubject schema
const ExamSubjectSchema = new Schema({
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true
    },
    examination_date: {
        type: Date,
        required: [true, 'Examination date is required'],

    }
});

// AdmitCard schema
const AdmitCardSchema = new Schema({
    examination_roll_number: {
        type: String,
        required: [true, 'Examination roll number is required'],
        trim: true,
        unique: true,
        minlength: [5, 'Examination roll number must be at least 5 characters long']
    },
    school_name: {
        type: String,
        required: [true, 'School name is required'],
        trim: true
    },
    session: {
        type: String,
        required: [true, 'Session is required'],
        trim: true
    },
    examination: {
        type: String,
        required: [true, 'Examination is required'],
        trim: true
    },
    student_name: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    class: {
        type: String,
        required: [true, 'Class name is required'],
        trim: true
    },
    startdate: {
        type: Date,
        required: [true, 'Start date is required'],

    },
    enddate: {
        type: Date,
        required: [true, 'End date is required'],

    },
    examstarting_time: {
        type: String,
        required: [true, 'Exam starting time is required'],

    },
    examending_time: {
        type: String,
        required: [true, 'Exam ending time is required'],

    },
    examsubjects: {
        type: [ExamSubjectSchema],
        validate: {
            validator: function (value) {
                return value.length > 0;
            },
            message: 'At least one exam subject is required'
        }
    },

});

// Create model from schema
const AdmitCard = mongoose.model('AdmitCard', AdmitCardSchema);

module.exports = AdmitCard;
{/*
{
    "_id": "60c72b2f4f1a256f4cdd0e0a",
    "examination_roll_number": "12345",
    "school_name": "ABC High School",
    "session": "2023-2024",
    "examination": "Final Exam",
    "student_name": "John Doe",
    "class_name": "10th Grade",
    "start_date": "2024-06-15T00:00:00.000Z",
    "end_date": "2024-06-17T00:00:00.000Z",
    "exam_starting_time": "09:00",
    "exam_subjects": [
      {
        "subject": "Mathematics",
        "examination_date": "2024-06-15T00:00:00.000Z"
      },
      {
        "subject": "Science",
        "examination_date": "2024-06-16T00:00:00.000Z"
      },
      {
        "subject": "English",
        "examination_date": "2024-06-17T00:00:00.000Z"
      }
    ],
    "__v": 0
  }
*/}

