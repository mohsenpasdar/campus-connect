import Cookies from './utils/cookies.js';

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
});

function initializeProfile() {
    const userData = Cookies.get('userData');
    const isLoggedIn = Cookies.get('isLoggedIn');

    if (!isLoggedIn || !userData) {
        window.location.href = 'login.html';
        return;
    }

    // Set default values if they don't exist
    const defaultData = {
        bio: 'Click to add a bio',
        major: 'Click to add your major',
        year: 'Click to add your year',
        interests: [],
        isPublic: false,
        showEmail: false,
        coverPhoto: null
    };

    // Merge default data with existing userData
    const updatedUserData = {
        ...userData,
        ...defaultData,
        ...userData.profile // If profile data exists, it will override defaults
    };

    // Remove separate profile property if it exists
    delete updatedUserData.profile;

    // Update cookie with merged data
    Cookies.set('userData', updatedUserData, 30);

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
        let newText = input.value.trim();
        const userData = Cookies.get('userData');

        if (!userData) {
            console.error('No user data found');
            return;
        }

        // If empty, use default text
        if (!newText) {
            newText = fieldType === 'bio' ? 'Click to add a bio' : `Click to add your ${fieldType}`;
        }

        // Update the UI
        const newElement = textElement.cloneNode(true);
        
        // Handle different field types
        switch(fieldType) {
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

        input.replaceWith(newElement);

        // Save to cookie and show success message
        try {
            Cookies.set('userData', userData, 30);
            showMessage('Changes saved successfully!');
        } catch (error) {
            console.error('Error saving data:', error);
            showMessage('Error saving changes', 'error');
        }

        // Reset buttons
        editBtn.style.display = 'inline-block';
        saveBtn.style.display = 'none';
    };

    // Save button click handler
    saveBtn.addEventListener('click', saveChanges);

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
    const userData = Cookies.get('userData');
    const setting = event.target.id === 'profile-visibility' ? 'isPublic' : 'showEmail';
    userData[setting] = event.target.checked;
    Cookies.set('userData', userData, 30);
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
    
    testImageUrl(photoUrl)
        .then(isValid => {
            const finalUrl = isValid ? photoUrl : DEFAULT_COVER;
            if (profileCover) {
                profileCover.style.backgroundImage = `url(${finalUrl})`;
                
                // Save the URL in cookies
                const userData = Cookies.get('userData');
                userData.coverPhoto = finalUrl;
                Cookies.set('userData', userData, 30);
            }
        })
        .catch(() => {
            // Use default cover if there's any error
            if (profileCover) {
                profileCover.style.backgroundImage = `url(${DEFAULT_COVER})`;
                
                const userData = Cookies.get('userData');
                userData.coverPhoto = DEFAULT_COVER;
                Cookies.set('userData', userData, 30);
            }
        });
} 