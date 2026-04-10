const ACTIVITY_FILE_MIGRATIONS = {
    'activity/activity_week_base.js': 'activity/week_activity_default.js',
    'activity/activity_default.js': 'activity/week_activity_default.js'
};
const MENU_FILE_MIGRATIONS = {
    'menus/menu.js': 'menus/week_menu_default.js',
    'menus/menu_default.js': 'menus/week_menu_default.js',
    'menus/menu_1.js': 'menus/week_menu_weightloss.js'
};
const toReverseMap = (map) => Object.fromEntries(Object.entries(map).map(([legacy, current]) => [current, legacy]));
const ACTIVITY_FILE_REVERSE_MIGRATIONS = toReverseMap(ACTIVITY_FILE_MIGRATIONS);
const MENU_FILE_REVERSE_MIGRATIONS = toReverseMap(MENU_FILE_MIGRATIONS);

const STORAGE_KEYS = Object.freeze({
    userProfile: 'user_profile',
    userAdjustments: 'user_adjustments',
    userSecondaryAdjustments: 'user_secondary_adjustments',
    userMacroRatios: 'user_macro_ratios',
    userMacroRatiosByDay: 'user_macro_ratios_by_day',
    userSecondaryRules: 'user_secondary_rules',
    userSecondaryTargets: 'user_secondary_targets',
    userHydrationRules: 'user_hydration_rules',
    userHydrationTargets: 'user_hydration_targets',
    dailyNutritionTargets: 'daily_nutrition_targets',
    selectedActivityPlanFile: 'selected_activity_plan_file',
    selectedMenuFile: 'selected_menu_file',
    shoppingCustomItems: 'shop_custom_items',
    shoppingCheckPrefix: 'shop_'
});

const readKey = (key, fallback = null) => DB.get(key, fallback);
const saveKey = (key, value) => DB.save(key, value);
const removeKey = (key) => DB.remove(key);
const getNormalizedSelectedFile = (storageKey, fallback, normalize) => {
    const selected = readKey(storageKey, fallback);
    const normalized = normalize(selected);
    if (selected !== normalized) saveKey(storageKey, normalized);
    return normalized;
};
const getMigratedSavedData = (prefix, file, normalize, reverseMigrations) => {
    const normalized = normalize(file);
    const dataKey = `${prefix}${normalized}`;
    let data = readKey(dataKey, null);
    if (!data && reverseMigrations[normalized]) {
        const legacyKey = `${prefix}${reverseMigrations[normalized]}`;
        data = readKey(legacyKey, null);
        if (data) {
            saveKey(dataKey, data);
            removeKey(legacyKey);
        }
    }
    return { normalized, data, dataKey };
};
const bindStoreAccessors = (pairs) => Object.fromEntries(pairs.flatMap(([name, key, fallback = null]) => [
    [`get${name}`, (value = fallback) => readKey(STORAGE_KEYS[key], value)],
    [`save${name}`, (value) => saveKey(STORAGE_KEYS[key], value)]
]));
const normalizeActivityPlanFile = (file) => ACTIVITY_FILE_MIGRATIONS[file] || file;
const normalizeMenuFile = (file) => MENU_FILE_MIGRATIONS[file] || file;
const normalizeActivitySection = (section) => {
    if (!section || typeof section !== 'object') return null;
    if (section.type === 'rest') return { type: 'rest', description: section.description || '' };
    return { exercises: Array.isArray(section.exercises) ? section.exercises : [], description: section.description || '' };
};
const normalizeDayKey = (value) => String(value || '')
    .trim()
    .toLowerCase()
    .replace(/Ã©|ã©|é/g, 'e')
    .replace(/Ã¡|ã¡|á/g, 'a')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z]/g, '');
const DAY_NAME_MAP = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Mi\u00E9rcoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'S\u00E1bado',
    domingo: 'Domingo'
};
const normalizeDayName = (value) => {
    const raw = String(value || '').trim();
    if (!raw) return raw;
    const key = normalizeDayKey(raw);
    return /^mi.*rcoles$/.test(key) ? 'Mi\u00E9rcoles' : /^sa.*bado$/.test(key) ? 'S\u00E1bado' : DAY_NAME_MAP[key] || raw;
};
const normalizeHydration = (hydration) => {
    const raw = hydration && typeof hydration === 'object' ? hydration : null;
    const description = raw?.description || 'Hidratacion directa necesaria durante todo el dia';
    if (Array.isArray(raw?.items)) return { items: raw.items, description };
    if (Number.isFinite(parseFloat(raw?.directMl))) return { items: [{ foodId: 'water', amount: parseFloat(raw.directMl) }], description };
    return { items: [{ foodId: 'water', amount: 1500 }], description };
};
const getSavedPlanData = (prefix, file, normalizeFile, reverseMigrations, normalizeData = null) => {
    const migrated = getMigratedSavedData(prefix, file, normalizeFile, reverseMigrations);
    const data = normalizeData && migrated.data ? normalizeData(migrated.data) : migrated.data;
    if (data && data !== migrated.data) saveKey(migrated.dataKey, data);
    return data;
};

const UserStore = {
    ...bindStoreAccessors([
        ['Profile', 'userProfile', {}],
        ['Adjustments', 'userAdjustments', null],
        ['SecondaryAdjustments', 'userSecondaryAdjustments', null],
        ['MacroRatios', 'userMacroRatios', null],
        ['DailyMacroRatios', 'userMacroRatiosByDay', null],
        ['SecondaryRules', 'userSecondaryRules', null],
        ['SecondaryTargets', 'userSecondaryTargets', null],
        ['HydrationRules', 'userHydrationRules', null],
        ['HydrationTargets', 'userHydrationTargets', null],
        ['DailyNutritionTargets', 'dailyNutritionTargets', {}]
    ]),
    patchProfile: (partialProfile = {}) => {
        const profile = { ...UserStore.getProfile({}), ...(partialProfile || {}) };
        UserStore.saveProfile(profile);
        return profile;
    }
};

const ShoppingStore = {
    getItemChecked: (itemId, fallback = false) => readKey(`${STORAGE_KEYS.shoppingCheckPrefix}${itemId}`, fallback),
    setItemChecked: (itemId, checked) => saveKey(`${STORAGE_KEYS.shoppingCheckPrefix}${itemId}`, !!checked),
    clearItemChecked: (itemId) => removeKey(`${STORAGE_KEYS.shoppingCheckPrefix}${itemId}`),
    clearAllChecks: () => DB.removeByPrefix(STORAGE_KEYS.shoppingCheckPrefix),
    getCustomItems: () => {
        const items = readKey(STORAGE_KEYS.shoppingCustomItems, []);
        return Array.isArray(items) ? items.filter((item) => item && typeof item.text === 'string' && item.text.trim()) : [];
    },
    saveCustomItems: (items) => saveKey(STORAGE_KEYS.shoppingCustomItems, items),
    addCustomItem: (text) => {
        const safeText = String(text || '').trim();
        if (!safeText) return ShoppingStore.getCustomItems();
        const updated = [...ShoppingStore.getCustomItems(), {
            id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
            text: safeText,
            checked: false
        }];
        ShoppingStore.saveCustomItems(updated);
        return updated;
    },
    setCustomItemChecked: (customId, checked) => {
        const updated = ShoppingStore.getCustomItems().map((item) => item.id === customId ? { ...item, checked: !!checked } : item);
        ShoppingStore.saveCustomItems(updated);
        return updated;
    },
    clearAll: () => {
        ShoppingStore.clearAllChecks();
        ShoppingStore.saveCustomItems([]);
    }
};

const ActivityStore = {
    getSelectedFile: () => getNormalizedSelectedFile(STORAGE_KEYS.selectedActivityPlanFile, DEFAULT_ACTIVITY_PLAN_FILE, normalizeActivityPlanFile),
    setSelectedFile: (file) => saveKey(STORAGE_KEYS.selectedActivityPlanFile, normalizeActivityPlanFile(file)),
    getSavedPlanData: (file) => getSavedPlanData('activity_data_', file, normalizeActivityPlanFile, ACTIVITY_FILE_REVERSE_MIGRATIONS),
    getStoredPlanData: (file = null) => {
        const data = ActivityStore.getSavedPlanData(file || ActivityStore.getSelectedFile());
        return Array.isArray(data) ? ActivityStore.normalizeActivityData(data) : null;
    },
    savePlanData: (file, data) => saveKey(`activity_data_${normalizeActivityPlanFile(file)}`, ActivityStore.normalizeActivityData(data)),
    clearSavedPlanData: (file) => removeKey(`activity_data_${normalizeActivityPlanFile(file)}`),
    normalizeActivityData: (data) => {
        if (!Array.isArray(data)) return data;
        const normalized = data.slice(0, DAYS_COUNT).map((day) => !day || typeof day !== 'object' ? day : ({
            day: day.day || '',
            walk: normalizeActivitySection(day.walk),
            gym: normalizeActivitySection(day.gym),
            extra_activity: normalizeActivitySection(day.extra_activity)
        }));
        while (normalized.length < DAYS_COUNT) normalized.push({
            day: typeof WEEK_DAYS !== 'undefined' ? WEEK_DAYS[normalized.length] || '' : '',
            walk: null,
            gym: null,
            extra_activity: null
        });
        return normalized;
    },
    getWalkInfo: (dayData, { defaultStepsCfg = null, walkingExercise = null } = {}) => {
        const defaults = defaultStepsCfg || APP_STEPS_DEFAULTS;
        const cadenceBase = Number.isFinite(parseFloat(walkingExercise?.cadenceBase)) ? parseFloat(walkingExercise.cadenceBase) : defaults.perMinute;
        const walkItem = Array.isArray(dayData?.walk?.exercises)
            ? dayData.walk.exercises.find((entry) => entry?.exerciseId === 'caminar') || dayData.walk.exercises[0]
            : null;
        const stepsPerMin = parseFloat(walkItem?.stepsPerMin) || cadenceBase;
        const secPerRep = parseFloat(walkItem?.secPerRep);
        const safeSec = Number.isFinite(secPerRep) && secPerRep > 0 ? secPerRep : Math.round((defaults.target / stepsPerMin) * 60);
        return { steps: Math.max(0, Math.round((safeSec / 60) * stepsPerMin)), stepsPerMin, secPerRep: safeSec, cadenceBase };
    }
};

const LEGACY_MEAL_KEYS = {
    breakfast: ['breakfast', 'desayuno'],
    lunch: ['lunch', 'comida'],
    dinner: ['dinner', 'cena']
};

const MenuStore = {
    getSelectedFile: () => getNormalizedSelectedFile(STORAGE_KEYS.selectedMenuFile, 'menus/week_menu_default.js', normalizeMenuFile),
    setSelectedFile: (file) => saveKey(STORAGE_KEYS.selectedMenuFile, normalizeMenuFile(file)),
    getSavedMenuData: (file) => getSavedPlanData('menu_data_', file, normalizeMenuFile, MENU_FILE_REVERSE_MIGRATIONS, MenuStore.normalizeMenuData),
    saveMenuData: (file, data) => saveKey(`menu_data_${normalizeMenuFile(file)}`, MenuStore.normalizeMenuData(data)),
    clearSavedMenuData: (file) => removeKey(`menu_data_${normalizeMenuFile(file)}`)
};

MenuStore.normalizeMenuData = (data) => {
    if (!Array.isArray(data)) return data;
    const needsMigration = data.some((day) => day && (day.dia || day.desayuno || day.comida || day.cena));
    return data.map((day) => {
        if (!day || typeof day !== 'object') return day;
        const normalized = {
            day: normalizeDayName(day.day || day.dia || ''),
            hydration: normalizeHydration(day.hydration)
        };
        Object.entries(LEGACY_MEAL_KEYS).forEach(([mealKey, aliases]) => {
            normalized[mealKey] = aliases.map((key) => day[key]).find(Boolean) || { items: [], description: '' };
        });
        return needsMigration ? normalized : { ...day, ...normalized };
    });
};

window.STORAGE_KEYS = STORAGE_KEYS;
window.UserStore = UserStore;
window.ShoppingStore = ShoppingStore;
window.ActivityStore = ActivityStore;
window.MenuStore = MenuStore;
