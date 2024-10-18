const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const StudentDetail = require('../Models/StudentDetails');
const Teacher = require('../Models/TeacherDetails');
const Staff = require('../Models/StaffDetails');
const Attendance = require('../Models/Attendance')
const ReportCard = require('../Models/Reportcard');
const Homework = require('../Models/HomeWork');
// router.get('/count', async (req, res) => {
//     try {
//         const count = await StudentDetail.countDocuments();
//         const presentCount = await Attendance.countDocuments({ present: true });
//         const teacher = await Teacher.countDocuments();
//         const teacherpresent = await Teacher.countDocuments({ isPresent: true });
//         const staffCount = await Staff.countDocuments();
//         const staffpresentCount = await Staff.countDocuments({ isPresent: true });
//         res.status(200).json({ count, presentCount, teacher, teacherpresent, staffCount, staffpresentCount });
//     } catch (error) {
//         res.status(500).json(error);
//     }
// });


// route to get count data 
const moment = require('moment-timezone');

// GET request to count attendance and other metrics
router.get('/count', async (req, res) => {
    try {
        // Get the current date in IST (India Standard Time)
        const todayIST = moment.tz("Asia/Kolkata").format("YYYY-MM-DD"); // Get today's date at midnight in IST

        // Debug: Log today's IST date to verify it's correct
        console.log('Today\'s Date in IST:', todayIST);

        // Count students present today
        // const presentCount = await Attendance.countDocuments({
        //     'dates.date': todayIST,  // Match today's date in IST
        //     'dates.present': true  // Only count if the student was marked present
        // });
        const result = await Attendance.aggregate([
            {
                $unwind: "$dates" // Flatten the dates array
            },
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: [{ $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$dates.date" } } }, todayIST] },
                            { $eq: ["$dates.present", true] }
                        ]
                    }
                }
            },
            {
                $group: {
                    _id: null, // Grouping by null to get a single result
                    presentCount: { $sum: 1 } // Counting present students
                }
            }
        ]);

        // Extract presentCount from the result
        const presentCount = result.length > 0 ? result[0].presentCount : 0; // Default to 0 if no results



        console.log(presentCount);
        // Count teachers present today
        const teacherPresentCount = await Teacher.countDocuments({
            isPresent: true,
            'attendance.date': todayIST  // Match today's date in IST for teachers
        });

        // Count staff present today
        const staffPresentCount = await Staff.countDocuments({
            isPresent: true,
            'attendance.date': todayIST  // Match today's date in IST for staff
        });

        // Fetch all report cards
        const reportCards = await ReportCard.find();

        // Initialize counters for struggling and excellence students
        let excellenceCount = 0;
        let strugglingCount = 0;

        // Iterate through the report cards and count based on percentage
        reportCards.forEach(reportCard => {
            const percentage = reportCard.percentage;  // Access the virtual percentage field

            if (percentage > 85) {
                excellenceCount++;  // Count for excellence students
            } else if (percentage < 60) {
                strugglingCount++;  // Count for struggling students
            }
        });

        // Total counts for students, teachers, and staff
        const count = await StudentDetail.countDocuments();
        const teacherCount = await Teacher.countDocuments();
        const staffCount = await Staff.countDocuments();
        const homeworkCount = await Homework.countDocuments();

        // Respond with the updated counts
        res.status(200).json({
            count,
            presentCount,
            teacherCount,
            teacherPresentCount,
            staffCount,
            staffPresentCount,
            excellenceCount,   // Added excellence count
            strugglingCount,
            homeworkCount
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


module.exports = router;