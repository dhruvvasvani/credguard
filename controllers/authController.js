const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * Generate JWT Token
 * @param {number} id - User ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
};

const sendTokenResponse = (user, statusCode, res, message) => {
    const token = generateToken(user.id);

    const options = {
        expires: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    };

    res.status(statusCode)
       .cookie('token', token, options)
       .json({
           message,
           user: {
               id: user.id,
               name: user.name,
               email: user.email,
               phone: user.phone
           },
           token
       });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res, next) => {
    try {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, phone, password, country, state, city, pincode } = req.body;

        // Check if user already exists (by email or phone)
        const [existingUsers] = await db.execute(
            'SELECT email, phone FROM users WHERE email = ? OR phone = ?',
            [email, phone]
        );
        
        if (existingUsers.length > 0) {
            const existing = existingUsers[0];
            if (existing.email === email) {
                res.status(400);
                throw new Error('User already exists with this email');
            }
            if (existing.phone === phone) {
                res.status(400);
                throw new Error('User already exists with this phone number');
            }
        }

        // Hash password (salt rounds >= 12)
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (name, email, phone, password, country, state, city, pincode) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, phone, hashedPassword, country || null, state || null, city || null, pincode || null]
        );

        const newUserId = result.insertId;

        sendTokenResponse({ id: newUserId, name, email, phone }, 201, res, 'User registered successfully');
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get token (login via email OR phone)
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res, next) => {
    try {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { identifier, password } = req.body;

        // Find user by email OR phone
        const [users] = await db.execute(
            'SELECT * FROM users WHERE email = ? OR phone = ? OR phone LIKE ?',
            [identifier, identifier, `%${identifier}`]
        );
        
        if (users.length === 0) {
            if (req.loginFailed) req.loginFailed();
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            if (req.loginSucceeded) req.loginSucceeded();
            sendTokenResponse(user, 200, res, 'Login successful');
        } else {
            if (req.loginFailed) req.loginFailed();
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logoutUser = async (req, res) => {
    res.cookie('token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        sameSite: 'strict'
    });
    res.json({ message: 'User logged out successfully' });
};

module.exports = {
    registerUser,
    loginUser,
    logoutUser
};
