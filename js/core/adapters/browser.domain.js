const CoreBrowserDomain = (() => {
    const DEFAULTS = {
        macros: { p: 0.30, c: 0.40, f: 0.30 },
        secondary: { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 },
        hydration: { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 }
    };
    const SECONDARY_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];

    const getAppDefault = (name, fallback) => typeof window[name] !== 'undefined' ? window[name] : fallback;
    const readUser = (method, fallback = null) => UserStore[method](fallback);
    const getDefaultMacroRatios = (formulas) => (
        typeof formulas?.getDefaultMacroRatios === 'function' ? formulas.getDefaultMacroRatios() : getAppDefault('APP_MACRO_RATIOS', DEFAULTS.macros)
    );
    const normalizeMacroRatios = (targets, ratios, fallback = null, formulas = null) => (
        targets.normalizeMacroRatios(ratios, fallback || getDefaultMacroRatios(formulas))
    );
    const getStoredDailyRatios = () => readUser('getDailyMacroRatios', null);
    const getUserMacroRatios = (targets, { formulas = null } = {}) => {
        const daily = getStoredDailyRatios();
        const source = Array.isArray(daily) && daily.length ? daily.find((value) => value && typeof value === 'object') || daily[0] : readUser('getMacroRatios', null);
        return normalizeMacroRatios(targets, source, null, formulas);
    };
    const getDailyMacroRatios = (targets, { formulas = null } = {}) => {
        const fallback = normalizeMacroRatios(targets, null, null, formulas);
        const list = Array.isArray(getStoredDailyRatios()) ? getStoredDailyRatios().slice(0, DAYS_COUNT) : [];
        while (list.length < DAYS_COUNT) list.push(null);
        return list.map((entry) => normalizeMacroRatios(targets, entry, fallback, formulas));
    };
    const getConfigured = (targets, method, appDefaultsName, defaults, rulesGetter, targetsGetter) => targets[method](
        getAppDefault(appDefaultsName, defaults),
        readUser(rulesGetter, null),
        readUser(targetsGetter, null)
    );
    const getSecondaryDefaults = (targets) => getConfigured(targets, 'getSecondaryDefaults', 'APP_SECONDARY_DEFAULTS', DEFAULTS.secondary, 'getSecondaryRules', 'getSecondaryTargets');
    const getHydrationDefaults = (targets) => getConfigured(targets, 'getHydrationDefaults', 'APP_HYDRATION_DEFAULTS', DEFAULTS.hydration, 'getHydrationRules', 'getHydrationTargets');
    const getSecondaryAdjustments = (targets) => targets.getSecondaryAdjustments(readUser('getSecondaryAdjustments', {}));
    const getHydrationAdjustments = (targets) => targets.getHydrationAdjustments(readUser('getAdjustments', {}));
    const calcSecondaryTargetsForKcal = (targets, kcal, defaults = null, adjustments = null) => (
        targets.getSecondaryTargetsForKcal(kcal, defaults || getSecondaryDefaults(targets), adjustments || getSecondaryAdjustments(targets))
    );
    const getMacroContext = (targets, { formulas = null } = {}) => targets.getMacroContext({
        activityKey: 'actividad',
        macroRatios: getUserMacroRatios(targets, { formulas })
    });
    const calcAdjustedValues = (targets, formulas, baseKcal, macroContext, customAdj) => targets.getAdjustedValues(baseKcal, macroContext, customAdj, {
        calcMacros: formulas.calcMacros,
        defaultMacroRatios: getDefaultMacroRatios(formulas)
    });
    const activityMethod = (engineMethod, uiMethod = engineMethod) => (
        (typeof ActivityEngine !== 'undefined' && typeof ActivityEngine[engineMethod] === 'function' ? ActivityEngine[engineMethod] : null)
        || (typeof UI !== 'undefined' && typeof UI[uiMethod] === 'function' ? UI[uiMethod] : null)
        || null
    );
    const hasTargetData = (current, predicate) => (
        current && Object.keys(current).length && Object.values(current).some((dayTarget) => predicate(dayTarget || {}))
    );

    const computeDailyTargets = (targets, formulas, weeklyPlan, profile, adjustments, exercisesMap) => {
        const userProfile = profile || readUser('getProfile', {});
        const userAdjustments = adjustments || readUser('getAdjustments', { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 });
        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;
        return targets.recalculateDailyTargets({
            weeklyPlan: Array.isArray(weeklyPlan) ? weeklyPlan.slice(0, DAYS_COUNT) : (typeof ActivityStore !== 'undefined' && typeof ActivityStore.getStoredPlanData === 'function' ? ActivityStore.getStoredPlanData() : null),
            profile: userProfile,
            adjustments: userAdjustments,
            exercisesMap: exercisesMap || null,
            daysCount: DAYS_COUNT,
            weekDays: WEEK_DAYS,
            restBmrFactor: getAppDefault('APP_REST_BMR_FACTOR', 1),
            stepsDefaults: getAppDefault('APP_STEPS_DEFAULTS', null),
            dailyMacroRatios: getDailyMacroRatios(targets, { formulas }),
            secondaryDefaults: getSecondaryDefaults(targets),
            secondaryAdjustments: getSecondaryAdjustments(targets),
            hydrationDefaults: getHydrationDefaults(targets),
            hydrationAdjustments: getHydrationAdjustments(targets),
            macroContextBase: targets.getMacroContext({ activityKey: 'actividad' }),
            getWalkInfo: typeof ActivityStore !== 'undefined' && typeof ActivityStore.getWalkInfo === 'function' ? ActivityStore.getWalkInfo : null,
            calculateStepsKcal: activityMethod('calculateStepsKcal'),
            calculateExerciseKcal: activityMethod('calculateExerciseKcal'),
            calculateExerciseMinutes: activityMethod('estimateExerciseMinutes'),
            calcBMR: formulas.calcBMR,
            calcMacros: formulas.calcMacros,
            defaultMacroRatios: getDefaultMacroRatios(formulas)
        });
    };

    const ensureDailyTargets = (targets, formulas, {
        storedTargets = null,
        needsSecondary = false,
        needsKcal = false,
        needsHydration = false
    } = {}) => {
        if (typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function') {
            return TargetsApplicationService.ensureDailyTargets({
                targets,
                formulas,
                browserDomain: CoreBrowserDomain,
                storedTargets,
                needsSecondary,
                needsKcal,
                needsHydration
            });
        }
        let current = storedTargets || readUser('getDailyNutritionTargets', {});
        const needsRecalc = !hasTargetData(current, () => true)
            || (needsSecondary && !hasTargetData(current, (day) => SECONDARY_KEYS.every((key) => Number.isFinite(parseFloat(day[key])))))
            || (needsKcal && !hasTargetData(current, (day) => Number.isFinite(parseFloat(day.kcal))))
            || (needsHydration && !hasTargetData(current, (day) => Number.isFinite(parseFloat(day.hydrationMin)) && Number.isFinite(parseFloat(day.hydrationMax))));
        if (needsRecalc) {
            const recalculated = computeDailyTargets(targets, formulas);
            if (recalculated) {
                UserStore.saveDailyNutritionTargets(recalculated);
                current = recalculated;
            }
        }
        return current || {};
    };

    const applyMacroDefaults = (formulas) => {
        const defaultRatios = getAppDefault('APP_MACRO_RATIOS', null);
        if (typeof formulas?.setDefaultMacroRatios === 'function' && defaultRatios) {
            formulas.setDefaultMacroRatios(defaultRatios);
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
