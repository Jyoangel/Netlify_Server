// tests/enquiryRoutes.test.js

const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Enquiry = require('../Models/Enquiry'); // Ensure this path is correct
const enquiryRouter = require('../routes/enquiryroutes'); // Ensure this path is correct

const app = express();
app.use(express.json());
app.use('/enquiries', enquiryRouter);

describe('Enquiry API', () => {
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
        await Enquiry.deleteMany();
    });

    test('should add a new enquiry', async () => {
        const newEnquiry = {
            name: 'John Doe',
            contactNumber: '1234567890',
            email: 'john.doe@example.com',
            enquiryRelated: 'Admission',
        };

        const response = await request(app)
            .post('/enquiries/add')
            .send(newEnquiry)
            .expect(201);

        expect(response.body.name).toBe('John Doe');
        expect(response.body.contactNumber).toBe('1234567890');
        expect(response.body.email).toBe('john.doe@example.com');
        expect(response.body.enquiryRelated).toBe('Admission');

        const enquiry = await Enquiry.findOne({ email: 'john.doe@example.com' });
        expect(enquiry).not.toBeNull();
    });

    test('should retrieve all enquiries', async () => {
        await Enquiry.create([
            {
                name: 'Alice',
                contactNumber: '0987654321',
                email: 'alice@example.com',
                enquiryRelated: 'Course',
            },
            {
                name: 'Bob',
                contactNumber: '1234567890',
                email: 'bob@example.com',
                enquiryRelated: 'Fee Structure',
            },
        ]);

        const response = await request(app)
            .get('/enquiries/get')
            .expect(200);

        // Sort the enquiries by name to ensure consistent order
        const sortedEnquiries = response.body.enquiries.sort((a, b) => a.name.localeCompare(b.name));

        expect(sortedEnquiries.length).toBe(2);
        expect(response.body.count).toBe(2);
        expect(sortedEnquiries[0].name).toBe('Alice');
        expect(sortedEnquiries[1].name).toBe('Bob');
    });


    test('should retrieve an enquiry by ID', async () => {
        const enquiry = await Enquiry.create({
            name: 'Charlie',
            contactNumber: '1111111111',
            email: 'charlie@example.com',
            enquiryRelated: 'Placement',
        });

        const response = await request(app)
            .get(`/enquiries/get/${enquiry._id}`)
            .expect(200);

        expect(response.body.name).toBe('Charlie');
        expect(response.body.email).toBe('charlie@example.com');
    });

    test('should update an enquiry by ID', async () => {
        const enquiry = await Enquiry.create({
            name: 'David',
            contactNumber: '2222222222',
            email: 'david@example.com',
            enquiryRelated: 'Syllabus',
        });

        const updatedEnquiry = {
            name: 'David Updated',
            contactNumber: '3333333333',
            email: 'david.updated@example.com',
            enquiryRelated: 'Timetable',
        };

        const response = await request(app)
            .put(`/enquiries/update/${enquiry._id}`)
            .send(updatedEnquiry)
            .expect(200);

        expect(response.body.name).toBe('David Updated');
        expect(response.body.contactNumber).toBe('3333333333');
    });

    test('should delete an enquiry by ID', async () => {
        const enquiry = await Enquiry.create({
            name: 'Eve',
            contactNumber: '4444444444',
            email: 'eve@example.com',
            enquiryRelated: 'Library',
        });

        const response = await request(app)
            .delete(`/enquiries/delete/${enquiry._id}`)
            .expect(200);

        expect(response.body.message).toBe('Enquiry deleted successfully');

        const count = await Enquiry.countDocuments();
        expect(count).toBe(0);
    });

    test('should return 404 when retrieving a non-existing enquiry by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .get(`/enquiries/get/${fakeId}`)
            .expect(404);
    });

    test('should return 404 when updating a non-existing enquiry by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .put(`/enquiries/update/${fakeId}`)
            .send({ name: 'Non-existing' })
            .expect(404);
    });

    test('should return 404 when deleting a non-existing enquiry by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .delete(`/enquiries/delete/${fakeId}`)
            .expect(404);
    });
});
