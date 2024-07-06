const API_URL = 'https://techthoughtsblog.onrender.com';

// Handle user registration
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered successfully');
        autoLogin(username, password);
    } else {
        const errorText = await response.text();
        alert('User registration failed: ' + errorText);
    }
});

// Function to automatically log in after registration
async function autoLogin(username, password) {
    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        alert('Login successful');
        updateUIForLoggedInUser(username);
        fetchUserDetails(data.userId, data.token);
    } else {
        alert('Auto-login failed');
    }
}

// Handle user login
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);
        alert('Login successful');
        updateUIForLoggedInUser(username);
        fetchUserDetails(data.userId, data.token);
    } else {
        alert('Login failed');
    }
});

// Handle user logout
document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    updateUIForLoggedOutUser();
    alert('Logged out successfully');
});

// Fetch user details
async function fetchUserDetails(userId, token) {
    const response = await fetch(`${API_URL}/users/user/${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    if (response.ok) {
        const user = await response.json();
        document.getElementById('userDetails').textContent = `Logged in as: ${user.username}`;
    } else {
        alert('Failed to fetch user details');
    }
}

// Handle post creation
document.getElementById('createPostForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You must be logged in to create a post');
        return;
    }

    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title, content })
    });

    if (response.ok) {
        alert('Post created successfully');
        fetchPosts();
    } else {
        alert('Failed to create post');
    }
});

// Fetch and display posts
async function fetchPosts() {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p class="author">By: ${post.author.username}</p>
        `;
        postsDiv.appendChild(postDiv);
    });
}

// Update UI for logged in user
function updateUIForLoggedInUser(username) {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}`;
    document.getElementById('postForm').style.display = 'block';
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('postForm').style.display = 'none';
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    const username = localStorage.getItem('username');
    const userId = localStorage.getItem('userId');
    updateUIForLoggedInUser(username);
    fetchUserDetails(userId, localStorage.getItem('token'));
}

// Fetch posts on page load
fetchPosts();
