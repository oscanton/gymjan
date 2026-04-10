/* =========================================
   core/storage.js - PERSISTENCE (LocalStorage)
   ========================================= */

const DB = {
    save: (key, value) => localStorage.setItem(APP_PREFIX + key, JSON.stringify(value)),
    get: (key, defaultValue = null) => {
        const data = localStorage.getItem(APP_PREFIX + key);
        try {
            const parsed = data ? JSON.parse(data) : null;
            return parsed !== null ? parsed : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    },
    remove: (key) => localStorage.removeItem(APP_PREFIX + key),
    getRawKey: (key) => APP_PREFIX + key,
    listKeys: () => Object.keys(localStorage)
        .filter(k => k.startsWith(APP_PREFIX))
        .map(k => k.slice(APP_PREFIX.length)),
    removeByPrefix: (prefix) => {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(APP_PREFIX + prefix)) {
                localStorage.removeItem(key);
            }
        });
    },
    clearAll: ({
        confirmReset = true,
        confirmMessage = 'Borrar todos los datos de la aplicación?',
        reload = true
    } = {}) => {
        if (confirmReset && !confirm(confirmMessage)) return false;
        Object.keys(localStorage).forEach(k => k.startsWith(APP_PREFIX) && localStorage.removeItem(k));
        if (reload) location.reload();
        return true;
    }
};

window.DB = DB;
