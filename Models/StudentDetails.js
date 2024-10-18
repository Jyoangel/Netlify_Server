const mongoose = require('mongoose');
const moment = require('moment-timezone');
const { Schema } = mongoose;
const parentSchema = require('./Parent');
const localGuardianSchema = require('./LocalGuardian');
const Communication = require('./Communication');
const Attendance = require('./Attendance') // Import Communication model
const getCurrentTimeIST = () => {
    return moment.tz('Asia/Kolkata').format('hh:mm a'); // 12-hour format with AM/PM
};

// Function to get the current date in IST (Asia/Kolkata)
const getCurrentDateIST = () => {
    return moment.tz('Asia/Kolkata').toDate(); // Get current date as a Date object in IST
};
// Validate minimum age (5 years)
const minimumAge = (value) => {
    const ageDiff = moment().diff(moment(value), 'years');
    return ageDiff >= 5;
};
const onlyAlphabets = (value) => /^[A-Za-z\s]+$/.test(value);

// Aadhar number validation to check for invalid sequences
const validAadharNumber = (value) => {
    if (/(\d)\1{11}/.test(value)) {
        return false; // Invalid if all digits are the same
    }
    return /^\d{12}$/.test(value); // Ensure it's exactly 12 digits
};

// Contact number validation to ensure no repetitive digits
const validContactNumber = (value) => {
    if (/(\d)\1{9}/.test(value)) {
        return false; // Invalid if all digits are the same
    }
    return /^\d{10}$/.test(value); // Ensure it's exactly 10 digits
};
const studentSchema = new Schema({
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true
    },
    formNumber: {
        type: String,
        required: [true, 'Form number is required']
    },
    admissionNumber: {
        type: String,
        required: [true, 'Admission number is required']
    },
    class: {
        type: String,
        required: [true, 'Class is required']
    },
    admissionType: {
        type: String,
        required: [true, 'Admission type is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required']
    },
    motherTongue: {
        type: String,
        required: [true, 'Mother tongue is required']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        validate: [minimumAge, 'Student must be at least 5 years old']

    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    religion: {
        type: String,
        required: [true, 'Religion is required']
    },
    caste: {
        type: String,
        required: [true, 'Caste is required']
    },
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required']
    },
    aadharNumber: {
        type: String,
        required: [true, 'Aadhar number is required'],
        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    totalFee: {
        type: Number,
        required: true
    },
    monthlyFee: {
        type: Number,
        default: function () {
            return parseFloat((this.totalFee / 12).toFixed(2));
        }
    },


    session: {
        type: String,
        required: true,
    },
    parent: {
        type: parentSchema,
        required: [true, 'Parent information is required']
    },
    localGuardian: {
        type: localGuardianSchema,
        required: [true, 'Local guardian information is required']
    },
    entryDate: {
        type: Date,
        required: true,
        default: getCurrentDateIST
    },
    entryTime: {
        type: String,
        required: true,
        default: getCurrentTimeIST
    }
}, { timestamps: true });

// Post-save middleware to add student data to Communication schema
studentSchema.post('save', async function (doc) {
    try {
        const communication = new Communication({
            studentID: doc.studentID,
            selected: false // Default selected value
        });
        await communication.save();
    } catch (error) {
        console.error('Error saving communication document:', error);
    }
});

studentSchema.post('save', async function (doc) {
    try {
        const attendance = new Attendance({
            studentId: doc._id,
            present: false // Default selected value
        });
        await attendance.save();
    } catch (error) {
        console.error('Error saving attendance document:', error);
    }
});


// Pre-remove middleware to delete related documents from Communication and Attendance schemas
studentSchema.pre('remove', async function (next) {
    try {
        // Remove the related communication document
        await Communication.deleteOne({ studentID: this.studentID });

        // Remove the related attendance document
        await Attendance.deleteOne({ studentId: this._id });

        next();
    } catch (error) {
        next(error); // Pass error to the next middleware
    }
});
module.exports = mongoose.model('StudentDetail', studentSchema);


{/*const mongoose = require('mongoose');
const { Schema } = mongoose;
const parentSchema = require('./Parent');
const localGuardianSchema = require('./LocalGuardian');
const Attendance = require('./Attendance')

const studentSchema = new Schema({
    studentID: {
        type: String,
        required: [true, 'Student ID is required'],
        unique: true
    },
    formNumber: {
        type: String,
        required: [true, 'Form number is required']
    },
    admissionNumber: {
        type: String,
        required: [true, 'Admission number is required']
    },
    class: {
        type: String,
        required: [true, 'Class is required']
    },
    admissionType: {
        type: String,
        required: [true, 'Admission type is required']
    },
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    nationality: {
        type: String,
        required: [true, 'Nationality is required']
    },
    motherTongue: {
        type: String,
        required: [true, 'Mother tongue is required']
    },
    dateOfBirth: {
        type: Date,
        required: [true, 'Date of birth is required'],
        set: (value) => {
            // Ensure only the date part is stored without time
            return new Date(value.toISOString().split('T')[0]);
        }
    },
    gender: {
        type: String,
        required: [true, 'Gender is required'],
        enum: ['Male', 'Female', 'Other']
    },
    religion: {
        type: String,
        required: [true, 'Religion is required']
    },
    caste: {
        type: String,
        required: [true, 'Caste is required']
    },
    bloodGroup: {
        type: String,
        required: [true, 'Blood group is required']
    },
    aadharNumber: {
        type: String,
        required: [true, 'Aadhar number is required'],
        unique: true,
        match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number']
    },
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    parent: {
        type: parentSchema,
        required: [true, 'Parent information is required']
    },
    localGuardian: {
        type: localGuardianSchema,
        required: [true, 'Local guardian information is required']
    }
}, { timestamps: true });
studentSchema.post('save', async function (doc) {
    try {
        const attendance = new Attendance({
            studentID: doc.studentID,
            name: doc.name,
            dateOfBirth: doc.dateOfBirth,
            class: doc.class,
            gender: doc.gender,
            aadharNumber: doc.aadharNumber,
            fatherName: doc.parent.fatherName,
            contactNumber: doc.contactNumber,
            email: doc.email,
            present: false // Default selected value
        });
        await attendance.save();
    } catch (error) {
        console.error('Error saving attendance document:', error);
    }
});

module.exports = mongoose.model('StudentDetail', studentSchema);
*/}