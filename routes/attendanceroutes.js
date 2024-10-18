const cron = require('node-cron');
const express = require('express');
const router = express.Router();
const moment = require('moment-timezone');
const Attendance = require('../Models/Attendance');
const StudentDetail = require('../Models/StudentDetails');

const getAttendanceCount = async () => {
    return await Attendance.countDocuments();
};

// Route to add a new attendance record
router.post('/add', async (req, res) => {
    try {
        const student = await StudentDetail.findOne({ studentID: req.body.studentID });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const attendance = new Attendance({
            studentId: student._id,  // Reference to StudentDetail
            present: req.body.present
        });

        const savedAttendance = await attendance.save();
        res.status(201).json(savedAttendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Route to get all attendance records with populated student details
router.get('/get', async (req, res) => {
    try {
        const attendance = await Attendance.findWithStudentDetails();
        const count = await getAttendanceCount();
        res.json({ attendance, count });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// router.put('/update/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { present } = req.body; // 'present' should be a boolean value

//         // Find and update the attendance record
//         const attendance = await Attendance.findById(id);

//         if (!attendance) {
//             return res.status(404).json({ message: 'Attendance record not found' });
//         }

//         attendance.present = present; // Update the present field
//         const updatedAttendance = await attendance.save();

//         res.json(updatedAttendance);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// Helper function to convert to IST
const convertToIST = (date) => {
    const utcOffsetMinutes = date.getTimezoneOffset(); // UTC offset in minutes
    const istOffsetMinutes = 330; // IST is UTC + 5:30 = 330 minutes
    return new Date(date.getTime() + (istOffsetMinutes - utcOffsetMinutes) * 60000);
};

// Cron job that runs at midnight (00:00 IST)
cron.schedule('0 18 * * *', async () => { // 18:00 UTC = 00:00 IST
    try {
        const istCurrentDate = moment.tz('Asia/Kolkata').startOf('day'); // Start of the day in IST

        await Attendance.updateMany(
            {
                date: { $lt: istCurrentDate.toDate() }  // Compare with IST date without time
            },
            {
                $set: { present: false }
            }
        );

        console.log('Attendance records have been updated to absent for the new day in IST.');
    } catch (error) {
        console.error('Error updating attendance records:', error.message);
    }
});

// Update attendance using ID (router.put)
// router.put('/update/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { present, updateDate } = req.body;

//         if (typeof present !== 'boolean') {
//             return res.status(400).json({ message: 'Invalid value for present' });
//         }

//         const attendance = await Attendance.findById(id);
//         if (!attendance) {
//             return res.status(404).json({ message: 'Attendance record not found' });
//         }

//         // Get the date in IST and set to midnight
//         const istDateTime = updateDate
//             ? moment.tz(updateDate, 'Asia/Kolkata') // Convert provided date to IST and set to midnight
//             : moment.tz('Asia/Kolkata'); // Current IST date at midnight

//         // Store the date as a formatted string
//         const formattedDate = moment.tz("Asia/Kolkata").format("DD-MM-YYYY"); // Format with IST timezone

//         // Console logs for debugging
//         console.log('updateDate:', updateDate);
//         console.log('IST dateTime:', istDateTime.toString());
//         console.log('Formatted IST dateTime for storage:', formattedDate);

//         // Check if the date already exists in the array
//         const existingEntry = attendance.dates.find(entry =>
//             moment(entry.date, 'DD-MM-YYYY').isSame(istDateTime, 'day') // Match the date by day
//         );

//         if (existingEntry) {
//             // Update the existing entry
//             existingEntry.present = present;
//             existingEntry.date = formattedDate; // Store the date in the desired format
//         } else {
//             // Add a new entry with date and time in IST
//             attendance.dates.push({
//                 date: formattedDate,  // Store date in the desired format
//                 present
//             });
//         }

//         // Update the record-level fields: present and date
//         attendance.present = present;
//         attendance.date = formattedDate;  // Store date in the desired format
//         console.log(attendance.date);
//         // Save the updated attendance record

//         const savedAttendance = await attendance.save();
//         console.log("attendance", savedAttendance);
//         // Format the response
//         const formattedAttendance = {
//             ...attendance.toObject(),
//             date: moment(attendance.date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss+05:30'),
//             dates: attendance.dates.map(entry => ({
//                 ...entry,
//                 date: moment(entry.date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss+05:30')
//             }))
//         };

//         res.json(savedAttendance);
//     } catch (error) {
//         console.log('Error:', error);
//         res.status(400).json({ message: error.message });
//     }
// });



router.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { present, updateDate } = req.body;

        if (typeof present !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for present' });
        }

        const attendance = await Attendance.findById(id);
        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        // Convert updateDate to a JavaScript Date object if provided, else use current IST date
        const istDateTime = updateDate
            ? moment.tz(updateDate, 'Asia/Kolkata').toDate() // Convert to Date object
            : moment.tz('Asia/Kolkata').toDate(); // Current IST date at midnight

        // Console logs for debugging
        console.log('updateDate:', updateDate);
        console.log('IST dateTime:', istDateTime); // This should be a JavaScript Date object

        // Check if the date already exists in the array
        const existingEntry = attendance.dates.find(entry =>
            moment(entry.date).isSame(istDateTime, 'day') // Match the date by day
        );

        if (existingEntry) {
            // Update the existing entry
            existingEntry.present = present;
            existingEntry.date = istDateTime; // Store as a Date object
        } else {
            // Add a new entry with date and time in IST
            attendance.dates.push({
                date: istDateTime,  // Store date as a Date object
                present
            });
        }

        // Update the record-level fields: present and date
        attendance.present = present;
        attendance.date = istDateTime;  // Store date as a Date object

        // Save the updated attendance record
        const savedAttendance = await attendance.save();
        console.log("attendance", savedAttendance);

        // Format the response with dates converted to IST
        const formattedAttendance = {
            ...attendance.toObject(),
            date: moment(attendance.date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss+05:30'),
            dates: attendance.dates.map(entry => ({
                ...entry,
                date: moment(entry.date).tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss+05:30')
            }))
        };

        res.json(formattedAttendance);
    } catch (error) {
        console.log('Error:', error);
        res.status(400).json({ message: error.message });
    }
});







// cron.schedule('0 0 * * *', async () => {
//     try {
//         const currentDate = new Date();
//         currentDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day

//         await Attendance.updateMany(
//             {
//                 date: { $lt: currentDate }
//             },
//             {
//                 $set: { present: false }
//             }
//         );

//         console.log('Attendance records have been updated to absent for the new day.');
//     } catch (error) {
//         console.error('Error updating attendance records:', error.message);
//     }
// });


// // update attendance using id 
// router.put('/update/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { present, updateDate } = req.body; // Added updateDate for flexibility

//         if (typeof present !== 'boolean') {
//             return res.status(400).json({ message: 'Invalid value for present' });
//         }

//         const attendance = await Attendance.findById(id);

//         if (!attendance) {
//             return res.status(404).json({ message: 'Attendance record not found' });
//         }

//         const currentDate = updateDate ? new Date(updateDate) : new Date();
//         currentDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day
//         const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

//         // Check if the date already exists in the array
//         const existingEntry = attendance.dates.find(entry => entry.date.toISOString().split('T')[0] === dateString);

//         if (existingEntry) {
//             // Update the existing entry
//             existingEntry.present = present;
//         } else {
//             // Add a new entry
//             attendance.dates.push({ date: currentDate, present });
//         }

//         // Update the present field if needed at the record level
//         // If you don't need this, you can remove or comment this line
//         attendance.present = present;
//         attendance.date = currentDate;

//         // Save the updated attendance record
//         await attendance.save();

//         // Log the updated state of the dates
//         console.log(`Updated attendance dates for student ${attendance.studentId}:`, attendance.dates);

//         res.json(attendance);
//     } catch (error) {
//         res.status(400).json({ message: error.message });
//     }
// });

// update attendance using studentID 
router.put('/updates/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const { present, updateDate } = req.body;

        if (typeof present !== 'boolean') {
            return res.status(400).json({ message: 'Invalid value for present' });
        }

        // Fetch attendance record by studentId
        const attendance = await Attendance.findOne({ studentId });

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found' });
        }

        const currentDate = updateDate ? new Date(updateDate) : new Date();
        currentDate.setUTCHours(0, 0, 0, 0); // Normalize to start of the day
        const dateString = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format

        // Check if the date already exists in the array
        const existingEntry = attendance.dates.find(entry => entry.date.toISOString().split('T')[0] === dateString);

        if (existingEntry) {
            // Update the existing entry
            existingEntry.present = present;
        } else {
            // Add a new entry
            attendance.dates.push({ date: currentDate, present });
        }

        attendance.present = present;
        attendance.date = currentDate;
        // Save the updated attendance record
        await attendance.save();

        // Log the updated state of the dates
        console.log(`Updated attendance dates for student ${attendance.studentId}:`, attendance.dates);

        res.json(attendance);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});
// get attendance using studentID

router.get('/gets/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;  // Correctly extract studentId
        console.log("Received studentId:", studentId);  // Log studentId

        // Fetch attendance records with populated student details
        const attendanceRecords = await Attendance.findWithStudentDetails(studentId);

        // Log the fetched attendance records
        console.log("Fetched attendance records:", attendanceRecords);

        if (!attendanceRecords.length) {
            console.log("No attendance records found for this student");
            return res.status(404).json({ message: 'No attendance records found for this student' });
        }

        // Respond with the fetched records
        res.json(attendanceRecords);
    } catch (error) {
        console.error("Error fetching attendance records:", error);  // Log the error
        res.status(500).json({ message: error.message });
    }
});

// get attendance count for today present 

router.get('/studentpresent', async (req, res) => {
    try {
        // Get the current date (without time) for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day (00:00:00)

        // Count the number of students present on the current date
        const presentCount = await Attendance.countDocuments({
            'dates.date': today,  // Check if attendance record's date matches today
            'dates.present': true  // Only count if the student was marked present
        });

        res.json({ presentCount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// get attendance using month 

router.get('/api/attendance/monthly', async (req, res) => {
    try {
        const { year, month } = req.query; // Get year and month from query parameters

        if (!year || !month) {
            return res.status(400).json({ error: 'Year and month are required' });
        }

        // Convert month to zero-based index for moment
        const startDate = moment().year(year).month(month - 1).startOf('month').toDate();
        const endDate = moment().year(year).month(month - 1).endOf('month').toDate();

        // Fetch attendance records and join with Student collection
        const attendances = await Attendance.aggregate([
            { $match: { 'dates.date': { $gte: startDate, $lte: endDate } } },
            { $unwind: '$dates' },
            { $match: { 'dates.date': { $gte: startDate, $lte: endDate } } },
            {
                $lookup: {
                    from: 'students', // Collection name for students
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $group: {
                    _id: '$student.class', // Group by class
                    totalDays: { $sum: 1 },
                    presentDays: { $sum: { $cond: ['$dates.present', 1, 0] } },
                    className: { $first: '$student.className' } // Assuming className exists in Student schema
                }
            },
            {
                $project: {
                    classId: '$_id',
                    className: 1,
                    totalDays: 1,
                    presentDays: 1
                }
            }
        ]);

        res.json(attendances);
    } catch (err) {
        console.error('Error calculating attendance:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

router.get('/classes', async (req, res) => {
    try {
        // Fetch all students and extract their class IDs
        const students = await StudentDetail.find().populate('class'); // Adjust field name if necessary
        const classIds = [...new Set(students.map(student => student.class._id.toString()))];

        // Fetch the classes from the database
        //const classes = await Class.find({ _id: { $in: classIds } });

        res.json(classes);
    } catch (err) {
        console.error('Error fetching classes:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;





router.get('/attendance/:classId', async (req, res) => {
    const { classId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear(); // Default to current year

    console.log('Class ID:', classId);
    console.log('Year:', year);

    try {
        const attendanceData = await Attendance.aggregate([
            // Unwind the dates array to process each date entry individually
            { $unwind: '$dates' },
            // Add fields to extract month and year from the dates array
            {
                $addFields: {
                    month: { $month: "$dates.date" },
                    year: { $year: "$dates.date" }
                }
            },
            // Lookup to join with student details
            {
                $lookup: {
                    from: 'studentdetails',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'studentInfo'
                }
            },
            { $unwind: '$studentInfo' },
            // Match by student class and year
            {
                $match: {
                    'studentInfo.class': classId,
                    year: year
                }
            },
            // Group by month and year
            {
                $group: {
                    _id: { month: "$month", year: "$year" },
                    totalPresent: { $sum: { $cond: [{ $eq: ["$dates.present", true] }, 1, 0] } },
                    totalAbsent: { $sum: { $cond: [{ $eq: ["$dates.present", false] }, 1, 0] } },
                    totalDays: { $sum: 1 }
                }
            },
            // Project the final result with attendance percentage calculation
            {
                $project: {
                    month: "$_id.month",
                    year: "$_id.year",
                    totalPresent: 1,
                    totalAbsent: 1,
                    totalDays: 1,
                    attendancePercentage: {
                        $multiply: [
                            {
                                $divide: [
                                    "$totalPresent",
                                    "$totalDays"
                                ]
                            },
                            100
                        ]
                    }
                }
            },
            { $sort: { year: 1, month: 1 } }
        ]);

        console.log('Processed Attendance Data:', attendanceData);

        res.status(200).json(attendanceData);
    } catch (error) {
        console.error('Error fetching attendance data:', error);
        res.status(500).json({ error: "Error fetching attendance data." });
    }
});



router.get('/schooloverview', async (req, res) => {
    const currentYear = new Date().getFullYear(); // Get the current year
    const months = Array.from({ length: 12 }, (x, i) => i + 1); // Generate an array for months [1, 2, ..., 12]

    try {
        // Step 1: Fetch the total number of students
        const totalStudents = await Attendance.countDocuments({});

        const schoolOverviewData = {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            datasets: [
                {
                    label: 'Total Present Students',
                    data: [],
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.5)',
                },
                {
                    label: 'Student Attendance (%)',
                    data: [],
                    borderColor: 'rgb(255, 159, 64)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                }
            ]
        };

        // Step 2: Loop through each month to calculate present days and attendance percentages
        for (const month of months) {
            // Fetch student attendance data for the current month
            const studentAttendance = await Attendance.aggregate([
                { $unwind: '$dates' },
                {
                    $match: {
                        'dates.date': {
                            $gte: new Date(currentYear, month - 1, 1), // First day of the month
                            $lte: new Date(currentYear, month, 0) // Last day of the month
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPresentStudents: { $sum: { $cond: [{ $eq: ["$dates.present", true] }, 1, 0] } },
                        totalDays: { $sum: 1 }
                    }
                }
            ]);

            // Extract the attendance data
            const totalPresentStudents = studentAttendance[0]?.totalPresentStudents || 0;
            const totalDaysInMonth = studentAttendance[0]?.totalDays || 1; // Avoid division by zero

            // Step 3: Calculate attendance percentage
            const studentAttendancePercentage = (totalPresentStudents / (totalStudents * totalDaysInMonth)) * 100;

            // Step 4: Push the data into the datasets
            schoolOverviewData.datasets[0].data.push(totalPresentStudents); // Total present students
            schoolOverviewData.datasets[1].data.push(studentAttendancePercentage); // Student attendance percentage
        }

        // Step 5: Send the response
        res.status(200).json(schoolOverviewData);
    } catch (error) {
        console.error('Error generating school overview data:', error);
        res.status(500).json({ error: 'Error generating school overview data.' });
    }
});


router.get('/student/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;

        // Fetch attendance records for the specific student
        const attendanceRecords = await Attendance.find({ studentId });

        // Initialize an array to hold monthly attendance counts
        const monthlyAttendance = Array(12).fill(0);

        // Aggregate attendance data by month from the `dates` field
        attendanceRecords.forEach(record => {
            record.dates.forEach(dateEntry => {
                const date = new Date(dateEntry.date);
                const month = date.getMonth();
                if (dateEntry.present) {
                    monthlyAttendance[month]++;
                }
            });
        });

        res.json({ monthlyAttendance });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});