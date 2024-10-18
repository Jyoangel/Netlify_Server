const mongoose = require('mongoose');
const StudentDetail = require('../Models/StudentDetails');
const Attendance = require('../Models/Attendance');

// Connect to MongoDB
mongoose.connect('mongodb+srv://jyotigupta:guptajyoti@patraihome.uysh0nk.mongodb.net/patrai?retryWrites=true&w=majority&appName=patraihome', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

async function migrateData() {
    try {
        // Fetch all students
        const students = await StudentDetail.find();

        // Iterate over each student and create an attendance record
        for (const student of students) {
            const attendance = new Attendance({
                studentId: student._id,  // Reference to StudentDetail
                present: false           // Default value for attendance
            });
            await attendance.save();
        }

        console.log('Migration completed successfully.');
    } catch (error) {
        console.error('Error during migration:', error);
    } finally {
        mongoose.connection.close();
    }
}

migrateData();
