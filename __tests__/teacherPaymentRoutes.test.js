const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const TeacherPayment = require('../Models/Paymentteacher'); // Adjust the path as necessary
const TeacherDetail = require('../Models/TeacherDetails'); // Adjust the path as necessary
const teacherPaymentRouter = require('../routes/paymentteacherroutes'); // Adjust the path as necessary

const app = express();
app.use(express.json());
app.use('/teacher-payment', teacherPaymentRouter);

describe('TeacherPayment API', () => {
    let teacher;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);

        // Create a teacher for testing
        teacher = new TeacherDetail({
            teacherID: 'T01',
            name: 'John Doe',
            dateOfBirth: '1990-01-01', // Use string format for dates
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'johnn@example.com',
            aadharNumber: '123456789010',
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
        });
        await teacher.save();
    });

    afterAll(async () => {
        await TeacherDetail.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await TeacherPayment.deleteMany({});
    });

    // Test for creating a payment record
    it('POST /teacher-payment/create should create a new payment record', async () => {
        const paymentData = {
            teacherId: teacher._id,
            assignedClass: "8",
            salary: 7000,
            paidAmount: 4000
        };

        const response = await request(app)
            .post('/teacher-payment/create')
            .send(paymentData)
            .expect(201);

        expect(response.body.payment.teacher.toString()).toBe(paymentData.teacherId.toString());
        expect(response.body.payment.salary).toBe(paymentData.salary);
        expect(response.body.payment.paidAmount).toBe(paymentData.paidAmount);
        expect(response.body.payment.dueAmount).toBe(paymentData.salary - paymentData.paidAmount);
        expect(response.body.payment.status).toBe('Due');
    });

    // Test for creating a payment record for non-existent teacher
    it('POST /teacher-payment/create should return 404 if teacher not found', async () => {
        const paymentData = {
            teacherId: new mongoose.Types.ObjectId(),
            assignedClass: "8",
            salary: 7000,
            paidAmount: 4000
        };

        const response = await request(app)
            .post('/teacher-payment/create')
            .send(paymentData)
            .expect(404);

        expect(response.body.message).toBe('Teacher not found');
    });

    // Test for getting all payment records
    it('GET /teacher-payment/get should return all payment records', async () => {
        const payment = new TeacherPayment({
            teacher: teacher._id,
            assignedClass: "8",
            salary: 7000,
            paidAmount: 4000,
            dueAmount: 3000,
            status: 'Due'
        });
        await payment.save();

        const response = await request(app)
            .get('/teacher-payment/get')
            .expect(200);

        expect(response.body.totalPayments).toBe(1);
        expect(response.body.totalAmountPaid).toBe(4000);
        expect(response.body.payments.length).toBe(1);
        expect(response.body.payments[0].teacher._id.toString()).toBe(teacher._id.toString());
    });



    // Test for updating a payment record
    it('PUT /teacher-payment/update/:id should update a payment record', async () => {
        const payment = new TeacherPayment({
            teacher: teacher._id,
            assignedClass: "8",
            salary: 7000,
            paidAmount: 4000,
            dueAmount: 3000,
            status: 'Due'
        });
        await payment.save();

        const updatedData = { salary: 7500, paidAmount: 7500 };

        const response = await request(app)
            .put(`/teacher-payment/update/${payment._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.payment.salary).toBe(updatedData.salary);
        expect(response.body.payment.paidAmount).toBe(updatedData.paidAmount);
        expect(response.body.payment.dueAmount).toBe(0);
        expect(response.body.payment.status).toBe('Paid');
    });

    // Test for updating a non-existent payment record
    it('PUT /teacher-payment/update/:id should return 404 for non-existent payment record', async () => {
        const updatedData = { salary: 7500, paidAmount: 7500 };

        const response = await request(app)
            .put(`/teacher-payment/update/${new mongoose.Types.ObjectId()}`)
            .send(updatedData)
            .expect(404);

        expect(response.body.message).toBe('Payment record not found');
    });
});
