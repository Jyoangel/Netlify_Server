const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const Staff = require('../Models/StaffDetails');
const staffRouter = require('../routes/staffroutes'); // Adjust the path as necessary

const app = express();
app.use(express.json());
app.use('/staff', staffRouter);

// Sample data for tests
const sampleStaffData = {
    staffID: 'S123',
    name: 'John Doe',
    dateOfBirth: new Date('1985-08-15'),
    gender: 'Male',
    contactNumber: '1234567890',
    email: 'john.do@example.com',
    education: 'Bachelor of Science',
    address: '123 Main St, City, Country',
    aadharNumber: '123456789012',
    position: 'Teacher',
    employmentType: 'Full-Time',
    emergencyContact: {
        contactNumber: '0987654321',
        relationship: 'Spouse'
    },
    nationality: 'CountryName',
    languageSpoken: 'English'
};

describe('Staff API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Staff.deleteMany({});
    });

    // Test for creating a new staff member
    it('POST /staff/add should create a new staff member', async () => {
        const response = await request(app)
            .post('/staff/add')
            .send(sampleStaffData)
            .expect(200);

        expect(response.body.staff.name).toBe(sampleStaffData.name);
        expect(response.body.staff.email).toBe(sampleStaffData.email);
    });

    // Test for getting all staff members
    it('GET /staff/get should return all staff members', async () => {
        await new Staff(sampleStaffData).save();

        const response = await request(app)
            .get('/staff/get')
            .expect(200);

        expect(response.body.staff.length).toBe(1);
        expect(response.body.staff[0].name).toBe(sampleStaffData.name);
    });

    // Test for getting a specific staff member by ID
    it('GET /staff/get/:id should return a specific staff member', async () => {
        const staff = await new Staff(sampleStaffData).save();

        const response = await request(app)
            .get(`/staff/get/${staff._id}`)
            .expect(200);

        expect(response.body.name).toBe(sampleStaffData.name);
    });

    // Test for 404 response for a non-existent staff member
    it('GET /staff/get/:id should return 404 for non-existent staff member', async () => {
        const response = await request(app)
            .get(`/staff/get/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toBe('Staff member not found');
    });

    // Test for updating a staff member by ID
    it('PUT /staff/update/:id should update a staff member', async () => {
        const staff = await new Staff(sampleStaffData).save();
        const updatedData = { ...sampleStaffData, name: 'Jane Doe' };

        const response = await request(app)
            .put(`/staff/update/${staff._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.name).toBe('Jane Doe');
    });

    // Test for invalid update attempt
    it('PUT /staff/update/:id should return 400 for invalid updates', async () => {
        const staff = await new Staff(sampleStaffData).save();

        const response = await request(app)
            .put(`/staff/update/${staff._id}`)
            .send({ invalidField: 'test' })
            .expect(400);

        expect(response.body.error).toBe('Invalid updates!');
    });

    // Test for deleting a staff member by ID
    it('DELETE /staff/delete/:id should delete a staff member', async () => {
        const staff = await new Staff(sampleStaffData).save();

        await request(app)
            .delete(`/staff/delete/${staff._id}`)
            .expect(200);

        const check = await Staff.findById(staff._id);
        expect(check).toBeNull();
    });

    // Test for 404 response when deleting a non-existent staff member
    it('DELETE /staff/delete/:id should return 404 for non-existent staff member', async () => {
        const response = await request(app)
            .delete(`/staff/delete/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toBe('Staff member not found');
    });

    // Test for getting staff count
    it('GET /staff/staff-count should return total staff count', async () => {
        await new Staff(sampleStaffData).save();

        const response = await request(app)
            .get('/staff/staff-count')
            .expect(200);

        expect(response.body.count).toBe(1);
    });
});
