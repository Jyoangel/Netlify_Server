const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');

const Assignment = require('../Models/Assignment');
const assignmentRoutes = require('../routes/assignmentroutes');

const app = express();
app.use(express.json());
app.use('/api/assignments', assignmentRoutes);

describe('Assignment API', () => {
    // Connect to the in-memory MongoDB before running tests
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    // Clean up the database after each test
    afterEach(async () => {
        await Assignment.deleteMany({});
    });

    // Disconnect from the database after all tests
    afterAll(async () => {
        await mongoose.connection.close();
    });

    // Test POST /api/assignments/add
    describe('POST /api/assignments/add', () => {
        it('should create a new assignment and return it with a count', async () => {
            const newAssignment = {
                assignmentCode: 'A001',
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                attachments: 'file.pdf',
                submissionMethod: 'Online',
                marks: 100,
                additionalInstruction: 'Complete by next week',
                class: '10th Grade',
                assignTo: 'Class A',
                courseDescription: 'Algebra',
                createdBy: 'Teacher X',
            };

            const response = await request(app)
                .post('/api/assignments/add')
                .send(newAssignment)
                .expect(201);

            expect(response.body.assignment).toHaveProperty('_id');
            expect(response.body.assignment.assignmentCode).toBe('A001');
            expect(response.body.count).toBe(1);
        });

        it('should return 500 if required fields are missing', async () => {
            const newAssignment = {
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                // Missing other required fields
            };

            const response = await request(app)
                .post('/api/assignments/add')
                .send(newAssignment)
                .expect(500);

            expect(response.body.message).toBeDefined();
        });
    });

    // Test GET /api/assignments/get
    describe('GET /api/assignments/get', () => {
        it('should retrieve all assignments', async () => {
            await new Assignment({
                assignmentCode: 'A001',
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                attachments: 'file.pdf',
                submissionMethod: 'Online',
                marks: 100,
                additionalInstruction: 'Complete by next week',
                class: '10th Grade',
                assignTo: 'Class A',
                courseDescription: 'Algebra',
                createdBy: 'Teacher X',
            }).save();

            const response = await request(app)
                .get('/api/assignments/get')
                .expect(200);

            expect(response.body.assignments.length).toBeGreaterThan(0);
        });

        it('should return 500 if there is an error fetching assignments', async () => {
            jest.spyOn(Assignment, 'find').mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/assignments/get')
                .expect(500);

            expect(response.body.message).toBe('Database error');
        });
    });

    // Test GET /api/assignments/get/:id
    describe('GET /api/assignments/get/:id', () => {
        it('should retrieve an assignment by ID', async () => {
            const assignment = await new Assignment({
                assignmentCode: 'A001',
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                attachments: 'file.pdf',
                submissionMethod: 'Online',
                marks: 100,
                additionalInstruction: 'Complete by next week',
                class: '10th Grade',
                assignTo: 'Class A',
                courseDescription: 'Algebra',
                createdBy: 'Teacher X',
            }).save();

            const response = await request(app)
                .get(`/api/assignments/get/${assignment._id}`)
                .expect(200);

            expect(response.body._id).toBe(assignment._id.toString());
        });

        it('should return 404 if the assignment is not found', async () => {
            const invalidId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .get(`/api/assignments/get/${invalidId}`)
                .expect(404);

            expect(response.body.message).toBe('Assignment not found');
        });
    });

    // Test PUT /api/assignments/update/:id
    describe('PUT /api/assignments/update/:id', () => {
        it('should update an assignment by ID', async () => {
            const assignment = await new Assignment({
                assignmentCode: 'A001',
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                attachments: 'file.pdf',
                submissionMethod: 'Online',
                marks: 100,
                additionalInstruction: 'Complete by next week',
                class: '10th Grade',
                assignTo: 'Class A',
                courseDescription: 'Algebra',
                createdBy: 'Teacher X',
            }).save();

            const updatedAssignment = {
                assignmentCode: 'A002',
                assignmentTitle: 'Science Homework',
                dueDate: '2024-08-20T00:00:00.000Z',
                attachments: 'newfile.pdf',
                submissionMethod: 'Offline',
                marks: 80,
                additionalInstruction: 'Complete by next month',
                class: '11th Grade',
                assignTo: 'Class B',
                courseDescription: 'Physics',
                createdBy: 'Teacher Y',
            };

            const response = await request(app)
                .put(`/api/assignments/update/${assignment._id}`)
                .send(updatedAssignment)
                .expect(200);

            expect(response.body.assignmentCode).toBe('A002');
            expect(response.body.assignmentTitle).toBe('Science Homework');
        });

        it('should return 404 if the assignment to update is not found', async () => {
            const invalidId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .put(`/api/assignments/update/${invalidId}`)
                .send({ assignmentCode: 'A002' })
                .expect(404);

            expect(response.body.message).toBe('Assignment not found');
        });
    });

    // Test DELETE /api/assignments/delete/:id
    describe('DELETE /api/assignments/delete/:id', () => {
        it('should delete an assignment by ID', async () => {
            const assignment = await new Assignment({
                assignmentCode: 'A001',
                assignmentTitle: 'Math Homework',
                dueDate: '2024-08-15T00:00:00.000Z',
                attachments: 'file.pdf',
                submissionMethod: 'Online',
                marks: 100,
                additionalInstruction: 'Complete by next week',
                class: '10th Grade',
                assignTo: 'Class A',
                courseDescription: 'Algebra',
                createdBy: 'Teacher X',
            }).save();

            const response = await request(app)
                .delete(`/api/assignments/delete/${assignment._id}`)
                .expect(200);

            expect(response.body.message).toBe('Assignment deleted successfully');
            expect(response.body.count).toBe(0);
        });

        it('should return 404 if the assignment to delete is not found', async () => {
            const invalidId = new mongoose.Types.ObjectId();

            const response = await request(app)
                .delete(`/api/assignments/delete/${invalidId}`)
                .expect(404);

            expect(response.body.message).toBe('Assignment not found');
        });
    });
});
