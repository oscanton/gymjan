const TargetsApplicationService = (() => {
    const DEFAULTS = {
        profile: { sex: 'male', age: 30, height: 175, weight: 75 },
        adjustments: { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 },
        macros: { p: 0.30, c: 0.40, f: 0.30 },
        secondary: { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 },
        hydration: { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 }
    };
    const PRIMARY_KEYS = ['protein', 'carbs', 'fat'];
    const SECONDARY_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];
    const WALK_EXERCISE_IDS = ['walk', 'caminar'];
    const root = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const getAppDefault = (name, fallback) => typeof root[name] !== 'undefined' ? root[name] : fallback;
    const readUser = (method, fallback = null) => resolvePersistenceApi()?.[method]?.(fallback) || fallback;
    const saveDailyTargets = (dailyTargets) => { resolvePersistenceApi()?.saveDailyNutritionTargets(dailyTargets); };
    const getStoredActivityPlan = () => resolvePersistenceApi()?.getStoredActivityPlan() || null;
    const getActivityEngineMethod = (method) => typeof ActivityEngine !== 'undefined' && typeof ActivityEngine[method] === 'function' ? ActivityEngine[method] : null;
    const isFiniteValue = (value) => Number.isFinite(parseFloat(value));
    const isPositiveValue = (value) => isFiniteValue(value) && parseFloat(value) > 0;
    const hasPositiveKeys = (target, keys = []) => target && keys.every((key) => isPositiveValue(target[key]));
    const anyTarget = (dailyTargets, predicate) => Object.values(dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {}).some(predicate);
    const isGenericDayKey = (value) => /^(dia|day)[_\s]*\d+$/i.test(String(value || '').trim());
    const getUserData = (method, defaults, override = null) => ({ ...defaults, ...(readUser(method, defaults) || {}), ...(override || {}) });
    const getFallbackDayKey = (index) => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.getWeekDayKey === 'function'
            ? DateUtils.getWeekDayKey(index)
            : `day_${index + 1}`
    );

    const getWeekDays = ({ weeklyPlan = null, fallbackCount = 7 } = {}) => {
        const lexicalWeekDays = typeof WEEK_DAYS !== 'undefined' ? WEEK_DAYS : null;
        if (Array.isArray(lexicalWeekDays) && lexicalWeekDays.length) return lexicalWeekDays.slice();
        if (Array.isArray(root.WEEK_DAYS) && root.WEEK_DAYS.length) return root.WEEK_DAYS.slice();
        if (Array.isArray(weeklyPlan) && weeklyPlan.length) {
            const planDays = weeklyPlan.map((day, index) => (
                day && typeof day.day === 'string' && day.day.trim() ? day.day.trim() : getFallbackDayKey(index)
            )).filter(Boolean);
            if (planDays.length) return planDays;
        }
        return Array.from({ length: fallbackCount }, (_, index) => getFallbackDayKey(index));
    };
    const getDaysCount = ({ weeklyPlan = null } = {}) => {
        const lexicalCount = typeof DAYS_COUNT !== 'undefined' ? DAYS_COUNT : NaN;
        if (Number.isFinite(lexicalCount) && lexicalCount > 0) return lexicalCount;
        const rootCount = Number.isFinite(root.DAYS_COUNT) ? root.DAYS_COUNT : NaN;
        if (Number.isFinite(rootCount) && rootCount > 0) return rootCount;
        if (Array.isArray(weeklyPlan) && weeklyPlan.length) return weeklyPlan.length;
        const weekDays = getWeekDays({ weeklyPlan });
        return Array.isArray(weekDays) && weekDays.length ? weekDays.length : 7;
    };
    const getPlanContext = (weeklyPlan = null) => {
        const plan = Array.isArray(weeklyPlan) ? weeklyPlan.slice(0, getDaysCount({ weeklyPlan })) : getStoredActivityPlan();
        const daysCount = getDaysCount({ weeklyPlan: plan });
        return { weeklyPlan: plan, daysCount, weekDays: getWeekDays({ weeklyPlan: plan, fallbackCount: daysCount }).slice(0, daysCount) };
    };

    const normalizeDailyTargetEntry = (entry = {}) => !entry || typeof entry !== 'object' ? entry : {
        ...entry,
        protein: isFiniteValue(entry.protein) ? entry.protein : entry.p,
        carbs: isFiniteValue(entry.carbs) ? entry.carbs : entry.c,
        fat: isFiniteValue(entry.fat) ? entry.fat : entry.f
    };
    const remapDailyTargetKeys = (dailyTargets = {}, weekDays = []) => {
        const entries = Object.entries(dailyTargets);
        if (!entries.length || !Array.isArray(weekDays) || !weekDays.length) return dailyTargets;
        const remapped = Object.fromEntries(entries.filter(([day]) => !isGenericDayKey(day)));
        entries
            .map(([day, entry]) => ({ day, entry, index: parseInt(String(day).replace(/[^\d]/g, ''), 10) - 1 }))
            .filter(({ day, index }) => isGenericDayKey(day) && Number.isInteger(index) && index >= 0 && index < weekDays.length)
            .forEach(({ entry, index }) => {
                const nextDay = weekDays[index];
                if (nextDay && !remapped[nextDay]) remapped[nextDay] = entry;
            });
        return Object.keys(remapped).length ? remapped : dailyTargets;
    };
    const normalizeDailyTargetsContract = (dailyTargets = null, { persist = false, weekDays = null } = {}) => {
        const source = dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {};
        const normalized = Object.fromEntries(
            Object.entries(remapDailyTargetKeys(source, weekDays)).map(([day, entry]) => [day, normalizeDailyTargetEntry(entry)])
        );
        if (persist && JSON.stringify(normalized) !== JSON.stringify(source)) saveDailyTargets(normalized);
        return normalized;
    };

    const getWalkInfo = (dayData, { defaultStepsCfg = null, walkingExercise = null } = {}) => {
        if (typeof ActivityApplicationService !== 'undefined' && typeof ActivityApplicationService.getWalkInfo === 'function') {
            return ActivityApplicationService.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise });
        }
        const defaults = defaultStepsCfg || getAppDefault('APP_STEPS_DEFAULTS', { target: 8000, perMinute: 100 });
        const cadenceBase = isFiniteValue(walkingExercise?.cadenceBase) ? parseFloat(walkingExercise.cadenceBase) : (parseFloat(defaults.perMinute) || 100);
        const walkItem = Array.isArray(dayData?.walk?.exercises)
            ? (dayData.walk.exercises.find((entry) => WALK_EXERCISE_IDS.includes(String(entry?.exerciseId || '').trim().toLowerCase())) || dayData.walk.exercises[0])
            : null;
        const stepsPerMin = parseFloat(walkItem?.stepsPerMin) || cadenceBase;
        const secPerRep = parseFloat(walkItem?.secPerRep);
        const safeSec = Number.isFinite(secPerRep) && secPerRep > 0 ? secPerRep : Math.round(((parseFloat(defaults.target) || 8000) / stepsPerMin) * 60);
        return { steps: Math.max(0, Math.round((safeSec / 60) * stepsPerMin)), stepsPerMin, secPerRep: safeSec, cadenceBase };
    };

    const getDefaultMacroRatios = (formulas = null) => typeof formulas?.getDefaultMacroRatios === 'function' ? formulas.getDefaultMacroRatios() : getAppDefault('APP_MACRO_RATIOS', DEFAULTS.macros);
    const normalizeMacroRatios = (targets, ratios, fallback = null, formulas = null) => (
        targets && typeof targets.normalizeMacroRatios === 'function'
            ? targets.normalizeMacroRatios(ratios, fallback || getDefaultMacroRatios(formulas))
            : (fallback || getDefaultMacroRatios(formulas))
    );
    const getStoredDailyRatios = () => readUser('getDailyMacroRatios', null);
    const getStoredMacroRatiosSource = () => {
        const daily = getStoredDailyRatios();
        return Array.isArray(daily) && daily.length ? (daily.find((value) => value && typeof value === 'object') || daily[0]) : readUser('getMacroRatios', null);
    };
    const getUserMacroRatios = (targets, { formulas = null } = {}) => normalizeMacroRatios(targets, getStoredMacroRatiosSource(), null, formulas);
    const getDailyMacroRatios = (targets, { formulas = null } = {}) => {
        const fallback = normalizeMacroRatios(targets, null, null, formulas);
        const list = Array.isArray(getStoredDailyRatios()) ? getStoredDailyRatios().slice(0, getDaysCount()) : [];
        while (list.length < getDaysCount()) list.push(null);
        return list.map((entry) => normalizeMacroRatios(targets, entry, fallback, formulas));
    };
    const getConfigured = (targets, method, appDefaultsName, defaults, rulesGetter, targetsGetter) => (
        targets[method](getAppDefault(appDefaultsName, defaults), readUser(rulesGetter, null), readUser(targetsGetter, null))
    );
    const getSecondaryDefaults = (targets) => getConfigured(targets, 'getSecondaryDefaults', 'APP_SECONDARY_DEFAULTS', DEFAULTS.secondary, 'getSecondaryRules', 'getSecondaryTargets');
    const getHydrationDefaults = (targets) => getConfigured(targets, 'getHydrationDefaults', 'APP_HYDRATION_DEFAULTS', DEFAULTS.hydration, 'getHydrationRules', 'getHydrationTargets');
    const getSecondaryAdjustments = (targets) => targets.getSecondaryAdjustments(readUser('getSecondaryAdjustments', {}));
    const getHydrationAdjustments = (targets) => targets.getHydrationAdjustments(readUser('getAdjustments', {}));
    const calcSecondaryTargetsForKcal = (targets, kcal, defaults = null, adjustments = null) => targets.getSecondaryTargetsForKcal(
        kcal,
        defaults || getSecondaryDefaults(targets),
        adjustments || getSecondaryAdjustments(targets)
    );
    const getMacroContext = (targets, { formulas = null } = {}) => targets.getMacroContext({ activityKey: 'activity', macroRatios: getUserMacroRatios(targets, { formulas }) });
    const calcAdjustedValues = (targets, formulas, baseKcal, macroContext, customAdj) => targets.getAdjustedValues(baseKcal, macroContext, customAdj, {
        calcMacros: formulas.calcMacros,
        defaultMacroRatios: getDefaultMacroRatios(formulas)
    });
    const applyMacroDefaults = (formulas) => {
        const defaultRatios = getAppDefault('APP_MACRO_RATIOS', null);
        if (typeof formulas?.setDefaultMacroRatios === 'function' && defaultRatios) formulas.setDefaultMacroRatios(defaultRatios);
    };
    const hasRequiredTargets = (dailyTargets, { needsSecondary = false, needsKcal = false, needsHydration = false } = {}) => {
        const current = normalizeDailyTargetsContract(dailyTargets);
        if (!Object.keys(current).length) return false;
        if ((needsSecondary || needsKcal || needsHydration) && !anyTarget(current, (target) => hasPositiveKeys(target, PRIMARY_KEYS))) return false;
        if (needsSecondary && !anyTarget(current, (target) => hasPositiveKeys(target, SECONDARY_KEYS))) return false;
        if (needsKcal && !anyTarget(current, (target) => isPositiveValue(target?.kcal))) return false;
        if (needsHydration && !anyTarget(current, (target) => hasPositiveKeys(target, ['hydrationMin', 'hydrationMax']))) return false;
        return true;
    };

    const computeDailyTargets = ({
        targets,
        formulas,
        weeklyPlan = null,
        profile = null,
        adjustments = null,
        exercisesMap = null,
        persist = true
    } = {}) => {
        if (!targets || typeof targets.recalculateDailyTargets !== 'function' || !formulas) return null;
        const { weeklyPlan: resolvedWeeklyPlan, daysCount, weekDays } = getPlanContext(weeklyPlan);
        const userProfile = getUserData('getProfile', DEFAULTS.profile, profile);
        const userAdjustments = getUserData('getAdjustments', DEFAULTS.adjustments, adjustments);
        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;
        const dailyTargets = targets.recalculateDailyTargets({
            weeklyPlan: resolvedWeeklyPlan,
            profile: userProfile,
            adjustments: userAdjustments,
            exercisesMap: exercisesMap || null,
            daysCount,
            weekDays,
            restBmrFactor: getAppDefault('APP_REST_BMR_FACTOR', 1),
            stepsDefaults: getAppDefault('APP_STEPS_DEFAULTS', null),
            dailyMacroRatios: getDailyMacroRatios(targets, { formulas }),
            secondaryDefaults: getSecondaryDefaults(targets),
            secondaryAdjustments: getSecondaryAdjustments(targets),
            hydrationDefaults: getHydrationDefaults(targets),
            hydrationAdjustments: getHydrationAdjustments(targets),
            macroContextBase: targets.getMacroContext({ activityKey: 'activity' }),
            getWalkInfo,
            calculateStepsKcal: getActivityEngineMethod('calculateStepsKcal'),
            calculateExerciseKcal: getActivityEngineMethod('calculateExerciseKcal'),
            calculateExerciseMinutes: getActivityEngineMethod('estimateExerciseMinutes'),
            calcBMR: formulas.calcBMR,
            calcMacros: formulas.calcMacros,
            defaultMacroRatios: getDefaultMacroRatios(formulas)
        });
        if (dailyTargets && persist) saveDailyTargets(dailyTargets);
        return dailyTargets;
    };
    const ensureDailyTargets = ({
        targets,
        formulas,
        storedTargets = null,
        weeklyPlan = null,
        profile = null,
        adjustments = null,
        exercisesMap = null,
        needsSecondary = false,
        needsKcal = false,
        needsHydration = false,
        persist = true
    } = {}) => {
        const { weekDays } = getPlanContext(weeklyPlan);
        const cachedTargets = normalizeDailyTargetsContract(storedTargets || readUser('getDailyNutritionTargets', {}), { persist, weekDays });
        return hasRequiredTargets(cachedTargets, { needsSecondary, needsKcal, needsHydration })
            ? cachedTargets
            : (computeDailyTargets({ targets, formulas, weeklyPlan, profile, adjustments, exercisesMap, persist }) || cachedTargets || {});
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
        applyMacroDefaults,
        hasRequiredTargets,
        computeDailyTargets,
        ensureDailyTargets
    };
})();

window.TargetsApplicationService = TargetsApplicationService;
