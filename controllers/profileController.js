const db = require('../config/db');
const { validationResult } = require('express-validator');

/**
 * @desc    Get user profile
 * @route   GET /api/profile
 * @access  Private (Requires Token)
 */
const getUserProfile = async (req, res, next) => {
    try {
        // User is attached to req by the protect middleware
        if (!req.user) {
            res.status(404);
            throw new Error('User not found');
        }

        res.json({
            data: {
                id: req.user.id,
                name: req.user.name,
                email: req.user.email,
                phone: req.user.phone,
                age: req.user.age,
                country: req.user.country,
                state: req.user.state,
                city: req.user.city,
                pincode: req.user.pincode,
                created_at: req.user.created_at
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile (optional fields: age, country, state, city, pincode)
 * @route   PUT /api/profile
 * @access  Private
 */
const updateUserProfile = async (req, res, next) => {
    try {
        // Validate inputs
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { age, country, state, city, pincode } = req.body;
        const userId = req.user.id;

        // Update the optional profile fields
        await db.execute(
            'UPDATE users SET age = ?, country = ?, state = ?, city = ?, pincode = ? WHERE id = ?',
            [age || null, country || null, state || null, city || null, pincode || null, userId]
        );

        // Fetch updated user to return
        const [updatedUsers] = await db.execute(
            'SELECT id, name, email, phone, age, country, state, city, pincode, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            data: updatedUsers[0]
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};
