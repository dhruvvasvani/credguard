const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Middleware to protect routes by verifying JWT
 */
const protect = async (req, res, next) => {
    let token;

    // Check if token exists in headers and starts with Bearer
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (format: "Bearer <token>")
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token and attach to request object
            const [users] = await db.execute(
                'SELECT id, name, email, created_at FROM users WHERE id = ?',
                [decoded.id]
            );

            if (users.length === 0) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            req.user = users[0];
            next();
        } catch (error) {
            console.error('JWT Verification Error:', error.message);
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

module.exports = { protect };
