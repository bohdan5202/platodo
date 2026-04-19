const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
    const header = req.header('Authorization');
    if (!header) return res.status(401).json({ error: 'Access denied. No token provided.' });

    const token = header.replace('Bearer ', '');
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        req.user = decoded;
        next();
    } catch (e) {
        res.status(400).json({ error: 'Invalid token.' });
    }
}

module.exports = authenticate;
