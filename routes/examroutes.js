const express = require('express');
const router = express.Router();
const Exam = require('../Models/Exam');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Save to 'uploads/books/' folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename the file
    },
});

const upload = multer({ storage });

// get exam count 
const getExamCount = async () => {
    return await Exam.countDocuments();
};
// Add a new exam
router.post('/add', upload.single('uploadQuestionPaper'), async (req, res) => {
    try {
        const { type, examTitle, subject, date, startTime, endTime, duration, instruction, totalMarks, passingMarks } = req.body;

        // Create the exam object
        const exam = new Exam({
            type,
            examTitle,
            subject,
            date,
            startTime,
            endTime,
            duration,
            instruction,
            totalMarks,
            passingMarks,
            uploadQuestionPaper: req.file ? req.file.path : null // Save file path if uploaded
        });

        // Save the exam to the database
        await exam.save();

        res.status(201).send(exam);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// Get all exams
router.get('/get', async (req, res) => {
    try {
        const exams = await Exam.find();
        const count = await getExamCount();
        res.status(200).send({ exams, count });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Get exam by ID
router.get('/get/:id', async (req, res) => {
    try {
        const exam = await Exam.findById(req.params.id);
        if (!exam) {
            return res.status(404).send({ error: 'Exam not found' });
        }
        res.status(200).send(exam);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// Update exam by ID
router.put('/update/:id', async (req, res) => {
    try {
        const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!exam) {
            return res.status(404).send({ error: 'Exam not found' });
        }
        res.status(200).send(exam);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete exam by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const exam = await Exam.findByIdAndDelete(req.params.id);
        if (!exam) {
            return res.status(404).send({ error: 'Exam not found' });
        }
        res.status(200).send({ message: 'Exam deleted successfully' });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
