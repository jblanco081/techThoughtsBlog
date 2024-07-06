const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const usersRoute = require('./routes/users');
const postsRoute = require('./routes/posts');

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use('/users', usersRoute);
app.use('/posts', postsRoute);

const PORT = process.env.PORT || 3000;

// Corrected MongoDB connection options
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
    .catch(err => console.error('Failed to connect to MongoDB:', err));
