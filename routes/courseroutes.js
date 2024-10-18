const express = require('express');
const router = express.Router();
const multer = require('multer');
const xlsx = require('xlsx');
const Course = require('../Models/Course');
const checkRole = require('../middleware/checkRole');
const auth = require('../middleware/auth');
const LiveClass = require('../Models/LiveClass'); // 

const path = require('path');
const fs = require('fs');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/';
        // Ensure the directory exists
        fs.mkdirSync(uploadPath, { recursive: true });
        cb(null, uploadPath); // Save to 'uploads/books/' folder
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // Rename the file
    },
});

const upload = multer({ storage });

router.use('/uploads', express.static(path.join(__dirname, '../uploads')));
//const upload = multer({ dest: 'uploads/' });

// Import courses from an Excel file
router.post('/import', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read the uploaded Excel file
        const workbook = xlsx.readFile(file.path);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel data to JSON
        const coursesData = xlsx.utils.sheet_to_json(worksheet);

        // Transform the data to match the Course schema
        const transformedData = coursesData.map(courseData => ({
            courseName: courseData.courseName,
            courseCode: courseData.courseCode,
            courseDescription: courseData.courseDescription,
            primaryInstructorname: courseData.primaryInstructorname,
            instructorEmail: courseData.instructorEmail,
            schedule: {
                classDays: courseData.schedule_classDays,
                classTime: courseData.schedule_classTime,
                startDate: new Date(courseData.schedule_startDate),
                endDate: new Date(courseData.schedule_endDate)
            },
            courseObjectives: courseData.courseObjectives,
            supplementaryMaterials: courseData.supplementaryMaterials,
            onlineResources: courseData.onlineResources
        }));

        await Course.insertMany(transformedData);

        const count = await Course.countDocuments();
        res.status(201).json({ message: `Courses imported successfully. Total courses: ${count}` });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


// Get all courses


router.get('/get', async (req, res) => {
    try {
        // Fetch courses without populating liveClasses initially
        const courses = await Course.find();

        // Iterate through courses and fetch liveClasses for each course
        const populatedCourses = await Promise.all(courses.map(async (course) => {
            const populatedCourse = course.toJSON(); // Convert Mongoose doc to plain object

            // Fetch liveClasses for current course
            populatedCourse.liveClasses = await LiveClass.find({ courseId: course._id });

            return populatedCourse;
        }));

        const count = populatedCourses.length; // Adjust as per your requirement

        res.status(200).json({ courses: populatedCourses, count, message: `The total number of courses is: ${count}` });
    } catch (err) {
        console.log('Error fetching courses:', err);
        res.status(500).json({ message: err.message });
    }
});



// Get a course by ID
router.get('/get/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('liveClasses');;
        if (!course) {
            return res.status(404).json('Course not found');
        }
        res.status(200).json(course);
    } catch (error) {
        console.log('Error fetching course by ID:', error);
        res.status(500).json(error);
    }
});

// Add a new course
router.post('/add', upload.single('uploadCourse'), async (req, res) => {
    try {
        // Create a new course object
        const courseData = {
            ...req.body,
            uploadCourse: req.file ? req.file.path : '' // Store the file path in uploadCourse field
        };

        const course = new Course(courseData);
        await course.save();

        const count = await Course.countDocuments();
        res.status(200).json({ course, message: `The total number of courses is: ${count}` });
    } catch (error) {
        console.error('Error adding course:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update a course by Id
router.put('/update/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!course) {
            return res.status(404).send({ error: 'Course not found' });
        }
        res.status(200).send(course);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// Delete a course by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json('Course not found');
        }
        const count = await Course.countDocuments();
        res.status(200).json({ course, message: `The total number of courses is: ${count}` });
    } catch (error) {
        console.log('Error deleting course:', error);
        res.status(500).json(error);
    }
});
// get count of course 
router.get('/count', async (req, res) => {
    try {
        const count = await Course.countDocuments();
        res.status(200).json({ message: `The total number of courses is: ${count}` });
    } catch (error) {
        res.status(500).json(error);
    }
});

// get course and live class data 
router.get('/courses-with-live-classes', async (req, res) => {
    try {
        const courses = await Course.find().populate('liveClasses');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});



module.exports = router;


{/*
const express = require('express');
const router = express.Router();
const Course = require('../Models/Course');


router.get('/get', async (req, res) => {
    try {
        const courses = await Course.find();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/get/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json('Course not found');
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json(error);
    }
});



// Create a course
/*router.post('/add', async (req, res) => {
    const course = new Course(req.body);

    try {
        const newCourse = await course.save();
        res.status(201).json(newCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});
router.post('/add', async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(400).json({ message: error.message });
        console.log(error);
    }
});

router.put('/update/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['courseName', 'courseCode', 'courseDescription', 'primaryInstructorname', 'instructorEmail', 'schedule', 'courseObjectives', 'supplementaryMaterials', 'onlineResources'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).json({ error: 'Invalid updates!' });
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).json('Course not found');
        }

        updates.forEach((update) => {
            course[update] = req.body[update];
        });
        await course.save();
        res.status(200).json(course);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.delete('/delete/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).json('Course not found');
        }
        res.status(200).json(course);
    } catch (error) {
        res.status(500).json(error);
    }
});

module.exports = router;
*/}

// Update a course
{/*router.put('/update/:id', getCourse, async (req, res) => {
    if (req.body.courseName != null) {
        res.course.courseName = req.body.courseName;
    }
    if (req.body.courseCode != null) {
        res.course.courseCode = req.body.courseCode;
    }
    // Update other fields similarly

    try {
        const updatedCourse = await res.course.save();
        res.json(updatedCourse);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a course
router.delete('/delete/:id', getCourse, async (req, res) => {
    try {
        await res.course.remove();
        res.json({ message: 'Course deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});






{/*const express = require('express');
const mongoose = require('mongoose');
const Course = require('../Models/Course');
const Instructor = require('../Models/Instructor');

const router = express.Router();

// Create a new course
router.post('/add', async (req, res) => {
    try {
        const instructor = await Instructor.findById(req.body.primaryInstructor);
        if (!instructor) {
            return res.status(404).send('Instructor not found');
        }

        const course = new Course({
            courseName: req.body.courseName,
            courseCode: req.body.courseCode,
            courseDescription: req.body.courseDescription,
            primaryInstructor: req.body.primaryInstructor,
            schedule: req.body.schedule,
            courseObjectives: req.body.courseObjectives,
            supplementaryMaterials: req.body.supplementaryMaterials,
            onlineResources: req.body.onlineResources
        });

        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Get all courses
router.get('/get', async (req, res) => {
    try {
        const courses = await Course.find().populate('primaryInstructor');
        res.status(200).send(courses);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Get a course by ID
router.get('/get/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id).populate('primaryInstructor');
        if (!course) {
            return res.status(404).send('Course not found');
        }
        res.status(200).send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update a course by ID
router.put('/update/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['courseName', 'courseCode', 'courseDescription', 'primaryInstructor', 'schedule', 'courseObjectives', 'supplementaryMaterials', 'onlineResources'];
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' });
    }

    try {
        const course = await Course.findById(req.params.id);
        if (!course) {
            return res.status(404).send('Course not found');
        }

        updates.forEach((update) => {
            course[update] = req.body[update];
        });
        await course.save();
        res.status(200).send(course);
    } catch (error) {
        res.status(400).send(error);
    }
});

// Delete a course by ID
router.delete('/delete/:id', async (req, res) => {
    try {
        const course = await Course.findByIdAndDelete(req.params.id);
        if (!course) {
            return res.status(404).send('Course not found');
        }
        res.status(200).send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;*/}
