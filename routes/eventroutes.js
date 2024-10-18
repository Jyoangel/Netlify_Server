const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Event = require('../Models/Event');
const Teacher = require('../Models/TeacherDetails.js');
const Staff = require('../Models/StaffDetails.js');
const checkRole = require('../middleware/checkRole');


// Create a new event
router.post('/add', async (req, res) => {
    try {
        const { eventName, eventDate, eventTime, description, organizerId, organizerModel } = req.body;

        // Validate organizer model
        if (!['TeacherDetail', 'StaffDetail'].includes(organizerModel)) {
            return res.status(400).json({ error: 'Invalid organizer model' });
        }

        // Find organizer by ID
        let organizer;
        if (organizerModel === 'TeacherDetail') {
            organizer = await Teacher.findById(organizerId);
        } else if (organizerModel === 'StaffDetail') {
            organizer = await Staff.findById(organizerId);
        }

        if (!organizer) {
            return res.status(404).json({ error: 'Organizer not found' });
        }

        // Create a new event with the organizer's name
        const event = new Event({
            eventName,
            eventDate,
            eventTime,
            description,
            organizerName: organizer.name,
            organizerId,
            organizerModel
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all events
router.get('/get', async (req, res) => {
    try {
        const events = await Event.find();

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get an event by ID
router.get('/get/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Update an event
router.put('/update/:id', async (req, res) => {
    try {
        const { eventName, eventDate, eventTime, description, organizerId, organizerModel } = req.body;

        // Validate organizer model if provided
        if (organizerModel && !['TeacherDetail', 'StaffDetail'].includes(organizerModel)) {
            return res.status(400).json({ error: 'Invalid organizer model' });
        }

        let organizer;
        if (organizerModel) {
            if (organizerModel === 'TeacherDetail') {
                organizer = await Teacher.findById(organizerId);
            } else if (organizerModel === 'StaffDetail') {
                organizer = await Staff.findById(organizerId);
            }

            if (!organizer) {
                return res.status(404).json({ error: 'Organizer not found' });
            }
        }

        const updatedData = {
            eventName,
            eventDate,
            eventTime,
            description,
            ...(organizer && {
                organizerName: organizer.name,
                organizerId,
                organizerModel
            })
        };

        const event = await Event.findByIdAndUpdate(req.params.id, updatedData, { new: true });

        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete an event
router.delete('/delete/:id', async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: 'Event not found' });
        }
        res.status(200).json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
