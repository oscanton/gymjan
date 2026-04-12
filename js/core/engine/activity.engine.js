const __activityRoot = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
const ActivityEngine = (() => {
    const EMPTY_BREAKDOWN = { workMin: 0, restMin: 0, totalMin: 0 };
    const EMPTY_TOTALS = { kcal: 0, min: 0, exerciseCount: 0, metAvg: 0, metMinSum: 0, intensityAvg: 0, intensityWorkMinSum: 0, intensityWorkMin: 0 };
    const EXERCISE_TYPE_ALIASES = {
        strength: ['strength', 'fuerza'],
        cardio: ['cardio'],
        recovery: ['recovery', 'recuperacion'],
        other: ['other', 'otros']
    };
    const number = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const positive = (value, fallback = NaN) => {
        const parsed = number(value, fallback);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };
    const normalizeExerciseType = (value = '') => {
        const token = String(value || '').trim().toLowerCase();
        const match = Object.entries(EXERCISE_TYPE_ALIASES).find(([, aliases]) => aliases.includes(token));
        return match ? match[0] : token;
    };

    const parseReps = (reps) => {
        if (!reps) return 0;
        if (typeof reps === 'number') return reps;
        const raw = String(reps).trim();
        if (!raw) return 0;
        const range = raw.includes('-') ? raw.split('-').map((value) => parseFloat(value)) : null;
        return range && range.length === 2 && Number.isFinite(range[0]) && Number.isFinite(range[1]) ? (range[0] + range[1]) / 2 : number(raw, 0);
    };

    const isTimedItem = (item) => item ? number(item.sets) > 0 && number(item.reps) === 1 && number(item.secPerRep) >= 30 : false;
    const getExerciseTimeBreakdown = (item, ex) => {
        if (!item || !ex) return EMPTY_BREAKDOWN;
        const sets = number(item.sets);
        const reps = parseReps(item.reps);
        if (sets <= 0 || reps <= 0) return EMPTY_BREAKDOWN;
        const workMin = reps * sets * number(item.secPerRep) / 60;
        const restMin = (sets > 1 ? (sets - 1) * number(ex.restSec) : 0) / 60;
        return { workMin, restMin, totalMin: workMin + restMin };
    };
    const estimateExerciseMinutes = (item, ex) => getExerciseTimeBreakdown(item, ex).totalMin;
    const getEstimatedOneRmEpley = (weightKg, reps) => {
        const weight = positive(weightKg);
        const repsVal = positive(reps);
        return Number.isFinite(weight) && Number.isFinite(repsVal) ? weight * (1 + repsVal / 30) : null;
    };
    const calculateEpleyLikeFactor = (value, base, { a = 1, b = 2 } = {}) => {
        const current = positive(value);
        const goal = positive(base);
        if (!Number.isFinite(current) || !Number.isFinite(goal)) return 1;
        const intensity = 1 / (1 + (((goal / current) - 1) / b));
        return 1 + (a * (intensity - 1));
    };
    const getIntensityFactorFromEpley = (weightKg, reps, { bodyWeightKg = null, relativeLoad = null } = {}) => {
        const repsVal = positive(reps);
        if (!Number.isFinite(repsVal)) return 1;
        const intensity = Math.min(Math.max(1 / (1 + (repsVal / 30)), 0), 1);
        const repsFactor = 0.7 + (0.8 * intensity);
        const weight = positive(weightKg);
        const bodyWeight = positive(bodyWeightKg);
        if (!Number.isFinite(weight) || !Number.isFinite(bodyWeight)) return repsFactor;
        return repsFactor * calculateEpleyLikeFactor((weight / bodyWeight) * intensity, positive(relativeLoad, 0.35), { a: 1, b: 2 });
    };
    const getExerciseKcalCoef = (item, ex, { bodyWeightKg = null } = {}) => {
        if (!item || !ex) return 0;
        const met = positive(ex.met);
        const breakdown = getExerciseTimeBreakdown(item, ex);
        if (!Number.isFinite(met) || breakdown.totalMin <= 0) return 0;
        let workCoef = (met / 60) * breakdown.workMin;
        const restCoef = (1.5 / 60) * breakdown.restMin;
        if (normalizeExerciseType(ex.type) === 'strength' && !isTimedItem(item)) {
            return (workCoef * getIntensityFactorFromEpley(item.weightKg, parseReps(item.reps), { bodyWeightKg, relativeLoad: ex.relativeLoad })) + restCoef;
        }
        if (normalizeExerciseType(ex.type) === 'cardio') {
            const cadence = positive(item.cadencePerMin ?? item.cadence ?? item.rpm);
            const baseCadence = positive(ex.cadenceBase);
            if (Number.isFinite(cadence) && Number.isFinite(baseCadence)) workCoef *= calculateEpleyLikeFactor(cadence, baseCadence, { a: 1, b: 2 });
        }
        return workCoef + restCoef;
    };
    const calculateExerciseKcal = (item, ex, { weightKg = null, bodyWeightKg = null } = {}) => {
        const weight = positive(weightKg);
        if (!Number.isFinite(weight)) return 0;
        const coef = getExerciseKcalCoef(item, ex, { bodyWeightKg: bodyWeightKg || weight });
        return coef > 0 ? coef * weight : 0;
    };
    const calculateStepsIntensityFactor = (stepsPerMin = 0, { baseStepsPerMin = 100, a = 1, b = 2 } = {}) => {
        const cadence = positive(stepsPerMin);
        return Number.isFinite(cadence) ? calculateEpleyLikeFactor(cadence, positive(baseStepsPerMin, 100), { a, b }) : 1;
    };
    const calculateStepsKcal = (steps = 0, { weightKg = null, stepsConfig = null } = {}) => {
        const safeSteps = Math.max(0, parseInt(steps, 10) || 0);
        const weight = positive(weightKg);
        if (!safeSteps || !Number.isFinite(weight)) return 0;
        const cfg = stepsConfig || {};
        const stepsPerMin = positive(cfg.stepsPerMin, 100);
        const met = positive(cfg.met, 3.5) * calculateStepsIntensityFactor(stepsPerMin, { baseStepsPerMin: positive(cfg.baseStepsPerMin, 100), a: 1, b: 2 });
        return (met * weight / 60) * (safeSteps / stepsPerMin);
    };
    const calculateStepsDistanceKm = (steps = 0, { heightCm = null } = {}) => {
        const safeSteps = Math.max(0, parseInt(steps, 10) || 0);
        const height = positive(heightCm);
        return safeSteps && Number.isFinite(height) ? (safeSteps * ((height / 100) * 0.415)) / 1000 : 0;
    };
    const calculateTrainingTotals = (exerciseBlock, exerciseOverrides, exercisesMap, { weightKg = null, bodyWeightKg = null } = {}) => {
        if (!Array.isArray(exerciseBlock && exerciseBlock.exercises)) return { ...EMPTY_TOTALS };
        const totals = { ...EMPTY_TOTALS };
        const exercises = exercisesMap || {};
        exerciseBlock.exercises.forEach((item) => {
            if (!item || !item.exerciseId) return;
            const effectiveItem = { ...item, ...((exerciseOverrides && exerciseOverrides[item.exerciseId]) || {}) };
            const ex = exercises[effectiveItem.exerciseId];
            if (!ex) return;
            const breakdown = getExerciseTimeBreakdown(effectiveItem, ex);
            const met = positive(ex.met);
            totals.exerciseCount += 1;
            totals.min += breakdown.totalMin;
            totals.kcal += calculateExerciseKcal(effectiveItem, ex, { weightKg, bodyWeightKg: bodyWeightKg || weightKg });
            if (Number.isFinite(met) && breakdown.totalMin > 0) totals.metMinSum += met * breakdown.totalMin;
            if (normalizeExerciseType(ex.type) === 'strength' && !isTimedItem(effectiveItem) && breakdown.workMin > 0) {
                const intensity = getIntensityFactorFromEpley(effectiveItem.weightKg, parseReps(effectiveItem.reps), {
                    bodyWeightKg: bodyWeightKg || weightKg,
                    relativeLoad: ex.relativeLoad
                });
                if (Number.isFinite(intensity) && intensity > 0) {
                    totals.intensityWorkMinSum += intensity * breakdown.workMin;
                    totals.intensityWorkMin += breakdown.workMin;
                }
            }
        });
        totals.metAvg = totals.min > 0 ? totals.metMinSum / totals.min : 0;
        totals.intensityAvg = totals.intensityWorkMin > 0 ? totals.intensityWorkMinSum / totals.intensityWorkMin : 0;
        return totals;
    };

    return {
        parseReps,
        isTimedItem,
        getExerciseTimeBreakdown,
        estimateExerciseMinutes,
        getEstimatedOneRmEpley,
        calculateEpleyLikeFactor,
        getIntensityFactorFromEpley,
        getExerciseKcalCoef,
        calculateExerciseKcal,
        calculateStepsIntensityFactor,
        calculateStepsKcal,
        calculateStepsDistanceKm,
        calculateTrainingTotals
    };
})();

__activityRoot.ActivityEngine = ActivityEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = ActivityEngine;
