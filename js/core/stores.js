/* =========================================
   core/stores.js - DATOS COMPARTIDOS
   ========================================= */

const ActivityStore = {
    getSelectedFile: () => DB.get('selected_activity_plan_file', DEFAULT_ACTIVITY_PLAN_FILE),
    setSelectedFile: (file) => DB.save('selected_activity_plan_file', file),
    getSavedPlanData: (file) => DB.get(`activity_data_${file}`, null),
    savePlanData: (file, data) => DB.save(`activity_data_${file}`, ActivityStore.normalizeActivityData(data)),
    clearSavedPlanData: (file) => localStorage.removeItem(APP_PREFIX + `activity_data_${file}`),
    getActivePlanData: (file = null) => {
        const selected = file || ActivityStore.getSelectedFile();
        const saved = ActivityStore.getSavedPlanData(selected);
        if (Array.isArray(saved)) return ActivityStore.normalizeActivityData(saved);
        if (Array.isArray(window.ACTIVITY_DATA)) return ActivityStore.normalizeActivityData(window.ACTIVITY_DATA);
        return null;
    },
    normalizeActivityData: (data) => {
        if (!Array.isArray(data)) return data;
        const normalized = data.map((day) => {
            if (!day || typeof day !== 'object') return day;
            const normalized = {
                day: day.day || ''
            };
            const normalizeSection = (section) => {
                if (!section || typeof section !== 'object') return null;
                if (section.type === 'rest') {
                    return { type: 'rest', description: section.description || '' };
                }
                const exercises = Array.isArray(section.exercises) ? section.exercises : [];
                return {
                    exercises,
                    description: section.description || ''
                };
            };
            normalized.walk = normalizeSection(day.walk);
            normalized.gym = normalizeSection(day.gym);
            normalized.extra_activity = normalizeSection(day.extra_activity);
            return normalized;
        });
        const filled = normalized.slice(0, DAYS_COUNT);
        while (filled.length < DAYS_COUNT) {
            const dayName = (typeof WEEK_DAYS !== 'undefined' && WEEK_DAYS[filled.length]) ? WEEK_DAYS[filled.length] : '';
            filled.push({ day: dayName, walk: null, gym: null, extra_activity: null });
        }
        return filled;
    },
    getWalkInfo: (dayData, { defaultStepsCfg = null, walkingExercise = null } = {}) => {
        const defaults = defaultStepsCfg || APP_STEPS_DEFAULTS;
        const cadenceBase = (walkingExercise && Number.isFinite(parseFloat(walkingExercise.cadenceBase)))
            ? parseFloat(walkingExercise.cadenceBase)
            : defaults.perMinute;
        const walkItem = (dayData && dayData.walk && Array.isArray(dayData.walk.exercises))
            ? (dayData.walk.exercises.find(e => e && e.exerciseId === 'caminar') || dayData.walk.exercises[0])
            : null;
        const stepsPerMin = parseFloat(walkItem && walkItem.stepsPerMin) || cadenceBase;
        const secPerRep = parseFloat(walkItem && walkItem.secPerRep);
        const safeSec = Number.isFinite(secPerRep) && secPerRep > 0
            ? secPerRep
            : Math.round((defaults.target / stepsPerMin) * 60);
        const steps = Math.max(0, Math.round((safeSec / 60) * stepsPerMin));
        return { steps, stepsPerMin, secPerRep: safeSec, cadenceBase };
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

