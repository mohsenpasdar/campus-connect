import { initializeHeader } from './utils/header.js';
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

document.addEventListener('DOMContentLoaded', () => {
    // Initialize header
    initializeHeader();
    console.log('Header initialized');

    // Initialize contact form
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
});

function handleContactSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');
    
    // Simple validation
    if (!name || !email || !message) {
        showMessage('Please fill in all fields', 'error');
        return;
    }
    
    // In a real app, this would send the data to a server
    console.log('Contact form submitted:', { name, email, message });
    showMessage('Thank you for your message! We will get back to you soon.');
    event.target.reset();
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