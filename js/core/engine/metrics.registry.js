/* =========================================
   core/engine/metrics.registry.js - SHARED METRIC DEFINITIONS
   ========================================= */

const MetricsRegistry = (() => {
    const DEFINITIONS = Object.freeze({
        kcal: { key: 'kcal', label: 'Kcal', unit: 'kcal', rule: 'target', tolerancePct: 10, order: 10 },
        protein: { key: 'protein', label: 'Proteína', unit: 'g', rule: 'target', tolerancePct: 10, order: 20 },
        carbs: { key: 'carbs', label: 'Carbohidratos', unit: 'g', rule: 'target', tolerancePct: 10, order: 30 },
        fat: { key: 'fat', label: 'Grasas', unit: 'g', rule: 'target', tolerancePct: 10, order: 40 },
        fiber: { key: 'fiber', label: 'Fibra', unit: 'g', rule: 'min', tolerancePct: 10, order: 50 },
        sugar: { key: 'sugar', label: 'Azúcar', unit: 'g', rule: 'max', tolerancePct: 10, order: 60 },
        saturatedFat: { key: 'saturatedFat', label: 'Grasa sat.', unit: 'g', rule: 'max', tolerancePct: 10, order: 70 },
        salt: { key: 'salt', label: 'Sal', unit: 'g', rule: 'max', tolerancePct: 10, order: 80 },
        processing: { key: 'processing', label: 'Procesamiento', unit: 'score', rule: 'max', tolerancePct: 10, order: 90 },
        hydration: { key: 'hydration', label: 'Hidratación', unit: 'ml', rule: 'range', tolerancePct: 10, order: 100 }
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

    const get = (key) => DEFINITIONS[key] || null;

    const getKeys = ({ nutritionOnly = false } = {}) => (
        nutritionOnly ? NUTRITION_KEYS.slice() : Object.keys(DEFINITIONS)
    );

    const getOrderedKeys = ({ nutritionOnly = false } = {}) => (
        getKeys({ nutritionOnly }).sort((a, b) => (DEFINITIONS[a].order || 999) - (DEFINITIONS[b].order || 999))
    );

    return {
        DEFINITIONS,
        NUTRITION_KEYS,
        get,
        getKeys,
        getOrderedKeys
    };
})();

var __root = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined' ? window : this);
__root.MetricsRegistry = MetricsRegistry;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = MetricsRegistry;
}
