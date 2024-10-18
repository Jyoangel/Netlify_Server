// classRoutes.test.js

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const classRoutes = require('../routes/classroutes');
const Class = require('../Models/class');

// Setup express app for testing
const app = express();
app.use(express.json());
app.use('/classes', classRoutes);

describe('Class API', () => {
    // Connect to the in-memory MongoDB before running tests
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    // Clean up the database after each test
    afterEach(async () => {
        await Class.deleteMany({});
    });

    // Disconnect from the database after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test for adding a class
    describe('POST /classes/add', () => {
        it('should create a new class', async () => {
            const response = await request(app).post('/classes/add').send({ className: 'History 201' });

            expect(response.statusCode).toBe(201);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.className).toBe('History 201');
        });

        it('should not create a class with invalid data', async () => {
            const response = await request(app).post('/classes/add').send({});

            expect(response.statusCode).toBe(400);
            expect(response.body).toHaveProperty('error');
        });
    });

    // Test for updating a class
    describe('PUT /classes/update/:id', () => {
        it('should update class by ID', async () => {
            const newClass = new Class({ className: 'Chemistry 101' });
            await newClass.save();

            const response = await request(app).put(`/classes/update/${newClass._id}`).send({ className: 'Chemistry 102' });

            expect(response.statusCode).toBe(200);
            expect(response.body.className).toBe('Chemistry 102');
        });

        it('should return 404 if class not found', async () => {
            const response = await request(app).put('/classes/update/507f1f77bcf86cd799439011').send({ className: 'Physics 102' });

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Class not found');
        });
    });

    // Test for deleting a class
    describe('DELETE /classes/delete/:id', () => {
        it('should delete class by ID', async () => {
            const newClass = new Class({ className: 'Biology 101' });
            await newClass.save();

            const response = await request(app).delete(`/classes/delete/${newClass._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.message).toBe('Class deleted successfully');
        });

        it('should return 404 if class not found', async () => {
            const response = await request(app).delete('/classes/delete/507f1f77bcf86cd799439011');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Class not found');
        });
    });

    // Test for retrieving all classes
    describe('GET /classes/get', () => {
        it('should get all classes', async () => {
            const class1 = new Class({ className: 'Math 101' });
            const class2 = new Class({ className: 'English 102' });
            await class1.save();
            await class2.save();

            const response = await request(app).get('/classes/get');

            expect(response.statusCode).toBe(200);
            expect(response.body.classes).toHaveLength(2);
            expect(response.body.count).toBe(2);
        });
    });

    // Test for retrieving a class by ID
    describe('GET /classes/get/:id', () => {
        it('should get a class by ID', async () => {
            const newClass = new Class({ className: 'Physics 101' });
            await newClass.save();

            const response = await request(app).get(`/classes/get/${newClass._id}`);

            expect(response.statusCode).toBe(200);
            expect(response.body.className).toBe('Physics 101');
        });

        it('should return 404 if class not found', async () => {
            const response = await request(app).get('/classes/get/507f1f77bcf86cd799439011');

            expect(response.statusCode).toBe(404);
            expect(response.body.message).toBe('Class not found');
        });
    });
});
