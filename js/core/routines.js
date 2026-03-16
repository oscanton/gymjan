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

    compareByName: (a, b) => (
        (a && a.name ? a.name : '').localeCompare(
            (b && b.name ? b.name : ''),
            'es',
            { sensitivity: 'base', numeric: true }
        )
    ),

    getSortedByName: () => [...Routines.getAll()].sort(Routines.compareByName),

    getOptionsHtml: ({ selectedId = null } = {}) => {
        const list = Routines.getSortedByName();
        return list.map(r =>
            `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.name}</option>`
        ).join('');
    },

    getById: (id) => {
        const list = window.WORKOUT_ROUTINES || [];
        const found = list.find(r => r.id === id);
        if (found) return found;
        if (id === 'descanso') return list.find(r => r.id === 'recuperacion') || null;
        return null;
    },

    getActivityKey: (id) => {
        const routine = Routines.getById(id);
        if (routine && routine.activityKey) return routine.activityKey;
        if (routine && routine.type === 'fuerza') return 'fuerza_1h';
        return Routines.getDefaultId();
    }
};

window.Routines = Routines;
