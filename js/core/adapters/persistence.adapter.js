const PersistenceAdapter = (() => {
    const root = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
    const getStore = (name) => root[name] || null;
    const read = (storeName, method, fallback = null, ...args) => {
        const store = getStore(storeName);
        return store && typeof store[method] === 'function' ? store[method](...args) : fallback;
    };
    const write = (storeName, method, ...args) => {
        const store = getStore(storeName);
        return store && typeof store[method] === 'function' ? store[method](...args) : null;
    };
    const getProfileNumber = (key, fallback = 0) => {
        const value = parseFloat(read('UserStore', 'getProfile', {})?.[key]);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    };

    return {
        getProfile: (fallback = {}) => read('UserStore', 'getProfile', fallback, fallback),
        saveProfile: (profile) => write('UserStore', 'saveProfile', profile),
        getAdjustments: (fallback = null) => read('UserStore', 'getAdjustments', fallback, fallback),
        saveAdjustments: (adjustments) => write('UserStore', 'saveAdjustments', adjustments),
        getSecondaryAdjustments: (fallback = null) => read('UserStore', 'getSecondaryAdjustments', fallback, fallback),
        saveSecondaryAdjustments: (adjustments) => write('UserStore', 'saveSecondaryAdjustments', adjustments),
        getMacroRatios: (fallback = null) => read('UserStore', 'getMacroRatios', fallback, fallback),
        getDailyMacroRatios: (fallback = null) => read('UserStore', 'getDailyMacroRatios', fallback, fallback),
        saveDailyMacroRatios: (ratios) => write('UserStore', 'saveDailyMacroRatios', ratios),
        getSecondaryRules: (fallback = null) => read('UserStore', 'getSecondaryRules', fallback, fallback),
        getSecondaryTargets: (fallback = null) => read('UserStore', 'getSecondaryTargets', fallback, fallback),
        getHydrationRules: (fallback = null) => read('UserStore', 'getHydrationRules', fallback, fallback),
        getHydrationTargets: (fallback = null) => read('UserStore', 'getHydrationTargets', fallback, fallback),
        getDailyNutritionTargets: (fallback = {}) => read('UserStore', 'getDailyNutritionTargets', fallback, fallback),
        saveDailyNutritionTargets: (targets) => write('UserStore', 'saveDailyNutritionTargets', targets),
        getUiLocale: (fallback = 'es') => read('UIStore', 'getLocale', fallback, fallback),
        setUiLocale: (locale) => write('UIStore', 'setLocale', locale),
        getProfileNumber,
        getSelectedActivityFile: () => read('ActivityStore', 'getSelectedFile', null),
        setSelectedActivityFile: (file) => write('ActivityStore', 'setSelectedFile', file),
        getSavedActivityPlan: (file) => read('ActivityStore', 'getSavedPlanData', null, file),
        getStoredActivityPlan: (file = null) => read('ActivityStore', 'getStoredPlanData', null, file),
        normalizeActivityPlan: (planData) => read('ActivityStore', 'normalizeActivityData', planData, planData),
        saveActivityPlan: (file, planData) => write('ActivityStore', 'savePlanData', file, planData),
        clearActivityPlan: (file) => write('ActivityStore', 'clearSavedPlanData', file),
        getSelectedMenuFile: () => read('MenuStore', 'getSelectedFile', null),
        setSelectedMenuFile: (file) => write('MenuStore', 'setSelectedFile', file),
        getSavedMenuData: (file) => read('MenuStore', 'getSavedMenuData', null, file),
        normalizeMenuData: (menuData) => read('MenuStore', 'normalizeMenuData', menuData, menuData),
        saveMenuData: (file, menuData) => write('MenuStore', 'saveMenuData', file, menuData),
        clearMenuData: (file) => write('MenuStore', 'clearSavedMenuData', file),
        getShoppingCustomItems: () => read('ShoppingStore', 'getCustomItems', []),
        getShoppingItemChecked: (itemId, fallback = false) => read('ShoppingStore', 'getItemChecked', fallback, itemId, fallback),
        setShoppingItemChecked: (itemId, checked) => write('ShoppingStore', 'setItemChecked', itemId, checked),
        setShoppingCustomItemChecked: (customId, checked) => write('ShoppingStore', 'setCustomItemChecked', customId, checked),
        addShoppingCustomItem: (text) => write('ShoppingStore', 'addCustomItem', text) || [],
        clearShoppingAll: () => write('ShoppingStore', 'clearAll')
    };
})();

window.PersistenceAdapter = PersistenceAdapter;
