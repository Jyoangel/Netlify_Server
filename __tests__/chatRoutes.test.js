// chatRoutes.test.js

const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Chat = require('../Models/Chat');
const chatRouter = require('../routes/chatroutes');

// Mock Cloudinary to avoid real HTTP requests
jest.mock('cloudinary');

const app = express();
app.use(express.json());
app.use(chatRouter);

describe('Chat Routes', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        jest.clearAllMocks();
        await Chat.deleteMany();
    });

    it('should upload a voice file and return a URL', async () => {
        const res = await request(app)
            .post('/upload-voice')
            .attach('voice', Buffer.from('dummy content'), 'voice.mp3');

        console.log('Response body:', res.body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.voiceUrl).toBe('http://mockedurl.com/file');
    });

    it('should send a message with a file and return the saved message', async () => {
        const res = await request(app)
            .post('/send')
            .field('time', '12:00')
            .field('sender', 'senderId')
            .field('senderModel', 'User')
            .field('receiver', 'receiverId')
            .field('receiverModel', 'User')
            .field('text', 'Hello World!')
            .attach('file', Buffer.from('dummy content'), 'file.txt');

        console.log('Response body:', res.body);

        expect(res.statusCode).toEqual(200);
        expect(res.body.text).toBe('Hello World!');
        expect(res.body.fileUrl).toBe('http://mockedurl.com/file');
    });

    it('should retrieve messages between two users', async () => {
        // Clear any existing data
        await Chat.deleteMany({});

        // Save test messages
        const message1 = new Chat({
            time: '12:00',
            sender: 'user1',
            senderModel: 'User',
            receiver: 'user2',
            receiverModel: 'User',
            text: 'Message 1',
        });
        const message2 = new Chat({
            time: '12:05',
            sender: 'user2',
            senderModel: 'User',
            receiver: 'user1',
            receiverModel: 'User',
            text: 'Message 2',
        });

        await message1.save();
        await message2.save();

        // Make request
        const res = await request(app)
            .get('/messages?sender=user1&receiver=user2');

        // Validate response
        expect(res.statusCode).toEqual(200);
        //expect(res.body.length).toBe(2);
        //expect(res.body[0].text).toBe('Message 1');
        //expect(res.body[1].text).toBe('Message 2');
    });


    it('should handle errors when fetching messages', async () => {
        const findMock = jest.spyOn(Chat, 'find').mockReturnValue({
            sort: jest.fn().mockRejectedValue(new Error('Database Error'))
        });

        const res = await request(app)
            .get('/messages?sender=user1&receiver=user2');

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toBe('Failed to fetch messages');

        findMock.mockRestore(); // Clean up after test
    });


    it('should handle errors when sending a message', async () => {
        jest.spyOn(Chat.prototype, 'save').mockRejectedValue(new Error('Database Error'));

        const res = await request(app)
            .post('/send')
            .field('time', '12:00')
            .field('sender', 'senderId')
            .field('senderModel', 'User')
            .field('receiver', 'receiverId')
            .field('receiverModel', 'User')
            .field('text', 'Hello World!')
            .attach('file', Buffer.from('dummy content'), 'file.txt');

        expect(res.statusCode).toEqual(500);
        expect(res.body.error).toBe('Failed to send message');
    });
});
