import { fetchMultipleCategories, createImageElement } from './unsplashFetcher.js';
import { groups, CATEGORIES } from './groupsData.js';
import { isLoggedIn, joinGroup, leaveGroup, isMemberOfGroup } from './auth.js';
import { initializeHeader } from './utils/header.js';
import Cookies from './utils/cookies.js';

// Add debug logging
console.log('Module loaded');
console.log('Groups loaded:', groups);
console.log('Categories loaded:', CATEGORIES);

// Theme Persistence
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM Content Loaded');
    try {
        // Initialize header
        initializeHeader();
        console.log('Header initialized');

        // Load joined groups first thing
        const joinedGroups = getJoinedGroups();
        console.log('Loaded joined groups from cookie:', joinedGroups);

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

        // Force a sync after everything is loaded
        setTimeout(() => {
            console.log('Forcing final membership sync');
            syncGroupMemberships();
        }, 100);

        // Remove loading message if it exists
        const loadingMessage = document.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }

        console.log('Initialization complete');
    } catch (error) {
        console.error('Crikey! Initialization error:', error);
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
let nextGroupId = Math.max(...groups.map(g => g.id)) + 1;

// Get created groups from cookies
function getCreatedGroups() {
    try {
        const createdGroupsStr = Cookies.get('createdGroups');
        
        // If cookie doesn't exist or is empty, initialize it
        if (!createdGroupsStr) {
            const initialValue = [];
            Cookies.set('createdGroups', initialValue);
            return initialValue;
        }
        
        return createdGroupsStr;
    } catch (error) {
        console.error('Error reading created groups:', error);
        return [];
    }
}

function getJoinedGroups() {
    try {
        const joinedGroupsStr = Cookies.get('joinedGroups');
        
        // If cookie doesn't exist or is empty, initialize it
        if (!joinedGroupsStr) {
            const initialValue = [];
            Cookies.set('joinedGroups', initialValue);
            return initialValue;
        }
        
        return joinedGroupsStr;
    } catch (error) {
        console.error('Strewth! Cookie drama:', error);
        return [];
    }
}

// Add this function to sync the UI with cookie data
function syncGroupMemberships() {
    const joinedGroups = getJoinedGroups();
    const createdGroups = getCreatedGroups();
    console.log('Syncing memberships from cookie:', joinedGroups);
    console.log('Syncing created groups from cookie:', createdGroups);
    
    // Update all group cards on the page
    document.querySelectorAll('.group-card').forEach(card => {
        const groupId = parseInt(card.dataset.groupId);
        const actionButton = card.querySelector('.join-group-btn, .leave-group-btn');
        const isMember = joinedGroups.includes(groupId);
        const isCreator = createdGroups.includes(groupId);
        
        if (actionButton) {
            if (isCreator) {
                actionButton.className = 'leave-group-btn';
                actionButton.textContent = 'Leave Group';
                actionButton.disabled = true;
                actionButton.title = 'You cannot leave a group you created';
            } else {
                actionButton.className = isMember ? 'leave-group-btn' : 'join-group-btn';
                actionButton.textContent = isMember ? 'Leave Group' : 'Join Group';
                actionButton.disabled = false;
                actionButton.title = '';
            }
        }
    });
}

// Initialize groups with pagination
async function initializeGroups() {
    console.log('Initializing groups...');
    
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
    
    // Sync memberships from cookies after loading
    syncGroupMemberships();
}

// Update loadGroupsPage to handle cookie state
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
    
    // Sync memberships after loading new page
    syncGroupMemberships();
}

// Create a group card element
function createGroupCard(group) {
    const card = document.createElement('article');
    card.className = 'group-card';
    card.dataset.groupId = group.id;
    
    // Get fresh joined groups data
    const joinedGroups = getJoinedGroups();
    const createdGroups = getCreatedGroups();
    console.log('Creating card for group:', group.id, 'Current joined groups:', joinedGroups);
    console.log('Current created groups:', createdGroups);
    
    const isMember = Array.isArray(joinedGroups) && joinedGroups.includes(group.id);
    const isCreator = Array.isArray(createdGroups) && createdGroups.includes(group.id);
    const isUserLoggedIn = Boolean(Cookies.get('isLoggedIn'));
    
    // Update the member count based on joined state
    if (isMember && !group._memberCountUpdated) {
        group.members = parseInt(group.members) + 1;
        group._memberCountUpdated = true;
    }
    
    card.innerHTML = `
        <div class="group-banner">
            <div class="image-placeholder"></div>
        </div>
        <div class="group-content">
            <h3>${group.name}</h3>
            <p class="group-description">${group.description}</p>
            <div class="group-meta">
                <span class="members">👥 ${group.members} members</span>
                <span class="category">${getCategoryEmoji(group.category)} ${group.category}</span>
            </div>
            <div class="group-actions">
                ${isUserLoggedIn ? 
                    `<button class="${isMember ? 'leave-group-btn' : 'join-group-btn'}" 
                        data-group-id="${group.id}"
                        ${isCreator ? 'disabled title="You cannot leave a group you created"' : ''}>
                        ${isMember ? 'Leave Group' : 'Join Group'}
                    </button>` :
                    `<button class="join-group-btn" disabled title="Please log in to join groups">
                        Join Group
                    </button>`
                }
            </div>
        </div>
    `;
    
    // Add join/leave functionality
    const actionButton = card.querySelector('.join-group-btn, .leave-group-btn');
    if (actionButton && isUserLoggedIn && !isCreator) {
        actionButton.addEventListener('click', async (e) => {
            e.preventDefault();
            const isCurrentlyMember = actionButton.classList.contains('leave-group-btn');
            
            try {
                let currentGroups = getJoinedGroups();
                
                if (isCurrentlyMember) {
                    currentGroups = currentGroups.filter(id => id !== group.id);
                } else {
                    if (!currentGroups.includes(group.id)) {
                        currentGroups.push(group.id);
                    }
                }
                
                Cookies.set('joinedGroups', currentGroups);
                
                // Update UI
                actionButton.className = isCurrentlyMember ? 'join-group-btn' : 'leave-group-btn';
                actionButton.textContent = isCurrentlyMember ? 'Join Group' : 'Leave Group';
                
                // Update member count
                const membersSpan = card.querySelector('.members');
                const currentCount = parseInt(group.members);
                const newCount = isCurrentlyMember ? currentCount - 1 : currentCount + 1;
                membersSpan.textContent = `👥 ${newCount} members`;
                group.members = newCount;
                
                showNotification(`${isCurrentlyMember ? 'Left' : 'Joined'} ${group.name} successfully`);
                
            } catch (error) {
                console.error('Crikey! Error:', error);
                showNotification('Failed to update group membership', 'error');
            }
        });
    }
    
    
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
        const isLoggedIn = Boolean(Cookies.get('isLoggedIn'));
        if (!isLoggedIn) {
            createGroupBtn.disabled = true;
            createGroupBtn.title = 'Please log in to create groups';
        }
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

// Update the existing updateJoinedGroups function
function updateJoinedGroups(groupId, isJoining) {
    try {
        let joinedGroups = getJoinedGroups();
        // Make sure we've got a proper array
        if (!Array.isArray(joinedGroups)) {
            joinedGroups = [];
        }
        
        if (isJoining) {
            if (!joinedGroups.includes(groupId)) {
                joinedGroups.push(groupId);
            }
        } else {
            joinedGroups = joinedGroups.filter(id => id !== groupId);
        }
        
        // Store for 30 days with path set to root
        Cookies.set('joinedGroups', JSON.stringify(joinedGroups), { 
            expires: 30,
            path: '/',
            sameSite: 'strict'
        });
        
        // Sync all visible cards after update
        syncGroupMemberships();
        return true;
    } catch (error) {
        console.error('Crikey! Error updating joinedGroups cookie:', error);
        return false;
    }
}

// Add this HTML to the page when it loads
document.addEventListener('DOMContentLoaded', () => {
    const modalHTML = `
        <div class="modal-overlay" id="createGroupModal">
            <div class="modal">
                <div class="modal-header">
                    <h2>Create New Group</h2>
                    <button class="close-modal">×</button>
                </div>
                <form class="create-group-form" id="createGroupForm">
                    <div class="form-group">
                        <label for="groupName">Group Name</label>
                        <input type="text" id="groupName" required placeholder="Enter group name">
                    </div>
                    <div class="form-group">
                        <label for="groupDescription">Description</label>
                        <textarea id="groupDescription" required placeholder="Describe your group"></textarea>
                    </div>
                    <div class="form-group">
                        <label for="groupCategory">Category</label>
                        <select id="groupCategory" required>
                            ${Object.keys(CATEGORIES).map(category => 
                                `<option value="${category}">${category}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button type="submit" class="submit-group">Create Group</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Initialize modal functionality
    initializeModal();
});

// Add this function to handle modal functionality
function initializeModal() {
    const modal = document.getElementById('createGroupModal');
    const createBtn = document.querySelector('.create-group-btn');
    const closeBtn = modal.querySelector('.close-modal');
    const form = document.getElementById('createGroupForm');
    
    createBtn.addEventListener('click', () => {
        modal.classList.add('active');
    });
    
    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const isLoggedIn = Boolean(Cookies.get('isLoggedIn'));
        if (!isLoggedIn) {
            showNotification('Please log in to create a group', 'error');
            return;
        }
        
        const newGroup = {
            id: nextGroupId++,
            name: document.getElementById('groupName').value,
            description: document.getElementById('groupDescription').value,
            category: document.getElementById('groupCategory').value,
            members: 1,
            searchTerm: document.getElementById('groupCategory').value.toLowerCase(),
        };
        
        // Add to groups array
        groups.unshift(newGroup);
        
        // Store in created groups cookie
        let createdGroups = getCreatedGroups();
        if (!Array.isArray(createdGroups)) createdGroups = [];
        createdGroups.push(newGroup.id);
        Cookies.set('createdGroups', createdGroups);
        
        // Auto-join the created group
        let joinedGroups = getJoinedGroups();
        if (!Array.isArray(joinedGroups)) joinedGroups = [];
        if (!joinedGroups.includes(newGroup.id)) {
            joinedGroups.push(newGroup.id);
            Cookies.set('joinedGroups', joinedGroups);
        }
        
        // Reset form and close modal
        form.reset();
        modal.classList.remove('active');
        
        // Refresh the groups display
        filteredGroups = [...groups];
        loadGroupsPage(1);
        
        showNotification('Group created successfully! You are now a member.');
    });
} 