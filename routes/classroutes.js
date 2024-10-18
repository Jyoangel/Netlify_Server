// routes/classRoutes.js

const express = require('express');
const router = express.Router();
const Class = require('../Models/Class');

const getClassCount = async () => {
    return await Class.countDocuments();
};

// Add a new class
router.post('/add', async (req, res) => {
    try {
        const newClass = new Class(req.body);
        const savedClass = await newClass.save();
        res.status(201).json(savedClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update a class by ID
router.put('/update/:id', async (req, res) => {
    try {
        const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json(updatedClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete a class by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        // Attempt to delete the class
        const deletedClass = await Class.findByIdAndDelete(req.params.id);
        if (!deletedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        // Respond with success message
        res.json({ message: 'Class deleted successfully' });
    } catch (error) {
        console.error('Error deleting class data:', error); // Log the error
        res.status(500).json({ error: 'Failed to delete class data' }); // Send a more specific error message
    }
});


// Get all classes
router.get('/get', async (req, res) => {
    try {
        const classes = await Class.find();
        const count = await getClassCount();
        res.json({ classes, count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get a class by ID
router.get('/get/:id', async (req, res) => {
    try {
        const singleClass = await Class.findById(req.params.id);
        if (!singleClass) {
            return res.status(404).json({ message: 'Class not found' });
        }
        res.json(singleClass);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
