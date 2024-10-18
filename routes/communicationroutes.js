require('dotenv').config();
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Communication = require('../Models/Communication');
const StudentDetail = require('../Models/StudentDetails');
const Message = require('../Models/Message');
const checkRole = require('../middleware/checkRole');


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

// Create a new communication
router.post('/add', async (req, res) => {
    try {
        const student = await StudentDetail.findOne({ studentID: req.body.studentID });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const communication = new Communication({
            studentID: student.studentID,
            name: student.name,
            dateOfBirth: student.dateOfBirth,
            class: student.class,
            gender: student.gender,
            aadharNumber: student.aadharNumber,
            fatherName: student.parent.fatherName,
            contactNumber: student.contactNumber,
            email: student.email,
            selected: req.body.selected
        });

        const savedCommunication = await communication.save();
        res.status(201).json(savedCommunication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all communications
router.get('/get', async (req, res) => {
    try {
        const communications = await Communication.find();
        res.json(communications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a communication by ID
router.get('/get/:id', getCommunication, (req, res) => {
    res.json(res.communication);
});

// Update a communication
router.put('/update/:id', getCommunication, async (req, res) => {
    if (req.body.selected != null) {
        res.communication.selected = req.body.selected;
    }

    try {
        const updatedCommunication = await res.communication.save();
        res.json(updatedCommunication);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a communication
router.delete('/delete/:id', getCommunication, async (req, res) => {
    try {
        await res.communication.remove();
        res.json({ message: 'Deleted Communication' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Middleware function to get a communication by ID
async function getCommunication(req, res, next) {
    let communication;
    try {
        communication = await Communication.findById(req.params.id);
        if (communication == null) {
            return res.status(404).json({ message: 'Communication not found' });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

    res.communication = communication;
    next();
}

// Endpoint to update the selected field
router.put('/selectStudent/:studentId', async (req, res) => {
    const { studentId } = req.params;
    const { selected } = req.body;

    if (typeof selected !== 'boolean') {
        return res.status(400).json({ message: 'Selected field must be a boolean' });
    }

    try {
        const updatedStudent = await Communication.findOneAndUpdate(
            { studentID: studentId },
            { selected: selected },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send message to selected students
router.post('/sendMessages', async (req, res) => {
    const { subject, message } = req.body;

    if (!subject || !message) {
        return res.status(400).json({ message: 'Subject and message are required' });
    }

    try {
        const selectedStudents = await Communication.find({ selected: true });

        if (selectedStudents.length === 0) {
            return res.status(400).json({ message: 'No students selected for messaging' });
        }

        const emails = selectedStudents.map(student => student.email);

        const mailOptions = {
            from: EMAIL_USER,
            to: emails.join(','),
            subject: subject,
            text: message
        };

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
            await Communication.updateMany({ selected: true }, { selected: false });

            res.json({ message: 'Messages sent successfully', info });
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
