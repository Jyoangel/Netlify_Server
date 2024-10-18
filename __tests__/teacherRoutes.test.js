const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const Teacher = require('../Models/TeacherDetails'); // Adjust the path to your Teacher model
const teacherRouter = require('../routes/teacherroutes'); // Adjust the path to your routes file

const app = express();
app.use(express.json());
app.use('/teachers', teacherRouter);

// Sample data for tests
const sampleTeacherData = {
    teacherID: 'T1',
    name: 'John Doe',
    dateOfBirth: '1990-01-01', // Use string format for dates
    gender: 'Male',
    contactNumber: '1234567890',
    email: 'john.doe@example.com',
    aadharNumber: '123456789019',
    address: '123 Main St',
    subjectTaught: 'Math',
    gradeLevelTaught: 'Grade 10',
    department: 'Mathematics',
    highestDegreeEarned: 'MSc',
    instituteName: 'XYZ University',
    yearOfGraduation: 2012,
    emergencyContact: {
        contactNumber: '0987654321',
        relationship: 'Friend'
    },
    parent: {
        fatherName: 'Mr. Doe',
        fatherContactNumber: '1234567890',
        fatherAadharNumber: '123456789019',
        fatherOccupation: 'Engineer',
        motherName: 'Mrs. Doe',
        motherContactNumber: '0987654321',
        motherAadharNumber: '098765432167',
        motherOccupation: 'Teacher',
        annualIncome: 100000,
        parentAddress: '123 Main St'
    },
    password: 'P@ssw0rd!',
};

describe('Teacher API', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Teacher.deleteMany({});
    });

    // Test for creating a new teacher
    it('POST /teachers/add should create a new teacher', async () => {
        const response = await request(app)
            .post('/teachers/add')
            .send(sampleTeacherData)
            .expect(200);

        expect(response.body.teacher.name).toBe(sampleTeacherData.name);
        expect(response.body.teacher.email).toBe(sampleTeacherData.email);
    });

    // Test for getting all teachers
    it('GET /teachers/get should return all teachers', async () => {
        await new Teacher(sampleTeacherData).save();

        const response = await request(app)
            .get('/teachers/get')
            .expect(200);

        expect(response.body.teachers.length).toBe(1);
        expect(response.body.teachers[0].name).toBe(sampleTeacherData.name);
    });

    // Test for getting a specific teacher by ID
    it('GET /teachers/get/:id should return a specific teacher', async () => {
        const teacher = await new Teacher(sampleTeacherData).save();

        const response = await request(app)
            .get(`/teachers/get/${teacher._id}`)
            .expect(200);

        expect(response.body.name).toBe(sampleTeacherData.name);
    });

    // Test for 404 response for a non-existent teacher
    it('GET /teachers/get/:id should return 404 for non-existent teacher', async () => {
        const response = await request(app)
            .get(`/teachers/get/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toBe('Teacher not found');
    });

    // Test for updating a teacher by ID
    it('PUT /teachers/update/:id should update a teacher', async () => {
        const teacher = await new Teacher(sampleTeacherData).save();
        const updatedData = { ...sampleTeacherData, name: 'Emily Johnson' };

        const response = await request(app)
            .put(`/teachers/update/${teacher._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.name).toBe('Emily Johnson');
    });


    // Test for invalid update attempt


    // Test for deleting a teacher by ID
    it('DELETE /teachers/delete/:id should delete a teacher', async () => {
        const teacher = await new Teacher(sampleTeacherData).save();

        await request(app)
            .delete(`/teachers/delete/${teacher._id}`)
            .expect(200);

        const check = await Teacher.findById(teacher._id);
        expect(check).toBeNull();
    });

    // Test for 404 response when deleting a non-existent teacher
    it('DELETE /teachers/delete/:id should return 404 for non-existent teacher', async () => {
        const response = await request(app)
            .delete(`/teachers/delete/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body).toBe('Teacher not found');
    });

    // Test for getting teacher count
    it('GET /teachers/count should return total teacher count', async () => {
        await new Teacher(sampleTeacherData).save();

        const response = await request(app)
            .get('/teachers/count')
            .expect(200);

        expect(response.body.count).toBe(1);
    });
});
