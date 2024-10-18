require('dotenv').config();
const express = require('express');
const router = express.Router();
const Fee = require('../Models/Fee');
const Student = require('../Models/StudentDetails');
const FeeNotice = require('../Models/FeeNotice');
const nodemailer = require('nodemailer');
const checkRole = require('../middleware/checkRole');
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail', // Replace with your email service provider
    auth: {
        user: EMAIL_USER,

        pass: EMAIL_PASS   // Your email password
    }
});

// Helper function to send email
const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: EMAIL_USER, // Your email address
        to: to,
        subject: subject,
        text: text
    };

    return transporter.sendMail(mailOptions);
};


// add fee data 
router.post('/add', async (req, res) => {
    try {
        const {
            studentID,
            feePaid,
            otherFee = 0, // default to 0 if not provided
            feeMonth,
            paymentMode,
            referenceNo,
            bankName,
            remark,
            receiptBy
        } = req.body;

        console.log('Received new fee data:', req.body);

        // Fetch the student details to get totalFee and monthlyFee
        const student = await Student.findById(studentID);

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        const { totalFee, monthlyFee } = student; // Extract totalFee and monthlyFee from student

        // Calculate paidAmount based on feePaid and otherFee
        const paidAmount = feePaid + otherFee;

        // Initialize extraFee and dueAmount
        let extraFee = 0;
        let dueAmount = 0;

        // Determine extraFee and dueAmount based on paidAmount and monthlyFee
        if (paidAmount > monthlyFee) {
            extraFee = paidAmount - monthlyFee;
        } else {
            dueAmount = monthlyFee - paidAmount;
        }

        // Calculate totalDues (remaining balance) for the student
        const totalPaid = await Fee.aggregate([
            { $match: { studentID: student._id } },
            { $group: { _id: null, totalPaidAmount: { $sum: "$paidAmount" } } }
        ]);



        totalDues = student.totalFee - (totalPaid[0]?.totalPaidAmount || 0) - paidAmount;
        // Determine status based on dueAmount
        const status = totalDues > 0 ? 'Due' : 'Paid';

        // Create a new Fee record
        const newFee = new Fee({
            studentID,
            feePaid,
            otherFee,
            paidAmount,
            extraFee,
            total: paidAmount,  // Total for this transaction
            dueAmount,
            totalDues,          // Due amount for this transaction
            feeMonth,
            status,
            paymentMode,
            referenceNo,
            bankName,
            remark,
            receiptBy
        });

        const fee = await newFee.save();
        console.log('Saved fee:', fee);



        res.status(201).json({ msg: 'Fee record created successfully', fee });
    } catch (err) {
        console.error('Error saving fee:', err.message);
        res.status(400).json({ msg: err.message });
    }
});

// Get fee record by ID
{/*
router.get('/get/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`Fetching fee record for id: ${id}`);
    try {
        const fee = await Fee.findById(id).populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email parent.fatherName contactNumber address');
        if (!fee) {
            console.log(`Fee record not found for id: ${id}`);
            return res.status(404).json({ msg: 'Fee record not found' });
        }
        console.log(`Fee record found: ${fee}`);
        res.json(fee);
    } catch (err) {
        console.error(`Error fetching fee record: ${err.message}`);
        res.status(500).send('Server error');
    }
});
*/}

// get fee record using object id 
router.get('/get/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`Fetching fee record for id: ${id}`);

    try {
        // Fetch the specific fee record by ID and populate student details
        const fee = await Fee.findById(id).populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email parent.fatherName contactNumber address admissionNumber session monthlyFee');

        if (!fee) {
            console.log(`Fee record not found for id: ${id}`);
            return res.status(404).json({ msg: 'Fee record not found' });
        }

        // Fetch all fee records for this student
        const allFees = await Fee.find({ studentID: fee.studentID._id });

        // Extract all feeMonths from the records
        const paidMonths = allFees.map(f => f.feeMonth); // Get all the months where a fee record exists

        // Define all months of the year
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Calculate the due months by finding the months not in the paidMonths array
        const dueMonths = allMonths.filter(month => !paidMonths.includes(month));

        // Add dueMonths to the response object
        const response = {
            ...fee.toObject(), // Convert mongoose document to plain object
            dueMonths // Attach the calculated due months
        };

        console.log(`Fee record found with due months: ${response.dueMonths}`);
        res.json(response);

    } catch (err) {
        console.error(`Error fetching fee record: ${err.message}`);
        res.status(500).send('Server error');
    }
});


//get fee by studentID
// New route to fetch fee records by studentID
router.get('/student/:studentID', async (req, res) => {
    const studentID = req.params.studentID;
    console.log(`Fetching fee records for studentID: ${studentID}`);

    try {
        // Fetch the student's fee record
        const student = await Student.findById(studentID);


        if (!student) {
            console.log(`Student not found for studentID: ${studentID}`);
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Fetch all fee records for this student
        const allFees = await Fee.find({ studentID: student._id });

        if (!allFees || allFees.length === 0) {
            console.log(`No fee records found for studentID: ${studentID}`);
            return res.status(404).json({ msg: 'No fee records found' });
        }

        // Extract all feeMonths from the records
        const paidMonths = allFees.map(f => f.feeMonth); // Get all the months where a fee record exists

        // Define all months of the year
        const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        // Calculate the due months by finding the months not in the paidMonths array
        const dueMonths = allMonths.filter(month => !paidMonths.includes(month));

        // Calculate total paid amount for the student
        const totalPaidResult = await Fee.aggregate([
            { $match: { studentID: student._id } },
            { $group: { _id: null, totalPaid: { $sum: '$paidAmount' } } }
        ]);

        const totalPaid = totalPaidResult[0]?.totalPaid || 0;
        console.log(`Total paid by student: ${totalPaid}`);

        // Calculate the totalDueAmount (student's total fee - total paid amount)
        const totalDueAmount = student.totalFee - totalPaid;
        console.log(`Calculated totalDueAmount: ${totalDueAmount}`);

        // Find the most recent fee payment for the student (latest by date)
        const recentPayment = await Fee.findOne({ studentID: student._id }).sort({ date: -1 });
        const recentPaidAmount = recentPayment ? recentPayment.paidAmount : 0;
        console.log(`Most recent paid amount: ${recentPaidAmount}`);

        // Add totalDueAmount, dueMonths, and recentPaidAmount to the response object
        const response = {
            studentID: student.studentID,
            name: student.name,
            class: student.class,
            totalFee: student.totalFee,
            dueMonths,          // Attach the calculated due months
            totalDueAmount,     // Attach the calculated total due amount
            recentPaidAmount    // Attach the most recent paid amount
        };

        console.log(`Fee records found with totalDueAmount: ${totalDueAmount}, recentPaidAmount: ${recentPaidAmount}, and due months: ${response.dueMonths}`);
        res.json(response);

    } catch (err) {
        console.error(`Error fetching fee records: ${err.message}`);
        res.status(500).send('Server error');
    }
});


// Get all fee records
router.get('/get', async (req, res) => {
    try {
        const fees = await Fee.find().populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email parent.fatherName contactNumber address');
        if (!fees || fees.length === 0) {
            return res.status(404).json({ msg: 'No fee records found' });
        }

        const totalFeesCount = fees.length;
        const totalPaidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

        res.json({ fees, totalFeesCount, totalPaidAmount });
    } catch (err) {
        console.error(`Error fetching fee records: ${err.message}`);
        res.status(500).send('Server error');
    }
});

// get fee record  using studentID and month 
router.get('/get/:studentID/:month', async (req, res) => {
    const { studentID, month } = req.params;

    console.log(`Received request for studentID: ${studentID} and month: ${month}`);

    try {
        // Debugging output for query
        console.log(`Querying database with studentID: ${studentID} and feeMonth: ${month}`);

        const fee = await Fee.find({ studentID, feeMonth: month });

        // Debugging output for result
        if (!fee) {
            console.log(`No fee record found for studentID: ${studentID} and month: ${month}`);
            return res.status(404).json({ message: 'Fee record not found' });
        }

        console.log(`Fee record found:`, fee);
        res.json(fee);
    } catch (error) {
        console.error('Error fetching fee record:', error);
        res.status(500).json({ message: error.message });
    }
});


// Update total fee
router.put('/update/:id', async (req, res) => {
    try {
        const { totalFee } = req.body;

        const fee = await Fee.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({ msg: 'Fee record not found' });
        }

        fee.totalFee = totalFee;
        fee.dueAmount = totalFee - fee.paidAmount;
        fee.status = fee.dueAmount > 0 ? 'Due' : 'Paid';

        await fee.save();
        res.status(200).json({ msg: 'Total fee updated successfully', fee });
    } catch (error) {
        console.error('Error updating fee record:', error);
        res.status(500).json({ msg: 'Failed to update fee record', error: error.message });
    }
});

// update fee record using studentId and month 
// router.put('/updateByMonth/:studentID/:month', async (req, res) => {
//     const { studentID, month } = req.params;
//     const updatedData = req.body;

//     try {
//         // Find the fee record by studentID and month, and update it
//         const feeRecord = await Fee.findOneAndUpdate(
//             { studentID: studentID, feeMonth: month }, // Match studentID and feeMonth
//             { $set: updatedData }, // Update with the new data
//             { new: true } // Return the updated document
//         );

//         if (!feeRecord) {
//             return res.status(404).json({ message: 'Fee record not found' });
//         }

//         res.json({ message: 'Fee record updated successfully', feeRecord });
//     } catch (error) {
//         console.error("Error updating fee record:", error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }
// });

router.put('/updateByMonth/:studentID/:month', async (req, res) => {
    const { studentID, month } = req.params;
    const updatedData = req.body;

    try {
        // Find and update the fee record
        const feeRecord = await Fee.findOneAndUpdate(
            { studentID: studentID, feeMonth: month }, // Match studentID and feeMonth
            { $set: updatedData }, // Update with the new data
            { new: true } // Return the updated document
        );

        if (!feeRecord) {
            return res.status(404).json({ message: 'Fee record not found' });
        }

        // Return the updated record
        res.json({ message: 'Fee record updated successfully', feeRecord });
    } catch (error) {
        console.error("Error updating fee record:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Send notice route
router.post('/sendNotice/:studentID', async (req, res) => {
    const { message, remark, dueAmount, months } = req.body;
    const studentID = req.params.studentID; // Correctly access studentID

    try {
        // Fetch fee details using studentID
        const fee = await Fee.findOne({ studentID }).populate('studentID', 'email');
        if (!fee) {
            return res.status(404).json({ msg: 'Fee record not found' });
        }

        // Prepare the email content
        const subject = 'Fee Notice';
        const text = `
            Hello,

            This is a reminder regarding your pending fee. Below are the details:

            Message: ${message}
            Remark: ${remark}
            Due Amount: ${dueAmount}
            Due Months: ${months}

            Please contact the school administration for further information.

            Best regards,
            School Administration
        `;

        // Send the email
        await sendEmail(fee.studentID.email, subject, text);
        console.log(`Notice sent to ${fee.studentID.email}`);

        res.status(200).json({ msg: 'Notice sent successfully' });
    } catch (error) {
        console.error('Error sending fee notice:', error);
        res.status(500).json({ msg: 'Failed to send fee notice', error: error.message });
    }
});

{/*
router.post('/sendNotice/:id', async (req, res) => {
    const { message, remark, dueAmount, months } = req.body;
    const studentID = req.params.id;

    try {
        // Fetch student details
        const student = await Student.findById(studentID);
        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        // Prepare the email content
        const subject = 'Fee Notice';
        const text = `
            Hello ${student.name},
            
            This is a reminder regarding your pending fee. Below are the details:

            Message: ${message}
            Remark: ${remark}
            Due Amount: ${dueAmount}
            Due Months: ${months}

            Please contact the school administration for further information.

            Best regards,
            School Administration
        `;

        // Send the email
        await sendEmail(student.email, subject, text);
        console.log(`Notice sent to ${student.email}`);

        res.status(200).json({ msg: 'Notice sent successfully' });
    } catch (err) {
        console.error(`Error sending notice: ${err.message}`);
        res.status(500).send('Server error');
    }
});
*/}

module.exports = router;



{/*const express = require('express');
const router = express.Router();
const Fee = require('../Models/Fee');
const Student = require('../Models/StudentDetails');
const checkRole = require('../middleware/checkRole');


// Create a fee tar
router.post('/add', async (req, res) => {
    try {
        const {
            studentID, totalFee, monthlyFee, festiveFee, feeMonth, registrationNo, number, schoolEmail, session,
            paymentMode, referenceNo, bankName, remark, receiptBy
        } = req.body;

        console.log('Received new fee data:', req.body);

        // Calculate paidAmount based on MonthlyFee and festiveFee
        const paidAmount = monthlyFee + (festiveFee || 0);

        // Calculate due amount and determine status
        const dueAmount = totalFee - paidAmount;
        const status = dueAmount > 0 ? 'Due' : 'Paid';

        const newFee = new Fee({
            studentID,
            totalFee,
            monthlyFee,
            festiveFee,
            feeMonth,
            registrationNo,
            status,
            number,
            schoolEmail,
            session,
            paymentMode,
            referenceNo,
            bankName,
            remark,
            receiptBy
        });

        const fee = await newFee.save();
        console.log('Saved fee:', fee);
        res.status(201).json({ msg: 'Fee record created successfully', fee });
    } catch (err) {
        console.error('Error saving fee:', err.message);
        res.status(500).send('Server error');
    }
});


// Get fee record by ID

router.get('/get/:id', async (req, res) => {
    const id = req.params.id;
    console.log(`Fetching fee record for id: ${id}`);
    try {
        const fee = await Fee.findById(id).populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email parent.fatherName contactNumber address');
        if (!fee) {
            console.log(`Fee record not found for id: ${id}`);
            return res.status(404).json({ msg: 'Fee record not found' });
        }
        console.log(`Fee record found: ${fee}`);
        res.json(fee);
    } catch (err) {
        console.error(`Error fetching fee record: ${err.message}`);
        res.status(500).send('Server error');
    }
});

router.get('/get', async (req, res) => {
    try {
        const fees = await Fee.find().populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email parent.fatherName contactNumber address');
        if (!fees || fees.length === 0) {
            return res.status(404).json({ msg: 'No fee records found' });
        }

        const totalFeesCount = fees.length;
        const totalPaidAmount = fees.reduce((sum, fee) => sum + fee.paidAmount, 0);

        res.json({ fees, totalFeesCount, totalPaidAmount });
    } catch (err) {
        console.error(`Error fetching fee records: ${err.message}`);
        res.status(500).send('Server error');
    }
});



// Update total fee
router.put('/update/:id', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const { totalFee } = req.body;

        const fee = await Fee.findById(req.params.id);
        if (!fee) {
            return res.status(404).json({ msg: 'Fee record not found' });
        }

        fee.totalFee = totalFee;
        fee.dueAmount = totalFee - fee.paidAmount;
        fee.status = fee.dueAmount > 0 ? 'Due' : 'Paid';

        await fee.save();
        res.status(200).json({ msg: 'Total fee updated successfully', fee });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


module.exports = router;

{/*
// Generate fee notice for students with due fees
router.get('/notice/:studentID', checkRole(['admin', 'teacher']), async (req, res) => {
    try {
        const studentID = req.params.studentID;
        const fee = await Fee.findOne({ studentID }).populate('studentID', 'studentID name class dateOfBirth gender aadharNumber email  parent.fatherName contactNumber');

        if (!fee) {
            return res.status(404).json({ msg: 'Fee record not found' });
        }

        if (fee.status === 'Paid') {
            return res.status(200).json({ msg: 'No due fees' });
        }

        const student = await Student.findById(studentID);

        if (!student) {
            return res.status(404).json({ msg: 'Student not found' });
        }

        const notice = {
            studentName: student.name,
            studentClass: student.class,
            totalFee: fee.totalFee,
            paidAmount: fee.paidAmount,
            dueAmount: fee.dueAmount,
            status: fee.status,
            message: `Dear ${student.name}, your total fee is ₹${fee.totalFee}. You have paid ₹${fee.paidAmount}, and ₹${fee.dueAmount} is still due. Please pay the due amount at your earliest convenience.`
        };

        res.status(200).json(notice);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
*/}