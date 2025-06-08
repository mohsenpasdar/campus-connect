import Cookies from './cookies.js';

export function initializeHeader() {
    const loginButton = document.querySelector('.login');
    const userActions = document.querySelector('.user-actions');
    const profileTrigger = document.querySelector('.profile-trigger');
    const userMenu = document.querySelector('.user-menu');
    const myProfileLink = document.querySelector('.my-profile');
    
    try {
        const isUserLoggedIn = Cookies.get('isLoggedIn') === 'true';
        const userData = Cookies.get('userData');
        
        if (isUserLoggedIn && userData) {
            // Handle both string and object userData
            let user = userData;
            if (typeof userData === 'string' && userData.startsWith('{')) {
                try {
                    user = JSON.parse(userData);
                } catch (e) {
                    console.error('Error parsing userData:', e);
                }
            }

            if (loginButton) loginButton.style.display = 'none';
            if (userActions) {
                userActions.style.display = 'flex';
                const usernameElement = userActions.querySelector('.username');
                const avatarElement = userActions.querySelector('.header-avatar');
                if (usernameElement && user.name) usernameElement.textContent = user.name;
                if (avatarElement && user.avatar) avatarElement.src = user.avatar;
            }
            if (myProfileLink) myProfileLink.style.display = 'block';

            // Setup user menu functionality
            if (profileTrigger && userMenu) {
                // Remove any existing listeners first
                const newProfileTrigger = profileTrigger.cloneNode(true);
                profileTrigger.parentNode.replaceChild(newProfileTrigger, profileTrigger);
                
                // Toggle dropdown menu
                newProfileTrigger.addEventListener('click', (e) => {
                    e.stopPropagation();
                    userMenu.classList.toggle('active');
                });

                // Close menu when clicking outside
                const handleClickOutside = (e) => {
                    if (!userMenu.contains(e.target) && !newProfileTrigger.contains(e.target)) {
                        userMenu.classList.remove('active');
                    }
                };
                document.removeEventListener('click', handleClickOutside);
                document.addEventListener('click', handleClickOutside);

                // Handle logout
                const logoutBtn = userMenu.querySelector('#logout-btn');
                if (logoutBtn) {
                    // Remove any existing listeners first
                    const newLogoutBtn = logoutBtn.cloneNode(true);
                    logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
                    
                    newLogoutBtn.addEventListener('click', () => {
                        Cookies.delete('isLoggedIn');
                        Cookies.delete('userData');
                        window.location.href = 'login.html';
                    });
                }
            }
        } else {
            if (loginButton) loginButton.style.display = 'block';
            if (userActions) userActions.style.display = 'none';
            if (myProfileLink) myProfileLink.style.display = 'none';
            if (userMenu) userMenu.classList.remove('active');
        }
    } catch (error) {
        console.error('Error updating header:', error);
    }
} 