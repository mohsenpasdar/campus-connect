// Auth state management
const AUTH_COOKIE = 'campusconnect_auth';
const GROUPS_COOKIE = 'campusconnect_groups';

// Check if user is logged in
export function isLoggedIn() {
    return getCookie(AUTH_COOKIE) !== null;
}

// Get joined groups
export function getJoinedGroups() {
    const groupsCookie = getCookie(GROUPS_COOKIE);
    return groupsCookie ? JSON.parse(groupsCookie) : [];
}

// Join a group
export function joinGroup(groupId) {
    if (!isLoggedIn()) return false;
    
    const joinedGroups = getJoinedGroups();
    if (!joinedGroups.includes(groupId)) {
        joinedGroups.push(groupId);
        setCookie(GROUPS_COOKIE, JSON.stringify(joinedGroups), 30); // 30 days expiry
    }
    return true;
}

// Leave a group
export function leaveGroup(groupId) {
    if (!isLoggedIn()) return false;
    
    const joinedGroups = getJoinedGroups();
    const index = joinedGroups.indexOf(groupId);
    if (index > -1) {
        joinedGroups.splice(index, 1);
        setCookie(GROUPS_COOKIE, JSON.stringify(joinedGroups), 30);
    }
    return true;
}

// Check if user is member of a group
export function isMemberOfGroup(groupId) {
    return getJoinedGroups().includes(groupId);
}

// Cookie utilities
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// For development/testing
export function simulateLogin() {
    setCookie(AUTH_COOKIE, 'demo_user', 1);
}

export function simulateLogout() {
    document.cookie = `${AUTH_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    document.cookie = `${GROUPS_COOKIE}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
} 