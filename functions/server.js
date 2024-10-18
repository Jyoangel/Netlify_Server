
require('dotenv').config();
const express = require('express');
const serverless = require('serverless-http');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
require('../routes/feeScheduler');
// Importing routes
const loginRoutes = require('../routes/authroutes/loginroutes');
const protectedRoutes = require('../routes/authroutes/protectedroutes');
const studentRoutes = require('../routes/studentroutes');
const teacherRoutes = require('../routes/teacherroutes');
const staffRoutes = require('../routes/staffroutes');
const courseRoutes = require('../routes/courseroutes');
const eventRoutes = require('../routes/eventroutes');
const liveclassRoutes = require('../routes/liveclassroutes');
const forgotpasswordRoutes = require('../routes/authroutes/forgotpassword');
const feeRoutes = require('../routes/feeroutes');
const paymentTeacherRoutes = require('../routes/paymentteacherroutes');
const paymentStaffRoutes = require('../routes/staffpaymentroutes');
const paymentRoutes = require('../routes/paymentroutes');
const admitCardRoutes = require('../routes/admitcardroutes');
const communicationRoutes = require('../routes/communicationroutes');
const countRoutes = require('../routes/countroutes');
const assignmentRoutes = require('../routes/assignmentroutes');
const homeworkRoutes = require('../routes/homeworkroutes');
const libraryRoutes = require('../routes/libraryroutes');
const examRoutes = require('../routes/examroutes');
const reportcardRoutes = require('../routes/reportcardroutes');
const transpotationRoutes = require('../routes/transpotation');
const enquiryRoutes = require('../routes/enquiryroutes');
const hotelRoutes = require('../routes/hotelroutes');
const subjectRoutes = require('../routes/subjectroutes');
const classRoutes = require('../routes/classroutes');
const classScheduleRoutes = require('../routes/classscheduleroutes');
const calendarRoutes = require('../routes/calendarroutes');
const chatRoutes = require('../routes/chatroutes');
const attendanceRoutes = require('../routes/attendanceroutes');
const adminUserRoutes = require('../routes/adminUser')
const adminCreateRoutes = require('../config/createDatabase')

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));
//http://192.168.6.152:3000
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

const userSockets = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Register the user's socket ID
  socket.on('register', (userId) => {
    userSockets[userId] = socket.id;
    console.log(`User ${userId} registered with socket ID ${socket.id}`);
  });

  // socket.on('sendMessage', async (messageData) => {
  //   try {
  //     console.log('Message data:', messageData);
  //     socket.broadcast.emit('receiveMessage', messageData);
  //   } catch (err) {
  //     console.error('Error saving message:', err);
  //   }
  // });

  socket.on('sendMessage', (message) => {
    console.log(message);
    socket.broadcast.emit('receiveMessage', message);
  });

  socket.on('call', (data) => {
    const receiverSocketId = userSockets[data.to];
    if (receiverSocketId) {
      console.log(`Call from ${data.from} to ${data.to}`);
      io.to(receiverSocketId).emit('call', { from: data.from, signal: data.signal });
    }
  });

  socket.on('answer', (data) => {
    const callerSocketId = userSockets[data.to];
    if (callerSocketId) {
      console.log(`Answer from ${data.from} to ${data.to}`);


      io.to(callerSocketId).emit('answer', { from: data.from, signal: data.signal, to: data.to });
    }
  });

  // Handle the 'callConfirmed' event
  socket.on('callAnswered', (data) => {
    console.log('Received callAnswered data:', data); // Log the data to ensure it's correct
    const callerSocketId = userSockets[data.to];
    console.log('Call confirmed by:', data.from); // This should not be undefined
    if (callerSocketId) {
      console.log(`Call confirmed from ${data.from} to ${data.to}`);
      io.to(callerSocketId).emit('callConfirmed', { from: data.from, to: data.to });
    } else {
      console.log('Caller socket ID not found for:', data.to);
    }
  });


  socket.on('callEnded', (data) => {
    const otherSocketId = userSockets[data.to];
    if (otherSocketId) {
      console.log(`Call ended from ${data.from} to ${data.to}`);
      io.to(otherSocketId).emit('callEnded', { from: data.from });
    }
  });



  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove the socket ID from userSockets
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
  });
});
{/*
const users = {};

io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('register', (userId) => {
    users[userId] = socket;
    console.log(`User ${userId} registered`);
  });

  socket.on('call', (data) => {
    console.log(`Call from ${data.from} to ${data.to}`);
    const receiverSocket = users[data.to];
    if (receiverSocket) {
      receiverSocket.emit('call', { from: data.from, signal: data.signal });
    }
  });

  socket.on('answer', (data) => {
    console.log(`Answer from ${data.from} to ${data.to}`);
    const callerSocket = users[data.to];
    if (callerSocket) {
      callerSocket.emit('answer', { from: data.from, signal: data.signal });
    }
  });
});
*/}
app.use(cookieParser());
app.use(express.json());
app.use(session({
  secret: '5c69a3691b9269010ce3f516d894af1106a7b15015b7442e62643a09154e18c6d451d28ce47dce76c8c794a67cc0cc61f56eabc6520f44aa0acf2321112bb9eb',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true }
}));

const connectDB = require('../config/db');
//connectDB();
// Middleware to switch DB connection based on the logged-in user
app.use(async (req, res, next) => {

  const dbName = req.body.dbName;
  console.log("Ressp", req.body);// Assuming dbName is based on user's Auth0 sub

  if (dbName) {
    try {
      await connectDB(dbName); // Connect to the user's specific database
    } catch (err) {
      return res.status(500).json({ error: 'Failed to switch database' });
    }
  }
  next(); // Proceed to the next middleware or route handler
});

app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true,
}));

//app.use('/uploads', express.static('uploads'));


app.get("/", (req, res) => {
  res.send("welcome backend");
});

// Defining routes
app.use("/api", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/liveclass", liveclassRoutes);
app.use("/api/forgotpassword", forgotpasswordRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/paymentTeacher", paymentTeacherRoutes);
app.use("/api/StaffPayment", paymentStaffRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/api/admitcard", admitCardRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/count", countRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/reportcard", reportcardRoutes);
app.use("/api/transpotation", transpotationRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/class", classRoutes);
app.use("/api/classSchedule", classScheduleRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/user", adminUserRoutes);
app.use("/api/admin", adminCreateRoutes);

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
module.exports.handler = serverless(app);
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, '0.0.0.0', () => {
//   console.log(`Server running on port ${PORT}`);
// });


{/*
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/upload-voice', upload.single('voice'), (req, res) => {
  console.log('Received upload voice request');
  res.json({ voiceUrl: `/uploads/${req.file.filename}` });
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);

  socket.on('sendMessage', (message) => {
    console.log(message);
    socket.broadcast.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

const users = {};

io.on('connection', (socket) => {
  console.log('New connection');

  socket.on('register', (userId) => {
    users[userId] = socket;
    console.log(`User ${userId} registered`);
  });

  socket.on('call', (data) => {
    console.log(`Call from ${data.from} to ${data.to}`);
    const receiverSocket = users[data.to];
    if (receiverSocket) {
      receiverSocket.emit('call', { from: data.from, signal: data.signal });
    }
  });

  socket.on('answer', (data) => {
    console.log(`Answer from ${data.from} to ${data.to}`);
    const callerSocket = users[data.to];
    if (callerSocket) {
      callerSocket.emit('answer', { from: data.from, signal: data.signal });
    }
  });
});
*/}
{/*const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const mongoose = require('mongoose');
const cors = require('cors')
const session = require('express-session');
const cookieParser = require('cookie-parser');

const loginRoutes = require('./routes/authroutes/loginroutes')
const protectedRoutes = require('./routes/authroutes/protectedroutes')
const studentRoutes = require('./routes/studentroutes');
const teacherRoutes = require('./routes/teacherroutes');
const staffRoutes = require('./routes/staffroutes');
const courseRoutes = require('./routes/courseroutes');
const eventRoutes = require('./routes/eventroutes');
const liveclassRoutes = require('./routes/liveclassroutes');
const forgotpasswordRoutes = require('./routes/authroutes/forgotpassword');
const feeRoutes = require('./routes/feeroutes');
const paymentTeacherRoutes = require('./routes/paymentteacherroutes')
const paymentStaffRoutes = require('./routes/staffpaymentroutes')
const paymentRoutes = require("./routes/paymentroutes");
const admitCardRoutes = require("./routes/admitcardroutes");
const communicationRoutes = require("./routes/communicationroutes");
const countRoutes = require("./routes/countroutes");
const assignmentRoutes = require("./routes/assignmentroutes");
const homeworkRoutes = require("./routes/homeworkroutes");
const libraryRoutes = require("./routes/libraryroutes");
const examRoutes = require("./routes/examroutes");
const reportcardRoutes = require("./routes/reportcardroutes");
const transpotationRoutes = require("./routes/transpotation");
const enquiryRoutes = require("./routes/enquiryroutes");
const hotelRoutes = require("./routes/hotelroutes");
const subjectRoutes = require("./routes/subjectroutes");
const classRoutes = require("./routes/classroutes");
const classScheduleRoutes = require("./routes/classscheduleroutes");
const calendarRoutes = require("./routes/calendarroutes");

const app = express();
app.use(cookieParser());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('sendMessage', (message) => {
    io.emit('receiveMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.use(session({
  secret: '5c69a3691b9269010ce3f516d894af1106a7b15015b7442e62643a09154e18c6d451d28ce47dce76c8c794a67cc0cc61f56eabc6520f44aa0acf2321112bb9eb',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true } // Hardcoded secure to true
}));

const connectDB = require('./config/db');

connectDB();


//app.use(cors())
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("PhonePe Integration APIs!");
});

app.use("/api", studentRoutes);
app.use("/api/teacher", teacherRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/event", eventRoutes);
app.use("/api/auth", loginRoutes);
app.use("/api/protected", protectedRoutes);
app.use("/api/liveclass", liveclassRoutes);
app.use("/api/forgotpassword", forgotpasswordRoutes);
app.use("/api/fees", feeRoutes);
app.use("/api/paymentTeacher", paymentTeacherRoutes);
app.use("/api/StaffPayment", paymentStaffRoutes);
app.use("/api/pay", paymentRoutes);
app.use("/api/admitcard", admitCardRoutes);
app.use("/api/communication", communicationRoutes);
app.use("/api/count", countRoutes);
app.use("/api/assignment", assignmentRoutes);
app.use("/api/homework", homeworkRoutes);
app.use("/api/library", libraryRoutes);
app.use("/api/exam", examRoutes);
app.use("/api/reportcard", reportcardRoutes);
app.use("/api/reportcard", reportcardRoutes);
app.use("/api/transpotation", transpotationRoutes);
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/hotel", hotelRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/class", classRoutes);
app.use("/api/classSchedule", classScheduleRoutes);
app.use("/api/calendar", calendarRoutes);

const port = process.env.PORT

app.listen(port, () => {
  console.log('Server is running on port http://localhost:5000');

})

*/}