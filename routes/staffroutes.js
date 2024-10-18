require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Staff = require('../Models/StaffDetails');
const checkRole = require('../middleware/checkRole');
const auth = require('../middleware/auth');
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
        const staffData = xlsx.utils.sheet_to_json(worksheet);

        // Helper function to validate date
        const isValidDate = (dateString) => {
            const date = new Date(dateString);
            return !isNaN(date.getTime()); // Returns true if valid date
        };

        // Transform the data to match the StaffDetail schema
        const transformedData = staffData.map(data => ({
            staffID: data.staffID,
            name: data.name,
            dateOfBirth: isValidDate(data.dateOfBirth) ? new Date(data.dateOfBirth) : null,
            gender: data.gender,
            contactNumber: data.contactNumber,
            email: data.email,
            education: data.education,
            address: data.address,
            aadharNumber: data.aadharNumber,
            position: data.position,
            employmentType: data.employmentType,
            emergencyContact: {
                contactNumber: data.emergencyContact_contactNumber,
                relationship: data.emergencyContact_relationship
            },
            nationality: data.nationality,
            languageSpoken: data.languageSpoken,
            salary: data.salary
        }));

        // Filter out any invalid staff records (e.g., missing date of birth)
        const validStaff = transformedData.filter(staff => staff.dateOfBirth !== null);

        if (validStaff.length === 0) {
            return res.status(400).json({ error: 'No valid staff data to import' });
        }

        // Insert valid staff data into the database
        await Staff.insertMany(validStaff);

        // Return success response with the total number of staff members
        const count = await Staff.countDocuments();
        res.status(201).json({ message: `Staff data imported successfully. Total staff members: ${count}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});



// Create a new staff member
router.post('/add', async (req, res) => {
    try {
        const staff = new Staff(req.body);
        await staff.save();
        const count = await Staff.countDocuments();
        res.status(200).json({ staff, message: `The total number of Staffs is: ${count}` });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Get all staff members
router.get('/get', async (req, res) => {
    try {
        const staff = await Staff.find();
        const count = await Staff.countDocuments();
        res.status(200).json({ staff, message: `The total number of Staffs is: ${count}` });
    } catch (error) {
        res.status(500).json(error);
    }
});

// Get a staff member by ID
router.get('/get/:id', async (req, res) => {
    const _id = req.params.id;

    try {
        const staff = await Staff.findById(_id);

        if (!staff) {
            return res.status(404).json('Staff member not found');
        }

        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json(error);
    }
});

// Update a staff member by ID
router.put('/update/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!staff) {
            return res.status(404).json({ error: 'Staff not found' });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a staff member by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);

        if (!staff) {
            return res.status(404).json('Staff member not found');
        }

        const count = await Staff.countDocuments();
        res.status(200).json({ staff, message: `The total number of Staffs is: ${count}` });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get staff  count 
router.get('/staff-count', async (req, res) => {
    try {
        const count = await Staff.countDocuments();
        const presentCount = await Staff.countDocuments({ isPresent: true });
        res.status(200).json({ count, presentCount });
    } catch (error) {
        res.status(500).json(error);
    }
});

router.put('/selectStaff/:staffID', async (req, res) => {
    const { staffID } = req.params;
    const { selected } = req.body;

    if (typeof selected !== 'boolean') {
        return res.status(400).json({ message: 'Selected field must be a boolean' });
    }

    try {
        const updatedStaff = await Staff.findOneAndUpdate(
            { staffID: staffID },
            { selected: selected },
            { new: true }
        );

        if (!updatedStaff) {
            return res.status(404).json({ message: 'Staff not found' });
        }

        res.json(updatedStaff);
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
        const selectedStaffs = await Staff.find({ selected: true });

        if (selectedStaffs.length === 0) {
            return res.status(400).json({ message: 'No Teachers selected for messaging' });
        }

        // Extract emails of selected Teachers
        const emails = selectedStaffs.map(staff => staff.email);

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
            await Staff.updateMany({ selected: true }, { selected: false });

            res.json({ message: 'Messages sent successfully', info });
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
