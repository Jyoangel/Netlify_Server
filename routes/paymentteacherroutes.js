const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const PaymentTeacher = require('../Models/Paymentteacher');
const TeacherDetails = require('../Models/TeacherDetails');



// Create a payment record for a teacher
router.post('/add', async (req, res) => {
    try {
        console.log('Request body:', req.body); // Log the request body
        const { teacherId, paidAmount, remark, month } = req.body;

        // Fetch teacher details by ID
        const teacher = await TeacherDetails.findById(teacherId);
        if (!teacher) {
            console.log('Teacher not found:', teacherId); // Log if teacher not found
            return res.status(404).json({ message: 'Teacher not found' });
        }

        console.log('Teacher details:', teacher); // Log teacher details

        // Calculate dueAmount from teacher's salary
        const salary = teacher.salary;
        const dueAmount = salary - paidAmount;

        // Determine the payment status
        const status = dueAmount > 0 ? 'Due' : 'Paid';

        // Create new payment record
        const newPayment = new PaymentTeacher({
            teacherId,
            status,
            paidAmount,
            dueAmount,
            remark,
            month
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


router.get('/get', async (req, res) => {
    try {
        const payments = await PaymentTeacher.find().populate('teacherId', 'teacherID name aadharNumber subjectTaught highestDegreeEarned contactNumber parent.fatherName');
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
        const payment = await PaymentTeacher.findById(req.params.id).populate('teacherId', 'teacherID name aadharNumber subjectTaught highestDegreeEarned contactNumber parent.fatherName');
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

        const payment = await PaymentTeacher.findById(req.params.id);
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
// Delete payment record
router.delete('/delete/:id', async (req, res) => {
    try {
        const payment = await PaymentTeacher.findById(req.params.id);
        if (!payment) {
            return res.status(404).json({ message: 'Payment record not found' });
        }

        await payment.remove();
        res.json({ message: 'Payment record deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;



