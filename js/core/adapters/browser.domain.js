/* =========================================
   core/adapters/browser.domain.js - DOMAIN HELPERS (BROWSER)
   ========================================= */

const CoreBrowserDomain = (() => {
    const DEFAULT_MACROS = { p: 0.30, c: 0.40, f: 0.30 };
    const DEFAULT_SECONDARY = { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };
    const DEFAULT_HYDRATION = { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 };

    const getDefaultMacroRatios = (formulas) => (
        typeof formulas?.getDefaultMacroRatios === 'function'
            ? formulas.getDefaultMacroRatios()
            : (typeof APP_MACRO_RATIOS !== 'undefined' ? APP_MACRO_RATIOS : DEFAULT_MACROS)
    );

    const normalizeMacroRatios = (targets, ratios, fallback = null, formulas = null) => {
        const fb = fallback || getDefaultMacroRatios(formulas);
        return targets.normalizeMacroRatios(ratios, fb);
    };

    const getUserMacroRatios = (targets, { formulas = null } = {}) => {
        const daily = DB.get('user_macro_ratios_by_day', null);
        if (Array.isArray(daily) && daily.length) {
            const first = daily.find(v => v && typeof v === 'object') || daily[0];
            return normalizeMacroRatios(targets, first, null, formulas);
        }
        const saved = DB.get('user_macro_ratios', null);
        return normalizeMacroRatios(targets, saved, null, formulas);
    };

    const getDailyMacroRatios = (targets, { formulas = null } = {}) => {
        const fallback = normalizeMacroRatios(targets, null, null, formulas);
        const raw = DB.get('user_macro_ratios_by_day', null);
        const list = Array.isArray(raw) ? raw.slice(0, DAYS_COUNT) : [];
        while (list.length < DAYS_COUNT) list.push(null);
        return list.map(entry => normalizeMacroRatios(targets, entry, fallback, formulas));
    };

    const getSecondaryDefaults = (targets) => targets.getSecondaryDefaults(
        (typeof APP_SECONDARY_DEFAULTS !== 'undefined') ? APP_SECONDARY_DEFAULTS : DEFAULT_SECONDARY,
        DB.get('user_secondary_rules', null),
        DB.get('user_secondary_targets', null)
    );

    const getSecondaryAdjustments = (targets) => targets.getSecondaryAdjustments(
        DB.get('user_secondary_adjustments', {})
    );

    const getHydrationDefaults = (targets) => targets.getHydrationDefaults(
        (typeof APP_HYDRATION_DEFAULTS !== 'undefined') ? APP_HYDRATION_DEFAULTS : DEFAULT_HYDRATION,
        DB.get('user_hydration_rules', null),
        DB.get('user_hydration_targets', null)
    );

    const getHydrationAdjustments = (targets) => targets.getHydrationAdjustments(
        DB.get('user_adjustments', {})
    );

    const calcSecondaryTargetsForKcal = (targets, kcal, defaults = null, adjustments = null) => {
        const cfg = defaults || getSecondaryDefaults(targets);
        const adj = adjustments || getSecondaryAdjustments(targets);
        return targets.getSecondaryTargetsForKcal(kcal, cfg, adj);
    };

    const getMacroContext = (targets, { formulas = null } = {}) => targets.getMacroContext({
        activityKey: 'actividad',
        macroRatios: getUserMacroRatios(targets, { formulas })
    });

    const calcAdjustedValues = (targets, formulas, baseKcal, macroContext, customAdj) => targets.getAdjustedValues(
        baseKcal,
        macroContext,
        customAdj,
        {
            calcMacros: formulas.calcMacros,
            defaultMacroRatios: getDefaultMacroRatios(formulas)
        }
    );

    const computeDailyTargets = (targets, formulas, weeklyPlan, profile, adjustments, exercisesMap) => {
        const userProfile = profile || DB.get('user_profile', {});
        const adj = adjustments || DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 });
        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;

        const dailyMacroRatios = getDailyMacroRatios(targets, { formulas });
        const secondaryDefaults = getSecondaryDefaults(targets);
        const secondaryAdjustments = getSecondaryAdjustments(targets);
        const hydrationDefaults = getHydrationDefaults(targets);
        const hydrationAdjustments = getHydrationAdjustments(targets);
        const weekly = Array.isArray(weeklyPlan)
            ? weeklyPlan.slice(0, DAYS_COUNT)
            : ((typeof ActivityStore !== 'undefined')
                ? ActivityStore.getActivePlanData()
                : null);
        const exercises = exercisesMap || (typeof EXERCISES !== 'undefined' ? EXERCISES : null);

        const calculateStepsKcal = (typeof UI !== 'undefined' && typeof UI.calculateStepsKcal === 'function')
            ? UI.calculateStepsKcal
            : null;
        const calculateExerciseKcal = (typeof UI !== 'undefined' && typeof UI.calculateExerciseKcal === 'function')
            ? UI.calculateExerciseKcal
            : null;
        const getWalkInfo = (typeof ActivityStore !== 'undefined' && ActivityStore.getWalkInfo)
            ? ActivityStore.getWalkInfo
            : null;
        const calculateExerciseMinutes = (typeof UI !== 'undefined' && typeof UI.estimateExerciseMinutes === 'function')
            ? UI.estimateExerciseMinutes
            : null;

        const dailyTargets = targets.recalculateDailyTargets({
            weeklyPlan: weekly,
            profile: userProfile,
            adjustments: adj,
            exercisesMap: exercises,
            daysCount: DAYS_COUNT,
            weekDays: WEEK_DAYS,
            restBmrFactor: APP_REST_BMR_FACTOR,
            stepsDefaults: APP_STEPS_DEFAULTS,
            dailyMacroRatios,
            secondaryDefaults,
            secondaryAdjustments,
            hydrationDefaults,
            hydrationAdjustments,
            macroContextBase: targets.getMacroContext({ activityKey: 'actividad' }),
            getWalkInfo,
            calculateStepsKcal,
            calculateExerciseKcal,
            calculateExerciseMinutes,
            calcBMR: formulas.calcBMR,
            calcMacros: formulas.calcMacros,
            defaultMacroRatios: getDefaultMacroRatios(formulas)
        });

        if (dailyTargets) {
            DB.save('daily_nutrition_targets', dailyTargets);
        }
        return dailyTargets;
    };

    const ensureDailyTargets = (targets, formulas, {
        storedTargets = null,
        needsSecondary = false,
        needsKcal = false,
        needsHydration = false
    } = {}) => {
        let current = storedTargets || DB.get('daily_nutrition_targets', {});
        const hasTargets = current && Object.keys(current).length > 0;
        const hasSecondary = hasTargets && Object.values(current).some(dayTarget =>
            dayTarget && ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'].every((key) =>
                Number.isFinite(parseFloat(dayTarget[key]))
            )
        );
        const hasKcal = hasTargets && Object.values(current).some(dayTarget =>
            dayTarget && Number.isFinite(parseFloat(dayTarget.kcal))
        );
        const hasHydration = hasTargets && Object.values(current).some(dayTarget =>
            dayTarget && Number.isFinite(parseFloat(dayTarget.hydrationMin)) && Number.isFinite(parseFloat(dayTarget.hydrationMax))
        );
        const needsRecalc = !hasTargets
            || (needsSecondary && !hasSecondary)
            || (needsKcal && !hasKcal)
            || (needsHydration && !hasHydration);
        if (needsRecalc) {
            const recalculated = computeDailyTargets(targets, formulas);
            if (recalculated) current = recalculated;
        }
        return current || {};
    };

    const applyMacroDefaults = (formulas) => {
        if (typeof APP_MACRO_RATIOS !== 'undefined' && typeof formulas?.setDefaultMacroRatios === 'function') {
            formulas.setDefaultMacroRatios(APP_MACRO_RATIOS);
        }
    };

    return {
        getDefaultMacroRatios,
        normalizeMacroRatios,
        getUserMacroRatios,
        getDailyMacroRatios,
        getSecondaryDefaults,
        getSecondaryAdjustments,
        getHydrationDefaults,
        getHydrationAdjustments,
        calcSecondaryTargetsForKcal,
        getMacroContext,
        calcAdjustedValues,
        computeDailyTargets,
        ensureDailyTargets,
        applyMacroDefaults
    };
})();

window.CoreBrowserDomain = CoreBrowserDomain;
