const express = require('express');
const request = require('supertest');
const mongoose = require('mongoose');
const Hotel = require('../Models/Hotel');
const hotelRoutes = require('../routes/hotelroutes');

const app = express();
app.use(express.json());
app.use('/api/hotel', hotelRoutes);

// Connect to the in-memory MongoDB before running tests
beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URL);
});

// Clean up the database after each test
afterEach(async () => {
    await Hotel.deleteMany({});
});

// Disconnect from the database after all tests
afterAll(async () => {
    await mongoose.connection.close();
});

describe('POST /api/hotel/add', () => {
    it('should create a new hotel and return it', async () => {
        const newHotel = {
            typeOfRoom: 'Deluxe',
            floor: 5,
            zone: 'North',
            price: 150,
        };

        const response = await request(app)
            .post('/api/hotel/add')
            .send(newHotel)
            .expect(201);

        expect(response.body).toHaveProperty('_id');
        expect(response.body.typeOfRoom).toBe('Deluxe');
        expect(response.body.floor).toBe(5);
    });

    it('should return 400 if required fields are missing', async () => {
        const newHotel = {
            typeOfRoom: 'Deluxe',
            // Missing floor, zone, and price
        };

        const response = await request(app)
            .post('/api/hotel/add')
            .send(newHotel)
            .expect(400);

        expect(response.body).toHaveProperty('errors');
    });
});

describe('GET /api/hotel/get', () => {
    it('should retrieve all hotels', async () => {
        await new Hotel({
            typeOfRoom: 'Deluxe',
            floor: 5,
            zone: 'North',
            price: 150,
        }).save();

        const response = await request(app)
            .get('/api/hotel/get')
            .expect(200);

        expect(response.body.hotels.length).toBeGreaterThan(0);
        expect(response.body.count).toBeGreaterThan(0);
    });

    it('should handle errors properly', async () => {
        jest.spyOn(Hotel, 'find').mockRejectedValue(new Error('Database error'));

        const response = await request(app)
            .get('/api/hotel/get')
            .expect(500);

        expect(response.body.message).toBe('Database error');
    });
});

describe('GET /api/hotel/get/:id', () => {
    it('should retrieve a hotel by ID', async () => {
        const hotel = await new Hotel({
            typeOfRoom: 'Deluxe',
            floor: 5,
            zone: 'North',
            price: 150,
        }).save();

        const response = await request(app)
            .get(`/api/hotel/get/${hotel._id}`)
            .expect(200);

        expect(response.body._id).toBe(hotel._id.toString());
        expect(response.body.typeOfRoom).toBe('Deluxe');
    });

    it('should return 404 if the hotel is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .get(`/api/hotel/get/${invalidId}`)
            .expect(404);

        expect(response.body).toEqual({});
    });
});

describe('PUT /api/hotel/update/:id', () => {
    it('should update a hotel by ID', async () => {
        const hotel = await new Hotel({
            typeOfRoom: 'Deluxe',
            floor: 5,
            zone: 'North',
            price: 150,
        }).save();

        const updatedHotel = {
            typeOfRoom: 'Suite',
            floor: 7,
            zone: 'South',
            price: 200,
        };

        const response = await request(app)
            .put(`/api/hotel/update/${hotel._id}`)
            .send(updatedHotel)
            .expect(200);

        expect(response.body.typeOfRoom).toBe('Suite');
        expect(response.body.floor).toBe(7);
    });

    it('should return 404 if the hotel to update is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .put(`/api/hotel/update/${invalidId}`)
            .send({ typeOfRoom: 'Suite' })
            .expect(404);

        expect(response.body).toEqual({});
    });
});


describe('DELETE /api/hotel/delete/:id', () => {
    it('should delete a hotel by ID', async () => {
        const hotel = await new Hotel({
            typeOfRoom: 'Deluxe',
            floor: 5,
            zone: 'North',
            price: 150,
        }).save();

        const response = await request(app)
            .delete(`/api/hotel/delete/${hotel._id}`)
            .expect(200);

        expect(response.body._id).toBe(hotel._id.toString());
        expect(response.body.typeOfRoom).toBe('Deluxe');
    });

    it('should return 404 if the hotel to delete is not found', async () => {
        const invalidId = '64d2d4fa1a2c4d6a4e8e9cfc'; // Example of an invalid ObjectId

        const response = await request(app)
            .delete(`/api/hotel/delete/${invalidId}`)
            .expect(404);

        expect(response.body).toEqual({});
    });
});
