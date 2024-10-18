
const express = require('express');
const auth = require('../../middleware/auth');
const Teacher = require('../../Models/TeacherDetails');

const router = express.Router();


router.get('/get', auth, async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            return res.status(200).json({ msg: 'Admin access granted' });
        }

        const teacher = await Teacher.findById(req.user.id).select('-password');
        res.json(teacher);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
