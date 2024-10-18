const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const Homework = require('../Models/HomeWork'); // Ensure the correct path

app.use(express.json());
app.use('/api/homework', require('../routes/homeworkroutes')); // Ensure the correct path

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
    // Clean up the database after each test
    await Homework.deleteMany({});
});

afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
});

describe('Homework API', () => {
    // Test POST /api/homework/add
    describe('POST /api/homework/add', () => {
        it('should create a new homework entry', async () => {
            const newHomework = {
                class: '10',
                subjects: 'Mathematics',
                chapter: 'Algebra',
                homework: 'Solve problems from the textbook',
                submissionMethod: 'Online',
                startDate: '2024-08-01T00:00:00.000Z',
                endDate: '2024-08-10T00:00:00.000Z',
                assignTo: 'John Doe',
                attachments: 'None',
                description: 'Math homework for Chapter 2',
                homeworkDone: 1,
                undoneHomework: 0 // Ensure this is a number
            };

            const response = await request(app)
                .post('/api/homework/add')
                .send(newHomework)
                .expect(201);

            expect(response.body.homework).toBeDefined();
            expect(response.body.count).toBe(1);

            // Store _id directly from response body for subsequent tests
            const homeworkId = response.body.homework._id.toString();

            // Test GET /api/homework/get/:id
            const getResponse = await request(app)
                .get(`/api/homework/get/${homeworkId}`)
                .expect(200);

            expect(getResponse.body._id).toBe(homeworkId);

            // Test PUT /api/homework/update/:id
            const updatedHomework = {
                class: '10',
                subjects: 'Mathematics',
                chapter: 'Geometry',
                homework: 'Read Chapter 3',
                submissionMethod: 'In-person',
                startDate: '2024-08-05T00:00:00.000Z',
                endDate: '2024-08-15T00:00:00.000Z',
                assignTo: 'John Doe',
                attachments: 'Worksheet',
                description: 'Geometry homework',
                homeworkDone: 1,
                undoneHomework: 0 // Ensure this is a number
            };

            const putResponse = await request(app)
                .put(`/api/homework/update/${homeworkId}`)
                .send(updatedHomework)
                .expect(200);

            expect(putResponse.body.chapter).toBe('Geometry');
            expect(putResponse.body.homework).toBe('Read Chapter 3');

            // Test DELETE /api/homework/delete/:id
            const deleteResponse = await request(app)
                .delete(`/api/homework/delete/${homeworkId}`)
                .expect(200);

            expect(deleteResponse.body.homework).toBeDefined();
            expect(deleteResponse.body.count).toBe(0);
        });
    });
});
