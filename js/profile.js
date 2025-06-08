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
const avatarTypeSelect = document.getElementById('avatar-type');
const jobAvatarOptions = document.getElementById('job-avatar-options');
const profileCover = document.querySelector('.profile-cover');

// Create file input element
const coverPhotoInput = document.createElement('input');
coverPhotoInput.type = 'file';
coverPhotoInput.accept = 'image/*';
coverPhotoInput.style.display = 'none';
document.body.appendChild(coverPhotoInput);

// Cover photo options
const coverPhotoOptions = [
    { query: 'university campus', description: 'Campus View' },
    { query: 'university library', description: 'Library' },
    { query: 'college students studying', description: 'Study Space' },
    { query: 'university architecture', description: 'Architecture' },
    { query: 'college campus autumn', description: 'Autumn Campus' },
    { query: 'university quad', description: 'Campus Quad' }
];

// Initialize profile
document.addEventListener('DOMContentLoaded', () => {
    initializeProfile();
    setupEventListeners();
    initializeCoverPhoto();
});

function initializeCoverPhoto() {
    const profileData = Cookies.get('profileData') || {};
    
    if (profileData.coverPhoto) {
        // Use saved cover photo
        profileCover.style.backgroundImage = `url(${profileData.coverPhoto})`;
    } else {
        // Set a random cover photo
        setRandomCoverPhoto();
    }

    // Create and add the cover photo controls
    createCoverPhotoControls();
}

function createCoverPhotoControls() {
    const controls = document.createElement('div');
    controls.className = 'cover-controls';
    controls.innerHTML = `
        <button class="edit-cover">Change Cover</button>
        <div class="cover-options">
            <div class="cover-options-header">
                <h3>Choose Cover Photo</h3>
                <button class="close-options">×</button>
            </div>
            <div class="cover-grid">
                ${coverPhotoOptions.map((option, index) => `
                    <div class="cover-option" data-index="${index}">
                        <div class="cover-preview" style="background-image: url(https://source.unsplash.com/400x200/?${encodeURIComponent(option.query)})"></div>
                        <span>${option.description}</span>
                    </div>
                `).join('')}
                <div class="cover-option upload-option">
                    <div class="upload-preview">
                        <span>📤</span>
                        <span>Upload Photo</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    profileCover.appendChild(controls);

    // Add event listeners for the controls
    const editButton = controls.querySelector('.edit-cover');
    const optionsPanel = controls.querySelector('.cover-options');
    const closeButton = controls.querySelector('.close-options');
    const coverOptions = controls.querySelectorAll('.cover-option');
    const uploadOption = controls.querySelector('.upload-option');

    editButton.addEventListener('click', () => {
        optionsPanel.classList.add('active');
    });

    closeButton.addEventListener('click', () => {
        optionsPanel.classList.remove('active');
    });

    // Close panel when clicking outside
    optionsPanel.addEventListener('click', (e) => {
        if (e.target === optionsPanel) {
            optionsPanel.classList.remove('active');
        }
    });

    coverOptions.forEach(option => {
        if (!option.classList.contains('upload-option')) {
            option.addEventListener('click', () => {
                const index = parseInt(option.dataset.index);
                const selectedOption = coverPhotoOptions[index];
                const unsplashUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(selectedOption.query)}`;
                
                profileCover.style.backgroundImage = `url(${unsplashUrl})`;
                
                // Save the URL in cookies
                const profileData = Cookies.get('profileData') || {};
                profileData.coverPhoto = unsplashUrl;
                Cookies.set('profileData', profileData, 30);
                
                optionsPanel.classList.remove('active');
            });
        }
    });

    uploadOption.addEventListener('click', () => {
        coverPhotoInput.click();
    });
}

function setRandomCoverPhoto() {
    const randomOption = coverPhotoOptions[Math.floor(Math.random() * coverPhotoOptions.length)];
    const unsplashUrl = `https://source.unsplash.com/1600x900/?${encodeURIComponent(randomOption.query)}`;
    
    if (profileCover) {
        profileCover.style.backgroundImage = `url(${unsplashUrl})`;
        
        // Save the URL in cookies
        const profileData = Cookies.get('profileData') || {};
        profileData.coverPhoto = unsplashUrl;
        Cookies.set('profileData', profileData, 30);
    }
}

function initializeProfile() {
    const userData = Cookies.get('userData');
    const isLoggedIn = Cookies.get('isLoggedIn');

    if (!isLoggedIn || !userData) {
        window.location.href = 'login.html';
        return;
    }

    // Update profile information
    updateProfileInfo(userData);

    // Load additional profile data if exists
    const profileData = Cookies.get('profileData') || {
        bio: 'Click to add a bio',
        major: 'Click to add your major',
        year: 'Click to add your year',
        interests: [],
        isPublic: false,
        showEmail: false
    };

    updateAdditionalInfo(profileData);
}

function updateProfileInfo(userData) {
    if (profileAvatar) profileAvatar.src = userData.avatar;
    if (headerAvatar) headerAvatar.src = userData.avatar;
    if (profileName) profileName.textContent = userData.name;
    if (username) username.textContent = userData.name;
    if (profileEmail) profileEmail.textContent = userData.email;
    if (profileRole) profileRole.textContent = userData.role || 'Student';

    // Update settings form
    if (settingsForm) {
        settingsForm.displayName.value = userData.name;
        settingsForm.email.value = userData.email;
        
        // Set avatar type
        const isJobAvatar = userData.avatar.includes('job');
        avatarTypeSelect.value = isJobAvatar ? 'job' : 'username';
        jobAvatarOptions.style.display = isJobAvatar ? 'block' : 'none';

        if (isJobAvatar) {
            const avatarUrl = new URL(userData.avatar);
            const jobType = avatarUrl.pathname.split('/')[3];
            const gender = avatarUrl.pathname.split('/')[4];

            settingsForm.jobType.value = jobType;
            settingsForm.querySelector(`input[name="gender"][value="${gender}"]`).checked = true;
        }
    }
}

function updateAdditionalInfo(profileData) {
    if (bioText) bioText.textContent = profileData.bio;
    if (majorText) majorText.textContent = profileData.major;
    if (yearText) yearText.textContent = profileData.year;
    if (interestsTags) {
        interestsTags.innerHTML = profileData.interests
            .map(interest => `<span class="tag">${interest}</span>`)
            .join('');
    }

    // Update privacy settings
    const profileVisibility = document.getElementById('profile-visibility');
    const emailVisibility = document.getElementById('email-visibility');

    if (profileVisibility) profileVisibility.checked = profileData.isPublic;
    if (emailVisibility) emailVisibility.checked = profileData.showEmail;
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

    // Avatar type selection
    if (avatarTypeSelect) {
        avatarTypeSelect.addEventListener('change', (e) => {
            jobAvatarOptions.style.display = e.target.value === 'job' ? 'block' : 'none';
        });
    }

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
    const textElement = field.querySelector('p, span');
    const currentText = textElement.textContent;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    
    textElement.replaceWith(input);
    input.focus();

    input.addEventListener('blur', () => {
        const newText = input.value.trim() || currentText;
        const newElement = textElement.cloneNode(true);
        newElement.textContent = newText;
        input.replaceWith(newElement);

        // Update profile data in cookies
        const profileData = Cookies.get('profileData') || {};
        const fieldType = field.querySelector('label')?.textContent.toLowerCase() || 'bio';
        profileData[fieldType] = newText;
        Cookies.set('profileData', profileData, 30);
    });

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            input.blur();
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

    // Update avatar
    if (formData.get('avatarType') === 'job') {
        userData.avatar = `https://avatar.iran.liara.run/public/job/${formData.get('jobType')}/${formData.get('gender')}`;
    } else {
        // Use name-based avatar (you can implement a different avatar service here)
        userData.avatar = `https://avatar.iran.liara.run/public/${userData.name}`;
    }

    // Save updated user data
    Cookies.set('userData', userData, 30);

    // Update UI
    updateProfileInfo(userData);

    // Show success message
    showMessage('Profile updated successfully!');
}

function handlePrivacyChange(event) {
    const profileData = Cookies.get('profileData') || {};
    const setting = event.target.id === 'profile-visibility' ? 'isPublic' : 'showEmail';
    profileData[setting] = event.target.checked;
    Cookies.set('profileData', profileData, 30);
}

function showMessage(message, type = 'success') {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

// Handle file upload
coverPhotoInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showMessage('Image size should be less than 5MB', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const base64Image = e.target.result;
            profileCover.style.backgroundImage = `url(${base64Image})`;
            
            // Save the base64 image in cookies
            const profileData = Cookies.get('profileData') || {};
            profileData.coverPhoto = base64Image;
            Cookies.set('profileData', profileData, 30);
            
            // Close the options panel
            const optionsPanel = document.querySelector('.cover-options');
            if (optionsPanel) {
                optionsPanel.classList.remove('active');
            }

            // Clear the input
            event.target.value = '';
        };

        reader.onerror = () => {
            showMessage('Error reading the image file', 'error');
        };

        reader.readAsDataURL(file);
    }
}); 