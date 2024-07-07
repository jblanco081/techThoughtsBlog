const express = require('express');
const Post = require('../models/post'); // Import the Post model
const authenticateToken = require('../middleware/auth'); // Middleware to authenticate JWT tokens

const router = express.Router();

// Create a new post (protected)
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { title, content, video } = req.body;
        const post = new Post({
            title,
            content,
            video,
            author: req.user.id // Use the authenticated user's ID as the author
        });
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').populate('comments.author', 'username');
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get a single post by ID
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('author', 'username').populate('comments.author', 'username');
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a post (protected)
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { title, content, video } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the author of the post
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        post.title = title;
        post.content = content;
        post.video = video;

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a post (protected)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if the authenticated user is the author of the post
        if (post.author.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await post.remove();
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add a comment to a post (protected)
router.post('/:id/comments', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const comment = {
            text,
            author: req.user.id
        };

        post.comments.push(comment);
        const updatedPost = await post.save();
        res.status(201).json(updatedPost);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
