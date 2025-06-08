import Cookies from './utils/cookies.js';

document.addEventListener('DOMContentLoaded', () => {
    const isLoggedIn = Cookies.get('isLoggedIn') === 'true';
    const userData = Cookies.get('userData');
    console.log(isLoggedIn, userData);
    if (!isLoggedIn || !userData) {
        const loggedInView = document.getElementById('logged-in-view');
        const loggedOutView = document.getElementById('logged-out-view');
        if (loggedInView) loggedInView.style.display = 'block';
        if (loggedOutView) loggedOutView.style.display = 'none';
    }
    
});