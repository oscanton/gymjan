/* =========================================
   core/stores.js - DATOS COMPARTIDOS
   ========================================= */

const ACTIVITY_FILE_MIGRATIONS = {
    'activity/activity_week_base.js': 'activity/week_activity_default.js',
    'activity/activity_default.js': 'activity/week_activity_default.js'
};

const MENU_FILE_MIGRATIONS = {
    'menus/menu.js': 'menus/week_menu_default.js',
    'menus/menu_default.js': 'menus/week_menu_default.js',
    'menus/menu_1.js': 'menus/week_menu_weightloss.js'
};

const normalizeActivityPlanFile = (file) => ACTIVITY_FILE_MIGRATIONS[file] || file;

const normalizeMenuFile = (file) => MENU_FILE_MIGRATIONS[file] || file;

const getLegacyActivityPlanFile = (file) => {
    const entry = Object.entries(ACTIVITY_FILE_MIGRATIONS).find(([, current]) => current === file);
    return entry ? entry[0] : null;
};

const getLegacyMenuFile = (file) => {
    const entry = Object.entries(MENU_FILE_MIGRATIONS).find(([, current]) => current === file);
    return entry ? entry[0] : null;
};

const ActivityStore = {
    getSelectedFile: () => {
        const selected = DB.get('selected_activity_plan_file', DEFAULT_ACTIVITY_PLAN_FILE);
        const normalized = normalizeActivityPlanFile(selected);
        if (selected !== normalized) DB.save('selected_activity_plan_file', normalized);
        return normalized;
    },
    setSelectedFile: (file) => DB.save('selected_activity_plan_file', normalizeActivityPlanFile(file)),
    getSavedPlanData: (file) => {
        const normalized = normalizeActivityPlanFile(file);
        const dataKey = `activity_data_${normalized}`;
        let data = DB.get(dataKey, null);
        if (!data) {
            const legacyFile = getLegacyActivityPlanFile(normalized);
            if (legacyFile) {
                const legacyData = DB.get(`activity_data_${legacyFile}`, null);
                if (legacyData) {
                    DB.save(dataKey, legacyData);
                    localStorage.removeItem(APP_PREFIX + `activity_data_${legacyFile}`);
                    data = legacyData;
                }
            }
        }
        return data;
    },
    savePlanData: (file, data) => DB.save(`activity_data_${normalizeActivityPlanFile(file)}`, ActivityStore.normalizeActivityData(data)),
    clearSavedPlanData: (file) => localStorage.removeItem(APP_PREFIX + `activity_data_${normalizeActivityPlanFile(file)}`),
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
    getSelectedFile: () => {
        const selected = DB.get('selected_menu_file', 'menus/week_menu_default.js');
        const normalized = normalizeMenuFile(selected);
        if (selected !== normalized) DB.save('selected_menu_file', normalized);
        return normalized;
    },
    setSelectedFile: (file) => DB.save('selected_menu_file', normalizeMenuFile(file)),
    getSavedMenuData: (file) => {
        const normalized = normalizeMenuFile(file);
        const dataKey = `menu_data_${normalized}`;
        let raw = DB.get(dataKey, null);
        if (!raw) {
            const legacyFile = getLegacyMenuFile(normalized);
            if (legacyFile) {
                const legacyData = DB.get(`menu_data_${legacyFile}`, null);
                if (legacyData) {
                    DB.save(dataKey, legacyData);
                    localStorage.removeItem(APP_PREFIX + `menu_data_${legacyFile}`);
                    raw = legacyData;
                }
            }
        }
        if (!raw) return raw;
        const normalizedData = MenuStore.normalizeMenuData(raw);
        if (normalizedData !== raw) {
            DB.save(dataKey, normalizedData);
        }
        return normalizedData;
    },
    saveMenuData: (file, data) => DB.save(`menu_data_${normalizeMenuFile(file)}`, MenuStore.normalizeMenuData(data)),
    clearSavedMenuData: (file) => localStorage.removeItem(APP_PREFIX + `menu_data_${normalizeMenuFile(file)}`)
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

