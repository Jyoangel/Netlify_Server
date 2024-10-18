const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const transportationRouter = require('../routes/transpotation'); // Adjust the path if needed
const Transportation = require('../Models/Transpotation'); // Adjust the path if needed

const app = express();
app.use(express.json());
app.use('/transportation', transportationRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
    await Transportation.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Transportation API', () => {
    test('should add a new transportation record', async () => {
        const newRecord = {
            studentName: 'John Doe',
            rollNo: '123',
            class: '10',
            fatherName: 'James Doe',
            fatherContactNumber: '1234567890',
            pickupLocation: 'Main Street',
            dropLocation: 'School',
            transportationFee: 100,
        };

        const response = await request(app).post('/transportation/add').send(newRecord);

        expect(response.status).toBe(201);
        expect(response.body.studentName).toBe(newRecord.studentName);
        expect(response.body).toHaveProperty('_id');
    });

    test('should not add a transportation record with missing fields', async () => {
        const incompleteRecord = {
            studentName: 'Jane Doe',
            // Missing rollNo and other required fields
        };

        const response = await request(app).post('/transportation/add').send(incompleteRecord);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test('should get all transportation records', async () => {
        const record1 = new Transportation({
            studentName: 'John Doe',
            rollNo: '123',
            class: '10',
            fatherName: 'James Doe',
            fatherContactNumber: '1234567890',
            pickupLocation: 'Main Street',
            dropLocation: 'School',
            transportationFee: 100,
        });

        const record2 = new Transportation({
            studentName: 'Alice Smith',
            rollNo: '124',
            class: '10',
            fatherName: 'Bob Smith',
            fatherContactNumber: '0987654321',
            pickupLocation: 'Park Avenue',
            dropLocation: 'School',
            transportationFee: 150,
        });

        await record1.save();
        await record2.save();

        const response = await request(app).get('/transportation/get');

        expect(response.status).toBe(200);
        expect(response.body.records).toHaveLength(2);
        expect(response.body.count).toBe(2);
    });

    test('should get a transportation record by ID', async () => {
        const record = new Transportation({
            studentName: 'John Doe',
            rollNo: '123',
            class: '10',
            fatherName: 'James Doe',
            fatherContactNumber: '1234567890',
            pickupLocation: 'Main Street',
            dropLocation: 'School',
            transportationFee: 100,
        });

        await record.save();

        const response = await request(app).get(`/transportation/get/${record._id}`);

        expect(response.status).toBe(200);
        expect(response.body.studentName).toBe('John Doe');
    });

    test('should return 404 if transportation record not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/transportation/get/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Record not found');
    });

    test('should update a transportation record by ID', async () => {
        const record = new Transportation({
            studentName: 'John Doe',
            rollNo: '123',
            class: '10',
            fatherName: 'James Doe',
            fatherContactNumber: '1234567890',
            pickupLocation: 'Main Street',
            dropLocation: 'School',
            transportationFee: 100,
        });

        await record.save();

        const updateData = {
            transportationFee: 200,
        };

        const response = await request(app).put(`/transportation/update/${record._id}`).send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.transportationFee).toBe(200);
    });

    test('should return 404 when updating a non-existent transportation record', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).put(`/transportation/update/${nonExistentId}`).send({ transportationFee: 200 });

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Record not found');
    });

    test('should delete a transportation record by ID', async () => {
        const record = new Transportation({
            studentName: 'John Doe',
            rollNo: '123',
            class: '10',
            fatherName: 'James Doe',
            fatherContactNumber: '1234567890',
            pickupLocation: 'Main Street',
            dropLocation: 'School',
            transportationFee: 100,
        });

        await record.save();

        const response = await request(app).delete(`/transportation/delete/${record._id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Record deleted');
    });


});
