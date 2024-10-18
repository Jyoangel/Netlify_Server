// reportCardRoutes.js

const express = require('express');
const router = express.Router();
const ReportCard = require('../Models/Reportcard');




{/*router.post('/add', async (req, res) => {
    try {
        const reportCard = new ReportCard(req.body);
        await reportCard.save();
        res.status(201).send(reportCard);
        console.log(reportCard)
    } catch (err) {
        res.status(400).send(err);
    }
});
*/}

// Route to create a new ReportCard
router.post('/add', async (req, res) => {
    try {
        const { admitCardId, marks, classTeacher, principleSignature } = req.body;

        // Check for missing fields
        if (!admitCardId || !marks || !classTeacher) {
            return res.status(400).json({
                error: 'Missing required fields: reportCardId, marks, and classTeacher are required',
            });
        }

        // Check if a report card already exists for this reportCardId
        const existingReportCard = await ReportCard.findOne({ admitCardId });
        if (existingReportCard) {
            return res.status(400).json({
                error: 'A report card has already been created for this report card',
            });
        }

        // Create the report card using the static method
        const reportCard = await ReportCard.createFromAdmitCard(admitCardId, {
            marks, // Marks for each subject provided in the request
            classTeacher,
            principleSignature, // Optional, will use default if not provided
        });

        // Return the created report card as a response
        res.status(201).json({
            message: 'Report card created successfully',
            reportCard,
        });
    } catch (error) {
        console.error('Error creating report card:', error);
        res.status(500).json({ error: error.message });
    }
});



//get report card using report card
router.get('/reportcard/:reportCardId', async (req, res) => {
    try {
        const { reportCardId } = req.params;

        // Find the report card using reportCardId
        const reportCard = await ReportCard.findOne({ reportCardId });
        if (!reportCard) {
            return res.status(404).json({
                error: 'Report card not found for the provided report card ID',
            });
        }

        // Return the report card as a response
        res.status(200).json({
            message: 'Report card fetched successfully',
            reportCard,
        });
    } catch (error) {
        console.error('Error fetching report card:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route to get all ReportCards
router.get('/get', async (req, res) => {
    try {
        const reportCards = await ReportCard.find();

        res.send(reportCards);
    } catch (err) {
        res.status(500).send(err);
    }
});



// Route to get a specific ReportCard by ID
router.get('/get/:id', async (req, res) => {
    try {
        const reportCard = await ReportCard.findById(req.params.id);
        if (!reportCard) {
            return res.status(404).send({ error: 'ReportCard not found' });
        }
        res.send(reportCard);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Route to update a ReportCard by ID
router.put('/update/:id', async (req, res) => {
    try {
        const reportCard = await ReportCard.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!reportCard) {
            return res.status(404).json({ error: 'Report card not found' });
        }
        res.status(200).json(reportCard);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Route to delete a ReportCard by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const reportCard = await ReportCard.findByIdAndDelete(req.params.id);
        if (!reportCard) {
            return res.status(404).send({ error: 'ReportCard not found' });
        }
        res.send(reportCard);
    } catch (err) {
        res.status(500).send(err);
    }
});

// get report card using studentID 
router.get('/gets/:studentID', async (req, res) => {
    try {
        const studentID = req.params.studentID; // Get studentID from URL params
        console.log(`Received studentID: ${studentID}`);

        if (!studentID) {
            return res.status(400).json({ message: 'Student ID is required' });
        }

        // Fetch the report card and populate the student details using studentID
        const reportCard = await ReportCard.findOne({ studentID })
            .populate('studentID', 'name class parent.fatherName dateOfBirth session');

        console.log(`report card with student details: ${reportCard}`);

        if (!reportCard) {
            return res.status(404).json({ message: `report card for student ID ${studentID} not found` });
        }

        res.status(200).json(reportCard);
    } catch (error) {
        console.error('Error fetching report card:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


module.exports = router;
