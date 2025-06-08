// Theme handling
const themeToggle = document.getElementById('theme-toggle');
const lightModeIcon = document.querySelector('.light-mode-icon');
const darkModeIcon = document.querySelector('.dark-mode-icon');
const THEME_STORAGE_KEY = 'campus-connect-theme';
const THEMES = {
    LIGHT: 'light',
    DARK: 'dark'
};

// Check for saved theme preference, otherwise default to dark mode
const getPreferredTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        return savedTheme;
    }
    return THEMES.DARK; // Default to dark mode
};

// Apply theme
const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    
    // Update icons if they exist
    if (lightModeIcon && darkModeIcon) {
        if (theme === THEMES.DARK) {
            lightModeIcon.style.display = 'none';
            darkModeIcon.style.display = 'block';
        } else {
            lightModeIcon.style.display = 'block';
            darkModeIcon.style.display = 'none';
        }
    }
};

// Initialize theme
setTheme(getPreferredTheme());

// Theme toggle click handler
themeToggle?.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    setTheme(currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK);
});

// Handle system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        setTheme(THEMES.DARK); // Default to dark mode instead of system preference
    }
});

// Dropdown menu handling
const initializeDropdownMenu = () => {
    const userMenu = document.querySelector('.user-menu');
    const profileTrigger = document.querySelector('.profile-trigger');
    const dropdownMenu = document.querySelector('.dropdown-menu');

    if (profileTrigger && userMenu && dropdownMenu) {
        // Toggle dropdown
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('active');
            
            // Update dropdown visibility
            if (userMenu.classList.contains('active')) {
                dropdownMenu.style.display = 'block';
                setTimeout(() => {
                    dropdownMenu.style.opacity = '1';
                    dropdownMenu.style.transform = 'translateY(0)';
                }, 10);
            } else {
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    dropdownMenu.style.display = 'none';
                }, 200);
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('active');
                dropdownMenu.style.opacity = '0';
                dropdownMenu.style.transform = 'translateY(-10px)';
                setTimeout(() => {
                    dropdownMenu.style.display = 'none';
                }, 200);
            }
        });
    }

    // Handle logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn?.addEventListener('click', () => {
        // Clear user data
        localStorage.removeItem(THEME_STORAGE_KEY);
        // Redirect to login
        window.location.href = 'login.html';
    });
};

// Initialize dropdown menu when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeDropdownMenu); 