const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('../utils/jwt');
const User = require('../models/user');
const authenticateToken = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const user = new User({
            username: req.body.username,
            password: hashedPassword
        });

        const savedUser = await user.save();
        res.send({ user: savedUser._id });
    } catch (err) {
        res.status(400).send(err);
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.body.username });
        if (!user) return res.status(400).send('Username or password is wrong');

        const validPass = await bcrypt.compare(req.body.password, user.password);
        if (!validPass) return res.status(400).send('Invalid password');

        const token = jwt(user);
        res.json({ token });
    } catch (err) {
        res.status(400).send(err);
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
