const CalculatorApplicationService = (() => {
    const DEFAULT_PROFILE = { sex: 'male', age: 30, height: 175, weight: 75 };
    const DEFAULT_ADJUSTMENTS = { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 };
    const DEFAULT_SECONDARY_ADJUSTMENTS = { saltMaxG: 0, fiberPer1000Kcal: 0, sugarMaxPctKcal: 0, satFatMaxPctKcal: 0, processingMaxScore: 0 };
    const WALK_EXERCISE_IDS = ['walk', 'caminar'];
    const resolveProfileApi = () => (
        typeof ProfileApplicationService !== 'undefined' ? ProfileApplicationService : null
    );
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const readProfile = () => resolveProfileApi()?.getProfile(DEFAULT_PROFILE) || { ...DEFAULT_PROFILE };
    const readAdjustments = () => resolveProfileApi()?.getAdjustments(DEFAULT_ADJUSTMENTS) || { ...DEFAULT_ADJUSTMENTS };
    const readSecondaryAdjustments = () => resolveProfileApi()?.getSecondaryAdjustments(DEFAULT_SECONDARY_ADJUSTMENTS) || { ...DEFAULT_SECONDARY_ADJUSTMENTS };
    const readActivityPlan = () => resolvePersistenceApi()?.getStoredActivityPlan() || null;
    const resolveActivityApi = () => (
        typeof ActivityApplicationService !== 'undefined' ? ActivityApplicationService : null
    );
    const resolveTargetsApi = ({ targetsService = null } = {}) => (
        targetsService || (typeof TargetsApplicationService !== 'undefined' ? TargetsApplicationService : null)
    );
    const roundSafe = (value, decimals = 0) => {
        const parsed = parseFloat(value);
        if (!Number.isFinite(parsed)) return 0;
        const factor = 10 ** decimals;
        return Math.round(parsed * factor) / factor;
    };
    const normalizeSecondary = (values) => ({
        salt: roundSafe(values && values.salt, 2),
        fiber: roundSafe(values && values.fiber, 1),
        sugar: roundSafe(values && values.sugar, 1),
        saturatedFat: roundSafe(values && values.saturatedFat, 1),
        processing: roundSafe(values && values.processing, 1)
    });
    const normalizeDayGoals = (values = {}) => ({
        kcal: roundSafe(values.kcal),
        p: roundSafe(Number.isFinite(parseFloat(values.p)) ? values.p : values.protein),
        c: roundSafe(Number.isFinite(parseFloat(values.c)) ? values.c : values.carbs),
        f: roundSafe(Number.isFinite(parseFloat(values.f)) ? values.f : values.fat),
        hydrationMin: roundSafe(values.hydrationMin),
        hydrationMax: roundSafe(values.hydrationMax)
    });
    const getInitialState = ({ formulas, targets, targetsService = null, weeklyPlan = null }) => {
        const api = resolveTargetsApi({ targetsService });
        api.applyMacroDefaults(formulas);
        return {
            userProfile: readProfile(),
            adjustments: readAdjustments(),
            secondaryAdjustments: readSecondaryAdjustments(),
            defaultMacroRatios: api.getDefaultMacroRatios(formulas),
            macroRatios: api.getUserMacroRatios(targets, { formulas }),
            hydrationDefaults: api.getHydrationDefaults(targets),
            defaultSecondaryTargets: api.getSecondaryDefaults(targets),
            weeklyPlan: weeklyPlan || readActivityPlan(),
            restBmrFactor: APP_REST_BMR_FACTOR,
            defaultStepsCfg: APP_STEPS_DEFAULTS
        };
    };
    const saveProfileAndAdjustments = ({ profile, adjustments, secondaryAdjustments, dailyMacroRatios = null }) => {
        const profileApi = resolveProfileApi();
        if (profileApi && typeof profileApi.saveProfileBundle === 'function') {
            profileApi.saveProfileBundle({ profile, adjustments, secondaryAdjustments, dailyMacroRatios });
            return;
        }
    };
    const getBaseResults = ({ profile, formulas }) => {
        const bmi = formulas.calcBMI(profile.weight, profile.height);
        return { bmi, bmiData: formulas.getBMICategory(bmi), bmr: formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) };
    };
    const getRestGoalsModel = ({ profile, adjustments, secondaryAdjustments, formulas, targets, targetsService = null, restBmrFactor }) => {
        const api = resolveTargetsApi({ targetsService });
        const baseKcal = Math.round(formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * restBmrFactor);
        const baseContext = api.getMacroContext(targets, { formulas });
        const defaultSecondaryTargets = api.getSecondaryDefaults(targets);
        const hydrationDefaults = api.getHydrationDefaults(targets);
        const baseVals = api.calcAdjustedValues(targets, formulas, baseKcal, baseContext, { kcal: 0, p: 0, c: 0, f: 0 });
        const objectiveVals = api.calcAdjustedValues(targets, formulas, baseKcal, baseContext, adjustments);
        return {
            baseKcal,
            baseVals,
            objectiveVals,
            baseSecondary: api.calcSecondaryTargetsForKcal(targets, baseVals.kcal, defaultSecondaryTargets, DEFAULT_SECONDARY_ADJUSTMENTS),
            objectiveSecondary: api.calcSecondaryTargetsForKcal(targets, objectiveVals.kcal, defaultSecondaryTargets, secondaryAdjustments),
            hydrationBase: targets.getHydrationBaseTargets(profile, hydrationDefaults, { hydration: 0 }),
            hydrationAdjusted: targets.getHydrationBaseTargets(profile, hydrationDefaults, { hydration: adjustments.hydration || 0 }),
            hydrationDefaults,
            defaultSecondaryTargets
        };
    };
    const getDayActivityLabel = (dayData) => {
        const gym = dayData && dayData.gym;
        return gym && gym.type === 'rest' ? 'rest' : (gym && Array.isArray(gym.exercises) && gym.exercises.length ? 'gym' : 'none');
    };
    const getDayWalkInfo = (dayData) => {
        const activityApi = resolveActivityApi();
        if (activityApi && typeof activityApi.getWalkInfo === 'function') {
            return activityApi.getWalkInfo(dayData, { defaultStepsCfg: APP_STEPS_DEFAULTS });
        }
        const defaults = APP_STEPS_DEFAULTS || { target: 8000, perMinute: 100 };
        const walkItem = Array.isArray(dayData?.walk?.exercises)
            ? (dayData.walk.exercises.find((entry) => WALK_EXERCISE_IDS.includes(String(entry?.exerciseId || '').trim().toLowerCase())) || dayData.walk.exercises[0])
            : null;
        const stepsPerMin = roundSafe(walkItem?.stepsPerMin || defaults.perMinute);
        const secPerRep = roundSafe(walkItem?.secPerRep);
        const safeSec = secPerRep > 0 ? secPerRep : Math.round(((defaults.target || 8000) / Math.max(stepsPerMin, 1)) * 60);
        return { steps: Math.max(0, Math.round((safeSec / 60) * stepsPerMin)), stepsPerMin, secPerRep: safeSec };
    };
    const getWeeklyGoalsModel = ({ profile, adjustments, formulas, targets, targetsService = null, weeklyPlan, exercisesMap }) => {
        const api = resolveTargetsApi({ targetsService });
        const dailyTargets = api.computeDailyTargets({ targets, formulas, weeklyPlan, profile, adjustments, exercisesMap }) || {};
        const defaultMacroRatios = api.getDefaultMacroRatios(formulas);
        const dailyMacroRatios = api.getDailyMacroRatios(targets, { formulas });
        const baseRest = formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * APP_REST_BMR_FACTOR;
        return {
            dailyTargets,
            weekRows: WEEK_DAYS.map((day, index) => {
                const dayData = Array.isArray(weeklyPlan) ? (weeklyPlan[index] || {}) : {};
                const macroRatios = dailyMacroRatios[index] || defaultMacroRatios;
                const rawValues = dailyTargets[day] || api.calcAdjustedValues(targets, formulas, baseRest, {
                    ...api.getMacroContext(targets, { formulas }),
                    macroRatios
                }, adjustments);
                return {
                    day,
                    activityLabel: getDayActivityLabel(dayData),
                    steps: getDayWalkInfo(dayData).steps || 0,
                    macroRatios,
                    ...normalizeDayGoals(rawValues),
                    ...(dailyTargets[day] && Number.isFinite(parseFloat(dailyTargets[day].salt))
                        ? normalizeSecondary(dailyTargets[day])
                        : normalizeSecondary(api.calcSecondaryTargetsForKcal(targets, rawValues.kcal)))
                };
            })
        };
    };
    return {
        getInitialState,
        saveProfileAndAdjustments,
        getBaseResults,
        getRestGoalsModel,
        getWeeklyGoalsModel,
        getDayWalkInfo
    };
})();

window.CalculatorApplicationService = CalculatorApplicationService;
