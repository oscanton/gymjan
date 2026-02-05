/* =========================================
   core/storage.js - PERSISTENCIA (LocalStorage)
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
    clearAll: () => {
        if (confirm("¿Borrar todos los datos de la aplicación?")) {
            Object.keys(localStorage).forEach(k => k.startsWith(APP_PREFIX) && localStorage.removeItem(k));
            location.reload();
        }
    }
};

window.DB = DB;
