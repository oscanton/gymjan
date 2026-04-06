/* =========================================
   core/engine/targets.engine.js - PURE TARGETS & MACROS
   ========================================= */

const TargetsEngine = (() => {
    const getObjectiveDescriptions = () => ({
        kcal: 'Define la energía diaria total. Un exceso sostenido puede favorecer ganancia de grasa; un déficit excesivo puede reducir rendimiento y recuperación.',
        p: 'La proteína ayuda a conservar y construir masa muscular, y mejora la saciedad. Un aporte bajo sostenido puede limitar recuperación y mantenimiento muscular.',
        c: 'Los carbohidratos son el combustible principal para entrenar y recuperar glucógeno. Un aporte muy bajo puede reducir energía, rendimiento e intensidad.',
        f: 'Las grasas son clave para función hormonal, absorción de vitaminas y salud celular. Un aporte muy bajo puede afectar hormonas y bienestar general.',
        salt: 'Controla el sodio total aproximado (expresado como sal). Un exceso mantenido puede empeorar retención de líquidos y tensión arterial en personas sensibles.',
        fiber: 'La fibra mejora salud digestiva, saciedad y control glucémico. Un aporte bajo suele empeorar tránsito intestinal y calidad global de la dieta.',
        sugar: 'Limita azúcares libres para mejorar calidad nutricional y estabilidad energética. Regla base: máximo % de kcal y conversión a gramos con (kcal x %)/4. Un exceso sostenido facilita picos de apetito y desplazamiento de alimentos de calidad.',
        saturatedFat: 'Limita grasas saturadas para proteger perfil lipídico y salud cardiovascular. Un exceso habitual puede empeorar marcadores cardiometabólicos.',
        processing: 'Refleja el grado medio de procesado de la dieta. Cuanto más alto, mayor riesgo de baja densidad nutricional y peor adherencia a largo plazo.',
        hydration: 'Define la hidratacion diaria base segun peso (30-35 ml/kg) y el extra por actividad (ml/min).'
    });

    const getObjectiveDescription = (key) => {
        const all = getObjectiveDescriptions();
        return all[key] || '';
    };

    const normalizeMacroRatios = (ratios, fallback = null) => {
        const fb = fallback || { p: 0.30, c: 0.40, f: 0.30 };
        const p = parseFloat(ratios && ratios.p);
        const c = parseFloat(ratios && ratios.c);
        const f = parseFloat(ratios && ratios.f);
        const hasAll = Number.isFinite(p) && Number.isFinite(c) && Number.isFinite(f);
        const sum = hasAll ? (p + c + f) : 0;
        if (!hasAll || sum <= 0) return fb;
        return { p: p / sum, c: c / sum, f: f / sum };
    };

    const getSecondaryDefaults = (secondaryDefaults, savedRules, legacyTargets) => {
        const secondary = secondaryDefaults || { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };
        const source = savedRules || legacyTargets || {};
        const num = (value, fallback) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        };
        return {
            saltMaxG: num(source.saltMaxG, secondary.saltMaxG),
            fiberPer1000Kcal: num(source.fiberPer1000Kcal, secondary.fiberPer1000Kcal),
            sugarMaxPctKcal: num(source.sugarMaxPctKcal, secondary.sugarMaxPctKcal),
            satFatMaxPctKcal: num(source.satFatMaxPctKcal, secondary.satFatMaxPctKcal),
            processingMaxScore: num(source.processingMaxScore, secondary.processingMaxScore)
        };
    };

    const getSecondaryAdjustments = (saved) => {
        const num = (value) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        return {
            saltMaxG: num(saved && saved.saltMaxG),
            fiberPer1000Kcal: num(saved && saved.fiberPer1000Kcal),
            sugarMaxPctKcal: num(saved && saved.sugarMaxPctKcal),
            satFatMaxPctKcal: num(saved && saved.satFatMaxPctKcal),
            processingMaxScore: num(saved && saved.processingMaxScore)
        };
    };

    const getHydrationDefaults = (hydrationDefaults, savedRules, legacyTargets) => {
        const defaults = hydrationDefaults || { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 };
        const source = savedRules || legacyTargets || {};
        const num = (value, fallback) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        };
        return {
            minMlPerKg: num(source.minMlPerKg, defaults.minMlPerKg),
            maxMlPerKg: num(source.maxMlPerKg, defaults.maxMlPerKg),
            activityMlPerMin: num(source.activityMlPerMin, defaults.activityMlPerMin)
        };
    };

    const getHydrationAdjustments = (saved) => {
        const num = (value) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        return {
            hydration: num(saved && saved.hydration)
        };
    };

    const getHydrationBaseTargets = (profile, defaults = null, adjustments = null) => {
        const cfg = defaults || getHydrationDefaults(null, null, null);
        const adj = adjustments || getHydrationAdjustments(null);
        const weight = parseFloat(profile && profile.weight);
        if (!Number.isFinite(weight) || weight <= 0) return null;
        const baseMin = weight * cfg.minMlPerKg;
        const baseMax = weight * cfg.maxMlPerKg;
        const factor = 1 + (Number.isFinite(adj.hydration) ? adj.hydration : 0);
        return {
            baseMin,
            baseMax,
            min: baseMin * factor,
            max: baseMax * factor
        };
    };

    const getSecondaryTargetsForKcal = (kcal, defaults = null, adjustments = null) => {
        const cfg = defaults || getSecondaryDefaults(null, null, null);
        const adj = adjustments || getSecondaryAdjustments(null);
        const safeKcal = Number.isFinite(kcal) && kcal > 0 ? kcal : 0;
        const round = (value, decimals) => {
            const factor = 10 ** decimals;
            return Math.round(value * factor) / factor;
        };
        const adjusted = (baseValue, adjustmentPct) => baseValue * (1 + (Number.isFinite(adjustmentPct) ? adjustmentPct : 0));

        const baseSalt = cfg.saltMaxG;
        const baseFiber = (safeKcal / 1000) * cfg.fiberPer1000Kcal;
        const baseSugar = (safeKcal * cfg.sugarMaxPctKcal) / 4;
        const baseSatFat = (safeKcal * cfg.satFatMaxPctKcal) / 9;
        const baseProcessing = cfg.processingMaxScore;

        return {
            salt: round(adjusted(baseSalt, adj.saltMaxG), 2),
            fiber: round(adjusted(baseFiber, adj.fiberPer1000Kcal), 1),
            sugar: round(adjusted(baseSugar, adj.sugarMaxPctKcal), 1),
            saturatedFat: round(adjusted(baseSatFat, adj.satFatMaxPctKcal), 1),
            processing: round(adjusted(baseProcessing, adj.processingMaxScore), 1)
        };
    };

    const getMacroContext = ({ activityKey = 'actividad', macroRatios = null } = {}) => ({
        activityKey,
        macroRatios
    });

    const getAdjustedValues = (baseKcal, macroContext, customAdj, { calcMacros, defaultMacroRatios } = {}) => {
        const safeAdj = customAdj || { kcal: 0, p: 0, c: 0, f: 0 };
        const targetKcal = baseKcal * (1 + safeAdj.kcal);
        const context = (typeof macroContext === 'string')
            ? { activityKey: macroContext, macroRatios: defaultMacroRatios }
            : (macroContext || {});
        const macrosFn = (typeof calcMacros === 'function')
            ? calcMacros
            : (kcal, ctx) => ({
                p: Math.round((kcal * (defaultMacroRatios ? defaultMacroRatios.p : 0.30)) / 4),
                c: Math.round((kcal * (defaultMacroRatios ? defaultMacroRatios.c : 0.40)) / 4),
                f: Math.round((kcal * (defaultMacroRatios ? defaultMacroRatios.f : 0.30)) / 9)
            });
        const m = macrosFn(targetKcal, context);

        const p = Math.round(m.p * (1 + safeAdj.p));
        const c = Math.round(m.c * (1 + safeAdj.c));
        const f = Math.round(m.f * (1 + safeAdj.f));

        const finalKcal = (p * 4) + (c * 4) + (f * 9);
        return { p, c, f, kcal: Math.round(finalKcal) };
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
        const safeDaysCount = Number.isFinite(daysCount) ? daysCount : 7;
        const safeWeekDays = Array.isArray(weekDays) && weekDays.length
            ? weekDays.slice(0, safeDaysCount)
            : Array.from({ length: safeDaysCount }, (_, idx) => `Día ${idx + 1}`);
        const userProfile = profile || {};
        const adj = adjustments || { kcal: 0, p: 0, c: 0, f: 0 };

        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;
        if (typeof calcBMR !== 'function') return null;

        const bmr = calcBMR(
            userProfile.weight,
            userProfile.height,
            userProfile.age,
            userProfile.sex || 'hombre'
        );

        const dailyTargets = {};
        const restFactor = Number.isFinite(restBmrFactor) ? restBmrFactor : 1.2;
        const restKcal = bmr * restFactor;
        const defaultStepsCfg = stepsDefaults || { target: 8000, perMinute: 100, met: 3.5 };
        const exercises = exercisesMap || null;
        const walkingExercise = exercises && exercises.caminar
            ? exercises.caminar
            : { met: defaultStepsCfg.met, cadenceBase: defaultStepsCfg.perMinute };
        const baseCadence = parseInt(walkingExercise.cadenceBase, 10) || defaultStepsCfg.perMinute;
        const stepsConfig = {
            targetSteps: defaultStepsCfg.target,
            stepsPerMin: baseCadence,
            met: walkingExercise.met || defaultStepsCfg.met,
            baseStepsPerMin: baseCadence
        };
        const weekly = Array.isArray(weeklyPlan)
            ? weeklyPlan.slice(0, safeDaysCount)
            : [];
        const perDayMacroRatios = Array.isArray(dailyMacroRatios)
            ? dailyMacroRatios.slice(0, safeDaysCount)
            : [];

        const secDefaults = secondaryDefaults || getSecondaryDefaults(null, null, null);
        const secAdjustments = secondaryAdjustments || getSecondaryAdjustments(null);
        const hydDefaults = hydrationDefaults || getHydrationDefaults(null, null, null);
        const hydAdjustments = hydrationAdjustments || getHydrationAdjustments(null);
        const hydrationBase = getHydrationBaseTargets(userProfile, hydDefaults, hydAdjustments);

        safeWeekDays.forEach((day, index) => {
            const dayData = Array.isArray(weekly) ? (weekly[index] || {}) : {};
            const baseContext = macroContextBase || getMacroContext({ activityKey: 'actividad' });
            const dayMacroRatios = perDayMacroRatios[index] || defaultMacroRatios || { p: 0.30, c: 0.40, f: 0.30 };
            const macroContextWithRatios = { ...baseContext, macroRatios: dayMacroRatios };

            const walkInfo = (typeof getWalkInfo === 'function')
                ? getWalkInfo(dayData, { defaultStepsCfg, walkingExercise })
                : { steps: defaultStepsCfg.target, stepsPerMin: stepsConfig.stepsPerMin, secPerRep: 0, cadenceBase: stepsConfig.baseStepsPerMin };
            const daySteps = walkInfo.steps;
            const dayStepsPerMin = walkInfo.stepsPerMin;
            const walkMinutes = (() => {
                const sec = parseFloat(walkInfo.secPerRep);
                if (Number.isFinite(sec) && sec > 0) return sec / 60;
                const spm = parseFloat(dayStepsPerMin) || stepsConfig.stepsPerMin;
                return spm > 0 ? (daySteps / spm) : 0;
            })();
            const perDayStepsConfig = {
                ...stepsConfig,
                stepsPerMin: dayStepsPerMin,
                baseStepsPerMin: stepsConfig.baseStepsPerMin
            };
            const stepsKcal = (typeof calculateStepsKcal === 'function')
                ? calculateStepsKcal(daySteps, { weightKg: userProfile.weight, stepsConfig: perDayStepsConfig })
                : 0;

            let gymKcal = 0;
            let gymMinutes = 0;
            const gymSection = dayData.gym;
            if (gymSection && gymSection.type !== 'rest' && Array.isArray(gymSection.exercises) && typeof calculateExerciseKcal === 'function') {
                gymSection.exercises.forEach((item) => {
                    const ex = exercises && item ? exercises[item.exerciseId] : null;
                    if (!ex) return;
                    gymKcal += calculateExerciseKcal(item, ex, { weightKg: userProfile.weight });
                    if (typeof calculateExerciseMinutes === 'function') {
                        gymMinutes += calculateExerciseMinutes(item, ex);
                    }
                });
            }

            let extraKcal = 0;
            let extraMinutes = 0;
            const extraSection = dayData.extra_activity;
            if (extraSection && extraSection.type !== 'rest' && Array.isArray(extraSection.exercises) && typeof calculateExerciseKcal === 'function') {
                extraSection.exercises.forEach((item) => {
                    const ex = exercises && item ? exercises[item.exerciseId] : null;
                    if (!ex) return;
                    extraKcal += calculateExerciseKcal(item, ex, { weightKg: userProfile.weight });
                    if (typeof calculateExerciseMinutes === 'function') {
                        extraMinutes += calculateExerciseMinutes(item, ex);
                    }
                });
            }

            const totalActivityKcal = stepsKcal + gymKcal + extraKcal;
            const totalActivityMin = walkMinutes + gymMinutes + extraMinutes;
            const tdee = restKcal + totalActivityKcal;
            const dayVals = getAdjustedValues(tdee, macroContextWithRatios, adj, {
                calcMacros,
                defaultMacroRatios: dayMacroRatios
            });
            const secondaryTargets = getSecondaryTargetsForKcal(dayVals.kcal, secDefaults, secAdjustments);
            const hydrationExtra = Number.isFinite(totalActivityMin)
                ? totalActivityMin * hydDefaults.activityMlPerMin
                : 0;
            const hydrationMin = hydrationBase ? Math.round(hydrationBase.min + hydrationExtra) : 0;
            const hydrationMax = hydrationBase ? Math.round(hydrationBase.max + hydrationExtra) : 0;

            dailyTargets[day] = {
                kcal: dayVals.kcal,
                protein: dayVals.p,
                carbs: dayVals.c,
                fat: dayVals.f,
                salt: secondaryTargets.salt,
                fiber: secondaryTargets.fiber,
                sugar: secondaryTargets.sugar,
                saturatedFat: secondaryTargets.saturatedFat,
                processing: secondaryTargets.processing,
                hydrationMin,
                hydrationMax,
                hydrationBaseMin: hydrationBase ? Math.round(hydrationBase.min) : 0,
                hydrationBaseMax: hydrationBase ? Math.round(hydrationBase.max) : 0,
                hydrationExtra: Math.round(hydrationExtra)
            };
        });

        return dailyTargets;
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

var __root = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined' ? window : this);
__root.TargetsEngine = TargetsEngine;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = TargetsEngine;
}
