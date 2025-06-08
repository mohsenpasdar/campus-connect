import Cookies from './utils/cookies.js';

document.addEventListener('DOMContentLoaded', () => {
    // Get form elements
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.querySelector('.toggle-password');
    const demoProfiles = document.querySelectorAll('.demo-profile');

    // Check if already logged in
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const userData = Cookies.get('userData');
    if (isLoggedIn && userData) {
        window.location.href = 'index.html';
        return;
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Disable form submission while processing
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Signing in...';
            
            try {
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
                await handleLogin({
                    id: Date.now().toString(),
                    name: email.split('@')[0],
                    email: email,
                    avatar: `https://avatar.iran.liara.run/public/job/teacher/female`,
                }, remember);
            } catch (error) {
                console.error('Login error:', error);
                showError(null, 'Failed to log in. Please try again.');
            } finally {
                // Re-enable form submission
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign in';
            }
        });
    }

    // Handle demo profile clicks
    demoProfiles.forEach(profile => {
        profile.addEventListener('click', async () => {
            const role = profile.dataset.role;
            let userData;

            switch(role) {
                case 'student':
                    userData = {
                        id: 'student_demo',
                        name: 'Demo Student',
                        email: 'student@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/teacher/female',
                        role: 'Student',
                        bio: 'Computer Science major passionate about web development and AI. Always eager to learn new technologies and collaborate on innovative projects.',
                        major: 'Computer Science',
                        year: 'Junior',
                        interests: ['Web Development', 'Artificial Intelligence', 'Hackathons', 'Open Source'],
                        isPublic: true,
                        showEmail: false
                    };
                    break;
                case 'leader':
                    userData = {
                        id: 'leader_demo',
                        name: 'Demo Leader',
                        email: 'leader@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/lawyer/male',
                        role: 'Club Leader',
                        bio: 'President of the Tech Innovation Club. Organizing workshops, hackathons, and tech talks to build a stronger tech community on campus.',
                        major: 'Software Engineering',
                        year: 'Senior',
                        interests: ['Technology', 'Leadership', 'Event Planning', 'Community Building'],
                        isPublic: true,
                        showEmail: true
                    };
                    break;
                case 'organizer':
                    userData = {
                        id: 'organizer_demo',
                        name: 'Demo Organizer',
                        email: 'organizer@university.edu',
                        avatar: 'https://avatar.iran.liara.run/public/job/operator/female',
                        role: 'Event Organizer',
                        bio: 'Campus Events Coordinator with a passion for creating engaging student experiences. Focused on bringing diverse and enriching activities to our community.',
                        major: 'Business Administration',
                        year: 'Senior',
                        interests: ['Event Management', 'Student Engagement', 'Marketing', 'Social Media'],
                        isPublic: true,
                        showEmail: true
                    };
                    break;
            }

            console.log('Selected demo profile:', userData); // Debug log

            try {
                // Set cookies directly without using handleLogin
                const expirationDays = 30; // Demo profiles always remember login

                // First set userData
                console.log('Setting userData cookie...'); // Debug log
                const userDataResult = Cookies.set('userData', userData, expirationDays);
                console.log('userData cookie set result:', userDataResult); // Debug log

                if (!userDataResult) {
                    throw new Error('Failed to set user data cookie');
                }

                // Then set isLoggedIn
                console.log('Setting isLoggedIn cookie...'); // Debug log
                const loginResult = Cookies.set('isLoggedIn', 'true', expirationDays);
                console.log('isLoggedIn cookie set result:', loginResult); // Debug log

                if (!loginResult) {
                    Cookies.delete('userData');
                    throw new Error('Failed to set login state cookie');
                }

                // Verify cookies were set
                const verifyUserData = Cookies.get('userData');
                const verifyLogin = Cookies.get('isLoggedIn');
                
                console.log('Verifying cookies:', { verifyUserData, verifyLogin }); // Debug log

                if (!verifyUserData || !verifyLogin) {
                    throw new Error('Failed to verify cookies');
                }

                // Only redirect if cookies are successfully set
                window.location.href = 'index.html';
            } catch (error) {
                console.error('Error during demo login:', error);
                // Clean up any partially set cookies
                Cookies.delete('userData');
                Cookies.delete('isLoggedIn');
                showError(null, 'Failed to log in with demo account. Please try again.');
            }
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
    
    // Add default profile fields if they don't exist
    const completeUserData = {
        bio: 'Click to add a bio',
        major: 'Click to add your major',
        year: 'Click to add your year',
        interests: [],
        isPublic: false,
        showEmail: false,
        coverPhoto: null,
        ...userData // This will override defaults with any existing values
    };
    
    try {
        // First try to set the userData cookie
        const userDataResult = Cookies.set('userData', completeUserData, expirationDays);
        if (!userDataResult) {
            throw new Error('Failed to set user data cookie');
        }

        // Then try to set the isLoggedIn cookie
        const loginResult = Cookies.set('isLoggedIn', 'true', expirationDays);
        if (!loginResult) {
            // If setting isLoggedIn fails, remove the userData cookie
            Cookies.delete('userData');
            throw new Error('Failed to set login state cookie');
        }

        // Verify cookies were set
        const verifyUserData = Cookies.get('userData');
        const verifyLogin = Cookies.get('isLoggedIn');
        
        if (!verifyUserData || !verifyLogin) {
            throw new Error('Failed to verify cookies');
        }

        // Only redirect if cookies are successfully set
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Error during login:', error);
        // Clean up any partially set cookies
        Cookies.delete('userData');
        Cookies.delete('isLoggedIn');
        showError(null, 'Failed to log in. Please try again.');
    }
}

function validateEmail(email) {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
}

function showError(input, message) {
    // Create error container if it doesn't exist
    let errorContainer = document.querySelector('.error-container');
    if (!errorContainer) {
        errorContainer = document.createElement('div');
        errorContainer.className = 'error-container';
        errorContainer.style.color = '#dc2626';
        errorContainer.style.padding = '1rem';
        errorContainer.style.marginBottom = '1rem';
        errorContainer.style.borderRadius = '0.375rem';
        errorContainer.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
        document.querySelector('.login-form').insertBefore(errorContainer, document.querySelector('.form-group'));
    }
    
    errorContainer.textContent = message;
    
    if (input) {
        input.style.borderColor = '#dc2626';
        
        // Remove error styling after 3 seconds
        setTimeout(() => {
            input.style.borderColor = '';
            errorContainer.textContent = '';
        }, 3000);
    }
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