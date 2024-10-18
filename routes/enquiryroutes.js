// routes/enquiryRoutes.js
const express = require('express');
const router = express.Router();
const Enquiry = require('../Models/Enquiry');

const getEnquiryCount = async () => {
    return await Enquiry.countDocuments();
};
// Add a new enquiry
router.post('/add', async (req, res) => {
    try {
        const enquiry = new Enquiry(req.body);
        await enquiry.save();
        res.status(201).json(enquiry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all enquiries
router.get('/get', async (req, res) => {
    try {
        const enquiries = await Enquiry.find();
        const count = await getEnquiryCount();
        res.status(200).json({ enquiries, count });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get an enquiry by ID
router.get('/get/:id', async (req, res) => {
    try {
        const enquiry = await Enquiry.findById(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        res.status(200).json(enquiry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update an enquiry by ID
router.put('/update/:id', async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        res.status(200).json(enquiry);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Delete an enquiry by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const enquiry = await Enquiry.findByIdAndDelete(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ error: 'Enquiry not found' });
        }
        res.status(200).json({ message: 'Enquiry deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
