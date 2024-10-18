require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const Teacher = require('../Models/TeacherDetails');
//const checkRole = require('../middleware/checkRole');
//const auth = require('../middleware/auth');

const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Message = require('../Models/Message');
const nodemailer = require('nodemailer');


const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;


// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Set up multer for file upload
const upload = multer({ dest: 'uploads/' });

// Helper function to validate date
const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime()); // Returns true if valid date
};

// Route to import teacher data from Excel
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON
        const teacherData = xlsx.utils.sheet_to_json(worksheet);

        // Transform the data to match the Teacher schema
        const transformedData = teacherData.map(data => ({
            teacherID: data.teacherID,
            name: data.name,
            dateOfBirth: isValidDate(data.dateOfBirth) ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
            contactNumber: data.contactNumber,
            email: data.email,
            aadharNumber: data.aadharNumber,
            address: data.address,
            subjectTaught: data.subjectTaught,
            assignedClass: data.assignedClass,
            gradeLevelTaught: data.gradeLevelTaught,
            department: data.department,
            highestDegreeEarned: data.highestDegreeEarned,
            instituteName: data.instituteName,
            yearOfGraduation: data.yearOfGraduation,
            emergencyContact: {
                contactNumber: data.emergencyContact_contactNumber,
                relationship: data.emergencyContact_relationship
            },
            salary: data.salary,
            parent: {
                fatherName: data.fatherName,
                fatherContactNumber: data.parent_fatherContactNumber,
                fatherAadharNumber: data.parent_fatherAadharNumber,
                fatherOccupation: data.parent_fatherOccupation,
                motherName: data.parent_motherName,
                motherContactNumber: data.parent_motherContactNumber,
                motherAadharNumber: data.parent_motherAadharNumber,
                motherOccupation: data.parent_motherOccupation,
                annualIncome: data.parent_annualIncome,
                parentAddress: data.parent_parentAddress
            }
        }));

        // Filter out any invalid records (e.g., missing date of birth)
        const validTeachers = transformedData.filter(teacher => teacher.dateOfBirth !== null);

        if (validTeachers.length === 0) {
            return res.status(400).json({ error: 'No valid teacher data to import' });
        }

        // Insert valid teacher data into the database
        await Teacher.insertMany(validTeachers);

        // Return success response with the total number of teachers
        const count = await Teacher.countDocuments();
        res.status(201).json({ message: `Teacher data imported successfully. Total teachers: ${count}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// Create a new teacher
router.post('/add', async (req, res) => {
    try {
        console.log("Request body:", req.body); // Log request body to check data being sent
        const teacher = new Teacher(req.body);
        await teacher.save();
        const count = await Teacher.countDocuments();
        console.log("Teacher added successfully, total teachers:", count); // Log success
        res.status(200).json({ teacher, message: `The total number of teachers is: ${count}` });
    } catch (error) {
        console.error("Error while adding teacher:", error); // Log error for more details
        res.status(400).json({ message: error.message }); // Send detailed error response
    }
});


// Get all teachers
router.get('/get', async (req, res) => {
    try {
        const teachers = await Teacher.find();
        const count = await Teacher.countDocuments();
        res.status(200).json({ teachers, message: `The total number of teachers is: ${count}` });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a teacher by ID
router.get('/get/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const teacher = await Teacher.findById(_id);

        if (!teacher) {
            return res.status(404).json('Teacher not found');
        }

        res.status(200).json(teacher);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update a teacher by ID

router.put('/update/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }
        res.status(200).json(teacher);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a teacher by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);

        if (!teacher) {
            return res.status(404).json('Teacher not found');
        }

        const count = await Teacher.countDocuments();
        res.status(200).json({ teacher, message: `The total number of Teachers is: ${count}` });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.get('/count', async (req, res) => {
    try {
        const count = await Teacher.countDocuments();
        const presentCount = await Teacher.countDocuments({ isPresent: true });
        res.status(200).json({ count, presentCount });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Check if email exists in the Teacher schema
router.get('/check-role', async (req, res) => {
    const { email } = req.query;

    try {
        const teacher = await Teacher.findOne({ email });
        if (teacher) {
            return res.status(200).json({ exists: true, role: 'Teacher' });
        }
        return res.status(404).json({ exists: false });
    } catch (error) {
        console.error('Error checking teacher role:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});


router.put('/selectTeacher/:teacherID', async (req, res) => {
    const { teacherID } = req.params;
    const { selected } = req.body;

    if (typeof selected !== 'boolean') {
        return res.status(400).json({ message: 'Selected field must be a boolean' });
    }

    try {
        const updatedTeacher = await Teacher.findOneAndUpdate(
            { teacherID: teacherID },
            { selected: selected },
            { new: true }
        );

        if (!updatedTeacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        res.json(updatedTeacher);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// route to send meesage through email 
router.post('/sendMessages', async (req, res) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    try {
        // Find all selected Teachers
        const selectedTeachers = await Teacher.find({ selected: true });

        if (selectedTeachers.length === 0) {
            return res.status(400).json({ message: 'No Teachers selected for messaging' });
        }

        // Extract emails of selected Teachers
        const emails = selectedTeachers.map(teacher => teacher.email);

        // Configure email options
        const mailOptions = {
            from: EMAIL_USER,
            to: emails.join(','),
            subject: subject,
            text: message
        };

        // Send email using nodemailer
        transporter.sendMail(mailOptions, async (error, info) => {
            if (error) {
                return res.status(500).json({ message: error.message });
            }

            // Save the message details in the database
            const sentMessage = new Message({
                subject,
                message
            });

            await sentMessage.save();

            // Reset the selected field to false after sending the message
            await Teacher.updateMany({ selected: true }, { selected: false });

            res.json({ message: 'Messages sent successfully', info });
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;


{/*const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const teacherDetails = require('../Models/TeacherDetails');

router.post('/add', async (req, res) => {
    try {
        const newUser = new teacherDetails(req.body);
        const saveUser = await newUser.save();
        res.status(201).json({
            message: "Teacher created successfully",
            data: saveUser
        });
    } catch (error) {
        console.error('Error saving user:', error); // Log the error
        res.status(400).json({ message: error.message });
    }
});






router.get('/get', async (req, res) => {

    const user = await teacherDetails.find();

    res.status(200).json({
        message: "Teacher details",
        data: user
    });

});

module.exports = router;*/}