const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Attendance = require('../Models/Attendance');
const StudentDetail = require('../Models/StudentDetails');
const attendanceRouter = require('../routes/attendanceroutes');

const app = express();
app.use(express.json());
app.use('/attendance', attendanceRouter);

describe('Attendance API', () => {
    let connection;
    let db;

    beforeAll(async () => {
        connection = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        db = mongoose.connection;
    });

    afterAll(async () => {
        await db.dropDatabase();
        await mongoose.disconnect();
    });

    beforeEach(async () => {
        await Attendance.deleteMany({});
        await StudentDetail.deleteMany({});
    });

    describe('POST /attendance/add', () => {
        it('should successfully add a new attendance record for an existing student', async () => {
            const student = new StudentDetail({
                studentID: '123456',
                formNumber: 'F12345',
                admissionNumber: 'A12345',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'English',
                dateOfBirth: '2005-01-01',
                gender: 'Male',
                religion: 'Christianity',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'john.de@example.com',
                address: '123 Main St, City, State',
                parent: {
                    fatherName: 'Robert Doe',
                    fatherContactNumber: '9876543211',
                    fatherAadharNumber: '123456789013',
                    fatherOccupation: 'Engineer',
                    motherName: 'Jane Doe',
                    motherContactNumber: '9876543212',
                    motherAadharNumber: '123456789014',
                    motherOccupation: 'Teacher',
                    annualIncome: 1000000,
                    parentAddress: '123 Main St, City, State'
                },
                localGuardian: {
                    guardianName: 'Uncle Joe',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543213',
                    guardianAadharNumber: '123456789015',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St, City, State'
                }
            });
            await student.save();

            const response = await request(app)
                .post('/attendance/add')
                .send({ studentID: '123456', present: true });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('studentId', student._id.toString());
            expect(response.body).toHaveProperty('present', true);
        });

        it('should return 404 if the student does not exist', async () => {
            const response = await request(app)
                .post('/attendance/add')
                .send({ studentID: 'nonexistent', present: true });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'Student not found');
        });


    });

    describe('GET /attendance/get', () => {
        it('should retrieve all attendance records with populated student details', async () => {
            const student = new StudentDetail({
                studentID: '123456',
                formNumber: 'F12345',
                admissionNumber: 'A12345',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'English',
                dateOfBirth: '2005-01-01',
                gender: 'Male',
                religion: 'Christianity',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'john.de@example.com',
                address: '123 Main St, City, State',
                parent: {
                    fatherName: 'Robert Doe',
                    fatherContactNumber: '9876543211',
                    fatherAadharNumber: '123456789013',
                    fatherOccupation: 'Engineer',
                    motherName: 'Jane Doe',
                    motherContactNumber: '9876543212',
                    motherAadharNumber: '123456789014',
                    motherOccupation: 'Teacher',
                    annualIncome: 1000000,
                    parentAddress: '123 Main St, City, State'
                },
                localGuardian: {
                    guardianName: 'Uncle Joe',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543213',
                    guardianAadharNumber: '123456789015',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St, City, State'
                }
            });
            await student.save();

            const attendance = new Attendance({
                studentId: student._id,
                present: true
            });
            await attendance.save();

            const response = await request(app).get('/attendance/get');

            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(1);
            expect(response.body[0]).toHaveProperty('present', true);
            expect(response.body[0].studentId).toHaveProperty('studentID', '123456');
        });

        it('should handle an empty database gracefully', async () => {
            const response = await request(app).get('/attendance/get');
            expect(response.statusCode).toBe(200);
            expect(response.body.length).toBe(0);
        });
    });

    describe('PUT /attendance/update/:id', () => {
        it('should successfully update an existing attendance record\'s present status', async () => {
            const student = new StudentDetail({
                studentID: '123456',
                formNumber: 'F12345',
                admissionNumber: 'A12345',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'English',
                dateOfBirth: '2005-01-01',
                gender: 'Male',
                religion: 'Christianity',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'john.de@example.com',
                address: '123 Main St, City, State',
                parent: {
                    fatherName: 'Robert Doe',
                    fatherContactNumber: '9876543211',
                    fatherAadharNumber: '123456789013',
                    fatherOccupation: 'Engineer',
                    motherName: 'Jane Doe',
                    motherContactNumber: '9876543212',
                    motherAadharNumber: '123456789014',
                    motherOccupation: 'Teacher',
                    annualIncome: 1000000,
                    parentAddress: '123 Main St, City, State'
                },
                localGuardian: {
                    guardianName: 'Uncle Joe',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543213',
                    guardianAadharNumber: '123456789015',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St, City, State'
                }
            });
            await student.save();

            const attendance = new Attendance({
                studentId: student._id,
                present: false
            });
            await attendance.save();

            const response = await request(app)
                .put(`/attendance/update/${attendance._id}`)
                .send({ present: true });

            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveProperty('present', true);
        });

        it('should return 404 if the attendance record does not exist', async () => {
            const response = await request(app)
                .put('/attendance/update/610c2f1e7a5f3c2c8c4a2d56')
                .send({ present: true });

            expect(response.statusCode).toBe(404);
            expect(response.body).toHaveProperty('message', 'Attendance record not found');
        });

        it('should return 400 if invalid data is provided', async () => {
            const student = new StudentDetail({
                studentID: '123456',
                formNumber: 'F12345',
                admissionNumber: 'A12345',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'English',
                dateOfBirth: '2005-01-01',
                gender: 'Male',
                religion: 'Christianity',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'john.de@example.com',
                address: '123 Main St, City, State',
                parent: {
                    fatherName: 'Robert Doe',
                    fatherContactNumber: '9876543211',
                    fatherAadharNumber: '123456789013',
                    fatherOccupation: 'Engineer',
                    motherName: 'Jane Doe',
                    motherContactNumber: '9876543212',
                    motherAadharNumber: '123456789014',
                    motherOccupation: 'Teacher',
                    annualIncome: 1000000,
                    parentAddress: '123 Main St, City, State'
                },
                localGuardian: {
                    guardianName: 'Uncle Joe',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543213',
                    guardianAadharNumber: '123456789015',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St, City, State'
                }
            });
            await student.save();

            const attendance = new Attendance({
                studentId: student._id,
                present: false
            });
            await attendance.save();

            const response = await request(app)
                .put(`/attendance/update/${attendance._id}`)
                .send({ present: 'invalid' });

            expect(response.statusCode).toBe(400);
        });
    });


});
