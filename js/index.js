// DOM Elements
const postForm = document.getElementById('post-form');
const postSearch = document.getElementById('post-search');
const filterGroups = document.getElementById('filter-groups');
const postsFeed = document.querySelector('.posts-feed');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize any necessary UI elements
    setupEventListeners();
});

function setupEventListeners() {
    // Handle post form submission
    postForm.addEventListener('submit', handlePostSubmit);

    // Handle post search
    postSearch.addEventListener('input', debounce(handleSearch, 300));

    // Handle group filtering
    filterGroups.addEventListener('change', handleGroupFilter);

    // Handle post interactions (likes, comments, shares)
    postsFeed.addEventListener('click', handlePostInteractions);
}

// Post Form Handler
function handlePostSubmit(event) {
    event.preventDefault();
    
    const textarea = postForm.querySelector('textarea');
    const imageInput = document.getElementById('image-upload');
    
    if (textarea.value.trim()) {
        // In a real app, this would send data to a server
        createPostElement({
            author: 'Current User',
            content: textarea.value,
            timestamp: 'Just now',
            image: imageInput.files[0] ? URL.createObjectURL(imageInput.files[0]) : null
        });
        
        // Reset form
        postForm.reset();
    }
}

// Create Post Element
function createPostElement(postData) {
    const post = document.createElement('article');
    post.className = 'post';
    
    post.innerHTML = `
        <div class="post-header">
            <img src="images/default-avatar.png" alt="User avatar" class="avatar">
            <div class="post-meta">
                <h3>${postData.author}</h3>
                <span class="timestamp">${postData.timestamp}</span>
            </div>
        </div>
        <p class="post-content">${postData.content}</p>
        ${postData.image ? `<img src="${postData.image}" alt="Post image" class="post-image">` : ''}
        <div class="post-actions">
            <button class="like-btn">👍 Like</button>
            <button class="comment-btn">💬 Comment</button>
            <button class="share-btn">📤 Share</button>
        </div>
    `;
    
    // Add to feed at the top
    postsFeed.insertBefore(post, postsFeed.firstChild);
}

// Search and Filter Handlers
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const posts = postsFeed.querySelectorAll('.post');
    
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
    const posts = postsFeed.querySelectorAll('.post');
    
    posts.forEach(post => {
        if (!selectedGroup || post.dataset.group === selectedGroup) {
            post.style.display = '';
        } else {
            post.style.display = 'none';
        }
    });
}

// Post Interaction Handlers
function handlePostInteractions(event) {
    const button = event.target.closest('button');
    if (!button) return;
    
    if (button.classList.contains('like-btn')) {
        toggleLike(button);
    } else if (button.classList.contains('comment-btn')) {
        showCommentInput(button);
    } else if (button.classList.contains('share-btn')) {
        sharePost(button);
    }
}

function toggleLike(button) {
    button.classList.toggle('active');
    button.textContent = button.classList.contains('active') ? '❤️ Liked' : '👍 Like';
}

function showCommentInput(button) {
    const post = button.closest('.post');
    const existingInput = post.querySelector('.comment-input');
    
    if (existingInput) {
        existingInput.remove();
        return;
    }
    
    const commentSection = document.createElement('div');
    commentSection.className = 'comment-input';
    commentSection.innerHTML = `
        <textarea placeholder="Write a comment..." rows="2"></textarea>
        <button class="submit-comment">Post Comment</button>
    `;
    
    button.parentElement.after(commentSection);
}

function sharePost(button) {
    // In a real app, this would open a share dialog
    alert('Sharing functionality would be implemented here!');
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