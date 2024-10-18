const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { check, validationResult } = require('express-validator');
const Teacher = require('../../Models/TeacherDetails');
const cors = require('cors');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET

// Admin credentials
const adminEmail = 'admin@gmail.com';
const adminPasswordHash = bcrypt.hashSync('admin', 10);

router.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true
}));

// Login route for teachers and admin
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user is admin
        if (email === adminEmail) {
            const isMatch = await bcrypt.compare(password, adminPasswordHash);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: 'admin',
                    role: 'admin'
                }
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
                if (err) throw err;

                res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });

                return res.status(200).json({ msg: 'Login successful', token });
            });
        } else {
            // Check if user is a teacher
            let teacher = await Teacher.findOne({ email });
            if (!teacher) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const dateOfBirth = teacher.dateOfBirth.toISOString().split('T')[0]; // Extract date part only
            const isMatch = await bcrypt.compare(password, teacher.password);
            console.log(`Email: ${email}, Password: ${password}, Hashed Password: ${teacher.password}, isMatch: ${isMatch}`);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: teacher.id,
                    role: 'teacher'
                }
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
                if (err) throw err;

                res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' }); // Hardcoded secure to true
                res.status(200).json({ msg: 'Login successful', token });
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Logout route to clear the token from cookies
router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ msg: 'Logout successful' });
});

router.get('/validateToken', (req, res) => {
    const token = req.headers.authorization.split(' ')[1];

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(200).json({ message: 'Token is valid' });
    });
});


module.exports = router;


{/*const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { check, validationResult } = require('express-validator');
const Teacher = require('../Models/TeacherDetails');

const router = express.Router();
const JWT_SECRET = '63cf2f30d8166f87f51da98c20c25ae7dd1f1bf3e48ad0012ffad3d15f347d0c7467049c3511d6fd5718001c1910452a9532c36ee465020a912c0c6a7514b300';

// Admin credentials
const adminEmail = 'admin@gmail.com';
const adminPasswordHash = bcrypt.hashSync('admin', 10);

// Login route for teachers and admin
router.post('/login', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        // Check if user is admin
        if (email === adminEmail) {
            const isMatch = await bcrypt.compare(password, adminPasswordHash);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: 'admin',
                    role: 'admin'
                }
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
                if (err) throw err;
                return res.status(200).json({ token });
                
            });
        } else {
            // Check if user is a teacher
            let teacher = await Teacher.findOne({ email });
            if (!teacher) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const dateOfBirth = teacher.dateOfBirth.toISOString().split('T')[0]; // Extract date part only
            const isMatch = await bcrypt.compare(password, teacher.password);
            if (!isMatch) {
                return res.status(400).json({ errors: [{ msg: 'Invalid Credentials' }] });
            }

            const payload = {
                user: {
                    id: teacher.id,
                    role: 'teacher'
                }
            };

            jwt.sign(payload, JWT_SECRET, { expiresIn: '5h' }, (err, token) => {
                if (err) throw err;
                res.status(200).json({ token });
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;*/}
