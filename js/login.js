// DOM Elements
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.querySelector('.toggle-password');
const demoProfiles = document.querySelectorAll('.demo-profile');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
});

function setupEventListeners() {
    // Handle login form submission
    loginForm.addEventListener('submit', handleLogin);

    // Toggle password visibility
    togglePasswordBtn.addEventListener('click', togglePasswordVisibility);

    // Handle demo profile selection
    demoProfiles.forEach(profile => {
        profile.addEventListener('click', handleDemoProfile);
    });
}

// Form Validation and Submission
function handleLogin(event) {
    event.preventDefault();

    // Basic form validation
    if (!validateEmail(emailInput.value)) {
        showError(emailInput, 'Please enter a valid university email address');
        return;
    }

    if (passwordInput.value.length < 8) {
        showError(passwordInput, 'Password must be at least 8 characters long');
        return;
    }

    // In a real app, this would send the credentials to a server
    // For demo purposes, we'll just simulate a successful login
    simulateLogin({
        email: emailInput.value,
        remember: loginForm.querySelector('[name="remember"]').checked
    });
}

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function showError(input, message) {
    const formGroup = input.closest('.form-group');
    const existingError = formGroup.querySelector('.error-message');
    
    if (existingError) {
        existingError.textContent = message;
    } else {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#dc2626';
        errorDiv.style.fontSize = '0.875rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.textContent = message;
        formGroup.appendChild(errorDiv);
    }

    input.style.borderColor = '#dc2626';
    
    // Remove error after 3 seconds
    setTimeout(() => {
        const error = formGroup.querySelector('.error-message');
        if (error) {
            error.remove();
            input.style.borderColor = '#e5e7eb';
        }
    }, 3000);
}

// Password Visibility Toggle
function togglePasswordVisibility() {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
}

// Demo Profile Selection
function handleDemoProfile(event) {
    const profile = event.currentTarget.dataset.profile;
    const demoUsers = {
        student: {
            email: 'student@university.edu',
            name: 'Demo Student',
            role: 'student'
        },
        'club-leader': {
            email: 'leader@university.edu',
            name: 'Demo Club Leader',
            role: 'club-leader'
        },
        'event-organizer': {
            email: 'organizer@university.edu',
            name: 'Demo Event Organizer',
            role: 'event-organizer'
        }
    };

    // Simulate login with demo profile
    simulateLogin(demoUsers[profile]);
}

// Login Simulation
function simulateLogin(userData) {
    // Show loading state
    const loginButton = loginForm.querySelector('button[type="submit"]');
    const originalText = loginButton.textContent;
    loginButton.disabled = true;
    loginButton.textContent = 'Signing in...';

    // Simulate API call
    setTimeout(() => {
        // In a real app, this would be handled by your authentication system
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Redirect to home page
        window.location.href = 'index.html';
    }, 1000);
}

// Clear stored credentials on page load if not "remember me"
window.addEventListener('load', () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const userData = JSON.parse(storedUser);
        if (userData.remember) {
            emailInput.value = userData.email;
            loginForm.querySelector('[name="remember"]').checked = true;
        }
    }
}); 