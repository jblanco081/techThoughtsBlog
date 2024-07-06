const express = require('express');
const router = express.Router();
const multer = require('multer');
const Post = require('../models/post');
const auth = require('../middleware/auth');
const path = require('path');
const fs = require('fs');

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Fetch all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find().populate('author', 'username').populate('comments.author', 'username');
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send('Server error');
    }
});

// Create a new post with optional video
router.post('/', [auth, upload.single('video')], async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = new Post({
            title,
            content,
            author: req.user.userId,
            video: req.file ? req.file.path : null,
            createdAt: new Date()
        });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).send('Server error');
    }
});

// Update a post
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).send('Access denied');
        }
        post.title = title;
        post.content = content;
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).send('Server error');
    }
});

// Delete a post
router.delete('/:id', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).send('Access denied');
        }
        await post.remove();
        res.json({ message: 'Post deleted' });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).send('Server error');
    }
});

// Add a comment to a post
router.post('/:id/comments', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).send('Post not found');
        }
        post.comments.push({
            text: req.body.text,
            author: req.user.userId
        });
        await post.save();
        res.json(post);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Server error');
    }
});

module.exports = router;
