const express = require('express');
const router = express.Router();
const ClassSchedule = require('../Models/ClassSchedule'); // Assuming your schema file is in models folder


// Add a new class schedule
router.post('/add', async (req, res) => {
    try {
        const newClassSchedule = new ClassSchedule(req.body);
        await newClassSchedule.save();
        res.status(201).json({ message: 'Class schedule added successfully' });
    } catch (error) {
        console.error('Failed to add  class data:', error);
        res.status(500).json({ message: 'Error adding class schedule', error });
    }
});

// Get all class schedules
router.get('/get', async (req, res) => {
    try {
        const schedules = await ClassSchedule.find();

        res.status(200).send(schedules);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get class schedule by ID
router.get('/get/:id', async (req, res) => {
    try {
        const schedule = await ClassSchedule.findById(req.params.id);
        if (!schedule) {
            return res.status(404).send();
        }
        res.send(schedule);
    } catch (e) {
        res.status(500).send(e);
    }
});

// Route to get class schedule by class
router.get('/class', async (req, res) => {
    const { class: className } = req.query;

    try {
        // Find the class schedule by class
        const schedule = await ClassSchedule.find({ class: className });

        if (!schedule.length) {
            return res.status(404).json({ message: 'No schedule found for the specified class' });
        }

        res.status(200).json(schedule);
    } catch (error) {
        console.error('Error fetching class schedule:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update class schedule by ID
router.put('/update/:id', async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!schedule) {
            return res.status(404).send({ error: 'Class schedule not found' });
        }
        res.status(200).send(schedule);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete class schedule by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const schedule = await ClassSchedule.findByIdAndDelete(req.params.id);
        if (!schedule) {
            return res.status(404).send();
        }
        const count = await ClassSchedule.countDocuments();
        res.json({ schedule, count });
    } catch (e) {
        res.status(500).send(e);
    }
});

module.exports = router;
