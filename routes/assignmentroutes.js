const express = require('express');
const router = express.Router();
const Assignment = require('../Models/Assignment');
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

// Utility function to get assignment count
const getAssignmentCount = async () => {
    return await Assignment.countDocuments();
};

// Create a new assignment
router.post('/add', upload.single('uploadAssignment'), async (req, res) => {
    try {
        const {
            assignmentCode,
            assignmentTitle,
            dueDate,
            attachments,
            submissionMethod,
            marks,
            additionalInstruction,
            class: class_,
            assignTo,
            courseDescription,
            createdBy
        } = req.body;

        // Get file path from the uploaded file
        const uploadAssignment = req.file ? req.file.path : null;

        // Check if file was uploaded
        if (!uploadAssignment) {
            return res.status(400).json({ message: 'Assignment upload is required' });
        }

        const newAssignment = new Assignment({
            assignmentCode,
            assignmentTitle,
            dueDate,
            attachments,
            submissionMethod,
            marks,
            additionalInstruction,
            class: class_,
            assignTo,
            courseDescription,
            createdBy,
            uploadAssignment,  // Include the file path
        });

        await newAssignment.save();
        const count = await getAssignmentCount();
        res.status(201).json({ assignment: newAssignment, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
router.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Get all assignments
router.get('/get', async (req, res) => {
    try {
        const assignments = await Assignment.find();
        const count = await getAssignmentCount();
        res.json({ assignments, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get an assignment by ID
router.get('/get/:id', async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        res.json(assignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update an assignment by ID
router.put('/update/:id', async (req, res) => {
    try {
        const {
            assignmentCode,
            assignmentTitle,
            dueDate,
            attachments,
            submissionMethod,
            marks,
            additionalInstruction,
            class: class_,
            assignTo,
            courseDescription,
            createdBy
        } = req.body;

        const updatedAssignment = await Assignment.findByIdAndUpdate(
            req.params.id,
            {
                assignmentCode,
                assignmentTitle,
                dueDate,
                attachments,
                submissionMethod,
                marks,
                additionalInstruction,
                class: class_,
                assignTo,
                courseDescription,
                createdBy
            },
            { new: true }
        );

        if (!updatedAssignment) return res.status(404).json({ message: 'Assignment not found' });

        res.json(updatedAssignment);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Delete an assignment by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedAssignment = await Assignment.findByIdAndDelete(req.params.id);
        if (!deletedAssignment) return res.status(404).json({ message: 'Assignment not found' });

        const count = await getAssignmentCount();
        res.json({ message: 'Assignment deleted successfully', count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
