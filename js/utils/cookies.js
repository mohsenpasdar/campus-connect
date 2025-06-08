// Cookie management utility functions
const Cookies = {
    set: function(name, value, days = 7) {
        try {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toUTCString();
            const sameSite = "; SameSite=Strict";
            const path = "; path=/";
            
            // Deep clone the value to ensure we don't have reference issues
            const clonedValue = JSON.parse(JSON.stringify(value));
            
            // Set the cookie
            document.cookie = `${name}=${encodeURIComponent(JSON.stringify(clonedValue))}${expires}${sameSite}${path}`;
            
            // Verify the cookie was set correctly
            const savedValue = this.get(name);
            if (!savedValue) {
                throw new Error('Failed to save cookie');
            }
            
            return true;
        } catch (error) {
            console.error('Error setting cookie:', name, error);
            throw error; // Re-throw to handle in the calling code
        }
    },

    get: function(name) {
        try {
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const encodedValue = c.substring(nameEQ.length, c.length);
                    const decodedValue = decodeURIComponent(encodedValue);
                    return JSON.parse(decodedValue);
                }
            }
            return null;
        } catch (error) {
            console.error('Error getting cookie:', name, error);
            return null;
        }
    },

    delete: function(name) {
        document.cookie = name + '=; Max-Age=-99999999; path=/';
    }
};

export default Cookies; 