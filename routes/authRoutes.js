const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser } = require('../controllers/authController');

const router = express.Router();

// Stricter rate limiting specifically for auth routes (prevent brute force)
const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour window
    max: 10, // start blocking after 10 requests
    message: 'Too many authentication attempts from this IP, please try again after an hour'
});

// Validation rules for registration
const registerValidation = [
    body('name').notEmpty().withMessage('Name is required').trim().escape(),
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/\d/)
        .withMessage('Password must contain at least one number')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[\W_]/)
        .withMessage('Password must contain at least one special character'),
    // body('phone_number').optional().isMobilePhone().withMessage('Invalid phone number'),
    // body('address').optional().trim().escape(),
    // body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
    // body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    // body('gov_id').optional().trim().escape(),
];

// Validation rules for login
const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
];

// @route   POST /api/auth/register
router.post('/register', authLimiter, registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginValidation, loginUser);

module.exports = router;
