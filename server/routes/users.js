const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt'); // This utility generates JWT tokens
const User = require('../models/user'); 
const authenticateToken = require('../middleware/auth'); // Middleware to authenticate JWT tokens

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = new User({ username, password });
        const savedUser = await user.save();
        res.status(201).send({ user: savedUser._id });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).send('Username or password is incorrect');

        const validPass = await user.comparePassword(password);
        if (!validPass) return res.status(400).send('Invalid password');

        const token = jwt.generateToken(user);
        res.json({ token, userId: user._id });
    } catch (err) {
        res.status(400).send(err.message);
    }
});

// Get user details route
router.get('/user/:id', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
