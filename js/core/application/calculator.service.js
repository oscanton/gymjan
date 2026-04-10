const CalculatorApplicationService = (() => {
    const DEFAULT_PROFILE = { sex: 'hombre', age: 30, height: 175, weight: 75 };
    const DEFAULT_ADJUSTMENTS = { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 };
    const DEFAULT_SECONDARY_ADJUSTMENTS = { saltMaxG: 0, fiberPer1000Kcal: 0, sugarMaxPctKcal: 0, satFatMaxPctKcal: 0, processingMaxScore: 0 };
    const readProfile = () => UserStore.getProfile({ ...DEFAULT_PROFILE });
    const readAdjustments = () => UserStore.getAdjustments({ ...DEFAULT_ADJUSTMENTS });
    const readSecondaryAdjustments = () => UserStore.getSecondaryAdjustments({ ...DEFAULT_SECONDARY_ADJUSTMENTS });
    const readActivityPlan = () => (typeof ActivityStore !== 'undefined' && typeof ActivityStore.getStoredPlanData === 'function') ? ActivityStore.getStoredPlanData() : null;
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
    const getInitialState = ({ formulas, targets, browserDomain, weeklyPlan = null }) => {
        browserDomain.applyMacroDefaults(formulas);
        return {
            userProfile: readProfile(),
            adjustments: readAdjustments(),
            secondaryAdjustments: readSecondaryAdjustments(),
            defaultMacroRatios: browserDomain.getDefaultMacroRatios(formulas),
            macroRatios: browserDomain.getUserMacroRatios(targets, { formulas }),
            hydrationDefaults: browserDomain.getHydrationDefaults(targets),
            defaultSecondaryTargets: browserDomain.getSecondaryDefaults(targets),
            weeklyPlan: weeklyPlan || readActivityPlan(),
            restBmrFactor: APP_REST_BMR_FACTOR,
            defaultStepsCfg: APP_STEPS_DEFAULTS
        };
    };
    const saveProfileAndAdjustments = ({ profile, adjustments, secondaryAdjustments, dailyMacroRatios = null }) => {
        UserStore.saveProfile(profile);
        UserStore.saveAdjustments(adjustments);
        UserStore.saveSecondaryAdjustments(secondaryAdjustments);
        if (Array.isArray(dailyMacroRatios)) UserStore.saveDailyMacroRatios(dailyMacroRatios);
    };
    const getBaseResults = ({ profile, formulas }) => {
        const bmi = formulas.calcBMI(profile.weight, profile.height);
        return { bmi, bmiData: formulas.getBMICategory(bmi), bmr: formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) };
    };
    const getRestGoalsModel = ({ profile, adjustments, secondaryAdjustments, formulas, targets, browserDomain, restBmrFactor }) => {
        const baseKcal = Math.round(formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * restBmrFactor);
        const baseContext = browserDomain.getMacroContext(targets, { formulas });
        const defaultSecondaryTargets = browserDomain.getSecondaryDefaults(targets);
        const hydrationDefaults = browserDomain.getHydrationDefaults(targets);
        const baseVals = browserDomain.calcAdjustedValues(targets, formulas, baseKcal, baseContext, { kcal: 0, p: 0, c: 0, f: 0 });
        const objectiveVals = browserDomain.calcAdjustedValues(targets, formulas, baseKcal, baseContext, adjustments);
        return {
            baseKcal,
            baseVals,
            objectiveVals,
            baseSecondary: browserDomain.calcSecondaryTargetsForKcal(targets, baseVals.kcal, defaultSecondaryTargets, DEFAULT_SECONDARY_ADJUSTMENTS),
            objectiveSecondary: browserDomain.calcSecondaryTargetsForKcal(targets, objectiveVals.kcal, defaultSecondaryTargets, secondaryAdjustments),
            hydrationBase: targets.getHydrationBaseTargets(profile, hydrationDefaults, { hydration: 0 }),
            hydrationAdjusted: targets.getHydrationBaseTargets(profile, hydrationDefaults, { hydration: adjustments.hydration || 0 }),
            hydrationDefaults,
            defaultSecondaryTargets
        };
    };
    const getDayActivityLabel = (dayData) => {
        const gym = dayData && dayData.gym;
        return gym && gym.type === 'rest' ? 'Descanso' : (gym && Array.isArray(gym.exercises) && gym.exercises.length ? 'Gimnasio' : 'Sin actividad');
    };
    const getDayWalkInfo = (dayData) => (
        typeof ActivityStore !== 'undefined' && ActivityStore.getWalkInfo
            ? ActivityStore.getWalkInfo(dayData, { defaultStepsCfg: APP_STEPS_DEFAULTS })
            : { steps: 0, stepsPerMin: APP_STEPS_DEFAULTS.perMinute }
    );
    const getWeeklyGoalsModel = ({ profile, adjustments, formulas, targets, browserDomain, weeklyPlan, exercisesMap }) => {
        const dailyTargets = (
            typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.computeDailyTargets === 'function'
                ? TargetsApplicationService.computeDailyTargets({ targets, formulas, browserDomain, weeklyPlan, profile, adjustments, exercisesMap })
                : browserDomain.computeDailyTargets(targets, formulas, weeklyPlan, profile, adjustments, exercisesMap)
        ) || {};
        const defaultMacroRatios = browserDomain.getDefaultMacroRatios(formulas);
        const dailyMacroRatios = browserDomain.getDailyMacroRatios(targets, { formulas });
        const baseRest = formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * APP_REST_BMR_FACTOR;
        return {
            dailyTargets,
            weekRows: WEEK_DAYS.map((day, index) => {
                const dayData = Array.isArray(weeklyPlan) ? (weeklyPlan[index] || {}) : {};
                const macroRatios = dailyMacroRatios[index] || defaultMacroRatios;
                const rawValues = dailyTargets[day] || browserDomain.calcAdjustedValues(targets, formulas, baseRest, {
                    ...browserDomain.getMacroContext(targets, { formulas }),
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
                        : normalizeSecondary(browserDomain.calcSecondaryTargetsForKcal(targets, rawValues.kcal)))
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
