const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth'); // Import Security Guard

const router = express.Router();

// HELPER: Sign Token
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Create User (Password hashing happens in Model)
        const user = await User.create({
            username,
            email,
            password
        });

        // Generate Token
        const token = signToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: { id: user._id, name: user.username, email: user.email, wallet: user.wallet }
        });
    } catch (err) {
        // Handle Duplicate Email Error
        if (err.code === 11000) {
            return res.status(400).json({ success: false, message: 'Email or Username already exists' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate Email & Password presence
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        // Check for user (and select password explicitly)
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check if password matches
        const isMatch = await user.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Generate Token
        const token = signToken(user._id);

        res.status(200).json({
            success: true,
            token,
            user: { id: user._id, name: user.username, email: user.email, wallet: user.wallet }
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current logged in user (Protected)
router.get('/me', protect, async (req, res) => {
    // req.user is already attached by middleware
    res.status(200).json({
        success: true,
        data: req.user
    });
});

module.exports = router;
