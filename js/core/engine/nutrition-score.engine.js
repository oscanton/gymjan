const __nutritionScoreRoot = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
const NutritionScoreEngine = (() => {
    const CURVE = { c: 5.3, k: 1.5 };
    const METRICS = Object.freeze({
        kcal: { targetKey: 'kcal', mode: 'target_asymmetric', belowRatePer10: 0.5, aboveRatePer10: 1.2, cap: 3.0 },
        protein: { targetKey: 'protein', mode: 'target_asymmetric', belowRatePer10: 0.8, aboveRatePer10: 0.2, cap: 2.0 },
        carbs: { targetKey: 'carbs', mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
        fat: { targetKey: 'fat', mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
        fiber: { targetKey: 'fiber', mode: 'min_only', belowRatePer10: 0.8, cap: 2.0 },
        sugar: { targetKey: 'sugar', mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 },
        saturatedFat: { targetKey: 'saturatedFat', mode: 'max_only', aboveRatePer10: 1.0, cap: 2.5 },
        salt: { targetKey: 'salt', mode: 'max_only', aboveRatePer10: 0.5, cap: 1.5 },
        processing: { targetKey: 'processing', mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 }
    });
    const round = (value, decimals = 3) => {
        const factor = 10 ** decimals;
        return Math.round((Number.isFinite(value) ? value : 0) * factor) / factor;
    };
    const clamp = (value, min = 0, max = Infinity) => Math.max(min, Math.min(max, value));
    const deviation = (actual, target) => {
        const value = parseFloat(actual);
        const goal = parseFloat(target);
        return Number.isFinite(value) && Number.isFinite(goal) && goal > 0 ? ((value - goal) / goal) * 100 : null;
    };
    const computePenalty = (metric, pct) => {
        if (!Number.isFinite(pct)) return 0;
        const ratio = Math.abs(pct) / 10;
        if (metric.mode === 'target_symmetric') return clamp(metric.ratePer10 * ratio, 0, metric.cap);
        if (metric.mode === 'target_asymmetric') return pct < 0 ? clamp(metric.belowRatePer10 * ratio, 0, metric.cap) : pct > 0 ? clamp(metric.aboveRatePer10 * ratio, 0, metric.cap) : 0;
        if (metric.mode === 'min_only') return pct < 0 ? clamp(metric.belowRatePer10 * ratio, 0, metric.cap) : 0;
        return pct > 0 ? clamp(metric.aboveRatePer10 * ratio, 0, metric.cap) : 0;
    };
    const scoreFromPenalty = (total) => {
        const penalty = Number.isFinite(total) ? Math.max(0, total) : 0;
        return penalty === 0 ? 10 : 10 / (1 + ((penalty / CURVE.c) ** CURVE.k));
    };
    const calculate = (actuals = {}, targets = {}) => {
        const penalties = {};
        const deviationsPct = {};
        Object.entries(METRICS).forEach(([key, metric]) => {
            const pct = deviation(actuals[key], targets[metric.targetKey]);
            penalties[key] = round(computePenalty(metric, pct), 3);
            deviationsPct[key] = Number.isFinite(pct) ? round(pct, 2) : null;
        });
        const penaltyTotal = round(Object.values(penalties).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0), 3);
        return { score: round(scoreFromPenalty(penaltyTotal), 3), penaltyTotal, penalties, deviationsPct };
    };
    const getStatusClass = (score) => {
        const value = parseFloat(score);
        if (!Number.isFinite(value)) return '';
        if (value >= 7) return 'text-status--ok';
        if (value >= 5.5) return 'text-status--warning';
        if (value >= 3.5) return 'text-status--danger';
        return 'color-critical';
    };
    return { calculate, getStatusClass };
})();

__nutritionScoreRoot.NutritionScoreEngine = NutritionScoreEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = NutritionScoreEngine;
