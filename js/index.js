import Cookies from './utils/cookies.js';
import { DEFAULT_POSTS, formatTimestamp, addPost, addComment, togglePostLike, toggleCommentLike } from './data/posts.js';

// DOM Elements
const postForm = document.getElementById('post-form');
const postSearch = document.getElementById('post-search');
const filterGroups = document.getElementById('filter-groups');
const postsFeed = document.querySelector('.posts-feed');

let notifications = [];

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const userData = Cookies.get('userData');

    if (!isLoggedIn || !userData) {
        // Clear any potentially invalid state
        initializeUserInterface();
    } else {
        initializeUserInterface();
    }
    
    setupEventListeners();
    initializeNotifications();
});

// Listen for posts updates
window.addEventListener('postsUpdated', () => {
    loadPosts();
    // Add a notification about the new engagement
    addNotification('Your post is getting attention! 🎉');
});

function initializeUserInterface() {
    const loggedInView = document.getElementById('logged-in-view');
    const loggedOutView = document.getElementById('logged-out-view');
    const createPostSection = document.querySelector('.create-post');
    const protectedFeatures = document.querySelectorAll('[data-requires-auth="true"]');

    // Check login state
    const isLoggedIn = Cookies.get('isLoggedIn');
    let userData = null;
    
    try {
        const userDataStr = Cookies.get('userData');
        userData = userDataStr ? (typeof userDataStr === 'string' ? JSON.parse(userDataStr) : userDataStr) : null;
    } catch (e) {
        console.error('Error parsing user data:', e);
        // If there's an error parsing userData, we should log out the user
        Cookies.delete('isLoggedIn');
        Cookies.delete('userData');
        window.location.href = 'login.html';
        return;
    }

    console.log('Login state:', { isLoggedIn, userData }); // Debug log
    console.log(isLoggedIn && userData);
    if (isLoggedIn && userData) {
        // Show logged in view
        if (loggedInView) loggedInView.style.display = 'block';
        if (loggedOutView) loggedOutView.style.display = 'none';
        if (createPostSection) createPostSection.style.display = 'block';
        
        // Show protected features
        protectedFeatures.forEach(element => {
            element.style.display = 'block';
        });

        // Update user interface with user data
        updateUserInterface(userData);
        loadPosts();
    } else {
        // Show logged out view
        if (loggedInView) loggedInView.style.display = 'none';
        if (loggedOutView) loggedOutView.style.display = 'block';
        if (createPostSection) createPostSection.style.display = 'none';
        
        // Hide protected features
        protectedFeatures.forEach(element => {
            element.style.display = 'none';
        });

        // Show public content only
        loadPublicContent();
    }

    // Setup user menu functionality
    setupUserMenu();
}

function loadPublicContent() {
    // Load public posts and content that doesn't require authentication
    const publicPosts = [
        {
            title: "Welcome to CampusConnect",
            content: "Join our community to connect with fellow students, share experiences, and stay updated with campus events!",
            author: "CampusConnect Team",
            avatar: "https://avatar.iran.liara.run/public/33"
        },
        {
            title: "Discover Student Groups",
            content: "Explore various student groups and activities. Sign up to participate!",
            author: "Student Activities",
            avatar: "https://avatar.iran.liara.run/public/44"
        }
    ];

    // Display public posts
    if (postsFeed) {
        postsFeed.innerHTML = publicPosts.map(post => `
            <div class="post public-post">
                <div class="post-header">
                    <img src="${post.avatar}" alt="${post.author}'s avatar" class="avatar">
                    <div class="post-meta">
                        <h2>${post.title}</h2>
                        <span class="author">${post.author}</span>
                    </div>
                </div>
                <p class="post-content">${post.content}</p>
                <a href="login.html" class="cta-button">Join Now</a>
            </div>
        `).join('');
    }
}

function updateUserInterface(userData) {
    if (!userData) return;

    // Update header user info
    const usernameElement = document.querySelector('.username');
    const headerAvatar = document.querySelector('.header-avatar');
    const postAvatars = document.querySelectorAll('.post .avatar');
    console.log(usernameElement && userData.name);
    if (usernameElement && userData.name) {
        usernameElement.textContent = userData.name;
    }
    console.log(headerAvatar && userData.avatar);
    if (headerAvatar && userData.avatar) {
        headerAvatar.src = userData.avatar;
        headerAvatar.alt = `${userData.name}'s avatar`;
    }

    // Update post form if it exists
    const postForm = document.getElementById('post-form');
    console.log(postForm && userData.name);
    if (postForm && userData.name) {
        const textarea = postForm.querySelector('textarea');
        if (textarea) {
            textarea.placeholder = `What's on your mind, ${userData.name.split(' ')[0]}?`;
        }
    }
}

function setupUserMenu() {
    const profileTrigger = document.querySelector('.profile-trigger');
    const userMenu = document.querySelector('.user-menu');
    const logoutBtn = document.getElementById('logout-btn');

    // Toggle dropdown menu
    if (profileTrigger && userMenu) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
            }
        });
    }

    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            Cookies.delete('isLoggedIn');
            Cookies.delete('userData');
            window.location.href = 'login.html';
        });
    }
}

function setupEventListeners() {
    // Handle post form submission
    if (postForm) {
        postForm.addEventListener('submit', handlePostSubmit);
    }

    // Handle post search
    if (postSearch) {
        postSearch.addEventListener('input', debounce(handleSearch, 300));
    }

    // Handle group filtering
    if (filterGroups) {
        filterGroups.addEventListener('change', handleGroupFilter);
    }

    // Global click handler for post interactions
    document.addEventListener('click', handlePostInteractions);
}

function loadPosts() {
    const posts = JSON.parse(localStorage.getItem('posts')) || DEFAULT_POSTS;
    let userData = null;
    try {
        const userDataStr = Cookies.get('userData');
        userData = userDataStr ? JSON.parse(userDataStr) : null;
    } catch (e) {
        console.error('Error parsing user data:', e);
        return;
    }

    if (!postsFeed || !userData) return;
    
    postsFeed.innerHTML = posts.map(post => `
        <article class="post" data-post-id="${post.id}">
            <div class="post-header">
                <img src="${post.avatar}" alt="${post.author}'s avatar" class="avatar">
                <div class="post-meta">
                    <h3>${post.author}</h3>
                    <span class="timestamp">${formatTimestamp(post.timestamp)}</span>
                </div>
            </div>
            <p class="post-content">${post.content}</p>
            <div class="post-actions">
                <button class="like-btn ${post.likedBy.includes(userData.id) ? 'active' : ''}" data-post-id="${post.id}">
                    ${post.likedBy.includes(userData.id) ? '❤️' : '👍'} ${post.likes} ${post.likes === 1 ? 'Like' : 'Likes'}
                </button>
                <button class="comment-btn" data-post-id="${post.id}">
                    💬 ${post.comments.length} Comments
                </button>
                <button class="share-btn" data-post-id="${post.id}" title="Share this post">
                    📤 Share
                </button>
            </div>
            <div class="comments-section" style="display: none;">
                <div class="comment-input">
                    <textarea placeholder="Write a comment..." rows="2"></textarea>
                    <button class="submit-comment" data-post-id="${post.id}">Post Comment</button>
                </div>
                <div class="comments-list">
                    ${post.comments.map(comment => `
                        <div class="comment" data-comment-id="${comment.id}">
                            <div class="comment-header">
                                <div class="comment-author">
                                    <strong>${comment.author}</strong>
                                    <span class="timestamp">${formatTimestamp(comment.timestamp)}</span>
                                </div>
                            </div>
                            <p>${comment.content}</p>
                            <button class="like-btn small ${comment.likedBy.includes(userData.id) ? 'active' : ''}" 
                                    data-post-id="${post.id}" 
                                    data-comment-id="${comment.id}">
                                ${comment.likedBy.includes(userData.id) ? '❤️' : '👍'} ${comment.likes}
                            </button>
                        </div>
                    `).join('')}
                </div>
            </div>
        </article>
    `).join('');
}

function handlePostSubmit(event) {
    event.preventDefault();
    
    const textarea = postForm.querySelector('textarea');
    const content = textarea.value.trim();
    
    if (content) {
        try {
            const userDataStr = Cookies.get('userData');
            if (!userDataStr) {
                throw new Error('No user data found');
            }

            // Handle both string and object userData
            let userData = userDataStr;
            if (typeof userDataStr === 'string' && userDataStr.startsWith('{')) {
                try {
                    userData = JSON.parse(userDataStr);
                } catch (e) {
                    console.error('Error parsing userData:', e);
                }
            }

            if (!userData || !userData.id || !userData.name || !userData.avatar) {
                throw new Error('Invalid user data');
            }

            const newPost = {
                id: 'post' + Date.now(),
                author: userData.name,
                authorId: userData.id,
                avatar: userData.avatar,
                content: content,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: [],
                comments: []
            };
            
            addPost(newPost);
            
            // Reset form and reload posts
            postForm.reset();
            loadPosts();
        } catch (e) {
            console.error('Error creating post:', e);
            showMessage('Failed to create post. Please try again.', 'error');
        }
    }
}

function handlePostLike(postId) {
    try {
        const userDataStr = Cookies.get('userData');
        if (!userDataStr) {
            throw new Error('No user data found');
        }

        // Handle both string and object userData
        let userData = userDataStr;
        if (typeof userDataStr === 'string' && userDataStr.startsWith('{')) {
            try {
                userData = JSON.parse(userDataStr);
            } catch (e) {
                console.error('Error parsing userData:', e);
            }
        }

        if (!userData || !userData.id) {
            throw new Error('Invalid user data');
        }

        togglePostLike(postId, userData.id);
        loadPosts();
    } catch (e) {
        console.error('Error liking post:', e);
        showMessage('Failed to like post. Please try again.', 'error');
    }
}

function handleCommentLike(postId, commentId) {
    try {
        const userDataStr = Cookies.get('userData');
        if (!userDataStr) {
            throw new Error('No user data found');
        }

        // Handle both string and object userData
        let userData = userDataStr;
        if (typeof userDataStr === 'string' && userDataStr.startsWith('{')) {
            try {
                userData = JSON.parse(userDataStr);
            } catch (e) {
                console.error('Error parsing userData:', e);
            }
        }

        if (!userData || !userData.id) {
            throw new Error('Invalid user data');
        }

        toggleCommentLike(postId, commentId, userData.id);
        loadPosts();
    } catch (e) {
        console.error('Error liking comment:', e);
        showMessage('Failed to like comment. Please try again.', 'error');
    }
}

function handleCommentSubmit(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const textarea = post.querySelector('.comment-input textarea');
    const content = textarea.value.trim();
    
    if (content) {
        try {
            const userDataStr = Cookies.get('userData');
            if (!userDataStr) {
                throw new Error('No user data found');
            }

            // Handle both string and object userData
            let userData = userDataStr;
            if (typeof userDataStr === 'string' && userDataStr.startsWith('{')) {
                try {
                    userData = JSON.parse(userDataStr);
                } catch (e) {
                    console.error('Error parsing userData:', e);
                }
            }

            if (!userData || !userData.id || !userData.name) {
                throw new Error('Invalid user data');
            }

            const newComment = {
                id: 'comment' + Date.now(),
                author: userData.name,
                authorId: userData.id,
                content: content,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedBy: []
            };
            
            addComment(postId, newComment);
            
            // Simulate notification after a delay
            setTimeout(() => {
                addNotification(`Someone liked your comment on "${content.substring(0, 30)}..."`);
            }, 5000);
            
            textarea.value = '';
            loadPosts();
        } catch (e) {
            console.error('Error creating comment:', e);
            showMessage('Failed to post comment. Please try again.', 'error');
        }
    }
}

function initializeNotifications() {
    // Add notification bell to header
    const userActions = document.querySelector('.user-actions');
    if (userActions) {
        const notificationBell = document.createElement('div');
        notificationBell.className = 'notification-bell';
        notificationBell.innerHTML = `
            <button class="bell-btn">🔔 <span class="notification-count">0</span></button>
            <div class="notifications-dropdown">
                <div class="notifications-list"></div>
            </div>
        `;
        userActions.insertBefore(notificationBell, userActions.firstChild);
        
        // Load existing notifications
        notifications = Cookies.get('notifications') || [];
        updateNotificationCount();
    }
}

function addNotification(message) {
    notifications.unshift({
        message,
        timestamp: new Date().toISOString()
    });
    Cookies.set('notifications', notifications);
    updateNotificationCount();
    
    // Show notification popup
    const popup = document.createElement('div');
    popup.className = 'notification-popup';
    popup.textContent = message;
    document.body.appendChild(popup);
    
    setTimeout(() => {
        popup.remove();
    }, 3000);
}

function updateNotificationCount() {
    const count = document.querySelector('.notification-count');
    if (count) {
        count.textContent = notifications.length;
        count.style.display = notifications.length > 0 ? 'inline' : 'none';
    }
}

// Add necessary event listeners
document.addEventListener('click', (e) => {
    if (e.target.closest('.bell-btn')) {
        const dropdown = document.querySelector('.notifications-dropdown');
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        
        if (dropdown.style.display === 'block') {
            const notificationsList = dropdown.querySelector('.notifications-list');
            notificationsList.innerHTML = notifications.map(notification => `
                <div class="notification-item">
                    <p>${notification.message}</p>
                    <small>${new Date(notification.timestamp).toLocaleTimeString()}</small>
                </div>
            `).join('') || '<p>No notifications</p>';
        }
    } else if (!e.target.closest('.notifications-dropdown')) {
        const dropdown = document.querySelector('.notifications-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
});

// Search and Filter Handlers
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        const content = post.querySelector('.post-content').textContent.toLowerCase();
        const author = post.querySelector('.post-meta h3').textContent.toLowerCase();
        
        if (content.includes(searchTerm) || author.includes(searchTerm)) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}

function handleGroupFilter(event) {
    const selectedGroup = event.target.value.toLowerCase();
    const posts = document.querySelectorAll('.post');
    
    posts.forEach(post => {
        if (!selectedGroup || post.dataset.group === selectedGroup) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}

// Post Interaction Handlers
function handlePostInteractions(e) {
    const target = e.target;

    // Handle comment section toggle
    if (target.closest('.comment-btn')) {
        const postId = target.closest('.post').dataset.postId;
        toggleComments(postId);
    }

    // Handle post likes
    if (target.closest('.post-actions .like-btn')) {
        const postId = target.closest('.post').dataset.postId;
        handlePostLike(postId);
    }

    // Handle comment likes
    if (target.closest('.comment .like-btn')) {
        const comment = target.closest('.comment');
        const post = target.closest('.post');
        handleCommentLike(post.dataset.postId, comment.dataset.commentId);
    }

    // Handle comment submission
    if (target.closest('.submit-comment')) {
        const post = target.closest('.post');
        handleCommentSubmit(post.dataset.postId);
    }

    // Handle share button click
    if (target.closest('.share-btn')) {
        const post = target.closest('.post');
        const postId = post.dataset.postId;
        const postContent = post.querySelector('.post-content').textContent;
        handleShare(postId, postContent);
    }
}

function toggleComments(postId) {
    const post = document.querySelector(`[data-post-id="${postId}"]`);
    const commentsSection = post.querySelector('.comments-section');
    commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Simulated data loading (in a real app, this would fetch from a server)
function loadInitialPosts() {
    // Example posts would be loaded here
}

async function handleShare(postId, postContent) {
    const shareData = {
        title: 'CampusConnect Post',
        text: postContent,
        url: `${window.location.origin}${window.location.pathname}?post=${postId}`
    };

    try {
        if (navigator.share && !navigator.userAgent.includes('Firefox')) { // Firefox has incomplete share implementation
            await navigator.share(shareData);
            showMessage('Post shared successfully!');
        } else {
            // Fallback to copy link
            const shareUrl = shareData.url;
            await navigator.clipboard.writeText(shareUrl);
            showMessage('Link copied to clipboard!');
        }
    } catch (err) {
        if (err.name === 'AbortError') {
            // User cancelled share
            return;
        }
        console.error('Error sharing:', err);
        showMessage('Failed to share post', 'error');
    }
} 