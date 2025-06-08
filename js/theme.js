// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const html = document.documentElement;
const THEME_STORAGE_KEY = 'campus-connect-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Initialize theme
function initializeTheme() {
    // Check for stored theme preference
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    
    if (storedTheme) {
        applyTheme(storedTheme);
    } else {
        // Check system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(prefersDark ? THEMES.DARK : THEMES.LIGHT);
    }

    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
            applyTheme(e.matches ? THEMES.DARK : THEMES.LIGHT);
        }
    });
}

// Apply theme
function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    updateThemeToggleButton(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

// Update theme toggle button
function updateThemeToggleButton(theme) {
    themeToggle.innerHTML = theme === THEMES.DARK ? '🌜' : '🌞';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === THEMES.DARK ? 'light' : 'dark'} mode`);
}

// Toggle theme
function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
    applyTheme(newTheme);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    themeToggle.addEventListener('click', toggleTheme);
}); 