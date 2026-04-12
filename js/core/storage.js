/* =========================================
   core/storage.js - PERSISTENCE (LocalStorage)
   ========================================= */

const getTranslatedMessage = (key, fallback = '') => window.I18n?.t?.(key, {}, fallback) || fallback;

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
        .filter((key) => key.startsWith(APP_PREFIX))
        .map((key) => key.slice(APP_PREFIX.length)),
    removeByPrefix: (prefix) => {
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(APP_PREFIX + prefix)) {
                localStorage.removeItem(key);
            }
        });
    },
    clearAll: ({
        confirmReset = true,
        confirmMessage = null,
        reload = true
    } = {}) => {
        const message = confirmMessage || getTranslatedMessage('storage.reset_confirm', 'Borrar todos los datos de la aplicacion?');
        if (confirmReset && !confirm(message)) return false;
        Object.keys(localStorage).forEach((key) => key.startsWith(APP_PREFIX) && localStorage.removeItem(key));
        if (reload) location.reload();
        return true;
    }
};

window.DB = DB;
