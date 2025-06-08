import Cookies from './utils/cookies.js';
import { checkAuth } from './utils/auth.js';
import { getUserContent, formatTimestamp } from './data/posts.js';

// DOM Elements
const profileAvatar = document.querySelector('.profile-avatar');
const headerAvatar = document.querySelector('.header-avatar');
const profileName = document.querySelector('.profile-name');
const profileRole = document.querySelector('.profile-role');
const profileEmail = document.querySelector('.profile-email');
const username = document.querySelector('.username');
const bioText = document.querySelector('.bio-text');
const majorText = document.querySelector('.major-text');
const yearText = document.querySelector('.year-text');
const interestsTags = document.querySelector('.interests-tags');
const settingsForm = document.getElementById('profile-settings-form');
const profileCover = document.querySelector('.profile-cover');
const userPostsContainer = document.querySelector('.user-posts');
const userCommentsContainer = document.querySelector('.user-comments');

// Cover photo options with specific Unsplash photos
const coverPhotoOptions = [
    { 
        id: 'KR2mdHJ5qMg',
        description: 'Modern University Library',
        author: 'Nathan Dumlao'
    },
    {
        id: 'hes6nUC1MVc',
        description: 'Campus Architecture',
        author: 'Vasily Koloda'
    },
    {
        id: 'YvvdHJGHYf4',
        description: 'Study Hall',
        author: 'Alexis Brown'
    },
    {
        id: 'JKUTrJ4vK00',
        description: 'Campus Life',
        author: 'LinkedIn Sales Solutions'
    },
    {
        id: '8CqDvPuo_kI',
        description: 'University Building',
        author: 'Ivan Aleksic'
    }
];

// Default cover photo (a specific Unsplash photo that's reliable)
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1600&h=900&q=80';

function getUnsplashUrl(photoId) {
    return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=1600&h=900&q=80`;
}

// Initialize profile
document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupEventListeners();
    initializeCoverPhoto();
    loadUserContent();
});

function initializeProfile() {
    const userDataStr = Cookies.get('userData');
    let userData = {};
    try {
        userData = JSON.parse(userDataStr);
    } catch (e) {
        userData = userDataStr; // If it's already an object
    }

    // Set default values if they don't exist
    const defaultData = {
        bio: 'Click to add a bio',
        major: 'Click to add your major',
        year: 'Click to add your year',
        interests: [],
        isPublic: false,
        showEmail: false,
        coverPhoto: "null"
    };

    // Merge default data with existing userData
    const updatedUserData = {
        ...defaultData,
        ...userData,
        ...(userData.profile || {}) // If profile data exists, it will override defaults
    };

    // Remove separate profile property if it exists
    delete updatedUserData.profile;

    // Update cookie with merged data
    Cookies.set('userData', JSON.stringify(updatedUserData), 30);

    // Update UI with all profile information
    updateProfileInfo(updatedUserData);
}

function updateProfileInfo(userData) {
    if (profileAvatar) profileAvatar.src = userData.avatar;
    if (headerAvatar) headerAvatar.src = userData.avatar;
    if (profileName) profileName.textContent = userData.name;
    if (username) username.textContent = userData.name;
    if (profileEmail) profileEmail.textContent = userData.email;
    if (profileRole) profileRole.textContent = userData.role || 'Student';

    // Update additional profile information
    if (bioText) bioText.textContent = userData.bio;
    if (majorText) majorText.textContent = userData.major;
    if (yearText) yearText.textContent = userData.year;
    if (interestsTags) {
        const interests = Array.isArray(userData.interests) ? userData.interests : [];
        interestsTags.innerHTML = interests
            .map(interest => `<span class="tag">${interest}</span>`)
            .join('');
    }

    // Update privacy settings
    const profileVisibility = document.getElementById('profile-visibility');
    const emailVisibility = document.getElementById('email-visibility');

    if (profileVisibility) profileVisibility.checked = !!userData.isPublic;
    if (emailVisibility) emailVisibility.checked = !!userData.showEmail;

    // Update settings form
    if (settingsForm) {
        settingsForm.displayName.value = userData.name;
        settingsForm.email.value = userData.email;
    }
}

function setupEventListeners() {
    // Tab switching
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.dataset.tab;
            switchTab(targetTab);
        });
    });

    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', handleEdit);
    });

    // Settings form submission
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSettingsSubmit);
    }

    // Privacy toggles
    const privacyToggles = document.querySelectorAll('.privacy-options input[type="checkbox"]');
    privacyToggles.forEach(toggle => {
        toggle.addEventListener('change', handlePrivacyChange);
    });

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', handleLogout);
}

function handleLogout() {
    Cookies.delete('isLoggedIn');
    Cookies.delete('userData');
    window.location.href = 'index.html';
}

function switchTab(tabId) {
    const tabs = document.querySelectorAll('.tab-panel');
    const buttons = document.querySelectorAll('.tab-btn');

    tabs.forEach(tab => {
        tab.classList.remove('active');
    });

    buttons.forEach(button => {
        button.classList.remove('active');
    });

    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

function handleEdit(event) {
    const field = event.target.closest('.editable-field');
    const textElement = field.querySelector('p, span, div');
    const currentText = textElement.textContent;
    const fieldType = field.querySelector('label')?.textContent.toLowerCase() || 'bio';
    const editBtn = field.querySelector('.edit-btn');
    const saveBtn = field.querySelector('.save-btn');

    // Create input based on field type
    const input = document.createElement(fieldType === 'interests' ? 'textarea' : 'input');
    input.type = 'text';
    input.value = currentText === 'Click to add your ' + fieldType ? '' : currentText;
    input.className = 'edit-input';
    
    // Show save button, hide edit button
    editBtn.style.display = 'none';
    saveBtn.style.display = 'inline-block';
    
    textElement.replaceWith(input);
    input.focus();

    const saveChanges = () => {
        try {
            // Get fresh copy of userData and parse it
            const userDataStr = Cookies.get('userData');
            if (!userDataStr) {
                throw new Error('No user data found');
            }
            
            let userData = JSON.parse(userDataStr);

            let newText = input.value.trim();
            // Create new element for UI update
            const newElement = textElement.cloneNode(true);
            // Update userData based on field type
            switch(newElement.classList[0].split('-')[0]) {
                case 'interests':
                    const interests = newText.split(',').map(i => i.trim()).filter(i => i);
                    userData.interests = interests;
                    newElement.innerHTML = interests.map(interest => `<span class="tag">${interest}</span>`).join('');
                    break;
                case 'major':
                    userData.major = newText;
                    newElement.textContent = newText;
                    break;
                case 'year':
                    userData.year = newText;
                    newElement.textContent = newText;
                    break;
                default: // bio
                    userData.bio = newText;
                    newElement.textContent = newText;
            }

            console.log('Saving userData:', userData); // Debug log
            
            // Save to cookie
            Cookies.set('userData', JSON.stringify(userData), 30);

            // Update UI
            input.replaceWith(newElement);
            showMessage('Changes saved successfully!');

            // Reset buttons
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';

        } catch (error) {
            console.error('Error saving changes:', error);
            showMessage('Error saving changes', 'error');
            
            // Reset UI on error
            input.replaceWith(textElement);
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        }
    };

    // Save button click handler
    const saveHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();
        saveChanges();
    };

    saveBtn.addEventListener('click', saveHandler, { once: true });

    // Cancel on escape key
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            input.replaceWith(textElement);
            editBtn.style.display = 'inline-block';
            saveBtn.style.display = 'none';
        }
    });

    // Save on enter key (except for interests)
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && fieldType !== 'interests') {
            e.preventDefault();
            saveChanges();
        }
    });
}

function handleSettingsSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const userData = Cookies.get('userData');

    // Update user data
    userData.name = formData.get('displayName');
    userData.email = formData.get('email');

    // Save updated user data
    Cookies.set('userData', userData, 30);

    // Update UI
    updateProfileInfo(userData);

    // Show success message
    showMessage('Profile updated successfully!');
}

function handlePrivacyChange(event) {
    const userDataStr = Cookies.get('userData');
    let userData;
    try {
        userData = JSON.parse(userDataStr);
    } catch (e) {
        userData = userDataStr; // If it's already an object
    }
    
    const setting = event.target.id === 'profile-visibility' ? 'isPublic' : 'showEmail';
    userData[setting] = event.target.checked;
    Cookies.set('userData', JSON.stringify(userData), 30);
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.right = '20px';
    messageDiv.style.padding = '1rem';
    messageDiv.style.borderRadius = '0.5rem';
    messageDiv.style.backgroundColor = type === 'success' ? '#10B981' : '#EF4444';
    messageDiv.style.color = 'white';
    messageDiv.style.zIndex = '1000';
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function initializeCoverPhoto() {
    const profileData = Cookies.get('userData');
    
    if (profileData.coverPhoto) {
        // Test if the saved cover photo is still accessible
        testImageUrl(profileData.coverPhoto)
            .then(isValid => {
                if (isValid) {
                    profileCover.style.backgroundImage = `url(${profileData.coverPhoto})`;
                } else {
                    setRandomCoverPhoto();
                }
            })
            .catch(() => setRandomCoverPhoto());
    } else {
        setRandomCoverPhoto();
    }
}

function testImageUrl(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

function setRandomCoverPhoto() {
    const randomOption = coverPhotoOptions[Math.floor(Math.random() * coverPhotoOptions.length)];
    const photoUrl = getUnsplashUrl(randomOption.id);
}

function loadUserContent() {
    const userData = JSON.parse(Cookies.get('userData'));
    if (!userData || !userData.id) return;

    const { posts, comments } = getUserContent(userData.id);
    
    // Render user's posts
    if (userPostsContainer) {
        userPostsContainer.innerHTML = `
            <h3>Your Posts</h3>
            ${posts.length ? posts.map(post => `
                <div class="user-post">
                    <div class="post-header">
                        <span class="timestamp">${formatTimestamp(post.timestamp)}</span>
                    </div>
                    <p class="post-content">${post.content}</p>
                    <div class="post-stats">
                        <span>👍 ${post.likes} likes</span>
                        <span>💬 ${post.comments.length} comments</span>
                    </div>
                </div>
            `).join('') : '<p>No posts yet</p>'}
        `;
    }

    // Render user's comments
    if (userCommentsContainer) {
        userCommentsContainer.innerHTML = `
            <h3>Your Comments</h3>
            ${comments.length ? comments.map(comment => `
                <div class="user-comment">
                    <div class="comment-header">
                        <small>Commented on ${postAuthor}'s post:</small>
                        <span class="timestamp">${formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p class="post-preview">${comment.postContent}</p>
                    <p class="comment-content">${comment.content}</p>
                    <div class="comment-stats">
                        <span>👍 ${comment.likes} likes</span>
                    </div>
                </div>
            `).join('') : '<p>No comments yet</p>'}
        `;
    }
} 