/* =========================================
   core/nutrition-score.js - NUTRITIONAL SCORE
   ========================================= */

const NutritionScore = (() => {
    const DEFAULT_METRICS = Object.freeze({
        kcal: { mode: 'target_asymmetric', belowRatePer10: 0.5, aboveRatePer10: 1.2, cap: 3.0 },
        protein: { mode: 'target_asymmetric', belowRatePer10: 0.8, aboveRatePer10: 0.2, cap: 2.0 },
        carbs: { mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
        fat: { mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
        fiber: { mode: 'min_only', belowRatePer10: 0.8, cap: 2.0 },
        sugar: { mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 },
        saturatedFat: { mode: 'max_only', aboveRatePer10: 1.0, cap: 2.5 },
        salt: { mode: 'max_only', aboveRatePer10: 0.5, cap: 1.5 },
        processing: { mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 }
    });

    const CURVE = Object.freeze({
        c: 5.3,
        k: 1.5
    });

    const METRICS = Object.freeze(Object.keys(DEFAULT_METRICS).reduce((acc, key) => {
        const base = DEFAULT_METRICS[key];
        acc[key] = { targetKey: key, ...base };
        return acc;
    }, {}));

    const round = (value, decimals = 3) => {
        const factor = 10 ** decimals;
        return Math.round((Number.isFinite(value) ? value : 0) * factor) / factor;
    };

    const pctDeviation = (actual, target) => {
        const safeActual = parseFloat(actual);
        const safeTarget = parseFloat(target);
        if (!Number.isFinite(safeActual) || !Number.isFinite(safeTarget) || safeTarget <= 0) return null;
        return ((safeActual - safeTarget) / safeTarget) * 100;
    };

    const clamp = (value, min = 0, max = Infinity) => Math.max(min, Math.min(max, value));

    const computePenalty = (metricDef, deviationPct) => {
        if (!Number.isFinite(deviationPct)) return 0;
        const absRatioPer10 = Math.abs(deviationPct) / 10;

        if (metricDef.mode === 'target_symmetric') {
            return clamp(metricDef.ratePer10 * absRatioPer10, 0, metricDef.cap);
        }
        if (metricDef.mode === 'target_asymmetric') {
            if (deviationPct < 0) return clamp(metricDef.belowRatePer10 * absRatioPer10, 0, metricDef.cap);
            if (deviationPct > 0) return clamp(metricDef.aboveRatePer10 * absRatioPer10, 0, metricDef.cap);
            return 0;
        }
        if (metricDef.mode === 'min_only') {
            if (deviationPct < 0) return clamp(metricDef.belowRatePer10 * absRatioPer10, 0, metricDef.cap);
            return 0;
        }
        if (metricDef.mode === 'max_only') {
            if (deviationPct > 0) return clamp(metricDef.aboveRatePer10 * absRatioPer10, 0, metricDef.cap);
            return 0;
        }
        return 0;
    };

    const scoreFromPenalty = (penaltyTotal) => {
        const p = Number.isFinite(penaltyTotal) ? Math.max(0, penaltyTotal) : 0;
        if (p === 0) return 10;
        return 10 / (1 + ((p / CURVE.c) ** CURVE.k));
    };

    const calculate = (actuals = {}, targets = {}) => {
        const penalties = {};
        const deviationsPct = {};

        Object.entries(METRICS).forEach(([metricKey, metricDef]) => {
            const actual = actuals[metricKey];
            const target = targets[metricDef.targetKey];
            const deviation = pctDeviation(actual, target);
            const penalty = computePenalty(metricDef, deviation);

            deviationsPct[metricKey] = Number.isFinite(deviation) ? round(deviation, 2) : null;
            penalties[metricKey] = round(penalty, 3);
        });

        const penaltyTotal = round(Object.values(penalties).reduce((acc, value) => acc + (Number.isFinite(value) ? value : 0), 0), 3);
        const score = round(scoreFromPenalty(penaltyTotal), 3);

        return {
            score,
            penaltyTotal,
            penalties,
            deviationsPct
        };
    };

    const getStatusClass = (score) => {
        const val = parseFloat(score);
        if (!Number.isFinite(val)) return '';
        if (val >= 7) return 'text-status--ok';
        if (val >= 5.5) return 'text-status--warning';
        if (val >= 3.5) return 'text-status--danger';
        return 'color-critical';
    };

    return {
        calculate,
        getStatusClass
    };
})();

window.NutritionScore = NutritionScore;
