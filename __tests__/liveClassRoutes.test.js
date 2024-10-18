const express = require('express');

const request = require('supertest');
const mongoose = require('mongoose');
//const app = require('../app'); // Assuming you have an app.js where you set up your Express app
const LiveClass = require('../Models/LiveClass');
const liveClassRouter = require('../routes/liveclassroutes'); // Adjust the path as necessary

const app = express();
app.use(express.json());
app.use('/liveclasses', liveClassRouter);

// Sample data for tests
const sampleLiveClassData = {
    courseId: new mongoose.Types.ObjectId(),
    topic: 'Sample Topic',
    section: 'Section A',
    liveRoom: 'Room 101',
    date: new Date(),
    time: '10:00 AM',
    duration: '1 hour',
    assignTo: 'Teacher A',
    noteToStudents: 'Please join on time.'
};

describe('LiveClass API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await LiveClass.deleteMany({});
    });

    // Test for creating a new live class
    it('POST /liveclasses/add should create a new live class', async () => {
        const response = await request(app)
            .post('/liveclasses/add')
            .send(sampleLiveClassData)
            .expect(201);

        expect(response.body.topic).toBe(sampleLiveClassData.topic);
        expect(response.body.section).toBe(sampleLiveClassData.section);
    });

    // Test for reading all live classes
    {/* it('GET /liveclasses/get should return all live classes', async () => {
        await new LiveClass(sampleLiveClassData).save();

        const response = await request(app)
            .get('/liveclasses/get')
        //.expect(200);

        expect(response.body.length).toBe(1);
        expect(response.body[0].topic).toBe(sampleLiveClassData.topic);
    });*/}

    // Test for reading a specific live class by ID
    it('GET /liveclasses/get/:id should return a specific live class', async () => {
        const liveClass = await new LiveClass(sampleLiveClassData).save();

        const response = await request(app)
            .get(`/liveclasses/get/${liveClass._id}`)
            .expect(200);

        expect(response.body.topic).toBe(sampleLiveClassData.topic);
    });

    // Test for 404 response for a non-existent live class
    it('GET /liveclasses/get/:id should return 404 for non-existent live class', async () => {
        const response = await request(app)
            .get(`/liveclasses/get/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toEqual({});
    });

    // Test for updating a live class by ID
    it('PUT /liveclasses/update/:id should update a live class', async () => {
        const liveClass = await new LiveClass(sampleLiveClassData).save();
        const updatedData = { ...sampleLiveClassData, topic: 'Updated Topic' };

        const response = await request(app)
            .put(`/liveclasses/update/${liveClass._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.topic).toBe('Updated Topic');
    });

    // Test for deleting a live class by ID
    it('DELETE /liveclasses/delete/:id should delete a live class', async () => {
        const liveClass = await new LiveClass(sampleLiveClassData).save();

        await request(app)
            .delete(`/liveclasses/delete/${liveClass._id}`)
            .expect(200);

        const check = await LiveClass.findById(liveClass._id);
        expect(check).toBeNull();
    });

    // Test for 404 response when deleting a non-existent live class
    it('DELETE /liveclasses/delete/:id should return 404 for non-existent live class', async () => {
        const response = await request(app)
            .delete(`/liveclasses/delete/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toEqual({});
    });
});
