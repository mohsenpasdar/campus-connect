import Cookies from './cookies.js';

// List of public pages that don't require authentication
const PUBLIC_PAGES = [
    'index.html',
    'login.html',
    ''  // Empty string for root path
];

// Check if the current page requires authentication
export function checkAuth() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || 'index.html';
    
    // Get auth state
    const isLoggedIn = Cookies.get('isLoggedIn');
    const userData = Cookies.get('userData');

    // Allow access to public pages regardless of auth state
    if (PUBLIC_PAGES.includes(pageName)) {
        // If user is logged in and trying to access login page, redirect to home
        if (isLoggedIn && userData && pageName === 'login.html') {
            window.location.href = 'index.html';
            return;
        }
        return;
    }

    // For protected pages, check if user is logged in
    if (!isLoggedIn || !userData) {
        window.location.href = 'login.html';
        return;
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', checkAuth); 