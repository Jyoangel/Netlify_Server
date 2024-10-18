const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const Calendar = require('../Models/Calendar');
const calendarRoutes = require('../routes/calendarroutes');

const app = express();
app.use(express.json());
app.use('/api/calendar', calendarRoutes);

// Connect to the in-memory MongoDB before running tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

// Clean up the database after each test
afterEach(async () => {
    await Calendar.deleteMany({});
});

// Disconnect from the database after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

// Test POST /api/calendar/add
describe('POST /api/calendar/add', () => {
    it('should create a new calendar event and return it', async () => {
        const newEvent = {
            type: 'Meeting',
            title: 'Project Kickoff',
            date: '2024-08-15T00:00:00.000Z',
            startTime: '10:00',
            endTime: '11:00',
            duration: '1 hour',
        };

        const response = await request(app)
            .post('/api/calendar/add')
            .send(newEvent)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.type).toBe('Meeting');
        expect(response.body.title).toBe('Project Kickoff');
    });

    it('should return 400 if required fields are missing', async () => {
        const newEvent = {
            type: 'Meeting',
            title: 'Project Kickoff',
            // Missing date, startTime, endTime, and duration
        };

        const response = await request(app)
            .post('/api/calendar/add')
            .send(newEvent)
            .expect(400);

        expect(response.body.message).toBeDefined();
    });
});

// Test GET /api/calendar/get
describe('GET /api/calendar/get', () => {
    it('should retrieve all calendar events', async () => {
        await new Calendar({
            type: 'Meeting',
            title: 'Project Kickoff',
            date: '2024-08-15T00:00:00.000Z',
            startTime: '10:00',
            endTime: '11:00',
            duration: '1 hour',
        }).save();

        const response = await request(app)
            .get('/api/calendar/get')
            .expect(200);

        expect(response.body.length).toBeGreaterThan(0);
    });

    it('should return 400 if there is an error fetching events', async () => {
        jest.spyOn(Calendar, 'find').mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/api/calendar/get')
            .expect(400);

        expect(response.body.message).toBe('Database error');
    });
});

// Test GET /api/calendar/get/:id
// Test GET /api/calendar/get/:id
describe('GET /api/calendar/get/:id', () => {
    it('should retrieve a calendar event by ID', async () => {
        const event = await new Calendar({
            type: 'Meeting',
            title: 'Project Kickoff',
            date: '2024-08-15T00:00:00.000Z',
            startTime: '10:00',
            endTime: '11:00',
            duration: '1 hour',
        }).save();

        const response = await request(app)
            .get(`/api/calendar/get/${event._id}`)
            .expect(200);

        expect(response.body._id).toBe(event._id.toString());
    });

    it('should return 404 if the event is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .get(`/api/calendar/get/${invalidId}`)
            .expect(404);

        expect(response.body.message).toBe('Event not found');
    });
});

// Test PUT /api/calendar/update/:id
describe('PUT /api/calendar/update/:id', () => {
    it('should update a calendar event by ID', async () => {
        const event = await new Calendar({
            type: 'Meeting',
            title: 'Project Kickoff',
            date: '2024-08-15T00:00:00.000Z',
            startTime: '10:00',
            endTime: '11:00',
            duration: '1 hour',
        }).save();

        const updatedEvent = {
            type: 'Workshop',
            title: 'Tech Workshop',
            date: '2024-08-20T00:00:00.000Z',
            startTime: '14:00',
            endTime: '16:00',
            duration: '2 hours',
        };

        const response = await request(app)
            .put(`/api/calendar/update/${event._id}`)
            .send(updatedEvent)
            .expect(200);

        expect(response.body.type).toBe('Workshop');
        expect(response.body.title).toBe('Tech Workshop');
    });

    it('should return 404 if the event to update is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .put(`/api/calendar/update/${invalidId}`)
            .send({ type: 'Workshop' })
            .expect(404);

        expect(response.body.message).toBe('Event not found');
    });
});

// Test DELETE /api/calendar/delete/:id
describe('DELETE /api/calendar/delete/:id', () => {
    it('should delete a calendar event by ID', async () => {
        // Create a new event and get its ID
        const event = await new Calendar({
            type: 'Meeting',
            title: 'Project Kickoff',
            date: '2024-08-15T00:00:00.000Z',
            startTime: '10:00',
            endTime: '11:00',
            duration: '1 hour',
        }).save();

        // Delete the event by ID
        const response = await request(app)
            .delete(`/api/calendar/delete/${event._id}`)
            .expect(200); // Expecting 200 OK

        expect(response.body.message).toBe('Event deleted successfully');

        // Verify that the event was indeed deleted
        const deletedEvent = await Calendar.findById(event._id);
        expect(deletedEvent).toBeNull();
    });

    it('should return 404 if the event to delete is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .delete(`/api/calendar/delete/${invalidId}`)
            .expect(404);

        expect(response.body.message).toBe('Event not found');
    });
});