const I18nRegistry = (() => {
    const locales = new Map();

    const normalizeCode = (code = '') => String(code || '').trim().toLowerCase();

    return {
        registerLocale: (code, bundle) => {
            const localeCode = normalizeCode(code || bundle?.meta?.code);
            if (!localeCode || !bundle || typeof bundle !== 'object') return null;
            locales.set(localeCode, bundle);
            return bundle;
        },
        getLocale: (code) => locales.get(normalizeCode(code)) || null,
        hasLocale: (code) => locales.has(normalizeCode(code)),
        listLocales: () => Array.from(locales.entries()).map(([code, bundle]) => ({
            code,
            label: bundle?.meta?.label || code
        }))
    };
})();

window.I18nRegistry = I18nRegistry;
