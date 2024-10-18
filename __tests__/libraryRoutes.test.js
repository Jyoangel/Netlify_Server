const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const libraryRouter = require('../routes/libraryroutes'); // Adjust the path if needed
const LibraryItem = require('../Models/Library'); // Adjust the path if needed

const app = express();
app.use(express.json());
app.use('/library', libraryRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
    await LibraryItem.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Library API', () => {
    test('should add a new library item', async () => {
        const newLibraryItem = {
            title: 'The Great Gatsby',
            type: 'Book',
            subject: 'Literature',
            class: '10',
            authorName: 'F. Scott Fitzgerald',
            description: 'A novel set in the Roaring Twenties.',
            uploadedBy: 'teacher@example.com',
        };

        const response = await request(app).post('/library/add').send(newLibraryItem);

        expect(response.status).toBe(201);
        expect(response.body.title).toBe(newLibraryItem.title);
        expect(response.body).toHaveProperty('_id');
    });

    test('should not add a library item with missing fields', async () => {
        const incompleteLibraryItem = {
            title: 'The Great Gatsby',
            // Missing other required fields
        };

        const response = await request(app).post('/library/add').send(incompleteLibraryItem);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message');
    });

    test('should get all library items', async () => {
        const libraryItem1 = new LibraryItem({
            title: 'The Great Gatsby',
            type: 'Book',
            subject: 'Literature',
            class: '10',
            authorName: 'F. Scott Fitzgerald',
            description: 'A novel set in the Roaring Twenties.',
            uploadedBy: 'teacher1@example.com',
        });

        const libraryItem2 = new LibraryItem({
            title: 'Physics Fundamentals',
            type: 'Book',
            subject: 'Physics',
            class: '11',
            authorName: 'John Doe',
            description: 'An introduction to physics.',
            uploadedBy: 'teacher2@example.com',
        });

        await libraryItem1.save();
        await libraryItem2.save();

        const response = await request(app).get('/library/get');

        expect(response.status).toBe(200);
        expect(response.body.libraryItems).toHaveLength(2);
        expect(response.body.count).toBe(2);
    });

    test('should get a library item by ID', async () => {
        const libraryItem = new LibraryItem({
            title: 'The Great Gatsby',
            type: 'Book',
            subject: 'Literature',
            class: '10',
            authorName: 'F. Scott Fitzgerald',
            description: 'A novel set in the Roaring Twenties.',
            uploadedBy: 'teacher@example.com',
        });

        await libraryItem.save();

        const response = await request(app).get(`/library/get/${libraryItem._id}`);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('The Great Gatsby');
    });

    test('should return 404 if library item not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/library/get/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.message).toBe('Cannot find library item');
    });

    test('should update a library item by ID', async () => {
        const libraryItem = new LibraryItem({
            title: 'The Great Gatsby',
            type: 'Book',
            subject: 'Literature',
            class: '10',
            authorName: 'F. Scott Fitzgerald',
            description: 'A novel set in the Roaring Twenties.',
            uploadedBy: 'teacher@example.com',
        });

        await libraryItem.save();

        const updateData = {
            title: 'The Great Gatsby - Updated',
        };

        const response = await request(app).put(`/library/update/${libraryItem._id}`).send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('The Great Gatsby - Updated');
    });

    test('should return 404 when updating a non-existent library item', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).put(`/library/update/${nonExistentId}`).send({ title: 'Non-existent' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('HomeWork not found');
    });

    test('should delete a library item by ID', async () => {
        const libraryItem = new LibraryItem({
            title: 'The Great Gatsby',
            type: 'Book',
            subject: 'Literature',
            class: '10',
            authorName: 'F. Scott Fitzgerald',
            description: 'A novel set in the Roaring Twenties.',
            uploadedBy: 'teacher@example.com',
        });

        await libraryItem.save();

        const response = await request(app).delete(`/library/delete/${libraryItem._id}`);

        expect(response.status).toBe(200);
        expect(response.body.library.title).toBe('The Great Gatsby');
    });

    test('should return 404 when deleting a non-existent library item', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/library/delete/${nonExistentId}`);

        expect(response.status).toBe(404);
    });
});
