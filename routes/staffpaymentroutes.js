const express = require('express');
const router = express.Router();
const StaffPayment = require('../Models/StaffPayment');
const StaffDetail = require('../Models/StaffDetails');

// Create a payment record
router.post('/add', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log request body

        const { staffId, paidAmount, remark, month } = req.body;

        // Fetch staff details by ID
        const staff = await StaffDetail.findById(staffId);

        if (!staff) {
            console.log('Staff not found:', staffId); // Log if staff not found
            return res.status(404).json({ message: 'Staff not found' });
        }

        console.log('Staff details:', staff); // Log staff details

        // Calculate dueAmount from staff's salary
        const salary = staff.salary;
        const dueAmount = salary - paidAmount;

        // Determine the payment status
        const status = dueAmount > 0 ? 'Due' : 'Paid';

        // Create new payment record
        const newPayment = new StaffPayment({
            staffId, // Use staffId from the request
            month, // Use the month from the request
            status, // Set payment status
            paidAmount, // Set paid amount from the request
            dueAmount, // Set calculated due amount
            remark // Set the remark from the request
        });

        // Save the payment record to the database
        await newPayment.save();

        console.log('Payment saved:', newPayment); // Log the saved payment

        res.status(201).json({ message: 'Payment created successfully', payment: newPayment });
    } catch (error) {
        console.error('Error creating payment:', error); // Log the error
        res.status(500).json({ message: 'Server error' });
    }
});


// Get all payment records
router.get('/get', async (req, res) => {
    try {
        const payments = await StaffPayment.find().populate('staffId', 'name aadharNumber education position employmentType contactNumber');
        const totalPayments = payments.length;
        const totalAmountPaid = payments.reduce((acc, payment) => acc + payment.paidAmount, 0);

        res.json({
            totalPayments,
            totalAmountPaid,
            payments
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get payment record by ID
router.get('/show/:id', async (req, res) => {
    try {
        const payment = await StaffPayment.findById(req.params.id).populate('staffId', 'name aadharNumber education position employmentType contactNumber');
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }
        res.json(payment);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update payment record
router.put('/update/:id', async (req, res) => {
    try {
        const { salary, paidAmount } = req.body;

        const payment = await StaffPayment.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        payment.salary = salary;
        payment.paidAmount = paidAmount;
        payment.dueAmount = salary - paidAmount;
        payment.status = payment.dueAmount > 0 ? 'Due' : 'Paid';


        await payment.save();
        res.status(200).json({ message: 'Payment record updated successfully', payment });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});



module.exports = router;
