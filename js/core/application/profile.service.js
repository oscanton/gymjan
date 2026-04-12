const ProfileApplicationService = (() => {
    const DEFAULT_PROFILE = { sex: 'male', age: 30, height: 175, weight: 75 };
    const DEFAULT_ADJUSTMENTS = { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 };
    const DEFAULT_SECONDARY_ADJUSTMENTS = { saltMaxG: 0, fiberPer1000Kcal: 0, sugarMaxPctKcal: 0, satFatMaxPctKcal: 0, processingMaxScore: 0 };
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const readStore = (method, fallback = null) => resolvePersistenceApi()?.[method]?.(fallback) || fallback;
    const saveStore = (method, value) => { resolvePersistenceApi()?.[method]?.(value); };
    const normalizeSex = (value = '') => {
        const token = String(value || '').trim().toLowerCase();
        if (token === 'hombre' || token === 'male') return 'male';
        if (token === 'mujer' || token === 'female') return 'female';
        return DEFAULT_PROFILE.sex;
    };
    const normalizeProfile = (profile = {}, defaults = DEFAULT_PROFILE) => ({
        ...defaults,
        ...(profile || {}),
        sex: normalizeSex((profile || {}).sex ?? defaults.sex)
    });
    const getProfile = (defaults = DEFAULT_PROFILE) => normalizeProfile(readStore('getProfile', defaults) || {}, defaults);
    const getAdjustments = (defaults = DEFAULT_ADJUSTMENTS) => ({ ...defaults, ...(readStore('getAdjustments', defaults) || {}) });
    const getSecondaryAdjustments = (defaults = DEFAULT_SECONDARY_ADJUSTMENTS) => ({ ...defaults, ...(readStore('getSecondaryAdjustments', defaults) || {}) });
    const getDailyMacroRatios = (fallback = null) => readStore('getDailyMacroRatios', fallback);
    const saveProfileBundle = ({ profile, adjustments, secondaryAdjustments, dailyMacroRatios = null } = {}) => {
        saveStore('saveProfile', normalizeProfile(profile));
        saveStore('saveAdjustments', adjustments);
        saveStore('saveSecondaryAdjustments', secondaryAdjustments);
        if (Array.isArray(dailyMacroRatios)) saveStore('saveDailyMacroRatios', dailyMacroRatios);
    };
    const getProfileNumber = (key, fallback = 0) => {
        const value = parseFloat(getProfile({})?.[key]);
        return Number.isFinite(value) && value > 0 ? value : fallback;
    };

    return {
        DEFAULT_PROFILE,
        DEFAULT_ADJUSTMENTS,
        DEFAULT_SECONDARY_ADJUSTMENTS,
        getProfile,
        getAdjustments,
        getSecondaryAdjustments,
        getDailyMacroRatios,
        saveProfileBundle,
        getProfileNumber
    };
})();

window.ProfileApplicationService = ProfileApplicationService;
