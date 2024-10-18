const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const StudentDetail = require('../Models/StudentDetails');
const Communication = require('../Models/Communication');
const Message = require('../Models/Message');
const studentRouter = require('../routes/studentroutes');


jest.mock('nodemailer');
jest.mock('twilio');

const nodemailer = require('nodemailer');
nodemailer.createTransport.mockReturnValue({
    sendMail: jest.fn((options, callback) => {
        callback(null, { response: '250 Message sent' });
    }),
});

// Mock Twilio client
const twilio = require('twilio');
twilio.mockImplementation(() => ({
    messages: {
        create: jest.fn().mockResolvedValue({ sid: 'SM123' }),
    },
}));

const app = express();
app.use(express.json());
app.use('/students', studentRouter);

describe('Student API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await StudentDetail.deleteMany({});
        await Communication.deleteMany({});
        await Message.deleteMany({});
    });

    describe('POST /students/add', () => {
        it('should add a new student', async () => {
            const newStudent = {
                studentID: 'S1001',
                formNumber: 'F001',
                admissionNumber: 'A001',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'Hindi',
                dateOfBirth: '2005-08-15',
                gender: 'Male',
                religion: 'Hindu',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                address: '123 Main St',
                parent: {
                    fatherName: 'Jane Doe',
                    fatherContactNumber: '9876543210',
                    fatherAadharNumber: '123456789012',
                    fatherOccupation: 'Engineer',
                    motherName: 'Mary Doe',
                    motherContactNumber: '9876543211',
                    motherAadharNumber: '123456789013',
                    motherOccupation: 'Teacher',
                    annualIncome: 100000,
                    parentAddress: '123 Main St'
                },
                localGuardian: {
                    guardianName: 'Robert Smith',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543212',
                    guardianAadharNumber: '123456789014',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St'
                }
            };

            const response = await request(app)
                .post('/students/add')
                .send(newStudent);

            expect(response.status).toBe(201);
            expect(response.body.student.studentID).toBe('S1001');
            expect(response.body.message).toMatch(/total number of students is: 1/i);
        });

        it('should not add a student with missing required fields', async () => {
            const newStudent = {
                studentID: 'S1002',
                // Missing formNumber, admissionNumber, and other fields
            };

            const response = await request(app)
                .post('/students/add')
                .send(newStudent);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('GET /students/get', () => {
        it('should get all students', async () => {
            const student = new StudentDetail({
                studentID: 'S1001',
                formNumber: 'F001',
                admissionNumber: 'A001',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'Hindi',
                dateOfBirth: '2005-08-15',
                gender: 'Male',
                religion: 'Hindu',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                address: '123 Main St',
                parent: {
                    fatherName: 'Jane Doe',
                    fatherContactNumber: '9876543210',
                    fatherAadharNumber: '123456789012',
                    fatherOccupation: 'Engineer',
                    motherName: 'Mary Doe',
                    motherContactNumber: '9876543211',
                    motherAadharNumber: '123456789013',
                    motherOccupation: 'Teacher',
                    annualIncome: 100000,
                    parentAddress: '123 Main St'
                },
                localGuardian: {
                    guardianName: 'Robert Smith',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543212',
                    guardianAadharNumber: '123456789014',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St'
                }
            });
            await student.save();

            const response = await request(app).get('/students/get');

            expect(response.status).toBe(200);
            expect(response.body.students.length).toBe(1);
            expect(response.body.students[0].name).toBe('John Doe');
        });
    });

    describe('PUT /students/update/:studentID', () => {
        it('should update a student by ID', async () => {
            const student = await StudentDetail.create({
                studentID: 'S12345',
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
                email: 'john.doe@example.com',
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

            const updatedData = {
                name: 'Jane Doe',
            };

            const res = await request(app)
                .put(`/students/update/${student.studentID}`)
                .send(updatedData);
            expect(res.statusCode).toEqual(200);
            expect(res.body.student).toHaveProperty('name', 'Jane Doe');
        });

        it('should return 404 for non-existent student', async () => {
            const res = await request(app)
                .put('/students/update/unknownID')
                .send({ name: 'Jane Doe' });
            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('error', 'Student not found');
        });
    });


    describe('DELETE /students/delete/:id', () => {
        it('should delete a student by ID', async () => {
            const student = new StudentDetail({
                studentID: 'S1001',
                formNumber: 'F001',
                admissionNumber: 'A001',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'Hindi',
                dateOfBirth: '2005-08-15',
                gender: 'Male',
                religion: 'Hindu',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                address: '123 Main St',
                parent: {
                    fatherName: 'Jane Doe',
                    fatherContactNumber: '9876543210',
                    fatherAadharNumber: '123456789012',
                    fatherOccupation: 'Engineer',
                    motherName: 'Mary Doe',
                    motherContactNumber: '9876543211',
                    motherAadharNumber: '123456789013',
                    motherOccupation: 'Teacher',
                    annualIncome: 100000,
                    parentAddress: '123 Main St'
                },
                localGuardian: {
                    guardianName: 'Robert Smith',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543212',
                    guardianAadharNumber: '123456789014',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St'
                }
            });
            await student.save();

            const response = await request(app).delete(`/students/delete/${student._id}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Student deleted successfully');
        });

        it('should return 404 if student not found', async () => {
            const response = await request(app).delete('/students/delete/64cd5ccbd3b5e9bbf7cabc12');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Student not found');
        });
    });

    describe('PUT /students/selectStudent/:studentId', () => {
        it('should update the selected status of a student', async () => {
            const student = await Communication.create({
                studentID: 'S12345',
                name: 'John Doe',
                dateOfBirth: '2005-08-15',
                class: '10',
                gender: 'Male',
                aadharNumber: '123456789012',
                fatherName: 'Jane Doe',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                selected: false,
            });

            const res = await request(app)
                .put(`/students/selectStudent/${student.studentID}`)
                .send({ selected: true });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('selected', true);

            const updatedStudent = await Communication.findOne({ studentID: student.studentID });
            expect(updatedStudent).toHaveProperty('selected', true);
        });

        it('should return 404 if the student is not found', async () => {
            const res = await request(app)
                .put('/students/selectStudent/unknownID')
                .send({ selected: true });

            expect(res.statusCode).toEqual(404);
            expect(res.body).toHaveProperty('message', 'Student not found');
        });

        it('should return 400 if selected field is not a boolean', async () => {
            const student = await Communication.create({
                studentID: 'S12345',
                name: 'John Doe',
                dateOfBirth: '2005-08-15',
                class: '10',
                gender: 'Male',
                aadharNumber: '123456789012',
                fatherName: 'Jane Doe',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                selected: false,
            });

            const res = await request(app)
                .put(`/students/selectStudent/${student.studentID}`)
                .send({ selected: 'yes' });

            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('message', 'Selected field must be a boolean');
        });
    });






    {/*
    describe('POST /students/selectStudent/:studentId', () => {
        it('should select a student', async () => {
            const student = new StudentDetail({
                studentID: 'S1001',
                formNumber: 'F001',
                admissionNumber: 'A001',
                class: '10',
                admissionType: 'Regular',
                name: 'John Doe',
                nationality: 'Indian',
                motherTongue: 'Hindi',
                dateOfBirth: '2005-08-15',
                gender: 'Male',
                religion: 'Hindu',
                caste: 'General',
                bloodGroup: 'O+',
                aadharNumber: '123456789012',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                address: '123 Main St',
                parent: {
                    fatherName: 'Jane Doe',
                    fatherContactNumber: '9876543210',
                    fatherAadharNumber: '123456789012',
                    fatherOccupation: 'Engineer',
                    motherName: 'Mary Doe',
                    motherContactNumber: '9876543211',
                    motherAadharNumber: '123456789013',
                    motherOccupation: 'Teacher',
                    annualIncome: 100000,
                    parentAddress: '123 Main St'
                },
                localGuardian: {
                    guardianName: 'Robert Smith',
                    relationWithStudent: 'Uncle',
                    guardianContactNumber: '9876543212',
                    guardianAadharNumber: '123456789014',
                    guardianOccupation: 'Doctor',
                    guardianAddress: '456 Elm St'
                }
            });
            await student.save();

            const selectedStudent = {
                studentID: 'S1001',
                name: 'John Doe',
                dateOfBirth: '2005-08-15',
                class: '10',
                gender: 'Male',
                aadharNumber: '123456789012',
                fatherName: 'Jane Doe',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                selected: true
            };

            const response = await request(app)
                .post('/students/selectStudent/${student.studentID}')
                .send(selectedStudent);

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Student selected successfully');
        });
    });

    describe('POST /students/sendMessages', () => {
        it('should send emails to selected students', async () => {
            const selectedStudent = new Communication({
                studentID: 'S1001',
                name: 'John Doe',
                dateOfBirth: '2005-08-15',
                class: '10',
                gender: 'Male',
                aadharNumber: '123456789012',
                fatherName: 'Jane Doe',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                selected: true
            });
            await selectedStudent.save();

            const message = new Message({
                subject: 'Test Subject',
                message: 'Test message content'
            });
            await message.save();

            nodemailer.createTransport.mockReturnValue({
                sendMail: jest.fn((mailOptions, callback) => {
                    callback(null, { response: 'Email sent successfully' });
                })
            });

            const response = await request(app)
                .post('/students/sendMessages')
                .send({ messageId: message._id });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Email sent successfully');
        });
    });

    describe('POST /students/sendSMS', () => {
        it('should send SMS messages to selected students', async () => {
            const selectedStudent = new Communication({
                studentID: 'S1001',
                name: 'John Doe',
                dateOfBirth: '2005-08-15',
                class: '10',
                gender: 'Male',
                aadharNumber: '123456789012',
                fatherName: 'Jane Doe',
                contactNumber: '9876543210',
                email: 'johndoe@example.com',
                selected: true
            });
            await selectedStudent.save();

            const message = new Message({
                subject: 'Test Subject',
                message: 'Test message content'
            });
            await message.save();

            twilio.mockReturnValue({
                messages: {
                    create: jest.fn(() => Promise.resolve({ sid: 'SM1234567890' }))
                }
            });

            const response = await request(app)
                .post('/students/sendSMS')
                .send({ messageId: message._id });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('SMS sent successfully');
        });
    });
    */}
});
