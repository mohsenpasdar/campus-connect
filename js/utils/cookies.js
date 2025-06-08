// Cookie management utility functions
const Cookies = {
    set: function(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        const sameSite = "; SameSite=Strict";
        const path = "; path=/";
        document.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + expires + sameSite + path;
    },

    get: function(name) {
        const nameEQ = name + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                try {
                    return JSON.parse(decodeURIComponent(c.substring(nameEQ.length, c.length)));
                } catch (e) {
                    return null;
                }
            }
        }
        return null;
    },

    delete: function(name) {
        document.cookie = name + '=; Max-Age=-99999999; path=/';
    }
};

export default Cookies; 