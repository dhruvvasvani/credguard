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
        expiresIn: process.env.JWT_EXPIRES_IN || '30d',
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

        const { name, email, password /*, phone_number, address, age, gender, gov_id */ } = req.body;

        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT email FROM users WHERE email = ?', [email]);
        
        if (existingUsers.length > 0) {
            res.status(400);
            throw new Error('User already exists with this email');
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insert new user
        const [result] = await db.execute(
            'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
            // To include extra fields, use the query below instead:
            // 'INSERT INTO users (name, email, password, phone_number, address, age, gender, gov_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword /*, phone_number, address, age, gender, gov_id */]
        );

        const newUserId = result.insertId;

        // Success response
        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUserId,
                name: name,
                email: email
                //, phone_number: phone_number
                //, address: address
                //, age: age
                //, gender: gender
                //, gov_id: gov_id
            },
            token: generateToken(newUserId)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Authenticate user & get token
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

        const { email, password } = req.body;

        // Find user by email
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        
        if (users.length === 0) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

        const user = users[0];

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            res.json({
                message: 'Login successful',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                    //, phone_number: user.phone_number
                    //, address: user.address
                    //, age: user.age
                    //, gender: user.gender
                    //, gov_id: user.gov_id
                },
                token: generateToken(user.id)
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser
};
