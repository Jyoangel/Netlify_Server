// subjectRoutes.test.js

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const subjectRoutes = require('../routes/subjectroutes'); // Adjust the path if needed
const Subject = require('../Models/Subject');

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/subjects', subjectRoutes);

describe('Subject API', () => {
    // Connect to the in-memory MongoDB before running tests
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    // Clean up the database after each test
    afterEach(async () => {
        await Subject.deleteMany({});
    });

    // Disconnect from the database after all tests
    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    // Test for adding a subject
    describe('POST /subjects/add', () => {
        it('should create a new subject', async () => {
            const response = await request(app)
                .post('/subjects/add')
                .send({ class: '10th Grade', subject: 'Mathematics' });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.class).toBe('10th Grade');
            expect(response.body.subject).toBe('Mathematics');
            expect(response.body.date).toBeDefined();
            expect(response.body.time).toBeDefined();
        });

        it('should not create a subject with invalid data', async () => {
            const response = await request(app).post('/subjects/add').send({});

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('message');
        });
    });

    // Test for retrieving all subjects
    describe('GET /subjects/get', () => {
        it('should get all subjects', async () => {
            const subject1 = new Subject({ class: '10th Grade', subject: 'Science' });
            const subject2 = new Subject({ class: '10th Grade', subject: 'English' });
            await subject1.save();
            await subject2.save();

            const response = await request(app).get('/subjects/get');

            expect(response.statusCode).toBe(200);
            expect(response.body.subjects).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });
    });

    // Test for retrieving a subject by ID
    describe('GET /subjects/get/:id', () => {
        it('should get a subject by ID', async () => {
            const newSubject = new Subject({ class: '10th Grade', subject: 'History' });
            await newSubject.save();

            const response = await request(app).get(`/subjects/get/${newSubject._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.class).toBe('10th Grade');
            expect(response.body.subject).toBe('History');
        });

        it('should return 404 if subject not found', async () => {
            const response = await request(app).get('/subjects/get/507f1f77bcf86cd799439011');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Subject not found');
        });
    });

    // Test for updating a subject
    describe('PUT /subjects/update/:id', () => {
        it('should update a subject by ID', async () => {
            const newSubject = new Subject({ class: '10th Grade', subject: 'Geography' });
            await newSubject.save();

            const response = await request(app)
                .put(`/subjects/update/${newSubject._id}`)
                .send({ subject: 'Geography - Advanced' });

            expect(response.statusCode).toBe(200);
            expect(response.body.subject).toBe('Geography - Advanced');
        });

        it('should return 404 if subject not found', async () => {
            const response = await request(app)
                .put('/subjects/update/507f1f77bcf86cd799439011')
                .send({ subject: 'Physics' });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Subject not found');
        });
    });

    // Test for deleting a subject
    describe('DELETE /subjects/delete/:id', () => {
        it('should delete a subject by ID', async () => {
            const newSubject = new Subject({ class: '10th Grade', subject: 'Biology' });
            await newSubject.save();

            const response = await request(app).delete(`/subjects/delete/${newSubject._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Subject deleted');
        });

        it('should return 404 if subject not found', async () => {
            const response = await request(app).delete('/subjects/delete/507f1f77bcf86cd799439011');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Subject not found');
        });
    });
});
