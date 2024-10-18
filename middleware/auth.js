// auth.js
{/*
const jwt = require('jsonwebtoken');
const JWT_SECRET = '63cf2f30d8166f87f51da98c20c25ae7dd1f1bf3e48ad0012ffad3d15f347d0c7467049c3511d6fd5718001c1910452a9532c36ee465020a912c0c6a7514b300';


module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

{/*const jwt = require('jsonwebtoken');

const JWT_SECRET = '63cf2f30d8166f87f51da98c20c25ae7dd1f1bf3e48ad0012ffad3d15f347d0c7467049c3511d6fd5718001c1910452a9532c36ee465020a912c0c6a7514b300';

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

module.exports = authMiddleware;
*/}


const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = function (req, res, next) {
    // Get token from header
    //const token = req.cookies.token;
    const token = req.cookies.token;
    console.log('Token received in middleware:', token);

    // Check if not token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};

