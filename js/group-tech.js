document.addEventListener('DOMContentLoaded', () => {
    initializeTabs();
    initializeGroupActions();
    initializePostActions();
    initializeEventActions();
});

// Tab Switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.nav-item');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panels
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanels.forEach(panel => panel.classList.remove('active'));

            // Add active class to clicked button and corresponding panel
            button.classList.add('active');
            const tabId = button.dataset.tab;
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Group Actions
function initializeGroupActions() {
    const joinButton = document.querySelector('.join-group');
    const shareButton = document.querySelector('.share-group');

    if (joinButton) {
        joinButton.addEventListener('click', () => {
            const isJoined = joinButton.textContent === 'Leave Group';
            
            joinButton.textContent = isJoined ? 'Join Group' : 'Leave Group';
            joinButton.style.backgroundColor = isJoined ? 'var(--brand-primary)' : 'var(--bg-tertiary)';
            joinButton.style.color = isJoined ? 'var(--bg-secondary)' : 'var(--text-secondary)';

            showNotification(isJoined ? 'Left the group' : 'Joined the group');
        });
    }

    if (shareButton) {
        shareButton.addEventListener('click', () => {
            // In a real app, this would open a share dialog
            const groupUrl = window.location.href;
            
            // Fallback to clipboard copy if Web Share API is not available
            if (navigator.share) {
                navigator.share({
                    title: 'Tech Innovators - CampusConnect',
                    text: 'Check out this tech group on CampusConnect!',
                    url: groupUrl
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(groupUrl)
                    .then(() => showNotification('Group link copied to clipboard!'))
                    .catch(console.error);
            }
        });
    }
}

// Post Actions
function initializePostActions() {
    // Create Post
    const createPostForm = document.querySelector('.create-post');
    const postTextarea = createPostForm?.querySelector('textarea');
    const postButton = createPostForm?.querySelector('.post-btn');

    if (postButton && postTextarea) {
        postButton.addEventListener('click', () => {
            const content = postTextarea.value.trim();
            if (content) {
                // In a real app, this would send the post to a server
                showNotification('Post created successfully!');
                postTextarea.value = '';
            }
        });
    }

    // Like, Comment, and Share buttons
    document.querySelectorAll('.like-btn, .comment-btn, .share-btn').forEach(button => {
        button.addEventListener('click', () => {
            const action = button.classList.contains('like-btn') ? 'like' :
                          button.classList.contains('comment-btn') ? 'comment' : 'share';
            
            // Update button state (in a real app, this would interact with a server)
            if (action === 'like') {
                const currentLikes = parseInt(button.textContent.split(' ')[1]);
                const isLiked = button.classList.contains('liked');
                button.textContent = `👍 ${isLiked ? currentLikes - 1 : currentLikes + 1}`;
                button.classList.toggle('liked');
            } else if (action === 'comment') {
                showNotification('Comments feature coming soon!');
            } else {
                // Share functionality
                const postText = button.closest('.discussion-post').querySelector('.post-content').textContent;
                if (navigator.share) {
                    navigator.share({
                        title: 'CampusConnect Post',
                        text: postText,
                        url: window.location.href
                    }).catch(console.error);
                } else {
                    navigator.clipboard.writeText(postText)
                        .then(() => showNotification('Post content copied to clipboard!'))
                        .catch(console.error);
                }
            }
        });
    });
}

// Event Actions
function initializeEventActions() {
    document.querySelectorAll('.rsvp-btn').forEach(button => {
        button.addEventListener('click', () => {
            const isGoing = button.textContent === 'Cancel RSVP';
            button.textContent = isGoing ? 'RSVP' : 'Cancel RSVP';
            button.style.backgroundColor = isGoing ? 'var(--brand-primary)' : 'var(--bg-tertiary)';
            button.style.color = isGoing ? 'var(--bg-secondary)' : 'var(--text-secondary)';

            const eventName = button.closest('.event-card').querySelector('h3').textContent;
            showNotification(isGoing ? `Canceled RSVP for ${eventName}` : `RSVP'd to ${eventName}`);
        });
    });
}

// Notification System
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'var(--brand-primary)',
        color: 'var(--bg-secondary)',
        padding: '1rem',
        borderRadius: '0.375rem',
        boxShadow: 'var(--shadow-md)',
        zIndex: '1000',
        opacity: '0',
        transition: 'opacity 0.3s ease'
    });

    document.body.appendChild(notification);

    // Trigger reflow to ensure transition works
    notification.offsetHeight;
    notification.style.opacity = '1';

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 