import { fetchMultipleCategories, createImageElement } from './unsplashFetcher.js';
import { groups, CATEGORIES } from './groupsData.js';
import { isLoggedIn, joinGroup, leaveGroup, isMemberOfGroup } from './auth.js';
import { initializeHeader } from './utils/header.js';
import Cookies from './utils/cookies.js';

// Add debug logging
console.log('Module loaded');
console.log('Groups loaded:', groups);
console.log('Categories loaded:', CATEGORIES);

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

// Theme Persistence
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    try {
        // Initialize header
        initializeHeader();
        console.log('Header initialized');

        const container = document.querySelector('.groups-grid');
        if (!container) {
            throw new Error('Could not find groups-grid container');
        }
        console.log('Found groups container');

        await initializeGroups();
        console.log('Groups initialized');

        initializeSearch();
        console.log('Search initialized');

        initializeGroupActions();
        console.log('Group actions initialized');

        initializePagination();
        console.log('Pagination initialized');

        // Remove loading message if it exists
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        console.log('Initialization complete');
    } catch (error) {
        console.error('Initialization error:', error);
        // Show error message in the UI
        const container = document.querySelector('.groups-grid');
        if (container) {
            container.innerHTML = `<div class="error-message">Error loading groups: ${error.message}</div>`;
        }
    }
});

// Constants
const GROUPS_PER_PAGE = 12;
let currentPage = 1;
let filteredGroups = [...groups];

// Initialize groups with pagination
async function initializeGroups() {
    // Initialize category filter
    const categoryFilter = document.getElementById('category-filter');
    categoryFilter.innerHTML = `
        <option value="">All Categories</option>
        ${Object.keys(CATEGORIES).map(category => 
            `<option value="${category.toLowerCase()}">${category}</option>`
        ).join('')}
    `;

    // Load initial page
    await loadGroupsPage(1);
}

// Load groups for a specific page
async function loadGroupsPage(page) {
    const startIdx = (page - 1) * GROUPS_PER_PAGE;
    const endIdx = startIdx + GROUPS_PER_PAGE;
    const pageGroups = filteredGroups.slice(startIdx, endIdx);

    // Prepare container
    const container = document.querySelector('.groups-grid');
    container.innerHTML = '';

    // Create group cards
    for (const group of pageGroups) {
        const card = createGroupCard(group);
        container.appendChild(card);
    }

    // Load images for the current page
    await loadGroupImages(pageGroups);
    updatePaginationControls();
}

// Create a group card element
function createGroupCard(group) {
    const card = document.createElement('article');
    card.className = 'group-card';
    card.dataset.groupId = group.id;
    
    const isMember = isMemberOfGroup(group.id);
    const isUserLoggedIn = Cookies.get('isLoggedIn')
    console.log(isUserLoggedIn);
    card.innerHTML = `
        <div class="group-banner">
            <div class="image-placeholder"></div>
        </div>
        <div class="group-info">
            <h3>${group.name}</h3>
            <p class="group-description">${group.description}</p>
            <div class="group-meta">
                <span class="members">👥 ${group.members} members</span>
                <span class="category">${getCategoryEmoji(group.category)} ${group.category}</span>
            </div>
            <div class="group-actions">
                <a href="#" class="view-group">View Group</a>
                <button class="join-group ${isMember ? 'joined' : ''} ${!isUserLoggedIn ? 'disabled' : ''}" 
                    ${!isUserLoggedIn ? 'disabled' : ''}>
                    ${isMember ? 'Leave Group' : 'Join Group'}
                </button>
            </div>
        </div>
    `;
    
    // Add join/leave functionality
    const joinButton = card.querySelector('.join-group');
    joinButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (!isUserLoggedIn) {
            showNotification('Please log in to join groups', 'error');
            return;
        }

        const isCurrentlyMember = joinButton.classList.contains('joined');
        if (isCurrentlyMember) {
            if (leaveGroup(group.id)) {
                joinButton.textContent = 'Join Group';
                joinButton.classList.remove('joined');
                showNotification(`You have left ${group.name}`);
            }
        } else {
            if (joinGroup(group.id)) {
                joinButton.textContent = 'Leave Group';
                joinButton.classList.add('joined');
                showNotification(`You have joined ${group.name}`);
            }
        }
    });
    
    return card;
}

// Get emoji for category
function getCategoryEmoji(category) {
    const emojis = {
        'Academic': '📚',
        'Sports': '⚽',
        'Arts': '🎨',
        'Technology': '💻',
        'Cultural': '🌍',
        'Science': '🔬',
        'Business': '💼',
        'Language': '🗣️',
        'Environmental': '🌱',
        'Gaming': '🎮'
    };
    return emojis[category] || '📌';
}

// Load images for groups
async function loadGroupImages(pageGroups) {
    const imageRequests = {};
    
    // Group image requests by search term to minimize API calls
    pageGroups.forEach(group => {
        if (!imageRequests[group.searchTerm]) {
            imageRequests[group.searchTerm] = 1;
        } else {
            imageRequests[group.searchTerm]++;
        }
    });

    try {
        const images = await fetchMultipleCategories(imageRequests);
        
        // Map images to groups
        pageGroups.forEach((group, index) => {
            const imageData = images[group.searchTerm]?.[0];
            if (imageData) {
                const card = document.querySelector(`[data-group-id="${group.id}"]`);
                const bannerDiv = card.querySelector('.group-banner');
                bannerDiv.innerHTML = '';
                const imageElement = createImageElement(imageData, 'small', 'banner-image');
                bannerDiv.appendChild(imageElement);
            }
        });
    } catch (error) {
        console.error('Failed to load group images:', error);
    }
}

// Initialize pagination controls
function initializePagination() {
    const totalPages = Math.ceil(filteredGroups.length / GROUPS_PER_PAGE);
    
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';
    paginationContainer.innerHTML = `
        <button class="prev-page" disabled>Previous</button>
        <span class="page-info">Page <span class="current-page">1</span> of <span class="total-pages">${totalPages}</span></span>
        <button class="next-page">Next</button>
    `;
    
    document.querySelector('main').appendChild(paginationContainer);
    
    // Add event listeners
    paginationContainer.querySelector('.prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadGroupsPage(currentPage);
        }
    });
    
    paginationContainer.querySelector('.next-page').addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadGroupsPage(currentPage);
        }
    });
}

// Update pagination controls
function updatePaginationControls() {
    const totalPages = Math.ceil(filteredGroups.length / GROUPS_PER_PAGE);
    const container = document.querySelector('.pagination');
    
    if (container) {
        container.querySelector('.current-page').textContent = currentPage;
        container.querySelector('.total-pages').textContent = totalPages;
        container.querySelector('.prev-page').disabled = currentPage === 1;
        container.querySelector('.next-page').disabled = currentPage === totalPages;
    }
}

// Search and Filter Functionality
function initializeSearch() {
    const searchInput = document.getElementById('group-search');
    const categoryFilter = document.getElementById('category-filter');

    const filterGroups = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedCategory = categoryFilter.value.toLowerCase();

        filteredGroups = groups.filter(group => {
            const matchesSearch = 
                group.name.toLowerCase().includes(searchTerm) || 
                group.description.toLowerCase().includes(searchTerm);
            const matchesCategory = !selectedCategory || 
                group.category.toLowerCase() === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        currentPage = 1;
        loadGroupsPage(1);
    };

    searchInput.addEventListener('input', filterGroups);
    categoryFilter.addEventListener('change', filterGroups);
}

// Group Actions
function initializeGroupActions() {
    const createGroupBtn = document.querySelector('.create-group-btn');
    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            showNotification('Create Group feature coming soon!');
        });
    }
}

// Show notification with type
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => notification.classList.add('show'), 10);

    // Remove notification
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
} 