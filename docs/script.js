const API_URL = 'https://techthoughtsblog.onrender.com'; // Update this to your actual backend URL

// Handle user registration
document.getElementById('registerForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;

    try {
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
    } catch (err) {
        console.error('Registration request failed:', err);
        alert('An error occurred during registration.');
    }
});

// Function to automatically log in after registration
async function autoLogin(username, password) {
    try {
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
    } catch (err) {
        console.error('Auto-login request failed:', err);
        alert('An error occurred during auto-login.');
    }
}

// Handle user login
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    try {
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
            alert('Login failed: ' + await response.text());
        }
    } catch (err) {
        console.error('Login request failed:', err);
        alert('An error occurred while trying to log in.');
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

// Fetch and display posts
async function fetchPosts() {
    const response = await fetch(`${API_URL}/posts`);
    if (response.ok) {
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
                ${post.video ? `<video controls><source src="${post.video}" type="video/mp4"></video>` : ''}
                <div class="comments">
                    <h3>Comments</h3>
                    ${post.comments.map(comment => `
                        <div class="comment">
                            <p>${comment.text}</p>
                            <p class="author">By: ${comment.author.username}</p>
                        </div>
                    `).join('')}
                </div>
            `;
            postsDiv.appendChild(postDiv);
        });
    } else {
        console.error('Failed to fetch posts:', await response.text());
    }
}

// Function to update UI for logged in user
function updateUIForLoggedInUser(username) {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}`;
    document.getElementById('postForm').style.display = 'block';
    fetchPosts(); // Fetch posts after login
}

// Function to update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('postForm').style.display = 'none';
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    const username = localStorage.getItem('username');
    updateUIForLoggedInUser(username);
    fetchUserDetails(localStorage.getItem('userId'), localStorage.getItem('token'));
}

// Ensure posts are fetched on page load
document.addEventListener('DOMContentLoaded', fetchPosts);
