const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const xlsx = require('xlsx'); // Import xlsx at the top of the file

const Course = require('../Models/Course');
const LiveClass = require('../Models/LiveClass');
const courseRouter = require('../routes/courseroutes'); // Adjust the path as necessary

// Create an Express app and use the router
const app = express();
app.use(express.json());
app.use('/courses', courseRouter);

describe('Course API', () => {
    beforeAll(async () => {
        // Connect to the in-memory MongoDB database
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        // Close the connection to the in-memory MongoDB database
        await mongoose.connection.close();
    });

    afterEach(async () => {
        // Clear all entries after each test
        await Course.deleteMany();
    });


    describe('POST /courses/add', () => {
        it('should create a new course', async () => {
            const newCourse = {
                courseName: 'Test Course',
                courseCode: 'TC101',
                courseDescription: 'A test course',
                primaryInstructorname: 'Instructor Name',
                instructorEmail: 'instructor@example.com',
                schedule: {
                    classDays: ['Monday', 'Wednesday'],
                    classTime: '10:00 AM - 11:30 AM',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                },
                courseObjectives: 'Test objectives',
                supplementaryMaterials: 'Some materials',
                onlineResources: 'Some resources'
            };

            const response = await request(app)
                .post('/courses/add')
                .send(newCourse)
                .expect(200);

            expect(response.body.course).toHaveProperty('_id');
            expect(response.body.course.courseName).toBe('Test Course');
        });

        it('should return an error for invalid data', async () => {
            const invalidCourse = {
                courseName: '', // Invalid empty name
                courseCode: 'TC101',
                courseDescription: 'A test course',
                primaryInstructorname: 'Instructor Name',
                instructorEmail: 'invalid-email', // Invalid email
            };

            const response = await request(app)
                .post('/courses/add')
                .send(invalidCourse)
                .expect(400);

            expect(response.body.message).toBeDefined();
        });
    });

    describe('GET /courses/get', () => {
        it('should return all courses', async () => {
            await Course.create([
                { courseName: 'Course 1', courseCode: 'C1', courseDescription: 'Desc 1', primaryInstructorname: 'Instructor 1', instructorEmail: 'instructor1@example.com', schedule: {}, courseObjectives: 'Objectives 1' },
                { courseName: 'Course 2', courseCode: 'C2', courseDescription: 'Desc 2', primaryInstructorname: 'Instructor 2', instructorEmail: 'instructor2@example.com', schedule: {}, courseObjectives: 'Objectives 2' }
            ]);

            const response = await request(app)
                .get('/courses/get')
                .expect(200);

            expect(response.body.courses.length).toBe(2);
            expect(response.body.count).toBe(2);
        });
    });

    describe('GET /courses/get/:id', () => {
        it('should return a course by ID', async () => {
            const course = await Course.create({
                courseName: 'Course 1',
                courseCode: 'C1',
                courseDescription: 'Desc 1',
                primaryInstructorname: 'Instructor 1',
                instructorEmail: 'instructor1@example.com',
                schedule: {},
                courseObjectives: 'Objectives 1'
            });

            const response = await request(app)
                .get(`/courses/get/${course._id}`)
                .expect(200);

            expect(response.body.courseName).toBe('Course 1');
        });

        it('should return 404 for non-existent course', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .get(`/courses/get/${nonExistentId}`)
                .expect(404);

            expect(response.body).toBe('Course not found');
        });
    });

    describe('PUT /courses/update/:id', () => {
        it('should update a course by ID', async () => {
            const course = await Course.create({
                courseName: 'Course 1',
                courseCode: 'C1',
                courseDescription: 'Desc 1',
                primaryInstructorname: 'Instructor 1',
                instructorEmail: 'instructor1@example.com',
                schedule: {},
                courseObjectives: 'Objectives 1'
            });

            const updatedData = {
                courseName: 'Updated Course 1'
            };

            const response = await request(app)
                .put(`/courses/update/${course._id}`)
                .send(updatedData)
                .expect(200);

            expect(response.body.courseName).toBe('Updated Course 1');
        });

        it('should return 404 for non-existent course', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const updatedData = {
                courseName: 'Updated Course'
            };

            const response = await request(app)
                .put(`/courses/update/${nonExistentId}`)
                .send(updatedData)
                .expect(404);

            expect(response.body.error).toBe('Course not found');
        });
    });

    describe('DELETE /courses/delete/:id', () => {
        it('should delete a course by ID', async () => {
            const course = await Course.create({
                courseName: 'Course 1',
                courseCode: 'C1',
                courseDescription: 'Desc 1',
                primaryInstructorname: 'Instructor 1',
                instructorEmail: 'instructor1@example.com',
                schedule: {},
                courseObjectives: 'Objectives 1'
            });

            const response = await request(app)
                .delete(`/courses/delete/${course._id}`)
                .expect(200);

            expect(response.body.course).toBeDefined();
            expect(response.body.message).toContain('The total number of courses is: 0');
        });

        it('should return 404 for non-existent course', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const response = await request(app)
                .delete(`/courses/delete/${nonExistentId}`)
                .expect(404);

            expect(response.body).toBe('Course not found');
        });
    });

    describe('GET /courses/count', () => {
        it('should return the total number of courses', async () => {
            await Course.create({
                courseName: 'Course 1',
                courseCode: 'C1',
                courseDescription: 'Desc 1',
                primaryInstructorname: 'Instructor 1',
                instructorEmail: 'instructor1@example.com',
                schedule: {},
                courseObjectives: 'Objectives 1'
            });

            const response = await request(app)
                .get('/courses/count')
                .expect(200);

            expect(response.body.message).toContain('The total number of courses is: 1');
        });
    });



    describe('GET /courses/courses-with-live-classes', () => {
        it('should return courses with populated live classes', async () => {
            const liveClass = await LiveClass.create({
                topic: 'Sample Topic',
                section: 'A',
                liveRoom: 'Room 101',
                date: new Date(),
                time: '10:00 AM',
                duration: '60 mins',
                assignTo: 'Teacher ID',
                noteToStudents: 'Bring materials',
                courseId: new mongoose.Types.ObjectId()
            });

            const course = await Course.create({
                courseName: 'Course 1',
                courseCode: 'C1',
                courseDescription: 'Desc 1',
                primaryInstructorname: 'Instructor 1',
                instructorEmail: 'instructor1@example.com',
                schedule: {},
                courseObjectives: 'Objectives 1',
                liveClasses: [liveClass._id]
            });

            const response = await request(app)
                .get('/courses/courses-with-live-classes')
                .expect(200);

            expect(response.body[0].liveClasses.length).toBe(1);
            expect(response.body[0].liveClasses[0]._id).toBe(liveClass._id.toString());
        });
    });

    {/*describe('POST /courses/import', () => {
        it('should import courses from an Excel file', async () => {
            // Mock the uploaded Excel file with sample data
            const workbook = xlsx.utils.book_new();
            const worksheetData = [
                {
                    courseName: 'Course 1',
                    courseCode: 'C1',
                    courseDescription: 'Desc 1',
                    primaryInstructorname: 'Instructor 1',
                    instructorEmail: 'instructor1@example.com',
                    classDays: 'Monday,Wednesday',
                    classTime: '10:00 AM - 11:30 AM',
                    startDate: '2024-01-01',
                    endDate: '2024-12-31',
                    courseObjectives: 'Objectives 1',
                    supplementaryMaterials: 'Materials 1',
                    onlineResources: 'Resources 1',
                },
                {
                    courseName: 'Course 2',
                    courseCode: 'C2',
                    courseDescription: 'Desc 2',
                    primaryInstructorname: 'Instructor 2',
                    instructorEmail: 'instructor2@example.com',
                    classDays: 'Tuesday,Thursday',
                    classTime: '1:00 PM - 2:30 PM',
                    startDate: '2024-02-01',
                    endDate: '2024-11-30',
                    courseObjectives: 'Objectives 2',
                    supplementaryMaterials: 'Materials 2',
                    onlineResources: 'Resources 2',
                },
            ];

            const worksheet = xlsx.utils.json_to_sheet(worksheetData);
            xlsx.utils.book_append_sheet(workbook, worksheet, 'Courses');
            const excelFilePath = '/tmp/courses.xlsx';
            xlsx.writeFile(workbook, excelFilePath);

            const response = await request(app)
                .post('/courses/import')
                .attach('file', excelFilePath)
                .expect(200);

            expect(response.body.message).toBe('Courses imported successfully.');
            expect(response.body.courses.length).toBe(2);
        });
    });
    */}
});


