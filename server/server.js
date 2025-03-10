require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const usersRoute = require('./routes/users');
const postsRoute = require('./routes/posts');

const app = express();

app.use(express.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../docs')));

app.use('/users', usersRoute);
app.use('/posts', postsRoute);

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../docs', 'index.html'));
});

const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
