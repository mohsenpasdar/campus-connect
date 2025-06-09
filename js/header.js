import Cookies from './utils/cookies.js';

// Function to load and inject the header HTML
async function loadHeader() {
    try {
        const response = await fetch('/header.html');
        const html = await response.text();
        document.body.insertAdjacentHTML('afterbegin', html);
        initializeHeader();
    } catch (error) {
        console.error('Error loading header:', error);
    }
}

// Function to set the active navigation item
function setActiveNavItem() {
    const currentPath = window.location.pathname;
    const navItems = {
        'index.html': 'nav-home',
        'groups.html': 'nav-groups',
        'about.html': 'nav-about',
        'contact.html': 'nav-contact',
        'faq.html': 'nav-faq'
    };

    // Remove active class from all nav items
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
    });

    // Add active class to current page's nav item
    const currentPage = currentPath.split('/').pop() || 'index.html';
    const activeNavId = navItems[currentPage];
    if (activeNavId) {
        const activeNav = document.getElementById(activeNavId);
        if (activeNav) {
            activeNav.classList.add('active');
        }
    }
}

// Function to update header based on login state
function updateLoginState() {
    const isLoggedIn = Cookies.get('isLoggedIn')
    const userData = Cookies.get('userData') || {};
    console.log(isLoggedIn, userData, "isLoggedIn, userData");
    
    const loggedInView = document.getElementById('logged-in-view');
    const loggedOutView = document.getElementById('logged-out-view');
    
    if (isLoggedIn && userData) {
        if (loggedInView) {
            loggedInView.style.display = 'block';
            // Update user info in header
            const avatar = loggedInView.querySelector('.header-avatar');
            const username = loggedInView.querySelector('.username');
            if (avatar && userData.avatar) avatar.src = userData.avatar;
            if (username && userData.name) username.textContent = userData.name;
        }
        if (loggedOutView) loggedOutView.style.display = 'none';
    } else {
        if (loggedInView) loggedInView.style.display = 'none';
        if (loggedOutView) loggedOutView.style.display = 'block';
    }
}

// Function to handle user menu dropdown
function initializeUserMenu() {
    const profileTrigger = document.querySelector('.profile-trigger');
    const userMenu = document.querySelector('.user-menu');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (profileTrigger && userMenu && dropdownMenu) {
        // Remove any existing listeners first
        const newProfileTrigger = profileTrigger.cloneNode(true);
        profileTrigger.parentNode.replaceChild(newProfileTrigger, profileTrigger);
        
        // Toggle dropdown
        newProfileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
            
            // Update dropdown visibility
            if (userMenu.classList.contains('active')) {
                dropdownMenu.style.display = 'block';
                dropdownMenu.style.zIndex = '1000';
                setTimeout(() => {
                    dropdownMenu.style.opacity = '1';
                    dropdownMenu.style.transform = 'translateY(0)';
                }, 10);
            } else {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    dropdownMenu.style.display = 'none';
                }, 200);
            }
        });

        // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    dropdownMenu.style.display = 'none';
                }, 200);
            }
        };

        // Remove any existing click listeners
        document.removeEventListener('click', handleClickOutside);
        document.addEventListener('click', handleClickOutside);

        // Prevent dropdown from closing when clicking inside it
        dropdownMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }
}

// Function to handle logout
function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear cookies
            Cookies.delete('isLoggedIn');
            Cookies.delete('userData');
            // Redirect to home page
            window.location.href = '/index.html';
        });
    }
}

// Main initialization function
export function initializeHeader() {
    setActiveNavItem();
    updateLoginState();
    initializeUserMenu();
    initializeLogout();
}

// Load header when using as a module
export function loadAndInitializeHeader() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadHeader);
    } else {
        loadHeader();
    }
} 