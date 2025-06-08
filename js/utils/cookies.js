// Cookie management utility functions
const Cookies = {
    set: function(name, value, days = 7) {
        try {
            console.log(`Setting cookie ${name}:`, value); // Debug log
            
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            const expires = "; expires=" + date.toUTCString();
            const sameSite = "; SameSite=Lax"; // Changed from Strict to Lax for better compatibility
            const path = "; path=/";
            
            // Convert value to string if it's not already a string
            const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
            
            // Set the cookie
            const cookieStr = `${name}=${encodeURIComponent(valueStr)}${expires}${sameSite}${path}`;
            console.log('Setting cookie with string:', cookieStr); // Debug log
            document.cookie = cookieStr;
            
            // Verify the cookie was set
            const verifyValue = this.get(name);
            console.log(`Verifying cookie ${name}:`, verifyValue); // Debug log
            
            if (!verifyValue) {
                console.error('Failed to verify cookie:', name);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error setting cookie:', name, error);
            return false;
        }
    },

    get: function(name) {
        try {
            console.log(`Getting cookie ${name}`); // Debug log
            const nameEQ = name + "=";
            const ca = document.cookie.split(';');
            console.log('All cookies:', ca); // Debug log
            
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') c = c.substring(1, c.length);
                if (c.indexOf(nameEQ) === 0) {
                    const encodedValue = c.substring(nameEQ.length, c.length);
                    const decodedValue = decodeURIComponent(encodedValue);
                    try {
                        // Try to parse as JSON first
                        const parsedValue = JSON.parse(decodedValue);
                        console.log(`Found cookie ${name}:`, parsedValue); // Debug log
                        return parsedValue;
                    } catch {
                        // If parsing fails, return as is (string)
                        console.log(`Found cookie ${name} (string):`, decodedValue); // Debug log
                        return decodedValue;
                    }
                }
            }
            console.log(`Cookie ${name} not found`); // Debug log
            return null;
        } catch (error) {
            console.error('Error getting cookie:', name, error);
            return null;
        }
    },

    delete: function(name) {
        try {
            console.log(`Deleting cookie ${name}`); // Debug log
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
            // Verify deletion
            const verifyDeleted = this.get(name);
            const success = verifyDeleted === null;
            console.log(`Cookie ${name} deletion ${success ? 'successful' : 'failed'}`); // Debug log
            return success;
        } catch (error) {
            console.error('Error deleting cookie:', name, error);
            return false;
        }
    }
};

export default Cookies; 