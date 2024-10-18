const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const examRouter = require('../routes/examroutes'); // Adjust the path if needed
const Exam = require('../Models/Exam');

const app = express();
app.use(express.json());
app.use('/exams', examRouter);

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterEach(async () => {
    await Exam.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Exam API', () => {
    test('should add a new exam', async () => {
        const newExam = {
            type: 'Final',
            examTitle: 'Math Final Exam',
            subject: 'Mathematics',
            date: new Date('2024-06-01'),
            startTime: '09:00',
            duration: '2h',
            instruction: 'No calculators allowed',
            totalMarks: 100,
            passingMarks: 50,
            uploadQuestionPaper: 'http://example.com/question-paper.pdf',
        };

        const response = await request(app).post('/exams/add').send(newExam);

        expect(response.status).toBe(201);
        expect(response.body.examTitle).toBe(newExam.examTitle);
    });

    test('should not add a new exam with missing fields', async () => {
        const incompleteExam = {
            type: 'Final',
            // Missing other required fields
        };

        const response = await request(app).post('/exams/add').send(incompleteExam);

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/validation failed/i);
    });

    test('should get all exams', async () => {
        const exam1 = new Exam({
            type: 'Final',
            examTitle: 'Math Final Exam',
            subject: 'Mathematics',
            date: new Date('2024-06-01'),
            startTime: '09:00',
            duration: '2h',
            instruction: 'No calculators allowed',
            totalMarks: 100,
            passingMarks: 50,
            uploadQuestionPaper: 'http://example.com/question-paper1.pdf',
        });

        const exam2 = new Exam({
            type: 'Midterm',
            examTitle: 'Science Midterm Exam',
            subject: 'Science',
            date: new Date('2024-06-15'),
            startTime: '10:00',
            duration: '1.5h',
            instruction: 'Open book exam',
            totalMarks: 80,
            passingMarks: 40,
            uploadQuestionPaper: 'http://example.com/question-paper2.pdf',
        });

        await exam1.save();
        await exam2.save();

        const response = await request(app).get('/exams/get');

        expect(response.status).toBe(200);

        expect(response.body.count).toBe(2);
    });

    test('should get an exam by ID', async () => {
        const exam = new Exam({
            type: 'Final',
            examTitle: 'Physics Final Exam',
            subject: 'Physics',
            date: new Date('2024-06-01'),
            startTime: '11:00',
            duration: '2h',
            instruction: 'Formula sheet allowed',
            totalMarks: 100,
            passingMarks: 50,
            uploadQuestionPaper: 'http://example.com/question-paper3.pdf',
        });

        await exam.save();

        const response = await request(app).get(`/exams/get/${exam._id}`);

        expect(response.status).toBe(200);
        expect(response.body.examTitle).toBe('Physics Final Exam');
    });

    test('should return 404 if exam not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).get(`/exams/get/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Exam not found');
    });

    test('should update an exam by ID', async () => {
        const exam = new Exam({
            type: 'Final',
            examTitle: 'Chemistry Final Exam',
            subject: 'Chemistry',
            date: new Date('2024-06-01'),
            startTime: '08:00',
            duration: '2h',
            instruction: 'No electronic devices allowed',
            totalMarks: 100,
            passingMarks: 50,
            uploadQuestionPaper: 'http://example.com/question-paper4.pdf',
        });

        await exam.save();

        const updateData = {
            examTitle: 'Updated Chemistry Exam',
        };

        const response = await request(app).put(`/exams/update/${exam._id}`).send(updateData);

        expect(response.status).toBe(200);
        expect(response.body.examTitle).toBe('Updated Chemistry Exam');
    });

    test('should return 404 when updating a non-existent exam', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).put(`/exams/update/${nonExistentId}`).send({ examTitle: 'Non-existent' });

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Exam not found');
    });

    test('should delete an exam by ID', async () => {
        const exam = new Exam({
            type: 'Final',
            examTitle: 'History Final Exam',
            subject: 'History',
            date: new Date('2024-06-01'),
            startTime: '10:00',
            duration: '2h',
            instruction: 'No notes allowed',
            totalMarks: 100,
            passingMarks: 50,
            uploadQuestionPaper: 'http://example.com/question-paper5.pdf',
        });

        await exam.save();

        const response = await request(app).delete(`/exams/delete/${exam._id}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Exam deleted successfully');
    });

    test('should return 404 when deleting a non-existent exam', async () => {
        const nonExistentId = new mongoose.Types.ObjectId();
        const response = await request(app).delete(`/exams/delete/${nonExistentId}`);

        expect(response.status).toBe(404);
        expect(response.body.error).toBe('Exam not found');
    });
});
