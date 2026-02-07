/* =========================================
   core/routines.js - CARGA Y ACCESO A RUTINAS
   ========================================= */

const Routines = {
    ensureLoaded: () => {
        if (window.RUTINAS_FUERZA && window.RUTINAS_FUERZA.length) return Promise.resolve();
        const files = (typeof AVAILABLE_RUTINAS !== 'undefined') ? AVAILABLE_RUTINAS : [];
        const loads = files.map((file, idx) => UI.loadScript(`js/data/${file}`, `routine-data-${idx}`));
        return Promise.all(loads);
    },

    getAll: () => window.RUTINAS_FUERZA || [],

    getById: (id) => {
        const list = window.RUTINAS_FUERZA || [];
        return list.find(r => r.id === id) || null;
    }
};

window.Routines = Routines;
