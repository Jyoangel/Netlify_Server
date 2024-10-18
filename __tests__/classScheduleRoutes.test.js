const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const ClassSchedule = require('../Models/ClassSchedule'); // Ensure this path is correct
const classScheduleRouter = require('../routes/classscheduleroutes'); // Ensure this path is correct

const app = express();
app.use(express.json());
app.use('/class-schedule', classScheduleRouter);

describe('Class Schedule API', () => {
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
        await ClassSchedule.deleteMany();
    });

    test('should add a new class schedule', async () => {
        const newSchedule = {
            subject: 'Math',
            startTime: '10:00 AM',
            endTime: '11:00 AM',
            day: 'Monday',
            period: '1',
        };

        const response = await request(app)
            .post('/class-schedule/add')
            .send(newSchedule)
            .expect(201);

        expect(response.body.message).toBe('Class schedule added successfully');

        const schedule = await ClassSchedule.findOne({ subject: 'Math' });
        expect(schedule).not.toBeNull();
        expect(schedule.subject).toBe('Math');
        expect(schedule.startTime).toBe('10:00 AM');
        expect(schedule.endTime).toBe('11:00 AM');
        expect(schedule.day).toBe('Monday');
        expect(schedule.period).toBe('1');
    });

    test('should retrieve all class schedules', async () => {
        await ClassSchedule.create({
            subject: 'Science',
            startTime: '11:00 AM',
            endTime: '12:00 PM',
            day: 'Tuesday',
            period: '2',
        });

        const response = await request(app)
            .get('/class-schedule/get')
            .expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].subject).toBe('Science');
        expect(response.body[0].startTime).toBe('11:00 AM');
        expect(response.body[0].endTime).toBe('12:00 PM');
        expect(response.body[0].day).toBe('Tuesday');
        expect(response.body[0].period).toBe('2');
    });

    test('should retrieve a class schedule by ID', async () => {
        const schedule = await ClassSchedule.create({
            subject: 'History',
            startTime: '12:00 PM',
            endTime: '1:00 PM',
            day: 'Wednesday',
            period: '3',
        });

        const response = await request(app)
            .get(`/class-schedule/get/${schedule._id}`)
            .expect(200);

        expect(response.body.subject).toBe('History');
        expect(response.body.startTime).toBe('12:00 PM');
        expect(response.body.endTime).toBe('1:00 PM');
        expect(response.body.day).toBe('Wednesday');
        expect(response.body.period).toBe('3');
    });

    test('should update a class schedule by ID', async () => {
        const schedule = await ClassSchedule.create({
            subject: 'Geography',
            startTime: '1:00 PM',
            endTime: '2:00 PM',
            day: 'Thursday',
            period: '4',
        });

        const updatedSchedule = {
            subject: 'Updated Geography',
            startTime: '2:00 PM',
            endTime: '3:00 PM',
            day: 'Friday',
            period: '5',
        };

        const response = await request(app)
            .put(`/class-schedule/update/${schedule._id}`)
            .send(updatedSchedule)
            .expect(200);

        expect(response.body.subject).toBe('Updated Geography');
        expect(response.body.startTime).toBe('2:00 PM');
        expect(response.body.endTime).toBe('3:00 PM');
        expect(response.body.day).toBe('Friday');
        expect(response.body.period).toBe('5');
    });

    test('should delete a class schedule by ID', async () => {
        const schedule = await ClassSchedule.create({
            subject: 'Physics',
            startTime: '2:00 PM',
            endTime: '3:00 PM',
            day: 'Friday',
            period: '6',
        });

        const response = await request(app)
            .delete(`/class-schedule/delete/${schedule._id}`)
            .expect(200);

        expect(response.body.schedule.subject).toBe('Physics');

        const count = await ClassSchedule.countDocuments();
        expect(count).toBe(0);
    });

    test('should return 404 when retrieving a non-existing class schedule by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .get(`/class-schedule/get/${fakeId}`)
            .expect(404);
    });

    test('should return 404 when updating a non-existing class schedule by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .put(`/class-schedule/update/${fakeId}`)
            .send({ subject: 'Non-existing' })
            .expect(404);
    });

    test('should return 404 when deleting a non-existing class schedule by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .delete(`/class-schedule/delete/${fakeId}`)
            .expect(404);
    });
});
