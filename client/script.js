const API_URL = 'https://techthoughtsblog.onrender.com';

// Function to handle user registration
document.getElementById('register').addEventListener('click', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${API_URL}/users/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.ok) {
        alert('User registered successfully');
    } else {
        const errorText = await response.text();
        alert('User registration failed: ' + errorText);
    }
});

// Function to handle user login
document.getElementById('login').addEventListener('click', async function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

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
        localStorage.setItem('username', username);
        updateUIForLoggedInUser(username);
        alert('Login successful');
    } else {
        alert('Login failed');
    }
});

// Function to handle user logout
document.getElementById('logout').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    updateUIForLoggedOutUser();
    alert('Logged out successfully');
});

// Function to create a new post
document.getElementById('createPost').addEventListener('click', async function(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const content = quill.root.innerHTML;
    const video = document.getElementById('video').files[0];
    const token = localStorage.getItem('token');

    if (!token) {
        alert('You must be logged in to create a post');
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    if (video) {
        formData.append('video', video);
    }

    const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (response.ok) {
        alert('Post created successfully');
        fetchPosts();
    } else {
        alert('Failed to create post');
    }
});

// Function to fetch and display posts
async function fetchPosts() {
    const response = await fetch(`${API_URL}/posts`);
    const posts = await response.json();
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    posts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        postDiv.innerHTML = `
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            <p class="author">By: ${post.author.username}</p>
            <p class="date">Posted on: ${formattedDate}</p>
            ${post.video ? `<video controls src="${post.video}" style="width: 100%;"></video>` : ''}
            <div class="comments">
                <h3>Comments</h3>
                <div id="comments-${post._id}">${post.comments.map(comment => `
                    <div class="comment">
                        <p>${comment.text}</p>
                        <p class="author">By: ${comment.author.username}</p>
                    </div>
                `).join('')}</div>
                <textarea id="commentText-${post._id}" placeholder="Write a comment..."></textarea>
                <button class="addComment btn" data-id="${post._id}">Add Comment</button>
            </div>
            <button class="edit btn" data-id="${post._id}">Edit</button>
            <button class="delete btn" data-id="${post._id}">Delete</button>
        `;
        postsDiv.appendChild(postDiv);
    });

    // Add event listeners for comments, edit, and delete buttons
    addEventListeners();
}

// Function to add event listeners for dynamic elements
function addEventListeners() {
    document.querySelectorAll('.addComment').forEach(button => {
        button.addEventListener('click', async function() {
            const postId = this.getAttribute('data-id');
            const commentText = document.getElementById(`commentText-${postId}`).value;
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ text: commentText })
            });

            if (response.ok) {
                alert('Comment added successfully');
                fetchPosts();
            } else {
                alert('Failed to add comment');
            }
        });
    });

    document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', async function() {
            const postId = this.getAttribute('data-id');
            const newTitle = prompt('Enter new title');
            const newContent = prompt('Enter new content');
            const token = localStorage.getItem('token');

            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: newTitle, content: newContent })
            });

            if (response.ok) {
                alert('Post updated successfully');
                fetchPosts();
            } else {
                alert('Failed to update post');
            }
        });
    });

    document.querySelectorAll('.delete').forEach(button => {
        button.addEventListener('click', async function() {
            const postId = this.getAttribute('data-id');
            const token = localStorage.getItem('token');
            console.log('Deleting post:', postId);

            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                console.log('Post deleted successfully');
                alert('Post deleted successfully');
                fetchPosts();
            } else {
                const errorText = await response.text();
                console.error('Failed to delete post:', errorText);
                alert('Failed to delete post: ' + errorText);
            }
        });
    });
}

// Function to update UI for logged in user
function updateUIForLoggedInUser(username) {
    document.getElementById('authForm').style.display = 'none';
    document.getElementById('userInfo').style.display = 'block';
    document.getElementById('welcomeMessage').textContent = `Welcome, ${username}`;
    document.getElementById('welcomeMessage').style.marginBottom = '10px';
    document.getElementById('postForm').style.display = 'block';
}

// Function to update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('authForm').style.display = 'block';
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('postForm').style.display = 'none';
}

// Check if user is already logged in
if (localStorage.getItem('token')) {
    updateUIForLoggedInUser(localStorage.getItem('username'));
}

// Fetch posts on page load
fetchPosts();
