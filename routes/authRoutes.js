const express = require('express');
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { registerUser, loginUser, logoutUser } = require('../controllers/authController');
const loginBruteForceLimiter = require('../middleware/loginBruteForceLimiter');

const router = express.Router();

// Rule B4: Strict Rate limiting on sensitive auth endpoints (5 attempts per 15 minutes)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: { message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Validation rules for registration
const registerValidation = [
    body('name')
        .notEmpty().withMessage('Name is required')
        .isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters')
        .trim().escape(),
    body('email')
        .isEmail().withMessage('Please provide a valid email')
        .isLength({ max: 100 }).withMessage('Email cannot exceed 100 characters')
        .normalizeEmail(),
    body('phone')
        .notEmpty().withMessage('Phone number is required')
        .matches(/^\+\d{1,4}\d{7,14}$/).withMessage('Phone must include country code (e.g. +919876543210)')
        .isLength({ min: 10, max: 18 }).withMessage('Phone must be 10-18 characters including country code')
        .trim(),
    body('country').optional().trim(),
    body('state').optional().trim(),
    body('city').optional().trim(),
    body('pincode').optional().trim(),
    body('password')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
        .matches(/\d/).withMessage('Password must contain at least one number')
        .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
        .matches(/[\W_]/).withMessage('Password must contain at least one special character'),
];

// Validation rules for login (accepts email OR phone as 'identifier')
const loginValidation = [
    body('identifier').notEmpty().withMessage('Email or phone number is required').trim(),
    body('password').notEmpty().withMessage('Password is required'),
];

// @route   POST /api/auth/register
router.post('/register', authLimiter, registerValidation, registerUser);

// @route   POST /api/auth/login
router.post('/login', authLimiter, loginBruteForceLimiter, loginValidation, loginUser);

// @route   POST /api/auth/logout
router.post('/logout', logoutUser);

module.exports = router;
