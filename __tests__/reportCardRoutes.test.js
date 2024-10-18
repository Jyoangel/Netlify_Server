const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const ReportCard = require('../Models/Reportcard'); // Ensure this path is correct
const reportCardRouter = require('../routes/reportcardroutes'); // Ensure this path is correct

const app = express();
app.use(express.json());
app.use('/reportcards', reportCardRouter);

describe('ReportCard API', () => {
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
        await ReportCard.deleteMany();
    });

    test('should add a new report card', async () => {
        const newReportCard = {
            type: 'Midterm',
            name: 'John Doe',
            fatherName: 'Mr. Doe',
            session: '2023-2024',
            rollNumber: '123',
            class: '10th',
            dateOfBirth: '2006-05-15',
            numberOfSubjects: 3,
            subjects: [
                { subjectName: 'Math', marks: 85 },
                { subjectName: 'Science', marks: 90 },
                { subjectName: 'English', marks: 78 }
            ],
            classTeacher: 'Mrs. Smith',
            principleSignature: 'Mr. Principal',
        };

        const response = await request(app)
            .post('/reportcards/add')
            .send(newReportCard)
            .expect(201);

        expect(response.body.name).toBe('John Doe');
        expect(response.body.status).toBe('Pass');
        expect(response.body.percentage).toBeCloseTo(84.33, 2);
    });

    test('should retrieve all report cards', async () => {
        await ReportCard.create([
            {
                type: 'Midterm',
                name: 'Alice',
                fatherName: 'Mr. Alice',
                session: '2023-2024',
                rollNumber: '124',
                class: '10th',
                dateOfBirth: '2006-07-18',
                numberOfSubjects: 3,
                subjects: [
                    { subjectName: 'Math', marks: 80 },
                    { subjectName: 'Science', marks: 85 },
                    { subjectName: 'English', marks: 70 }
                ],
                classTeacher: 'Mrs. Smith',
                principleSignature: 'Mr. Principal',
            },
            {
                type: 'Midterm',
                name: 'Bob',
                fatherName: 'Mr. Bob',
                session: '2023-2024',
                rollNumber: '125',
                class: '10th',
                dateOfBirth: '2006-08-12',
                numberOfSubjects: 3,
                subjects: [
                    { subjectName: 'Math', marks: 60 },
                    { subjectName: 'Science', marks: 65 },
                    { subjectName: 'English', marks: 50 }
                ],
                classTeacher: 'Mrs. Smith',
                principleSignature: 'Mr. Principal',
            }
        ]);

        const response = await request(app)
            .get('/reportcards/get')
            .expect(200);

        expect(response.body.length).toBe(2);
    });

    test('should retrieve a report card by ID', async () => {
        const reportCard = await ReportCard.create({
            type: 'Midterm',
            name: 'Charlie',
            fatherName: 'Mr. Charlie',
            session: '2023-2024',
            rollNumber: '126',
            class: '10th',
            dateOfBirth: '2006-09-14',
            numberOfSubjects: 3,
            subjects: [
                { subjectName: 'Math', marks: 75 },
                { subjectName: 'Science', marks: 80 },
                { subjectName: 'English', marks: 65 }
            ],
            classTeacher: 'Mrs. Smith',
            principleSignature: 'Mr. Principal',
        });

        const response = await request(app)
            .get(`/reportcards/get/${reportCard._id}`)
            .expect(200);

        expect(response.body.name).toBe('Charlie');
    });

    test('should update a report card by ID', async () => {
        const reportCard = await ReportCard.create({
            type: 'Midterm',
            name: 'David',
            fatherName: 'Mr. David',
            session: '2023-2024',
            rollNumber: '127',
            class: '10th',
            dateOfBirth: '2006-10-20',
            numberOfSubjects: 3,
            subjects: [
                { subjectName: 'Math', marks: 70 },
                { subjectName: 'Science', marks: 75 },
                { subjectName: 'English', marks: 60 }
            ],
            classTeacher: 'Mrs. Smith',
            principleSignature: 'Mr. Principal',
        });

        const updatedData = {
            name: 'David Updated',
            subjects: [
                { subjectName: 'Math', marks: 90 },
                { subjectName: 'Science', marks: 95 },
                { subjectName: 'English', marks: 85 }
            ],
        };

        const response = await request(app)
            .put(`/reportcards/update/${reportCard._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.name).toBe('David Updated');
        expect(response.body.status).toBe('Pass');
        expect(response.body.percentage).toBeCloseTo(90, 2);
    });

    test('should delete a report card by ID', async () => {
        const reportCard = await ReportCard.create({
            type: 'Midterm',
            name: 'Eve',
            fatherName: 'Mr. Eve',
            session: '2023-2024',
            rollNumber: '128',
            class: '10th',
            dateOfBirth: '2006-11-22',
            numberOfSubjects: 3,
            subjects: [
                { subjectName: 'Math', marks: 65 },
                { subjectName: 'Science', marks: 70 },
                { subjectName: 'English', marks: 55 }
            ],
            classTeacher: 'Mrs. Smith',
            principleSignature: 'Mr. Principal',
        });

        const response = await request(app)
            .delete(`/reportcards/delete/${reportCard._id}`)
            .expect(200);

        expect(response.body.name).toBe('Eve');

        const count = await ReportCard.countDocuments();
        expect(count).toBe(0);
    });

    test('should return 404 when retrieving a non-existing report card by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .get(`/reportcards/get/${fakeId}`)
            .expect(404);
    });

    test('should return 404 when updating a non-existing report card by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .put(`/reportcards/update/${fakeId}`)
            .send({ name: 'Non-existing' })
            .expect(404);
    });

    test('should return 404 when deleting a non-existing report card by ID', async () => {
        const fakeId = new mongoose.Types.ObjectId();
        await request(app)
            .delete(`/reportcards/delete/${fakeId}`)
            .expect(404);
    });
});
