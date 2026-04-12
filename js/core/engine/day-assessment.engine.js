const __dayAssessmentRoot = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
const DayAssessmentEngine = (() => {
    const STATUS = Object.freeze({ NONE: 'none', OK: 'ok', WARNING: 'warning', DANGER: 'danger', CRITICAL: 'critical' });
    const NUTRITION_KEYS = typeof MetricsRegistry !== 'undefined' && typeof MetricsRegistry.getOrderedKeys === 'function'
        ? MetricsRegistry.getOrderedKeys({ nutritionOnly: true })
        : ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'saturatedFat', 'salt', 'processing'];
    const number = (value, fallback = NaN) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const round = (value, decimals = 2) => {
        const factor = 10 ** decimals;
        return Math.round((Number.isFinite(value) ? value : 0) * factor) / factor;
    };
    const getDeviationPct = (actual, target) => {
        const value = number(actual);
        const goal = number(target);
        return Number.isFinite(value) && Number.isFinite(goal) && goal > 0 ? round(((value - goal) / goal) * 100, 2) : null;
    };
    const getScoreStatus = (score, { ok = 7, warning = 5.5, danger = 3.5 } = {}) => {
        const value = number(score);
        if (!Number.isFinite(value)) return STATUS.NONE;
        if (value >= ok) return STATUS.OK;
        if (value >= warning) return STATUS.WARNING;
        if (value >= danger) return STATUS.DANGER;
        return STATUS.CRITICAL;
    };
    const assessRule = (rule, actual, target, extra = null, tolerancePct = 10) => {
        const value = number(actual);
        const goal = number(target);
        if (!Number.isFinite(value) || !Number.isFinite(goal) || goal <= 0) return { status: STATUS.NONE, deviationPct: null };
        const deviationPct = getDeviationPct(value, goal);
        if (rule === 'min') return { status: value >= goal ? STATUS.OK : value >= goal * (1 - tolerancePct / 100) ? STATUS.WARNING : STATUS.DANGER, deviationPct };
        if (rule === 'max') return { status: value <= goal ? STATUS.OK : value <= goal * (1 + tolerancePct / 100) ? STATUS.WARNING : STATUS.DANGER, deviationPct };
        if (rule === 'range') {
            const max = number(extra);
            if (!Number.isFinite(max) || max <= 0) return { status: STATUS.NONE, deviationPct: null };
            if (value >= goal && value <= max) return { status: STATUS.OK, deviationPct: 0 };
            const edge = value < goal ? goal : max;
            const pct = getDeviationPct(value, edge);
            return { status: value < goal ? (value >= goal * (1 - tolerancePct / 100) ? STATUS.WARNING : STATUS.DANGER) : (value <= max * (1 + tolerancePct / 100) ? STATUS.WARNING : STATUS.DANGER), deviationPct: pct };
        }
        return { status: deviationPct > tolerancePct ? STATUS.DANGER : deviationPct < -tolerancePct ? STATUS.WARNING : STATUS.OK, deviationPct };
    };
    const assessMetric = ({ metricKey, actual, target, minTarget = null, maxTarget = null } = {}) => {
        const def = typeof MetricsRegistry !== 'undefined' && MetricsRegistry.get ? MetricsRegistry.get(metricKey) : null;
        const rule = def ? def.rule : 'target';
        const tolerancePct = def ? def.tolerancePct : 10;
        if (rule === 'range') return { rule, ...assessRule(rule, actual, minTarget, maxTarget, tolerancePct), actual, minTarget, maxTarget };
        return { rule, ...assessRule(rule, actual, target, null, tolerancePct), actual, target };
    };
    const createNutritionAssessment = ({ dayTargets = null, dayIntake = null, nutritionScoreEngine = null } = {}) => {
        const actuals = dayIntake || {};
        const targets = dayTargets || {};
        const orderedKeys = typeof MetricsRegistry !== 'undefined' && MetricsRegistry.getOrderedKeys ? MetricsRegistry.getOrderedKeys({ nutritionOnly: true }) : NUTRITION_KEYS;
        const checks = Object.fromEntries(orderedKeys.map((key) => [key, assessMetric({ metricKey: key, actual: actuals[key], target: targets[key] })]));
        checks.hydration = assessMetric({ metricKey: 'hydration', actual: actuals.hydrationTotalMl, minTarget: targets.hydrationMin, maxTarget: targets.hydrationMax });
        const scorePayload = nutritionScoreEngine && typeof nutritionScoreEngine.calculate === 'function'
            ? nutritionScoreEngine.calculate({
                kcal: actuals.kcal,
                protein: actuals.protein,
                carbs: actuals.carbs,
                fat: actuals.fat,
                fiber: actuals.fiber,
                sugar: actuals.sugar,
                saturatedFat: actuals.saturatedFat,
                salt: actuals.salt,
                processing: actuals.processing
            }, targets)
            : { score: NaN, penalties: {}, deviationsPct: {} };
        return { actuals, targets, checks, score: { ...scorePayload, status: getScoreStatus(scorePayload.score) } };
    };
    const createActivityAssessment = ({ dayTargets = null, dayConsumption = null, activityScoreEngine = null } = {}) => {
        const actuals = dayConsumption || {};
        const targets = { kcal: number(dayTargets && dayTargets.kcal, 0) };
        const scorePayload = activityScoreEngine && typeof activityScoreEngine.calculate === 'function'
            ? activityScoreEngine.calculate({
                stepsKcal: actuals.stepsKcal,
                trainingKcal: actuals.trainingKcal,
                met: actuals.metAvg,
                intensity: actuals.intensityAvg,
                targetKcal: targets.kcal
            })
            : { score: NaN };
        return { actuals, targets, score: { ...scorePayload, status: getScoreStatus(scorePayload.score, { ok: 10, warning: 7, danger: 0 }) } };
    };
    const createDayAssessment = ({ dayTargets = null, dayIntake = null, dayConsumption = null, nutritionScoreEngine = null, activityScoreEngine = null } = {}) => DayContracts.buildDayAssessment({
        day: (dayTargets && dayTargets.day) || (dayIntake && dayIntake.day) || (dayConsumption && dayConsumption.day) || '',
        nutrition: createNutritionAssessment({ dayTargets, dayIntake, nutritionScoreEngine }),
        activity: dayConsumption ? createActivityAssessment({ dayTargets, dayConsumption, activityScoreEngine }) : null
    });
    return { STATUS, assessMetric, createNutritionAssessment, createActivityAssessment, createDayAssessment };
})();

__dayAssessmentRoot.DayAssessmentEngine = DayAssessmentEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = DayAssessmentEngine;
