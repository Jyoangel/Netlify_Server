const mongoose = require('mongoose');
const Class = require('../Models/class');

describe('Class Model Test', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('should create & save a class successfully', async () => {
        const classData = { className: 'Class 1' };
        const classInstance = new Class(classData);
        const savedClass = await classInstance.save();

        // Validate the response
        expect(savedClass._id).toBeDefined();
        expect(savedClass.className).toBe(classData.className);
        expect(savedClass.date).toBeDefined();
        expect(savedClass.time).toBeDefined();
    });

    it('should fail to create a class without required field', async () => {
        const classInstance = new Class({});
        let err;
        try {
            await classInstance.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.className).toBeDefined();
    });
});
