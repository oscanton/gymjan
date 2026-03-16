/* =========================================
   core/stores.js - DATOS COMPARTIDOS
   ========================================= */

const ActivityStore = {
    getWeeklyPlan: () => {
        const daysCount = DAYS_COUNT;
        const fallbackId = (typeof Routines !== 'undefined') ? Routines.getDefaultId() : 'recuperacion';
        const raw = DB.get('user_activity_plan', Array(daysCount).fill(fallbackId));
        const plan = Array.isArray(raw) ? raw.slice(0, daysCount) : Array(daysCount).fill(fallbackId);
        while (plan.length < daysCount) plan.push(fallbackId);
        return plan.map(v => v || fallbackId);
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
    getSavedMenuData: (file) => {
        const raw = DB.get(`menu_data_${file}`, null);
        if (!raw) return raw;
        const normalized = MenuStore.normalizeMenuData(raw);
        if (normalized !== raw) {
            DB.save(`menu_data_${file}`, normalized);
        }
        return normalized;
    },
    saveMenuData: (file, data) => DB.save(`menu_data_${file}`, MenuStore.normalizeMenuData(data)),
    clearSavedMenuData: (file) => localStorage.removeItem(APP_PREFIX + `menu_data_${file}`)
};

MenuStore.normalizeMenuData = (data) => {
    if (!Array.isArray(data)) return data;
    const mealMap = {
        breakfast: 'breakfast',
        lunch: 'lunch',
        dinner: 'dinner',
        desayuno: 'breakfast',
        comida: 'lunch',
        cena: 'dinner'
    };
    const needsMigration = data.some(day => day && (day.dia || day.desayuno || day.comida || day.cena));
    if (!needsMigration) return data;

    return data.map(day => {
        if (!day || typeof day !== 'object') return day;
        const normalized = {
            day: day.day || day.dia || ''
        };
        ['breakfast', 'lunch', 'dinner'].forEach((key) => {
            const legacyKey = Object.keys(mealMap).find(k => mealMap[k] === key && k !== key);
            const source = day[key] || day[legacyKey] || null;
            normalized[key] = source || { items: [], description: '' };
        });
        return normalized;
    });
};

window.ActivityStore = ActivityStore;
window.MenuStore = MenuStore;

