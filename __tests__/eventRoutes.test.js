// tests/eventRoutes.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Event = require('../Models/Event'); // Ensure this path is correct
const Teacher = require('../Models/TeacherDetails'); // Ensure this path is correct
const Staff = require('../Models/StaffDetails'); // Ensure this path is correct
const eventRouter = require('../routes/eventroutes'); // Ensure this path is correct

const app = express();
app.use(express.json());
app.use('/events', eventRouter);

describe('Event API', () => {
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
        await Event.deleteMany();
        await Teacher.deleteMany();
        await Staff.deleteMany();
    });

    test('should create a new event with a teacher as organizer', async () => {
        const teacher = await Teacher.create({
            name: 'Mr. Smith',
            teacherID: 'T123',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'mrsmith@example.com',
            aadharNumber: '123456789012', // Valid 12-digit Aadhar number
            address: '123 Main St, City, Country',
            subjectTaught: 'Mathematics',
            gradeLevelTaught: '10th Grade',
            department: 'Science',
            highestDegreeEarned: 'M.Sc. Mathematics',
            instituteName: 'University of Education',
            yearOfGraduation: 2005,
            emergencyContact: {
                name: 'Mrs. Smith',
                relation: 'Spouse',
                contactNumber: '0987654321'
            },
            parent: {
                fatherName: 'John Smith',
                fatherContactNumber: '1122334455',
                fatherAadharNumber: '111122223333',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Smith',
                motherContactNumber: '5566778899',
                motherAadharNumber: '444455556666',
                motherOccupation: 'Doctor',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, Country'
            },
            password: 'Password123!',
        });

        const newEvent = {
            eventName: 'Science Fair',
            eventDate: new Date(),
            eventTime: '10:00 AM',
            description: 'Annual Science Fair',
            organizerId: teacher._id.toString(),
            organizerModel: 'TeacherDetail',
        };

        const response = await request(app)
            .post('/events/add')
            .send(newEvent)
            .expect(201);

        expect(response.body.eventName).toBe('Science Fair');
        expect(response.body.organizerName).toBe('Mr. Smith');
    });

    test('should create a new event with a staff member as organizer', async () => {
        const staff = await Staff.create({
            name: 'Mrs. Johnson',
            staffID: 'S456',
            dateOfBirth: new Date('1975-05-15'),
            gender: 'Female',
            contactNumber: '9876543210',
            email: 'mrsjohnson@example.com',
            aadharNumber: '987654321098', // Valid 12-digit Aadhar number
            address: '456 Elm St, City, Country',
            education: 'B.A. English',
            position: 'Administrator',
            employmentType: 'Full-Time',
            emergencyContact: {

                contactNumber: '1234567890',
                relationship: 'Uncle'
            },
            nationality: 'Indian',
            languageSpoken: 'English',
        });

        const newEvent = {
            eventName: 'Sports Day',
            eventDate: new Date(),
            eventTime: '2:00 PM',
            description: 'Annual Sports Day',
            organizerId: staff._id.toString(),
            organizerModel: 'StaffDetail',
        };

        const response = await request(app)
            .post('/events/add')
            .send(newEvent)
            .expect(201);

        expect(response.body.eventName).toBe('Sports Day');
        expect(response.body.organizerName).toBe('Mrs. Johnson');
    });

    test('should return 400 for invalid organizer model', async () => {
        const response = await request(app)
            .post('/events/add')
            .send({
                eventName: 'Math Contest',
                eventDate: new Date(),
                eventTime: '11:00 AM',
                description: 'Math Contest Description',
                organizerId: new mongoose.Types.ObjectId().toString(),
                organizerModel: 'InvalidModel',
            })
            .expect(400);

        expect(response.body.error).toBe('Invalid organizer model');
    });

    test('should return 404 for non-existent organizer', async () => {
        const response = await request(app)
            .post('/events/add')
            .send({
                eventName: 'Math Contest',
                eventDate: new Date(),
                eventTime: '11:00 AM',
                description: 'Math Contest Description',
                organizerId: new mongoose.Types.ObjectId().toString(),
                organizerModel: 'TeacherDetail',
            })
            .expect(404);

        expect(response.body.error).toBe('Organizer not found');
    });

    test('should get all events', async () => {
        const teacher = await Teacher.create({
            name: 'Mr. Smith',
            teacherID: 'T123',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'mrsmith@example.com',
            aadharNumber: '123456789012', // Valid 12-digit Aadhar number
            address: '123 Main St, City, Country',
            subjectTaught: 'Mathematics',
            gradeLevelTaught: '10th Grade',
            department: 'Science',
            highestDegreeEarned: 'M.Sc. Mathematics',
            instituteName: 'University of Education',
            yearOfGraduation: 2005,
            emergencyContact: {
                name: 'Mrs. Smith',
                relation: 'Spouse',
                contactNumber: '0987654321'
            },
            parent: {
                fatherName: 'John Smith',
                fatherContactNumber: '1122334455',
                fatherAadharNumber: '111122223333',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Smith',
                motherContactNumber: '5566778899',
                motherAadharNumber: '444455556666',
                motherOccupation: 'Doctor',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, Country'
            },
            password: 'Password123!',
        });
        await Event.create({
            eventName: 'Art Exhibition',
            eventDate: new Date(),
            eventTime: '1:00 PM',
            description: 'Art Exhibition Description',
            organizerName: teacher.name,
            organizerId: teacher._id,
            organizerModel: 'TeacherDetail',
        });

        const response = await request(app)
            .get('/events/get')
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].eventName).toBe('Art Exhibition');
    });

    test('should get an event by ID', async () => {
        const teacher = await Teacher.create({
            name: 'Mr. Smith',
            teacherID: 'T123',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'mrsmith@example.com',
            aadharNumber: '123456789012', // Valid 12-digit Aadhar number
            address: '123 Main St, City, Country',
            subjectTaught: 'Mathematics',
            gradeLevelTaught: '10th Grade',
            department: 'Science',
            highestDegreeEarned: 'M.Sc. Mathematics',
            instituteName: 'University of Education',
            yearOfGraduation: 2005,
            emergencyContact: {
                name: 'Mrs. Smith',
                relation: 'Spouse',
                contactNumber: '0987654321'
            },
            parent: {
                fatherName: 'John Smith',
                fatherContactNumber: '1122334455',
                fatherAadharNumber: '111122223333',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Smith',
                motherContactNumber: '5566778899',
                motherAadharNumber: '444455556666',
                motherOccupation: 'Doctor',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, Country'
            },
            password: 'Password123!',
        });
        const event = await Event.create({
            eventName: 'Music Concert',
            eventDate: new Date(),
            eventTime: '3:00 PM',
            description: 'Music Concert Description',
            organizerName: teacher.name,
            organizerId: teacher._id,
            organizerModel: 'TeacherDetail',
        });

        const response = await request(app)
            .get(`/events/get/${event._id}`)
            .expect(200);

        expect(response.body.eventName).toBe('Music Concert');
    });

    test('should return 404 for non-existent event by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .get(`/events/get/${fakeId}`)
            .expect(404);
    });

    test('should update an event', async () => {
        const teacher = await Teacher.create({
            name: 'Mr. Smith',
            teacherID: 'T123',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'mrsmith@example.com',
            aadharNumber: '123456789012', // Valid 12-digit Aadhar number
            address: '123 Main St, City, Country',
            subjectTaught: 'Mathematics',
            gradeLevelTaught: '10th Grade',
            department: 'Science',
            highestDegreeEarned: 'M.Sc. Mathematics',
            instituteName: 'University of Education',
            yearOfGraduation: 2005,
            emergencyContact: {
                name: 'Mrs. Smith',
                relation: 'Spouse',
                contactNumber: '0987654321'
            },
            parent: {
                fatherName: 'John Smith',
                fatherContactNumber: '1122334455',
                fatherAadharNumber: '111122223333',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Smith',
                motherContactNumber: '5566778899',
                motherAadharNumber: '444455556666',
                motherOccupation: 'Doctor',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, Country'
            },
            password: 'Password123!',
        });
        const event = await Event.create({
            eventName: 'History Lecture',
            eventDate: new Date(),
            eventTime: '4:00 PM',
            description: 'History Lecture Description',
            organizerName: teacher.name,
            organizerId: teacher._id,
            organizerModel: 'TeacherDetail',
        });

        const response = await request(app)
            .put(`/events/update/${event._id}`)
            .send({
                eventName: 'Updated History Lecture',
                eventTime: '5:00 PM',
            })
            .expect(200);

        expect(response.body.eventName).toBe('Updated History Lecture');
        expect(response.body.eventTime).toBe('5:00 PM');
    });

    test('should delete an event', async () => {
        const teacher = await Teacher.create({
            name: 'Mr. Smith',
            teacherID: 'T123',
            dateOfBirth: new Date('1980-01-01'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'mrsmith@example.com',
            aadharNumber: '123456789012', // Valid 12-digit Aadhar number
            address: '123 Main St, City, Country',
            subjectTaught: 'Mathematics',
            gradeLevelTaught: '10th Grade',
            department: 'Science',
            highestDegreeEarned: 'M.Sc. Mathematics',
            instituteName: 'University of Education',
            yearOfGraduation: 2005,
            emergencyContact: {
                name: 'Mrs. Smith',
                relation: 'Spouse',
                contactNumber: '0987654321'
            },
            parent: {
                fatherName: 'John Smith',
                fatherContactNumber: '1122334455',
                fatherAadharNumber: '111122223333',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Smith',
                motherContactNumber: '5566778899',
                motherAadharNumber: '444455556666',
                motherOccupation: 'Doctor',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, Country'
            },
            password: 'Password123!',
        });
        const event = await Event.create({
            eventName: 'Philosophy Seminar',
            eventDate: new Date(),
            eventTime: '6:00 PM',
            description: 'Philosophy Seminar Description',
            organizerName: teacher.name,
            organizerId: teacher._id,
            organizerModel: 'TeacherDetail',
        });

        const response = await request(app)
            .delete(`/events/delete/${event._id}`)
            .expect(200);

        expect(response.body.message).toBe('Event deleted successfully');

        const count = await Event.countDocuments();
        expect(count).toBe(0);
    });


});
