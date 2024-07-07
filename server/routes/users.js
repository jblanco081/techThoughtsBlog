const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt'); // Utility to generate JWT tokens
const User = require('../models/user'); // Import the User model
const authenticateToken = require('../middleware/auth'); // Middleware to authenticate JWT tokens

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).send('Username is already taken');
        }

        // Create a new user with hashed password
        const user = new User({ username, password });
        await user.save(); // Pre-save hook hashes the password
        res.status(201).send({ user: user._id });
    } catch (err) {
        res.status(400).send(err.message);
    }
});


// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(`Login attempt for username: ${username}`);

        const user = await User.findOne({ username });
        if (!user) {
            console.log(`User not found: ${username}`);
            return res.status(400).send('Username or password is incorrect');
        }

        const validPass = await user.comparePassword(password);
        console.log(`Password comparison result for ${username}: ${validPass}`);
        if (!validPass) {
            console.log(`Invalid password for username: ${username}`);
            return res.status(400).send('Invalid password');
        }

        const token = jwt.generateToken(user);
        console.log(`Login successful for username: ${username}`);
        res.json({ token, userId: user._id });
    } catch (err) {
        console.error('Login error:', err);
        res.status(400).send(err.message);
    }
});


// Get user details route (protected)
router.get('/user/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.json(user);
    } catch (err) {
        res.status(400).send(err.message);
    }
});

module.exports = router;
