const express = require('express');
const router = express.Router();
const Subject = require('../Models/Subject'); // Adjust the path as needed

const getSubjectCount = async () => {
    return await Subject.countDocuments();
};
// Add a new subject
router.post('/add', async (req, res) => {
    try {
        const newSubject = new Subject(req.body);
        const savedSubject = await newSubject.save();
        res.status(201).json(savedSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all subjects
router.get('/get', async (req, res) => {
    try {
        const subjects = await Subject.find();
        const count = await getSubjectCount();
        res.json({ subjects, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a subject by ID
router.get('/get/:id', async (req, res) => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (subject == null) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(subject);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a subject
router.put('/update/:id', async (req, res) => {
    try {
        const updatedSubject = await Subject.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedSubject == null) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json(updatedSubject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a subject
router.delete('/delete/:id', async (req, res) => {
    try {
        const deletedSubject = await Subject.findByIdAndDelete(req.params.id);
        if (deletedSubject == null) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        res.json({ message: 'Subject deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
