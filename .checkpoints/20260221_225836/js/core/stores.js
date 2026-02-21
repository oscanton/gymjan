/* =========================================
   core/stores.js - DATOS COMPARTIDOS
   ========================================= */

const ActivityStore = {
    getWeeklyPlan: () => {
        const daysCount = DAYS_COUNT;
        const fallbackId = (typeof DEFAULT_ROUTINE_ID !== 'undefined') ? DEFAULT_ROUTINE_ID : 'recuperacion';
        const raw = DB.get('user_activity_plan', Array(daysCount).fill(fallbackId));
        const plan = Array.isArray(raw) ? raw.slice(0, daysCount) : Array(daysCount).fill(fallbackId);
        while (plan.length < daysCount) plan.push(fallbackId);
        return plan.map(v => (v === 'descanso' ? 'recuperacion' : v));
    },
    saveWeeklyPlan: (plan) => DB.save('user_activity_plan', plan),
    getDailySteps: (defaultSteps = null) => {
        const daysCount = DAYS_COUNT;
        const fallbackSteps = Number.isFinite(defaultSteps)
            ? defaultSteps
            : APP_STEPS_DEFAULTS.target;
        const raw = DB.get('user_activity_steps', null);
        const parsed = Array.isArray(raw) ? raw.slice(0, daysCount) : [];
        while (parsed.length < daysCount) parsed.push(fallbackSteps);
        return parsed.map(v => {
            const num = parseInt(v, 10);
            return Number.isNaN(num) || num < 0 ? fallbackSteps : num;
        });
    },
    saveDailySteps: (steps) => {
        const daysCount = DAYS_COUNT;
        const arr = Array.isArray(steps) ? steps.slice(0, daysCount) : [];
        while (arr.length < daysCount) arr.push(0);
        DB.save('user_activity_steps', arr.map(v => {
            const num = parseInt(v, 10);
            return Number.isNaN(num) || num < 0 ? 0 : num;
        }));
    }
};

const MenuStore = {
    getSelectedFile: () => DB.get('selected_menu_file', 'menus/menu.js'),
    setSelectedFile: (file) => DB.save('selected_menu_file', file),
    getSavedMenuData: (file) => DB.get(`menu_data_${file}`, null),
    saveMenuData: (file, data) => DB.save(`menu_data_${file}`, data),
    clearSavedMenuData: (file) => localStorage.removeItem(APP_PREFIX + `menu_data_${file}`)
};

window.ActivityStore = ActivityStore;
window.MenuStore = MenuStore;

