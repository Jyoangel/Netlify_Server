require('dotenv').config();
const cron = require('node-cron');
const moment = require('moment');
const mongoose = require('mongoose');
const StudentDetail = require('../Models/StudentDetails');
const Fee = require('../Models/Fee');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Configure Twilio for sending SMS
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;


// Configure nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    }
});
// Configure Twilio
const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);
// Function to format phone numbers
const formatPhoneNumber = (phoneNumber) => {
    // Remove non-numeric characters
    const cleaned = phoneNumber.replace(/\D/g, '');

    // Assuming Indian phone numbers as an example, adjust accordingly for other countries
    if (cleaned.length === 10) {
        // Add country code for 10-digit numbers (assuming India)
        return `+91${cleaned}`;
    } else if (cleaned.length > 10) {
        // If more than 10 digits, assume it includes a country code
        return `+${cleaned}`;
    } else {
        // Invalid phone number length
        return null;
    }
};

cron.schedule('0 9 * * *', async () => {
    try {
        // Get all students
        const students = await StudentDetail.find();

        // Get the current month
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('default', { month: 'long' });

        // Loop through each student
        for (const student of students) {
            const { _id: studentObjectId, name, email, contactNumber } = student;

            try {
                // Find the fee record for the current month
                const feeRecord = await Fee.findOne({
                    studentID: studentObjectId, // Ensure you're using the ObjectId
                    feeMonth: currentMonth,
                });

                // If no feeRecord exists for the current month, send email and SMS
                if (!feeRecord) {
                    const totalDues = await calculateTotalDues(studentObjectId);

                    // Email content
                    const emailContent = `
                        Dear ${name},
                        This is a reminder that your fee for the month of ${currentMonth} is unpaid.
                        Your total dues are: ${totalDues}.
                        Please submit your payment as soon as possible.
                    `;

                    // Send email
                    await transporter.sendMail({
                        from: EMAIL_USER,
                        to: email,
                        subject: 'Fee Due Notice',
                        text: emailContent,
                    });

                    // Format contact number and send SMS
                    const formattedContactNumber = formatPhoneNumber(contactNumber);
                    if (formattedContactNumber) {
                        await client.messages.create({
                            body: `Dear ${name}, your fee for ${currentMonth} is unpaid. Total dues: ${totalDues}. Please submit it.`,
                            from: TWILIO_PHONE_NUMBER, // Your Twilio number
                            to: formattedContactNumber,
                        });

                        console.log(`Due notice sent to ${name} (${email}, ${formattedContactNumber}) for the month of ${currentMonth}`);
                    } else {
                        console.log(`Invalid phone number for student ${name}: ${contactNumber}`);
                    }
                } else {
                    console.log(`Fee record found for ${name} for the month of ${currentMonth}. No notice sent.`);
                }
            } catch (error) {
                console.error(`Error processing student ${name}:`, error);
            }
        }
    } catch (error) {
        console.error('Error sending due notices:', error);
    }
});


// Function to schedule a job for each student
{/*const scheduleDueNotice = async () => {
    try {
        // Get all students
        const students = await StudentDetail.find();

        students.forEach(student => {
            const { studentID, name, email, contactNumber, entryDate, entryTime } = student;

            // Parse entryDate and entryTime into cron-compatible format
            const entryMoment = moment(entryDate).set({
                hour: parseInt(entryTime.split(':')[0]),
                minute: parseInt(entryTime.split(':')[1])
            });

            const cronExpression = `${entryMoment.minute()} ${entryMoment.hour()} ${entryMoment.date()} ${entryMoment.month() + 1} *`;

            // Schedule a job based on entryDate and entryTime
            cron.schedule(cronExpression, async () => {
                const currentDate = new Date();
                const currentMonth = currentDate.toLocaleString('default', { month: 'long' });


                // Check if the fee for the current month has been paid
                const feeRecord = await Fee.findOne({
                    studentID,
                    feeMonth: currentMonth,

                });

                // If no fee record exists, send email and SMS
                if (!feeRecord) {
                    const totalDues = await calculateTotalDues(studentID);

                    // Email content
                    const emailContent = `
                        Dear ${name},
                        This is a reminder that your fee for the month of ${currentMonth} is unpaid.
                        Your total dues are: ${totalDues}.
                        Please submit your payment as soon as possible.
                    `;

                    // Send email
                    await transporter.sendMail({
                        from: EMAIL_USER,
                        to: email,
                        subject: 'Fee Due Notice',
                        text: emailContent
                    });

                    // Format the contact number
                    const formattedContactNumber = formatPhoneNumber(contactNumber);
                    if (formattedContactNumber) {
                        // Send SMS
                        await client.messages.create({
                            body: `Dear ${name}, your fee for ${currentMonth} is unpaid. Total dues: ${totalDues}. Please submit it.`,
                            from: '+13344014487', // Your Twilio number
                            to: formattedContactNumber
                        });

                        console.log(`Due notice sent to ${name} (${email}, ${formattedContactNumber}) for the month of ${currentMonth}`);
                    } else {
                        console.log(`Invalid phone number for student ${name}: ${contactNumber}`);
                    }
                }
            });
        });
    } catch (error) {
        console.error('Error scheduling due notices:', error);
    }
};

// Call the function to schedule the jobs
scheduleDueNotice();
*/}

// async function calculateTotalDues(studentObjectId) {
//     const student = await Fee.findById({ studentObjectId });
//     const totalPaid = await Fee.aggregate([
//         { $match: { studentObjectId } },
//         { $group: { _id: null, totalPaidAmount: { $sum: "$paidAmount" } } }
//     ]);
//     return student.totalFee - (totalPaid[0]?.totalPaidAmount || 0);
// }

async function calculateTotalDues(studentObjectId) {
    try {
        // Ensure studentObjectId is cast to ObjectId
        const objectId = new mongoose.Types.ObjectId(studentObjectId);

        // Find the student's total fee from the StudentDetail schema
        const studentDetail = await StudentDetail.findOne({ _id: objectId });
        if (!studentDetail) throw new Error('Student record not found in StudentDetail schema');

        const totalFee = studentDetail.totalFee;

        // Aggregate total paid amount from the Fee schema
        const totalPaid = await Fee.aggregate([
            { $match: { studentID: objectId } },
            { $group: { _id: null, totalPaidAmount: { $sum: "$paidAmount" } } }
        ]);

        // Calculate total dues
        const totalDues = totalFee - (totalPaid[0]?.totalPaidAmount || 0);
        return totalDues;
    } catch (error) {
        console.error('Error calculating total dues:', error);
        throw error; // Rethrow to be handled in the calling function
    }
}

