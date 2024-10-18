const express = require('express');
const mongoose = require('mongoose');
const request = require('supertest');
const StaffPayment = require('../Models/StaffPayment');
const StaffDetail = require('../Models/StaffDetails');
const staffPaymentRouter = require('../routes/staffpaymentroutes'); // Adjust the path as necessary

const app = express();
app.use(express.json());
app.use('/staff-payment', staffPaymentRouter);

describe('StaffPayment API', () => {
    let staff;

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);

        // Create a staff member for testing
        staff = new StaffDetail({
            staffID: 'S12',
            name: 'John Doe',
            dateOfBirth: new Date('1985-08-15'),
            gender: 'Male',
            contactNumber: '1234567890',
            email: 'john@example.com',
            education: 'Bachelor of Science',
            address: '123 Main St, City, Country',
            aadharNumber: '123456789016',
            position: 'Teacher',
            employmentType: 'Full-Time',
            emergencyContact: {
                contactNumber: '0987654321',
                relationship: 'Spouse'
            },
            nationality: 'CountryName',
            languageSpoken: 'English'
        });
        await staff.save();
    });

    afterAll(async () => {
        await StaffDetail.deleteMany({});
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await StaffPayment.deleteMany({});
    });

    // Test for creating a payment record
    it('POST /staff-payment/create should create a new payment record', async () => {
        const paymentData = {
            staffId: staff._id,
            salary: 5000,
            paidAmount: 3000
        };

        const response = await request(app)
            .post('/staff-payment/create')
            .send(paymentData)
            .expect(201);

        expect(response.body.payment.staff.toString()).toBe(paymentData.staffId.toString());
        expect(response.body.payment.salary).toBe(paymentData.salary);
        expect(response.body.payment.paidAmount).toBe(paymentData.paidAmount);
        expect(response.body.payment.dueAmount).toBe(paymentData.salary - paymentData.paidAmount);
        expect(response.body.payment.status).toBe('Due');
    });

    // Test for creating a payment record for non-existent staff
    it('POST /staff-payment/create should return 404 if staff not found', async () => {
        const paymentData = {
            staffId: new mongoose.Types.ObjectId(),
            salary: 5000,
            paidAmount: 3000
        };

        const response = await request(app)
            .post('/staff-payment/create')
            .send(paymentData)
            .expect(404);

        expect(response.body.message).toBe('Staff not found');
    });

    // Test for getting all payment records
    it('GET /staff-payment/get should return all payment records', async () => {
        const payment = new StaffPayment({
            staff: staff._id,
            salary: 5000,
            paidAmount: 3000,
            dueAmount: 2000,
            status: 'Due'
        });
        await payment.save();

        const response = await request(app)
            .get('/staff-payment/get')
            .expect(200);

        expect(response.body.totalPayments).toBe(1);
        expect(response.body.totalAmountPaid).toBe(3000);
        expect(response.body.payments.length).toBe(1);
        expect(response.body.payments[0].staff._id.toString()).toBe(staff._id.toString());
    });

    // Test for getting a specific payment record by ID
    it('GET /staff-payment/show/:id should return a specific payment record', async () => {
        const payment = new StaffPayment({
            staff: staff._id,
            salary: 5000,
            paidAmount: 3000,
            dueAmount: 2000,
            status: 'Due'
        });
        await payment.save();

        const response = await request(app)
            .get(`/staff-payment/show/${payment._id}`)
            .expect(200);

        expect(response.body.staff._id.toString()).toBe(staff._id.toString());
    });

    // Test for 404 response for a non-existent payment record
    it('GET /staff-payment/show/:id should return 404 for non-existent payment record', async () => {
        const response = await request(app)
            .get(`/staff-payment/show/${new mongoose.Types.ObjectId()}`)
            .expect(404);

        expect(response.body.message).toBe('Payment record not found');
    });

    // Test for updating a payment record
    it('PUT /staff-payment/update/:id should update a payment record', async () => {
        const payment = new StaffPayment({
            staff: staff._id,
            salary: 5000,
            paidAmount: 3000,
            dueAmount: 2000,
            status: 'Due'
        });
        await payment.save();

        const updatedData = { salary: 6000, paidAmount: 6000 };

        const response = await request(app)
            .put(`/staff-payment/update/${payment._id}`)
            .send(updatedData)
            .expect(200);

        expect(response.body.payment.salary).toBe(updatedData.salary);
        expect(response.body.payment.paidAmount).toBe(updatedData.paidAmount);
        expect(response.body.payment.dueAmount).toBe(0);
        expect(response.body.payment.status).toBe('Paid');
    });

    // Test for updating a non-existent payment record
    it('PUT /staff-payment/update/:id should return 404 for non-existent payment record', async () => {
        const updatedData = { salary: 6000, paidAmount: 6000 };

        const response = await request(app)
            .put(`/staff-payment/update/${new mongoose.Types.ObjectId()}`)
            .send(updatedData)
            .expect(404);

        expect(response.body.message).toBe('Payment record not found');
    });
});
