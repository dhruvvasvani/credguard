const express = require('express');
const { body } = require('express-validator');
const { getUserProfile, updateUserProfile } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Validation rules for optional profile update
const updateProfileValidation = [
    body('age').optional().isInt({ min: 1, max: 120 }).withMessage('Age must be between 1 and 120'),
    body('country').optional().isLength({ max: 50 }).withMessage('Country cannot exceed 50 characters').trim().escape(),
    body('state').optional().isLength({ max: 50 }).withMessage('State cannot exceed 50 characters').trim().escape(),
    body('city').optional().isLength({ max: 50 }).withMessage('City cannot exceed 50 characters').trim().escape(),
    body('pincode').optional().isLength({ max: 10 }).withMessage('Pincode cannot exceed 10 characters').trim().escape(),
];

// Protect all routes below this middleware
router.use(protect);

// @route   GET /api/profile
router.get('/', getUserProfile);

// @route   PUT /api/profile
router.put('/', updateProfileValidation, updateUserProfile);

module.exports = router;
