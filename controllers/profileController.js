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
            id: req.user.id,
            name: req.user.name,
            email: req.user.email,
            // phone_number: req.user.phone_number,
            // address: req.user.address,
            // age: req.user.age,
            // gender: req.user.gender,
            // gov_id: req.user.gov_id,
            created_at: req.user.created_at
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update user profile
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

        const { name, email /*, phone_number, address, age, gender, gov_id */ } = req.body;
        const userId = req.user.id;

        // If updating email, check if it's already taken by someone else
        if (email !== req.user.email) {
            const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
            if (existing.length > 0) {
                res.status(400);
                throw new Error('Email is already taken by another user');
            }
        }

        // Update the user
        await db.execute(
            'UPDATE users SET name = ?, email = ? WHERE id = ?',
            // To update extra fields, use the query below instead:
            // 'UPDATE users SET name = ?, email = ?, phone_number = ?, address = ?, age = ?, gender = ?, gov_id = ? WHERE id = ?',
            [name, email /*, phone_number, address, age, gender, gov_id */, userId]
        );

        // Fetch updated user to return
        const [updatedUsers] = await db.execute(
            'SELECT id, name, email, created_at FROM users WHERE id = ?',
            // To fetch extra fields, use the query below instead:
            // 'SELECT id, name, email, phone_number, address, age, gender, gov_id, created_at FROM users WHERE id = ?',
            [userId]
        );

        res.json({
            message: 'Profile updated successfully',
            user: updatedUsers[0]
        });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile
};
