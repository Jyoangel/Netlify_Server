const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const Fee = require('../Models/Fee');
const Student = require('../Models/StudentDetails');
const FeeNotice = require('../Models/FeeNotice');
const nodemailer = require('nodemailer');
const feeRouter = require('../routes/feeroutes');

// Mock Cloudinary to avoid real HTTP requests

const app = express();
app.use(express.json());
app.use('/fee', feeRouter);

// Mock nodemailer
jest.mock('nodemailer');
const mockSendMail = jest.fn();
nodemailer.createTransport.mockReturnValue({ sendMail: mockSendMail });

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Fee Management API', () => {
    let student;

    beforeEach(async () => {
        // Clean the database
        await Student.deleteMany({});
        await Fee.deleteMany({});

        // Create a sample student
        student = new Student({
            studentID: 'S345',
            formNumber: 'F12345',
            admissionNumber: 'A12345',
            class: '10',
            admissionType: 'Regular',
            name: 'John Doe',
            nationality: 'Indian',
            motherTongue: 'English',
            dateOfBirth: '2005-01-01',
            gender: 'Male',
            religion: 'Christianity',
            caste: 'General',
            bloodGroup: 'O+',
            aadharNumber: '123456789012',
            contactNumber: '9876543210',
            email: 'john.de@example.com',
            address: '123 Main St, City, State',
            parent: {
                fatherName: 'Robert Doe',
                fatherContactNumber: '9876543211',
                fatherAadharNumber: '123456789013',
                fatherOccupation: 'Engineer',
                motherName: 'Jane Doe',
                motherContactNumber: '9876543212',
                motherAadharNumber: '123456789014',
                motherOccupation: 'Teacher',
                annualIncome: 1000000,
                parentAddress: '123 Main St, City, State'
            },
            localGuardian: {
                guardianName: 'Uncle Joe',
                relationWithStudent: 'Uncle',
                guardianContactNumber: '9876543213',
                guardianAadharNumber: '123456789015',
                guardianOccupation: 'Doctor',
                guardianAddress: '456 Elm St, City, State'
            }
        });
        await student.save();
    });

    afterEach(async () => {
        await Fee.deleteMany({});
        await Student.deleteMany({});
    });

    it('should create a new fee record and a corresponding FeeNotice', async () => {
        const response = await request(app)
            .post('/fee/add')
            .send({
                studentID: student._id,
                totalFee: 1200,
                monthlyFee: 1000,
                festiveFee: 200,
                feeMonth: 'August',
                registrationNo: 'R001',
                number: 'INV001',
                schoolEmail: 'school@example.com',
                session: '2023-2024',
                paymentMode: 'Cash',
                referenceNo: 'REF123',
                bankName: 'Bank',
                remark: 'Paid in full',
                receiptBy: 'Cashier'
            });

        console.log('Response Body:', response.body); // Add logging to inspect response

        expect(response.status).toBe(201);
        expect(response.body.msg).toBe('Fee record created successfully');

        const fee = await Fee.findById(response.body.fee._id);
        expect(fee).not.toBeNull();
        expect(fee.studentID.toString()).toBe(student._id.toString());

        const feeNotice = await FeeNotice.findOne({ fee: fee._id });
        expect(feeNotice).not.toBeNull();
        expect(feeNotice.fee.toString()).toBe(fee._id.toString());
    });

    it('should fetch a fee record by ID', async () => {
        const fee = new Fee({
            studentID: student._id,
            totalFee: 1200,
            monthlyFee: 1000,
            festiveFee: 200,
            feeMonth: 'August',
            registrationNo: 'R001',
            number: 'INV001',
            schoolEmail: 'school@example.com',
            session: '2023-2024',
            paymentMode: 'Cash',
            referenceNo: 'REF123',
            bankName: 'Bank',
            remark: 'Paid in full',
            receiptBy: 'Cashier'
        });
        await fee.save();

        const response = await request(app).get(`/fee/get/${fee._id}`);

        expect(response.status).toBe(200);
        expect(response.body.studentID._id).toBe(student._id.toString());
        expect(response.body.studentID.name).toBe('John Doe');
    });

    it('should fetch all fee records', async () => {
        const fee1 = new Fee({
            studentID: student._id,
            totalFee: 1200,
            monthlyFee: 1000,
            festiveFee: 200,
            feeMonth: 'August',
            registrationNo: 'R001',
            number: 'INV001',
            schoolEmail: 'school@example.com',
            session: '2023-2024',
            paymentMode: 'Cash',
            referenceNo: 'REF123',
            bankName: 'Bank',
            remark: 'Paid in full',
            receiptBy: 'Cashier'
        });
        await fee1.save();

        const fee2 = new Fee({
            studentID: student._id,
            totalFee: 1500,
            monthlyFee: 1200,
            festiveFee: 300,
            feeMonth: 'September',
            registrationNo: 'R002',
            number: 'INV002',
            schoolEmail: 'school@example.com',
            session: '2023-2024',
            paymentMode: 'Bank Transfer',
            referenceNo: 'REF124',
            bankName: 'Bank',
            remark: 'Paid in full',
            receiptBy: 'Cashier'
        });
        await fee2.save();

        const response = await request(app).get('/fee/get');

        expect(response.status).toBe(200);
        expect(response.body.fees.length).toBe(2);
        expect(response.body.totalFeesCount).toBe(2);
        expect(response.body.totalPaidAmount).toBe(fee1.paidAmount + fee2.paidAmount);
    });

    it('should update the total fee for a fee record', async () => {
        const fee = new Fee({
            studentID: student._id,
            totalFee: 1200,
            monthlyFee: 1000,
            festiveFee: 200,
            paidAmount: 1200,
            feeMonth: 'August',
            registrationNo: 'R001',
            number: 'INV001',
            schoolEmail: 'school@example.com',
            session: '2023-2024',
            paymentMode: 'Cash',
            referenceNo: 'REF123',
            bankName: 'Bank',
            remark: 'Paid in full',
            receiptBy: 'Cashier'
        });
        await fee.save();

        const response = await request(app)
            .put(`/fee/update/${fee._id}`)
            .send({ totalFee: 1300 });

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('Total fee updated successfully');
        expect(response.body.fee.totalFee).toBe(1300);
        expect(response.body.fee.dueAmount).toBe(100); // New due amount should be 1300 - 1200 = 100
    });

    {/*it('should send a fee notice and record it', async () => {
        const fee = new Fee({
            studentID: student._id,
            totalFee: 1200,
            monthlyFee: 1000,
            festiveFee: 200,
            feeMonth: 'August',
            registrationNo: 'R001',
            number: 'INV001',
            schoolEmail: 'school@example.com',
            session: '2023-2024',
            paymentMode: 'Cash',
            referenceNo: 'REF123',
            bankName: 'Bank',
            remark: 'Paid in full',
            receiptBy: 'Cashier'
        });
        await fee.save();

        const response = await request(app)
            .post(`/fee/sendNotice/${fee._id}`)
            .send({
                message: 'Please pay your due fees.',
                remark: 'Urgent',
                dueAmount: 100,
                months: 'August'
            });

        expect(response.status).toBe(200);
        expect(response.body.msg).toBe('Notice sent successfully and recorded');
        expect(mockSendMail).toHaveBeenCalledTimes(1);
        expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
            to: student.email,
            subject: 'Fee Notice'
        }));
    });
    */}

});
