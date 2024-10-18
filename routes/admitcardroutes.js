const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');

const AdmitCard = require('../Models/AdmitCaard');
const StudentDetail = require('../Models/StudentDetails');
const checkRole = require('../middleware/checkRole');


const router = express.Router();

const getAssignmentCount = async () => {
    return await AdmitCard.countDocuments();
};

const upload = multer({ dest: 'uploads/' });

// import admit card data 
router.post('/import', upload.single('file'), async (req, res) => {
    const filePath = path.join(__dirname, req.file.path);
    const admitCards = [];

    fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (row) => {
            const examSubjects = JSON.parse(row.exam_subjects);
            admitCards.push({
                examination_roll_number: row.examination_roll_number,
                school_name: row.school_name,
                session: row.session,
                examination: row.examination,
                student_name: row.student_name,
                class_name: row.class_name,
                start_date: new Date(row.start_date),
                end_date: new Date(row.end_date),
                exam_starting_time: row.exam_starting_time,
                exam_subjects: examSubjects
            });
        })
        .on('end', async () => {
            try {
                await AdmitCard.insertMany(admitCards);
                res.status(201).json({ message: 'Admit Cards imported successfully' });
            } catch (err) {
                res.status(400).json({ message: err.message });
            } finally {
                fs.unlinkSync(filePath); // Clean up the uploaded file
            }
        });
});


{/*
router.post('/add', async (req, res) => {
    try {
        const newAdmitCard = new AdmitCard(req.body);
        const savedAdmitCard = await newAdmitCard.save();
        const count = await getAssignmentCount();
        res.status(201).json({ savedAdmitCard, count });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
*/}
// Create a new Admit Card
router.post('/add', async (req, res) => {
    try {
        const { class: inputClass, examination, startdate, enddate, examstarting_time, examending_time, examsubjects } = req.body;

        if (!inputClass) {
            return res.status(400).json({ message: 'Class is required' });
        }

        // Fetch students matching the input class
        const students = await StudentDetail.find({ class: inputClass });

        if (students.length === 0) {
            return res.status(404).json({ message: `No students found for class ${inputClass}` });
        }

        let admitCards = [];
        let counter = 1; // Sequential number for examination roll

        for (const student of students) {
            const examination_roll_number = `${student.studentID}${student.admissionNumber}${Math.floor(Math.random() * 100)}${counter}`;

            const admitCardData = {
                studentID: student._id, // Use studentID as ObjectId reference to StudentDetail
                examination_roll_number,
                examination: examination || 'Annual Examination', // Default examination value if not provided
                startdate,
                enddate,
                examstarting_time,
                examending_time,
                examsubjects: examsubjects || [], // Subjects should be provided in the request body
            };

            const admitCard = new AdmitCard(admitCardData); // Correct model usage: AdmitCaard
            admitCards.push(admitCard.save());
            counter++; // Increment counter for next student
        }

        // Save all admit cards
        await Promise.all(admitCards);

        res.status(201).json({ message: `Admit cards created successfully for class ${inputClass}` });
    } catch (error) {
        console.error('Error creating admit cards:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Get all Admit Cards
router.get('/get', async (req, res) => {
    try {
        console.log('Fetching admit card data...');

        const admitCards = await AdmitCard.find();

        console.log('Admit card data fetched successfully:', admitCards);

        res.status(200).json(admitCards);
    } catch (error) {
        console.error('Error fetching admit card data:', error);
        res.status(500).json({ message: 'Failed to fetch admit card data' });
    }
});

// Get a single Admit Card by ID
router.get('/get/:id', async (req, res) => {
    try {
        const admitCard = await AdmitCard.findById(req.params.id);
        if (!admitCard) return res.status(404).json({ message: 'Admit Card not found' });
        res.status(200).json(admitCard);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an Admit Card by ID
router.put('/update/:id', async (req, res) => {
    try {
        const updatedAdmitCard = await AdmitCard.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!updatedAdmitCard) return res.status(404).json({ message: 'Admit Card not found' });
        res.status(200).json(updatedAdmitCard);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete an Admit Card by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await AdmitCard.findByIdAndDelete(id);

        if (!result) {
            return res.status(404).json({ message: 'Admit card not found' });
        }

        res.status(200).json({ message: 'Admit card deleted successfully' });
    } catch (error) {
        console.error('Error deleting admit card:', error);
        res.status(500).json({ message: 'Failed to delete admit card' });
    }
});


// get admit card using studentID
router.get('/gets/:studentID', async (req, res) => {
    try {
        const studentID = req.params.studentID; // Get studentID from URL params
        console.log(`Received studentID: ${studentID}`);

        if (!studentID) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Fetch the admit card and populate the student details using studentID
        const admitCard = await AdmitCard.findOne({ studentID })
            .populate('studentID', 'name class parent.fatherName dateOfBirth session');

        console.log(`Admit card with student details: ${admitCard}`);

        if (!admitCard) {
            return res.status(404).json({ message: `Admit card for student ID ${studentID} not found` });
        }

        res.status(200).json(admitCard);
    } catch (error) {
        console.error('Error fetching admit card:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});










module.exports = router;
