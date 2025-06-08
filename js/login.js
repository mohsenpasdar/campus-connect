import Cookies from './utils/cookies.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const demoProfiles = document.querySelectorAll('.demo-profile');

    // Check if already logged in
    const userData = Cookies.get('userData');
    const isLoggedIn = Cookies.get('isLoggedIn');
    if (userData && isLoggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;
            const remember = document.getElementById('remember').checked;

            if (!validateEmail(email)) {
                showError(emailInput, 'Please enter a valid email address');
                return;
            }

            if (password.length < 6) {
                showError(passwordInput, 'Password must be at least 6 characters');
                return;
            }

            // In a real app, this would validate with a server
            handleLogin({
                name: email.split('@')[0],
                email: email,
                avatar: `https://avatar.iran.liara.run/public/job/teacher/female`,
            }, remember);
        });
    }

    // Handle demo profile clicks
    demoProfiles.forEach(profile => {
        profile.addEventListener('click', () => {
            const role = profile.dataset.role;
            let userData;

            switch(role) {
                case 'student':
                    userData = {
                        name: 'Demo Student',
                        email: 'student@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/teacher/female',
                        role: 'student'
                    };
                    break;
                case 'leader':
                    userData = {
                        name: 'Demo Leader',
                        email: 'leader@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/lawyer/male',
                        role: 'leader'
                    };
                    break;
                case 'organizer':
                    userData = {
                        name: 'Demo Organizer',
                        email: 'organizer@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/operator/female',
                        role: 'organizer'
                    };
                    break;
            }

            handleLogin(userData, true);
        });
    });

    // Toggle password visibility
    if (togglePasswordBtn) {
        togglePasswordBtn.addEventListener('click', () => {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            togglePasswordBtn.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }
});

function handleLogin(userData, remember = false) {
    // Set cookie expiration based on "remember me" option
    const expirationDays = remember ? 30 : 1;
    
    // Store user data in cookies
    Cookies.set('userData', userData, expirationDays);
    Cookies.set('isLoggedIn', true, expirationDays);
    
    // Redirect to home page
    window.location.href = 'index.html';
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
            input.style.borderColor = '';
        }
    }, 3000);
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