const express = require('express');
const axios = require('axios');
const router = express.Router();

// Replace these with your actual Kinde Auth details
const KIND_AUTH_DOMAIN = 'lms1.kinde.com'; // Updated to remove extra 'https://'
const KIND_AUTH_API_KEY = '32652a53ae1a4285aeba745a6cc65e90';

router.get('/all-users', async (req, res) => {
    try {
        const response = await axios.get(`https://${KIND_AUTH_DOMAIN}/api/v1/users`, {
            headers: {
                Authorization: `Bearer ${KIND_AUTH_API_KEY}`
            }
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching users from Kinde Auth API:', err.response ? err.response.data : err.message);
        res.status(500).json({ error: 'Internal Server Error', details: err.response ? err.response.data : err.message });
    }
});

module.exports = router;
