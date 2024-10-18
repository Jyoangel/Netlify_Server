require('dotenv').config();
const express = require('express');
const router = express.Router();
const Chat = require('../Models/Chat');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"]
    }
});


// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });
// route to post voice recording 
router.post('/upload-voice', upload.single('voice'), async (req, res) => {
    try {
        console.log('Upload voice request received:', req.file);
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `voice_messages/${req.file.originalname}`,
        });
        console.log('Cloudinary upload result:', result);
        const voiceUrl = result.secure_url;

        res.json({ voiceUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading voice message');
    }
});

// Route to send a message
router.post('/send', upload.single('file'), async (req, res) => {
    try {
        console.log('Send message request received:', req.body, req.file);
        const { time, sender, senderModel, receiver, receiverModel, text, voiceUrl } = req.body;
        let fileUrl = '';


        // Upload file to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'chat-files',
            });
            fileUrl = result.secure_url;
        }

        // Get voice URL from previous request
        const voiceRequest = req.body.voiceRequest;
        console.log("VoiceRequest", voiceRequest)
        if (voiceRequest) {
            voiceUrl = voiceRequest.voiceUrl;
        }

        // Save message to database
        const newMessage = new Chat({
            time,
            sender,
            senderModel,
            receiver,
            receiverModel,
            text,
            fileUrl,
            voiceUrl,
        });
        console.log('Saving message to database:', newMessage);
        await newMessage.save();

        // Emit the new message to the client
        io.emit('newMessage', newMessage);

        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
        console.log(error);
    }
});



// router.get('/messages', async (req, res) => {
//     try {
//         const { sender, receiver } = req.query;
//         const messages = await Chat.find({ sender, receiver }).sort({ time: -1 });
//         res.json(messages);
//     } catch (error) {
//         console.error("Error fetching messages:", error);
//         res.status(500).json({ error: "Failed to fetch messages" });
//     }
// });

// route to fetch messages 
router.get("/messages", async (req, res) => {
    const { sender, receiver } = req.query;

    console.log("Received request to /messages");
    console.log("UserID:", sender);
    console.log("SelectedUserID:", receiver);

    try {
        const messages = await Chat.find({
            $or: [
                { sender: sender, receiver: receiver },
                { sender: receiver, receiver: sender },
            ],
        }).sort({ createdAt: 1 }); // Sort messages by creation date



        res.json(messages);
    } catch (error) {
        console.error("Error fetching messages:", error);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// router.get('/messages', async (req, res) => {
//     const { sender, receiver } = req.query;

//     try {
//         const messages = await Chat.find({ sender, receiver })
//             .sort({ createdAt: 1 }); // Sorting by creation time
//         res.json(messages);
//     } catch (error) {
//         res.status(500).send('Server Error');
//     }
// });


module.exports = router;



{/*const express = require('express');
const router = express.Router();
const Chat = require('../Models/Chat');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const fs = require('fs');

// Cloudinary configuration
cloudinary.config({
    cloud_name: 'dsnfr8q1u',
    api_key: '721714419449564',
    api_secret: 'AwzrmpiCFz9CxwSGWwRdAx9d9ok',
});

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

router.post('/upload-voice', upload.single('voice'), async (req, res) => {
    try {
        console.log('Upload voice request received:', req.file);
        const result = await cloudinary.uploader.upload(req.file.path, {
            resource_type: 'video',
            public_id: `voice_messages/${req.file.originalname}`,
        });
        console.log('Cloudinary upload result:', result);
        const voiceUrl = result.secure_url;

        res.json({ voiceUrl });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading voice message');
    }
});

// Route to send a message
router.post('/send', upload.single('file'), async (req, res) => {
    try {
        console.log('Send message request received:', req.body, req.file, req.voice);
        const { time, sender, senderModel, receiver, receiverModel, text } = req.body;
        let fileUrl = '';
        let voiceUrl = '';

        // Upload file to Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'chat-files',
            });
            fileUrl = result.secure_url;
        }

        // Upload voice record to Cloudinary
        if (req.voice) {
            console.log('Uploading voice record to Cloudinary:', req.voice);
            const result = await cloudinary.uploader.upload(req.voice.path, {
                folder: 'chat-voices',
                resource_type: 'video',
            });
            voiceUrl = result.secure_url;
        }

        // Save message to database
        const newMessage = new Chat({
            time,
            sender,
            senderModel,
            receiver,
            receiverModel,
            text,
            fileUrl,
            voiceUrl,
        });
        await newMessage.save();

        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
        console.log(error);
    }
});

{/*const express = require('express');
const router = express.Router();
const Chat = require('../Models/Chat');
const Teacher = require('../Models/TeacherDetails');
const Student = require('../Models/StudentDetails');

router.post('/send', async (req, res) => {
    try {
        const { time, sender, senderModel, receiver, receiverModel, text, fileUrl, voiceUrl } = req.body;
        const newMessage = new Chat({ time, sender, senderModel, receiver, receiverModel, text, fileUrl, voiceUrl });
        await newMessage.save();
        res.status(200).json(newMessage);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send message' });
        console.log(error);
    }
});



router.get('/messages', async (req, res) => {
    const { sender, receiver } = req.query;

    try {
        const messages = await Chat.find({ sender, receiver })
            .sort({ createdAt: 1 }); // Sorting by creation time
        res.json(messages);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});


module.exports = router;

*/}

