const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const csvParser = require('csv-parser');

const AdmitCard = require('../Models/AdmitCaard');
const admitCardRouter = require('../routes/admitcardroutes');

const app = express();
app.use(express.json());
app.use('/api/admitcards', admitCardRouter);

describe('AdmitCard API', () => {
    beforeAll(async () => {
        // Using the connection string provided by @shelf/jest-mongodb
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterEach(async () => {
        await AdmitCard.deleteMany();
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('POST /api/admitcards/add should create a new admit card', async () => {
        const response = await request(app).post('/api/admitcards/add').send({
            examination_roll_number: '12345',
            school_name: 'Test School',
            session: '2024-2025',
            examination: 'Final Exam',
            student_name: 'John Doe',
            class: '10th Grade',
            startdate: new Date('2024-06-01'),
            enddate: new Date('2024-06-15'),
            examstarting_time: '10:00 AM',
            examending_time: '12:00 PM',
            examsubjects: [
                { subject: 'Math', examination_date: new Date('2024-06-02') },
                { subject: 'English', examination_date: new Date('2024-06-05') },
            ],
        });

        expect(response.statusCode).toBe(201);
        expect(response.body.savedAdmitCard).toHaveProperty('_id');
        expect(response.body.savedAdmitCard.examination_roll_number).toBe('12345');
    });

    it('GET /api/admitcards/get should return all admit cards', async () => {
        // Seed with some data
        await new AdmitCard({
            examination_roll_number: '54321',
            school_name: 'Test School 2',
            session: '2024-2025',
            examination: 'Midterm Exam',
            student_name: 'Jane Doe',
            class: '9th Grade',
            startdate: new Date('2024-07-01'),
            enddate: new Date('2024-07-10'),
            examstarting_time: '9:00 AM',
            examending_time: '11:00 AM',
            examsubjects: [
                { subject: 'Science', examination_date: new Date('2024-07-02') },
                { subject: 'History', examination_date: new Date('2024-07-05') },
            ],
        }).save();

        const response = await request(app).get('/api/admitcards/get');

        expect(response.statusCode).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
        expect(response.body.length).toBe(1);
        expect(response.body[0].examination_roll_number).toBe('54321');
    });

    it('GET /api/admitcards/get/:id should return a single admit card by id', async () => {
        const admitCard = await new AdmitCard({
            examination_roll_number: '12345',
            school_name: 'Test School',
            session: '2024-2025',
            examination: 'Final Exam',
            student_name: 'John Doe',
            class: '10th Grade',
            startdate: new Date('2024-06-01'),
            enddate: new Date('2024-06-15'),
            examstarting_time: '10:00 AM',
            examending_time: '12:00 PM',
            examsubjects: [
                { subject: 'Math', examination_date: new Date('2024-06-02') },
                { subject: 'English', examination_date: new Date('2024-06-05') },
            ],
        }).save();

        const response = await request(app).get(`/api/admitcards/get/${admitCard._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.examination_roll_number).toBe('12345');
    });

    it('PUT /api/admitcards/update/:id should update an existing admit card', async () => {
        const admitCard = await new AdmitCard({
            examination_roll_number: '12345',
            school_name: 'Test School',
            session: '2024-2025',
            examination: 'Final Exam',
            student_name: 'John Doe',
            class: '10th Grade',
            startdate: new Date('2024-06-01'),
            enddate: new Date('2024-06-15'),
            examstarting_time: '10:00 AM',
            examending_time: '12:00 PM',
            examsubjects: [
                { subject: 'Math', examination_date: new Date('2024-06-02') },
                { subject: 'English', examination_date: new Date('2024-06-05') },
            ],
        }).save();

        const response = await request(app).put(`/api/admitcards/update/${admitCard._id}`).send({
            examination_roll_number: '67890',
            school_name: 'Updated School',
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.examination_roll_number).toBe('67890');
        expect(response.body.school_name).toBe('Updated School');
    });

    it('DELETE /api/admitcards/delete/:id should delete an existing admit card', async () => {
        const admitCard = await new AdmitCard({
            examination_roll_number: '12345',
            school_name: 'Test School',
            session: '2024-2025',
            examination: 'Final Exam',
            student_name: 'John Doe',
            class: '10th Grade',
            startdate: new Date('2024-06-01'),
            enddate: new Date('2024-06-15'),
            examstarting_time: '10:00 AM',
            examending_time: '12:00 PM',
            examsubjects: [
                { subject: 'Math', examination_date: new Date('2024-06-02') },
                { subject: 'English', examination_date: new Date('2024-06-05') },
            ],
        }).save();

        const response = await request(app).delete(`/api/admitcards/delete/${admitCard._id}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('Admit card deleted successfully');

        const findResponse = await request(app).get(`/api/admitcards/get/${admitCard._id}`);
        expect(findResponse.statusCode).toBe(404);
    });

    {/*  it('POST /api/admitcards/import should import admit cards from CSV', async () => {
        const filePath = path.join(__dirname, 'sample.csv');
        const csvData = [
            'examination_roll_number,school_name,session,examination,student_name,class,startdate,enddate,examstarting_time,examending_time,examsubjects\n',
            '11111,Sample School,2024-2025,Midterm Exam,Alice Smith,8th Grade,2024-06-01,2024-06-15,10:00 AM,12:00 PM,"[{\"subject\": \"Science\", \"examination_date\": \"2024-06-02\"}]"',
        ];

        fs.writeFileSync(filePath, csvData.join('\n'));

        const response = await request(app)
            .post('/api/admitcards/import')
            .attach('file', filePath);

        expect(response.statusCode).toBe(201);
        expect(response.body.message).toBe('Admit Cards imported successfully');

        const admitCards = await AdmitCard.find();
        expect(admitCards.length).toBe(1);
        expect(admitCards[0].examination_roll_number).toBe('11111');

        fs.unlinkSync(filePath); // Clean up the test file
    }, 20000); // Set timeout to 10 seconds
*/}

});