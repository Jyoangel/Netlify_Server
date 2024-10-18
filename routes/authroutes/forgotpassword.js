const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const Teacher = require('../../Models/TeacherDetails');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET
const EMAIL_USER = process.env.User
const EMAIL_PASS = process.env.Pass;

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Route to request password reset
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        const user = await Teacher.findOne({ otp });
        if (!user || user.otpExpiration < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        // Clear OTP and expiration after successful verification
        user.otp = undefined;
        user.otpExpiration = undefined;
        await user.save();

        // Generate a token to use in subsequent requests
        const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '10m' });

        res.status(200).json({ msg: 'OTP verified', token });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
    const { newPassword, token } = req.body;
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const email = decoded.email;

        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Update user password and clear OTP fields
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiration = undefined;

        await user.save();

        res.status(200).json({ msg: 'Password has been reset' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to resend OTP
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate a new OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with new OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send new OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your new OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'New OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;


{/*
const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const Teacher = require('../Models/TeacherDetails');

const router = express.Router();
const JWT_SECRET = '63cf2f30d8166f87f51da98c20c25ae7dd1f1bf3e48ad0012ffad3d15f347d0c7467049c3511d6fd5718001c1910452a9532c36ee465020a912c0c6a7514b300';
const EMAIL_USER = "jyo209gup201@gmail.com";
const EMAIL_PASS = "endr hamj dblu rhiu";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

let userEmail = ''; // Variable to store user's email temporarily

// Route to request password reset
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Store the user's email temporarily
        userEmail = email;

        // Generate OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { otp } = req.body;
    try {
        if (!userEmail) {
            return res.status(400).json({ msg: 'Email not found' });
        }

        let user = await Teacher.findOne({ email: userEmail });
        if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        res.status(200).json({ msg: 'OTP verified', email: userEmail });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to reset password
router.post('/reset-password', async (req, res) => {
    const { newPassword } = req.body;
    try {
        if (!userEmail) {
            return res.status(400).json({ msg: 'Email not found' });
        }

        let user = await Teacher.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Update user password and clear OTP fields
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiration = undefined;

        await user.save();

        // Log the new password and hashed password
        console.log(`New password for ${user.email}: ${newPassword}`);

        res.status(200).json({ msg: 'Password has been reset' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        if (!userEmail) {
            return res.status(400).json({ msg: 'Email not found' });
        }

        let user = await Teacher.findOne({ email: userEmail });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate a new OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with new OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send new OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: userEmail,
            subject: 'Password Reset OTP',
            text: `Your new OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'New OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;


const express = require('express');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');
const Teacher = require('../Models/TeacherDetails');

const router = express.Router();
const JWT_SECRET = '63cf2f30d8166f87f51da98c20c25ae7dd1f1bf3e48ad0012ffad3d15f347d0c7467049c3511d6fd5718001c1910452a9532c36ee465020a912c0c6a7514b300';
const EMAIL_USER = "jyo209gup201@gmail.com";
const EMAIL_PASS = "endr hamj dblu rhiu";

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

// Route to request password reset
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to verify OTP
router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user || user.otp !== otp || user.otpExpiration < Date.now()) {
            return res.status(400).json({ msg: 'Invalid or expired OTP' });
        }

        res.status(200).json({ msg: 'OTP verified', email: user.email });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// Route to reset password
router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Update user password and clear OTP fields
        user.password = newPassword;
        user.otp = undefined;
        user.otpExpiration = undefined;

        await user.save();

        // Log the new password and hashed password
        console.log(`New password for ${user.email}: ${newPassword}`);

        res.status(200).json({ msg: 'Password has been reset' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Route to resend OTP
router.post('/resend-otp', async (req, res) => {
    const { email } = req.body;
    try {
        let user = await Teacher.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User with this email does not exist' });
        }

        // Generate a new OTP and set expiration
        const otp = Math.floor(100000 + Math.random() * 900000);
        const otpExpiration = new Date(Date.now() + 10 * 60000); // 10 minutes from now

        // Update user with new OTP and expiration
        user.otp = otp;
        user.otpExpiration = otpExpiration;
        await user.save();

        // Send new OTP to user's email
        const mailOptions = {
            from: EMAIL_USER,
            to: email,
            subject: 'Password Reset OTP',
            text: `Your new OTP for password reset is: ${otp}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return res.status(500).json({ msg: 'Failed to send email', error });
            }
            res.status(200).json({ msg: 'New OTP sent to email' });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;

// Route to reset password
{/*router.post('/reset-password', async (req, res) => {
    const { email, newPassword } = req.body;
    try {
        let teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Clear OTP fields
        teacher.password = hashedPassword;
        teacher.otp = undefined;
        teacher.otpExpiration = undefined;

        await teacher.save();
        console.log(`New password for ${teacher.email}: ${newPassword}`);
        console.log(`Hashed password for ${teacher.email}: ${hashedPassword}`);

        res.status(200).json({ msg: 'Password has been reset' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
*/}

