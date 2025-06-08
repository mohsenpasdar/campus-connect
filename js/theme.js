// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const lightModeIcon = document.querySelector('.light-mode-icon');
const darkModeIcon = document.querySelector('.dark-mode-icon');
const THEME_STORAGE_KEY = 'campus-connect-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Check for saved theme preference, otherwise use system preference
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? THEMES.DARK : THEMES.LIGHT;
};

// Apply theme
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Update icons
    if (theme === THEMES.DARK) {
        lightModeIcon.style.display = 'none';
        darkModeIcon.style.display = 'block';
    } else {
        lightModeIcon.style.display = 'block';
        darkModeIcon.style.display = 'none';
    }
};

// Initialize theme
setTheme(getPreferredTheme());

// Theme toggle click handler
themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
    }
});

// Function to clear all cookies except theme
const clearCookiesExceptTheme = () => {
    const cookies = document.cookie.split(';');
    const themePreference = localStorage.getItem(THEME_STORAGE_KEY);
    
    for (let cookie of cookies) {
        const cookieName = cookie.split('=')[0].trim();
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    }
    
    // Restore theme preference
    if (themePreference) {
        localStorage.setItem(THEME_STORAGE_KEY, themePreference);
    }
};

// Dropdown menu handling
document.addEventListener('DOMContentLoaded', () => {
    const userMenu = document.querySelector('.user-menu');
    const profileTrigger = document.querySelector('.profile-trigger');

    // Toggle dropdown
    profileTrigger?.addEventListener('click', (e) => {
        e.stopPropagation();
        userMenu.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!userMenu?.contains(e.target)) {
            userMenu?.classList.remove('active');
        }
    });

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        clearCookiesExceptTheme();
        window.location.href = 'login.html';
    });
}); 