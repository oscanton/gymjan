const ContentI18n = (() => {
    const FALLBACK_LOCALE = 'es';

    const resolvePath = (source, path) => String(path || '').split('.').reduce((value, key) => (
        value && typeof value === 'object' ? value[key] : undefined
    ), source);
    const getLocale = () => window.I18n?.getLocale?.() || FALLBACK_LOCALE;
    const getBundle = (domain, locale = null) => window.ContentRegistry?.getBundle?.(locale || getLocale(), domain) || null;
    const getValue = (domain, id, path, fallback = '') => {
        const currentValue = resolvePath(getBundle(domain, getLocale()), `${id}.${path}`);
        const fallbackValue = resolvePath(getBundle(domain, FALLBACK_LOCALE), `${id}.${path}`);
        const resolved = typeof currentValue === 'string' && currentValue.trim() ? currentValue : fallbackValue;
        return typeof resolved === 'string' && resolved.trim() ? resolved : fallback;
    };

    return {
        getValue,
        foodName: (id, fallback = '') => getValue('foods', id, 'name', fallback),
        foodCategory: (id, fallback = '') => getValue('foodCategories', id, 'label', fallback),
        exerciseName: (id, fallback = '') => getValue('exercises', id, 'name', fallback),
        exerciseDescription: (id, fallback = '') => getValue('exercises', id, 'description', fallback),
        exerciseTechnique: (id, fallback = '') => getValue('exercises', id, 'technique', fallback)
    };
})();

window.ContentI18n = ContentI18n;
