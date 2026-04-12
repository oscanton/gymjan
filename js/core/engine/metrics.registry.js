/* =========================================
   core/engine/metrics.registry.js - SHARED METRIC DEFINITIONS
   ========================================= */

const MetricsRegistry = (() => {
    const DEFINITIONS = Object.freeze({
        kcal: Object.freeze({
            key: 'kcal',
            aliases: [],
            unit: 'kcal',
            decimals: 0,
            rule: 'target',
            tolerancePct: 10,
            order: 10
        }),
        protein: Object.freeze({
            key: 'protein',
            aliases: ['p'],
            unit: 'g',
            decimals: 0,
            rule: 'target',
            tolerancePct: 10,
            order: 20
        }),
        carbs: Object.freeze({
            key: 'carbs',
            aliases: ['c'],
            unit: 'g',
            decimals: 0,
            rule: 'target',
            tolerancePct: 10,
            order: 30
        }),
        fat: Object.freeze({
            key: 'fat',
            aliases: ['f'],
            unit: 'g',
            decimals: 0,
            rule: 'target',
            tolerancePct: 10,
            order: 40
        }),
        fiber: Object.freeze({
            key: 'fiber',
            aliases: [],
            unit: 'g',
            decimals: 1,
            rule: 'min',
            tolerancePct: 10,
            order: 50,
            secondaryConfigKey: 'fiberPer1000Kcal'
        }),
        sugar: Object.freeze({
            key: 'sugar',
            aliases: [],
            unit: 'g',
            decimals: 1,
            rule: 'max',
            tolerancePct: 10,
            order: 60,
            secondaryConfigKey: 'sugarMaxPctKcal'
        }),
        saturatedFat: Object.freeze({
            key: 'saturatedFat',
            aliases: [],
            unit: 'g',
            decimals: 1,
            rule: 'max',
            tolerancePct: 10,
            order: 70,
            secondaryConfigKey: 'satFatMaxPctKcal'
        }),
        salt: Object.freeze({
            key: 'salt',
            aliases: [],
            unit: 'g',
            decimals: 2,
            rule: 'max',
            tolerancePct: 10,
            order: 80,
            secondaryConfigKey: 'saltMaxG'
        }),
        processing: Object.freeze({
            key: 'processing',
            aliases: [],
            unit: 'score',
            decimals: 1,
            rule: 'max',
            tolerancePct: 10,
            order: 90,
            secondaryConfigKey: 'processingMaxScore'
        }),
        hydration: Object.freeze({
            key: 'hydration',
            aliases: [],
            unit: 'ml',
            decimals: 0,
            rule: 'range',
            tolerancePct: 10,
            order: 100
        }),
        stepsKcal: Object.freeze({
            key: 'stepsKcal',
            aliases: [],
            unit: 'kcal',
            decimals: 1,
            rule: 'target',
            tolerancePct: 10,
            order: 210
        }),
        trainingKcal: Object.freeze({
            key: 'trainingKcal',
            aliases: [],
            unit: 'kcal',
            decimals: 1,
            rule: 'target',
            tolerancePct: 10,
            order: 220
        }),
        met: Object.freeze({
            key: 'met',
            aliases: [],
            unit: 'met',
            decimals: 1,
            rule: 'target',
            tolerancePct: 10,
            order: 230
        }),
        intensity: Object.freeze({
            key: 'intensity',
            aliases: [],
            unit: 'factor',
            decimals: 2,
            rule: 'target',
            tolerancePct: 10,
            order: 240
        })
    });

    const NUTRITION_KEYS = Object.freeze([
        'kcal',
        'protein',
        'carbs',
        'fat',
        'fiber',
        'sugar',
        'saturatedFat',
        'salt',
        'processing'
    ]);

    const ALIAS_MAP = Object.freeze(Object.entries(DEFINITIONS).reduce((map, [key, definition]) => {
        map[key] = key;
        (definition.aliases || []).forEach((alias) => {
            map[alias] = key;
        });
        return map;
    }, {}));

    const normalizeKey = (key) => ALIAS_MAP[String(key || '')] || String(key || '');
    const get = (key) => DEFINITIONS[normalizeKey(key)] || null;
    const getKeys = ({ nutritionOnly = false } = {}) => (
        nutritionOnly ? NUTRITION_KEYS.slice() : Object.keys(DEFINITIONS)
    );
    const getOrderedKeys = ({ nutritionOnly = false } = {}) => (
        getKeys({ nutritionOnly }).sort((a, b) => (DEFINITIONS[a].order || 999) - (DEFINITIONS[b].order || 999))
    );
    const getMetricI18n = (key, field, fallback = '') => {
        const normalizedKey = normalizeKey(key);
        return globalThis.I18n?.t?.(`metrics.${normalizedKey}.${field}`, {}, fallback) || fallback;
    };
    const humanize = (value = '') => String(value || '')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    const getLabel = (key, { short = false, fallback = '' } = {}) => {
        const normalizedKey = normalizeKey(key);
        if (!get(normalizedKey)) return fallback || humanize(normalizedKey);
        return getMetricI18n(normalizedKey, short ? 'shortLabel' : 'label', fallback || humanize(normalizedKey));
    };
    const getUnit = (key, fallback = '') => {
        const definition = get(key);
        return definition ? definition.unit : fallback;
    };
    const getDecimals = (key, fallback = 0) => {
        const definition = get(key);
        return definition && Number.isFinite(definition.decimals) ? definition.decimals : fallback;
    };
    const getDescription = (key, fallback = '') => {
        const normalizedKey = normalizeKey(key);
        return getMetricI18n(normalizedKey, 'description', fallback);
    };
    const toLabelMap = ({ keys = null, short = false } = {}) => {
        const sourceKeys = Array.isArray(keys) && keys.length ? keys : getOrderedKeys();
        return Object.fromEntries(sourceKeys.map((key) => [normalizeKey(key), getLabel(key, { short })]));
    };

    return {
        DEFINITIONS,
        NUTRITION_KEYS,
        normalizeKey,
        get,
        getKeys,
        getOrderedKeys,
        getLabel,
        getUnit,
        getDecimals,
        getDescription,
        toLabelMap
    };
})();

var __root = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined' ? window : this);
__root.MetricsRegistry = MetricsRegistry;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsRegistry;
}
