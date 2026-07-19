const express = require('express');
const { body } = require('express-validator');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules for profile update
const updateProfileValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty').trim().escape(),
    body('email').optional().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
    // body('phone_number').optional().isMobilePhone().withMessage('Invalid phone number'),
    // body('address').optional().trim().escape(),
    // body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Invalid age'),
    // body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
    // body('gov_id').optional().trim().escape(),
];

// Protect all routes below this middleware
router.use(protect);

// @route   GET /api/profile
router.get('/', getUserProfile);

// @route   PUT /api/profile
router.put('/', updateProfileValidation, updateUserProfile);

module.exports = router;
