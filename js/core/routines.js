/* =========================================
   core/routines.js - CARGA Y ACCESO A RUTINAS
   ========================================= */

const Routines = {
    getDefaultId: () => (
        (typeof DEFAULT_ROUTINE_ID !== 'undefined') ? DEFAULT_ROUTINE_ID : 'recuperacion'
    ),

    ensureLoaded: () => {
        if (window.WORKOUT_ROUTINES && window.WORKOUT_ROUTINES.length) return Promise.resolve();
        const files = (typeof AVAILABLE_ROUTINE_FILES !== 'undefined') ? AVAILABLE_ROUTINE_FILES : [];
        const loads = files.map((file, idx) => UI.loadScript(`js/data/${file}`, `routine-data-${idx}`));
        return Promise.all(loads);
    },

    getAll: () => window.WORKOUT_ROUTINES || [],

    getById: (id) => {
        const list = window.WORKOUT_ROUTINES || [];
        if (id === 'descanso') id = 'recuperacion';
        return list.find(r => r.id === id) || null;
    },

    getActivityKey: (id) => {
        const routine = Routines.getById(id);
        if (routine && routine.activityKey) return routine.activityKey;
        if (routine && routine.tipo === 'fuerza') return 'fuerza_1h';
        return Routines.getDefaultId();
    }
};

window.Routines = Routines;
