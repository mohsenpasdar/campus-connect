document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

async function handleFormSubmit(event) {
    event.preventDefault();
    
    // Get form elements
    const form = event.target;
    const submitBtn = form.querySelector('.submit-btn');
    const formData = new FormData(form);
    
    // Basic validation
    if (!validateForm(formData)) {
        return;
    }
    
    // Disable submit button and show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    
    try {
        // In a real application, this would be an API endpoint
        // Simulating API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Show success message
        showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        form.reset();
        
    } catch (error) {
        // Show error message
        showNotification('Failed to send message. Please try again later.', 'error');
        console.error('Form submission error:', error);
        
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
    }
}

function validateForm(formData) {
    const name = formData.get('name');
    const email = formData.get('email');
    const subject = formData.get('subject');
    const message = formData.get('message');
    
    // Name validation
    if (!name || name.trim().length < 2) {
        showNotification('Please enter a valid name (at least 2 characters).', 'error');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return false;
    }
    
    // Subject validation
    if (!subject) {
        showNotification('Please select a subject.', 'error');
        return false;
    }
    
    // Message validation
    if (!message || message.trim().length < 10) {
        showNotification('Please enter a message (at least 10 characters).', 'error');
        return false;
    }
    
    return true;
}

function showNotification(message, type = 'success') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '1rem 1.5rem',
        borderRadius: '0.5rem',
        backgroundColor: type === 'success' ? 'var(--brand-primary)' : '#ef4444',
        color: 'var(--bg-secondary)',
        boxShadow: 'var(--shadow-md)',
        zIndex: '1000',
        opacity: '0',
        transform: 'translateY(10px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease'
    });
    
    // Add to document
    document.body.appendChild(notification);
    
    // Trigger animation
    requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    });
    
    // Remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(10px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
} 