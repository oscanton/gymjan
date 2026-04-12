const TargetsEngine = (() => {
    const DEFAULT_MACRO_RATIOS = { p: 0.30, c: 0.40, f: 0.30 };
    const SECONDARY_DEFAULTS = { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };
    const HYDRATION_DEFAULTS = { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 };
    const METRICS = typeof MetricsRegistry !== 'undefined' ? MetricsRegistry : null;
    const SECONDARY_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];
    const SECONDARY_CONFIG_FALLBACKS = {
        salt: 'saltMaxG',
        fiber: 'fiberPer1000Kcal',
        sugar: 'sugarMaxPctKcal',
        saturatedFat: 'satFatMaxPctKcal',
        processing: 'processingMaxScore'
    };
    const SECONDARY_DECIMALS_FALLBACKS = { salt: 2, fiber: 1, sugar: 1, saturatedFat: 1, processing: 1 };
    const SECONDARY_MAP = SECONDARY_KEYS.map((key) => {
        const definition = METRICS && typeof METRICS.get === 'function' ? METRICS.get(key) : null;
        return [
            key,
            definition && definition.secondaryConfigKey ? definition.secondaryConfigKey : SECONDARY_CONFIG_FALLBACKS[key],
            definition && Number.isFinite(definition.decimals) ? definition.decimals : SECONDARY_DECIMALS_FALLBACKS[key]
        ];
    });
    const OBJECTIVE_KEYS = ['kcal', 'p', 'c', 'f', 'salt', 'fiber', 'sugar', 'saturatedFat', 'processing', 'hydration'];
    const WALK_EXERCISE_IDS = ['walk', 'caminar'];

    const toNumber = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const toPositive = (value, fallback) => {
        const parsed = toNumber(value, NaN);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
    };
    const round = (value, decimals = 0) => {
        const factor = 10 ** decimals;
        return Math.round(value * factor) / factor;
    };
    const scale = (value, adjustment = 0) => value * (1 + (Number.isFinite(adjustment) ? adjustment : 0));
    const normalizeConfig = (defaults, source = null, { positiveOnly = true } = {}) => Object.fromEntries(
        Object.entries(defaults).map(([key, fallback]) => [key, positiveOnly ? toPositive(source && source[key], fallback) : toNumber(source && source[key], fallback)])
    );
    const sumSectionActivity = (section, exercises, weightKg, calculateExerciseKcal, calculateExerciseMinutes) => {
        if (!section || section.type === 'rest' || !Array.isArray(section.exercises) || typeof calculateExerciseKcal !== 'function') {
            return { kcal: 0, minutes: 0 };
        }
        return section.exercises.reduce((totals, item) => {
            const exercise = exercises && item ? exercises[item.exerciseId] : null;
            if (!exercise) return totals;
            totals.kcal += calculateExerciseKcal(item, exercise, { weightKg });
            if (typeof calculateExerciseMinutes === 'function') totals.minutes += calculateExerciseMinutes(item, exercise);
            return totals;
        }, { kcal: 0, minutes: 0 });
    };

    const getObjectiveDescription = (key) => {
        const normalizedKey = METRICS && typeof METRICS.normalizeKey === 'function' ? METRICS.normalizeKey(key) : key;
        if (METRICS && typeof METRICS.getDescription === 'function') {
            const registryDescription = METRICS.getDescription(normalizedKey, '');
            if (registryDescription) return registryDescription;
        }
        return '';
    };
    const getObjectiveDescriptions = () => Object.fromEntries(OBJECTIVE_KEYS.map((key) => [key, getObjectiveDescription(key)]));
    const normalizeMacroRatios = (ratios, fallback = null) => {
        const normalized = ['p', 'c', 'f'].reduce((acc, key) => ({ ...acc, [key]: toNumber(ratios && ratios[key], NaN) }), {});
        const sum = normalized.p + normalized.c + normalized.f;
        return Number.isFinite(sum) && sum > 0
            ? { p: normalized.p / sum, c: normalized.c / sum, f: normalized.f / sum }
            : (fallback || DEFAULT_MACRO_RATIOS);
    };
    const getSecondaryDefaults = (secondaryDefaults, savedRules, legacyTargets) => normalizeConfig(secondaryDefaults || SECONDARY_DEFAULTS, savedRules || legacyTargets);
    const getSecondaryAdjustments = (saved) => Object.fromEntries(
        Object.keys(SECONDARY_DEFAULTS).map((key) => [key, toNumber(saved && saved[key], 0)])
    );
    const getHydrationDefaults = (hydrationDefaults, savedRules, legacyTargets) => normalizeConfig(hydrationDefaults || HYDRATION_DEFAULTS, savedRules || legacyTargets);
    const getHydrationAdjustments = (saved) => ({ hydration: toNumber(saved && saved.hydration, 0) });
    const getHydrationBaseTargets = (profile, defaults = null, adjustments = null) => {
        const weight = toNumber(profile && profile.weight, NaN);
        if (!Number.isFinite(weight) || weight <= 0) return null;
        const cfg = defaults || getHydrationDefaults();
        const factor = 1 + toNumber((adjustments || getHydrationAdjustments()).hydration, 0);
        const baseMin = weight * cfg.minMlPerKg;
        const baseMax = weight * cfg.maxMlPerKg;
        return { baseMin, baseMax, min: baseMin * factor, max: baseMax * factor };
    };
    const getSecondaryTargetsForKcal = (kcal, defaults = null, adjustments = null) => {
        const cfg = defaults || getSecondaryDefaults();
        const adj = adjustments || getSecondaryAdjustments();
        const safeKcal = Math.max(0, toNumber(kcal, 0));
        const base = {
            saltMaxG: cfg.saltMaxG,
            fiberPer1000Kcal: (safeKcal / 1000) * cfg.fiberPer1000Kcal,
            sugarMaxPctKcal: (safeKcal * cfg.sugarMaxPctKcal) / 4,
            satFatMaxPctKcal: (safeKcal * cfg.satFatMaxPctKcal) / 9,
            processingMaxScore: cfg.processingMaxScore
        };
        return Object.fromEntries(SECONDARY_MAP.map(([targetKey, sourceKey, decimals]) => [targetKey, round(scale(base[sourceKey], adj[sourceKey]), decimals)]));
    };
    const getMacroContext = ({ activityKey = 'activity', macroRatios = null } = {}) => ({ activityKey, macroRatios });
    const getAdjustedValues = (baseKcal, macroContext, customAdj, { calcMacros, defaultMacroRatios } = {}) => {
        const adj = { kcal: 0, p: 0, c: 0, f: 0, ...(customAdj || {}) };
        const ratios = defaultMacroRatios || DEFAULT_MACRO_RATIOS;
        const targetKcal = baseKcal * (1 + adj.kcal);
        const context = typeof macroContext === 'string'
            ? { activityKey: macroContext, macroRatios: ratios }
            : { ...(macroContext || {}), macroRatios: (macroContext && macroContext.macroRatios) || ratios };
        const macros = typeof calcMacros === 'function'
            ? calcMacros(targetKcal, context)
            : { p: Math.round((targetKcal * ratios.p) / 4), c: Math.round((targetKcal * ratios.c) / 4), f: Math.round((targetKcal * ratios.f) / 9) };
        const p = Math.round(macros.p * (1 + adj.p));
        const c = Math.round(macros.c * (1 + adj.c));
        const f = Math.round(macros.f * (1 + adj.f));
        return { p, c, f, kcal: Math.round((p * 4) + (c * 4) + (f * 9)) };
    };
    const recalculateDailyTargets = ({
        weeklyPlan,
        profile,
        adjustments,
        exercisesMap,
        daysCount,
        weekDays,
        restBmrFactor,
        stepsDefaults,
        dailyMacroRatios,
        secondaryDefaults,
        secondaryAdjustments,
        hydrationDefaults,
        hydrationAdjustments,
        macroContextBase,
        getWalkInfo,
        calculateStepsKcal,
        calculateExerciseKcal,
        calculateExerciseMinutes,
        calcBMR,
        calcMacros,
        defaultMacroRatios
    } = {}) => {
        const userProfile = profile || {};
        if (!userProfile.weight || !userProfile.height || !userProfile.age || typeof calcBMR !== 'function') return null;

        const safeDaysCount = Number.isFinite(daysCount) ? daysCount : 7;
        const safeWeekDays = Array.isArray(weekDays) && weekDays.length
            ? weekDays.slice(0, safeDaysCount)
            : Array.from({ length: safeDaysCount }, (_, idx) => `day_${idx + 1}`);
        const weekly = Array.isArray(weeklyPlan) ? weeklyPlan.slice(0, safeDaysCount) : [];
        const dailyRatios = Array.isArray(dailyMacroRatios) ? dailyMacroRatios.slice(0, safeDaysCount) : [];
        const exercises = exercisesMap || null;
        const restKcal = calcBMR(userProfile.weight, userProfile.height, userProfile.age, userProfile.sex || 'male') * (Number.isFinite(restBmrFactor) ? restBmrFactor : 1.2);
        const stepsCfg = stepsDefaults || { target: 8000, perMinute: 100, met: 3.5 };
        const walkingExercise = (WALK_EXERCISE_IDS.map((id) => exercises && exercises[id]).find(Boolean)) || { met: stepsCfg.met, cadenceBase: stepsCfg.perMinute };
        const baseCadence = parseInt(walkingExercise.cadenceBase, 10) || stepsCfg.perMinute;
        const stepBaseConfig = { targetSteps: stepsCfg.target, stepsPerMin: baseCadence, met: walkingExercise.met || stepsCfg.met, baseStepsPerMin: baseCadence };
        const secDefaults = secondaryDefaults || getSecondaryDefaults();
        const secAdjustments = secondaryAdjustments || getSecondaryAdjustments();
        const hydDefaults = hydrationDefaults || getHydrationDefaults();
        const hydAdjustments = hydrationAdjustments || getHydrationAdjustments();
        const hydrationBase = getHydrationBaseTargets(userProfile, hydDefaults, hydAdjustments);
        const baseContext = macroContextBase || getMacroContext();
        const adj = adjustments || { kcal: 0, p: 0, c: 0, f: 0 };

        return Object.fromEntries(safeWeekDays.map((day, index) => {
            const dayData = weekly[index] || {};
            const ratios = dailyRatios[index] || defaultMacroRatios || DEFAULT_MACRO_RATIOS;
            const walkInfo = typeof getWalkInfo === 'function'
                ? getWalkInfo(dayData, { defaultStepsCfg: stepsCfg, walkingExercise })
                : { steps: stepsCfg.target, stepsPerMin: stepBaseConfig.stepsPerMin, secPerRep: 0 };
            const daySteps = toNumber(walkInfo.steps, stepsCfg.target);
            const dayStepsPerMin = toNumber(walkInfo.stepsPerMin, stepBaseConfig.stepsPerMin);
            const walkMinutes = (() => {
                const seconds = toNumber(walkInfo.secPerRep, NaN);
                return Number.isFinite(seconds) && seconds > 0 ? seconds / 60 : (dayStepsPerMin > 0 ? daySteps / dayStepsPerMin : 0);
            })();
            const stepsKcal = typeof calculateStepsKcal === 'function'
                ? calculateStepsKcal(daySteps, { weightKg: userProfile.weight, stepsConfig: { ...stepBaseConfig, stepsPerMin: dayStepsPerMin } })
                : 0;
            const gymTotals = sumSectionActivity(dayData.gym, exercises, userProfile.weight, calculateExerciseKcal, calculateExerciseMinutes);
            const extraTotals = sumSectionActivity(dayData.extra_activity, exercises, userProfile.weight, calculateExerciseKcal, calculateExerciseMinutes);
            const activityKcal = stepsKcal + gymTotals.kcal + extraTotals.kcal;
            const activityMinutes = walkMinutes + gymTotals.minutes + extraTotals.minutes;
            const dayValues = getAdjustedValues(restKcal + activityKcal, { ...baseContext, macroRatios: ratios }, adj, {
                calcMacros,
                defaultMacroRatios: ratios
            });
            const secondary = getSecondaryTargetsForKcal(dayValues.kcal, secDefaults, secAdjustments);
            const hydrationExtra = round(Math.max(0, activityMinutes) * hydDefaults.activityMlPerMin);
            return [day, {
                kcal: dayValues.kcal,
                protein: dayValues.p,
                carbs: dayValues.c,
                fat: dayValues.f,
                salt: secondary.salt,
                fiber: secondary.fiber,
                sugar: secondary.sugar,
                saturatedFat: secondary.saturatedFat,
                processing: secondary.processing,
                hydrationMin: hydrationBase ? Math.round(hydrationBase.min + hydrationExtra) : 0,
                hydrationMax: hydrationBase ? Math.round(hydrationBase.max + hydrationExtra) : 0,
                hydrationBaseMin: hydrationBase ? Math.round(hydrationBase.min) : 0,
                hydrationBaseMax: hydrationBase ? Math.round(hydrationBase.max) : 0,
                hydrationExtra: Math.round(hydrationExtra)
            }];
        }));
    };

    return {
        getObjectiveDescriptions,
        getObjectiveDescription,
        normalizeMacroRatios,
        getSecondaryDefaults,
        getSecondaryAdjustments,
        getHydrationDefaults,
        getHydrationAdjustments,
        getHydrationBaseTargets,
        getSecondaryTargetsForKcal,
        getMacroContext,
        getAdjustedValues,
        recalculateDailyTargets
    };
})();

var __root = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : this);
__root.TargetsEngine = TargetsEngine;

if (typeof module !== 'undefined' && module.exports) module.exports = TargetsEngine;
