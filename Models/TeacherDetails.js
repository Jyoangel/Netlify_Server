const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const parentSchema = require('./Parent');
const emergencyContactSchema = require('./EmergencyContact');
const Schema = mongoose.Schema;
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
// Validate minimum age (5 years)
const minimumAge = (value) => {
    const ageDiff = moment().diff(moment(value), 'years');
    return ageDiff >= 10;
};
const teacherSchema = new Schema({
    teacherID: {
        type: String,
        required: [true, 'Teacher ID is required'],
        unique: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        validate: [onlyAlphabets, 'Name should contain only alphabetic characters']
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
    contactNumber: {
        type: String,
        required: [true, 'Contact number is required'],
        validate: [validContactNumber, 'Please enter a valid 10-digit contact number. Avoid all identical digits.']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    aadharNumber: {
        type: String,
        required: [true, 'Aadhar number is required'],
        unique: true,
        validate: [validAadharNumber, 'Please enter a valid Aadhar number. Avoid all identical digits.']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    subjectTaught: {
        type: String,
        required: [true, 'Subject taught is required']
    },
    assignedClass: {
        type: String,
        required: true
    },
    gradeLevelTaught: {
        type: String,
        required: [true, 'Grade level taught is required']
    },
    department: {
        type: String,
        required: [true, 'Department is required']
    },
    highestDegreeEarned: {
        type: String,
        required: [true, 'Highest degree earned is required']
    },
    instituteName: {
        type: String,
        required: [true, 'Institute name is required']
    },
    yearOfGraduation: {
        type: Number,
        required: [true, 'Year of graduation is required']
    },
    emergencyContact: {
        type: emergencyContactSchema,
        required: [true, 'Emergency contact is required']
    },
    salary: {
        type: Number,
        required: true
    },
    parent: {
        type: parentSchema,
        required: [true, 'Parent information is required']
    },
    selected: {
        type: Boolean,
        default: false
    },

}, { timestamps: true });

// Hash password before saving
teacherSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const Teacher = mongoose.model('TeacherDetail', teacherSchema);

module.exports = Teacher;
// exports.onExecutePostLogin = async (event, api) => {
//     const namespace = 'https://localhost:3000'; // Replace with your custom namespace
//     const assignedRoles = event.authorization?.roles || [];

//     // Set roles in the ID Token
//     api.idToken.setCustomClaim(`${namespace}/roles`, assignedRoles);

//     // Set roles in the Access Token
//     api.accessToken.setCustomClaim(`${namespace}/roles`, assignedRoles);
//   };

{/*const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');
const parentSchema = require('./Parent');
const emergencyContactSchema = require('./EmergencyContact');

const teacherSchema = new Schema({
    teacherID: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    contactNumber: {
        type: String,
        required: true,
        match: [/^\d{10}$/, 'Please enter a valid 10-digit contact number']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    aadharNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{12}$/, 'Please enter a valid 12-digit Aadhar number']
    },
    address: {
        type: String,
        required: true
    },
    subjectTaught: {
        type: String,
        required: true
    },
    gradeLevelTaught: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    highestDegreeEarned: {
        type: String,
        required: true
    },
    instituteName: {
        type: String,
        required: true
    },
    yearOfGraduation: {
        type: Number,
        required: true
    },
    emergencyContact: {
        type: emergencyContactSchema,
        required: true
    },
    parent: {
        type: parentSchema,
        required: true
    },
    // password: {
    //     type: String,
    //     required: [true, 'Password is required'],
    //     minlength: [8, 'Password must be at least 8 characters long'],
    //     validate: {
    //         validator: function (v) {
    //             return /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v) && /[^a-zA-Z\d]/.test(v);
    //         },
    //         message: props => 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'
    //     }
    // },
    otp: {
        type: Number,
        required: false
    },
    otpExpiration: {
        type: Date,
        required: false
    }
    otp: {
        type: Number,
        required: false
    },
    otpExpiration: {
        type: Date,
        required: false
    }
}, { timestamps: true });

// Hash password before saving
teacherSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

const Teacher = mongoose.model('TeacherDetail', teacherSchema);

module.exports = Teacher;*/}



