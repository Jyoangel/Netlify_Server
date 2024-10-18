
const jwt = require('jsonwebtoken');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

function checkRole(roles) {
    return (req, res, next) => {
        const token = req.cookies.token;
        console.log('Token received in checkRole middleware:', token);
        if (!token) {
            return res.status(401).json({ msg: 'No token, authorization denied' });
        }

        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded.user;

            if (!roles.includes(req.user.role)) {
                return res.status(403).json({ msg: 'Access denied' });
            }

            next();
        } catch (err) {
            res.status(401).json({ msg: 'Token is not valid' });
        }
    };
}

module.exports = checkRole;
