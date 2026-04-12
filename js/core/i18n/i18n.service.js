const I18n = (() => {
    const FALLBACK_LOCALE = 'es';
    let currentLocale = null;

    const normalizeCode = (code = '') => String(code || '').trim().toLowerCase();
    const resolvePath = (source, path) => String(path || '').split('.').reduce((value, key) => (
        value && typeof value === 'object' ? value[key] : undefined
    ), source);
    const interpolate = (value, params = {}) => String(value ?? '').replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => (
        Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : ''
    ));
    const getStore = () => window.UIStore || null;
    const getStoredLocale = () => {
        const locale = getStore()?.getLocale?.() || null;
        return normalizeCode(locale);
    };
    const getBundleFor = (locale) => (
        I18nRegistry.getLocale(normalizeCode(locale))
        || I18nRegistry.getLocale(FALLBACK_LOCALE)
        || null
    );
    const getNodeList = (root, selector) => {
        if (!root?.querySelectorAll) return [];
        const nodes = Array.from(root.querySelectorAll(selector));
        return root.matches?.(selector) ? [root, ...nodes] : nodes;
    };

    const getLocale = () => {
        const locale = normalizeCode(currentLocale || getStoredLocale() || FALLBACK_LOCALE);
        return I18nRegistry.hasLocale(locale) ? locale : FALLBACK_LOCALE;
    };
    const applyDocumentLocale = () => {
        document.documentElement.lang = getLocale();
    };

    const t = (key, params = {}, fallback = '') => {
        const bundle = getBundleFor(getLocale());
        const fallbackBundle = getBundleFor(FALLBACK_LOCALE);
        const value = resolvePath(bundle, key);
        const resolved = typeof value === 'undefined' ? resolvePath(fallbackBundle, key) : value;
        if (typeof resolved !== 'string') return fallback || String(key || '');
        return interpolate(resolved, params);
    };

    const apply = (root = document) => {
        getNodeList(root, '[data-i18n]').forEach((node) => {
            node.textContent = t(node.dataset.i18n, {}, node.textContent);
        });
        getNodeList(root, '[data-i18n-placeholder]').forEach((node) => {
            node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder, {}, node.getAttribute('placeholder') || ''));
        });
        getNodeList(root, '[data-i18n-aria-label]').forEach((node) => {
            node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel, {}, node.getAttribute('aria-label') || ''));
        });
        getNodeList(root, '[data-i18n-title]').forEach((node) => {
            node.setAttribute('title', t(node.dataset.i18nTitle, {}, node.getAttribute('title') || ''));
        });
        applyDocumentLocale();
        return root;
    };

    const setLocale = (locale) => {
        const nextLocale = normalizeCode(locale);
        if (!I18nRegistry.hasLocale(nextLocale)) return false;
        currentLocale = nextLocale;
        getStore()?.setLocale?.(nextLocale);
        applyDocumentLocale();
        return true;
    };

    currentLocale = getStoredLocale();
    if (!I18nRegistry.hasLocale(currentLocale)) currentLocale = FALLBACK_LOCALE;
    applyDocumentLocale();

    return {
        t,
        apply,
        getLocale,
        setLocale,
        exists: (key) => typeof resolvePath(getBundleFor(getLocale()), key) !== 'undefined',
        getLocales: () => I18nRegistry.listLocales(),
        getBundle: (key, locale = null) => resolvePath(getBundleFor(locale || getLocale()), key)
    };
})();

window.I18n = I18n;
