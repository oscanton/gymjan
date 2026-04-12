const ContentRegistry = (() => {
    const locales = new Map();

    const normalizeCode = (code = '') => String(code || '').trim().toLowerCase();
    const ensureLocale = (code = '') => {
        const localeCode = normalizeCode(code);
        if (!localeCode) return null;
        if (!locales.has(localeCode)) locales.set(localeCode, new Map());
        return locales.get(localeCode);
    };

    return {
        registerBundle: (code, domain, bundle) => {
            const localeStore = ensureLocale(code);
            const domainKey = String(domain || '').trim();
            if (!localeStore || !domainKey || !bundle || typeof bundle !== 'object') return null;
            localeStore.set(domainKey, bundle);
            return bundle;
        },
        getBundle: (code, domain) => locales.get(normalizeCode(code))?.get(String(domain || '').trim()) || null,
        hasBundle: (code, domain) => locales.get(normalizeCode(code))?.has(String(domain || '').trim()) || false
    };
})();

window.ContentRegistry = ContentRegistry;
