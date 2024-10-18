

const express = require('express');
const router = express.Router();
const LiveClass = require('../Models/LiveClass');
const checkRole = require('../middleware/checkRole');


// Create a new live class
router.post('/add', async (req, res) => {
    try {
        const liveClass = new LiveClass(req.body);
        await liveClass.save();
        res.status(201).send(liveClass);
    } catch (error) {
        console.error('Failed to add live class data:', error);
        res.status(500).send('Failed to add live class data');
    }
});


// Read all live classes
router.get('/get', async (req, res) => {
    try {
        const liveClasses = await LiveClass.find({}).populate('courseID', 'courseName');
        res.status(200).send(liveClasses);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Read a specific live class by ID
router.get('/get/:id', async (req, res) => {
    try {
        const liveClass = await LiveClass.findById(req.params.id);
        if (!liveClass) {
            return res.status(404).send();
        }
        res.status(200).send(liveClass);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a live class by ID
router.put('/update/:id', async (req, res) => {
    try {
        const liveclass = await LiveClass.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!liveclass) {
            return res.status(404).send({ error: 'HomeWork not found' });
        }
        res.status(200).send(liveclass);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});
// Delete a live class by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const liveClass = await LiveClass.findByIdAndDelete(req.params.id);
        if (!liveClass) {
            return res.status(404).send();
        }
        res.status(200).send(liveClass);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
