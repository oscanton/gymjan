const ActivityApplicationService = (() => {
    const TYPE_ORDER = ['fuerza', 'cardio', 'recuperacion', 'otros'];
    const FOCUS_ORDER = ['tren_superior', 'tren_inferior', 'core', 'full_body', 'movilidad', 'recuperacion', 'general'];
    const toNumber = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const getUserProfile = () => (typeof UserStore !== 'undefined' && typeof UserStore.getProfile === 'function') ? UserStore.getProfile({}) : {};
    const normalizePlanData = (planData, currentFile = null) => {
        if (typeof ActivityStore === 'undefined' || typeof ActivityStore.normalizeActivityData !== 'function') return planData;
        const normalized = ActivityStore.normalizeActivityData(planData);
        if (normalized && normalized !== planData && currentFile && typeof ActivityStore.savePlanData === 'function') ActivityStore.savePlanData(currentFile, normalized);
        return normalized;
    };
    const ensureTargets = ({ targets, formulas, browserDomain, weeklyPlan = null, exercisesMap = null }) => (
        typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function'
            ? (TargetsApplicationService.ensureDailyTargets({ targets, formulas, browserDomain, weeklyPlan, exercisesMap, needsKcal: true }) || {})
            : ((browserDomain && typeof browserDomain.ensureDailyTargets === 'function') ? (browserDomain.ensureDailyTargets(targets, formulas, { needsKcal: true }) || {}) : {})
    );
    const getWalkingExercise = ({ exercisesMap = null, defaultStepsCfg = null } = {}) => {
        const exercises = exercisesMap || {};
        const defaults = defaultStepsCfg || APP_STEPS_DEFAULTS || { perMinute: 100, met: 3.5 };
        return exercises.caminar || {
            id: 'caminar',
            name: 'Caminar',
            type: 'cardio',
            focus: 'full_body',
            muscles: 'piernas, core',
            equipment: 'ninguno',
            cadenceBase: defaults.perMinute,
            met: defaults.met,
            description: 'Actividad base de baja intensidad.',
            technique: 'Actividad diaria basada en pasos.'
        };
    };
    const getWalkInfo = (dayData, { defaultStepsCfg = null, walkingExercise = null } = {}) => (
        typeof ActivityStore !== 'undefined' && typeof ActivityStore.getWalkInfo === 'function'
            ? ActivityStore.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise })
            : { steps: 0, stepsPerMin: toNumber(defaultStepsCfg && defaultStepsCfg.perMinute, 100), secPerRep: 0, cadenceBase: toNumber(defaultStepsCfg && defaultStepsCfg.perMinute, 100) }
    );
    const buildExerciseView = ({ item, exerciseDefinition, weightKg = null } = {}) => {
        const exercise = exerciseDefinition || null;
        if (!item || !exercise) return null;
        const isTimeBased = ActivityEngine.isTimedItem(item);
        const numericWeight = toNumber(item.weightKg, NaN);
        const canEditWeight = exercise.type === 'fuerza' && !isTimeBased;
        const repsAvg = ActivityEngine.parseReps(item.reps);
        const intensityFactor = canEditWeight && repsAvg > 0
            ? ActivityEngine.getIntensityFactorFromEpley(item.weightKg, repsAvg, { bodyWeightKg: weightKg, relativeLoad: exercise.relativeLoad })
            : 0;
        return {
            item,
            definition: exercise,
            exerciseId: item.exerciseId,
            isTimeBased,
            numericWeight,
            showWeight: canEditWeight && Number.isFinite(numericWeight) && numericWeight > 0,
            canEditWeight,
            effectiveSecPerRep: isTimeBased ? toNumber(item.secPerRep) : 0,
            setsDisplay: Math.round(toNumber(item.sets)),
            repetitionsDisplay: isTimeBased
                ? ((toNumber(item.sets) > 0 && toNumber(item.secPerRep) > 0) ? `${Math.round(toNumber(item.sets))} x ${Math.round(toNumber(item.secPerRep))}s` : '-')
                : ((item.sets && item.reps) ? `${item.sets} x ${item.reps}` : '-'),
            kcal: ActivityEngine.calculateExerciseKcal(item, exercise, { weightKg, bodyWeightKg: weightKg }),
            estimatedMin: ActivityEngine.estimateExerciseMinutes(item, exercise),
            met: toNumber(exercise.met, NaN),
            showMet: Number.isFinite(toNumber(exercise.met, NaN)) && toNumber(exercise.met, NaN) > 0,
            repsAvg,
            intensityFactor,
            showIntensity: Number.isFinite(intensityFactor) && intensityFactor > 0 && canEditWeight,
            exerciseRest: Number.isFinite(toNumber(exercise.restSec, NaN)) ? exercise.restSec : ''
        };
    };
    const groupExerciseViews = (items = []) => {
        const groups = new Map();
        items.forEach((item) => {
            if (!item || !item.definition) return;
            const type = item.definition.type || 'otros';
            const focus = item.definition.focus || 'general';
            const key = `${type}__${focus}`;
            if (!groups.has(key)) groups.set(key, { type, focus, items: [] });
            groups.get(key).items.push(item);
        });
        const order = (value, list) => (list.indexOf(value) === -1 ? 999 : list.indexOf(value));
        return Array.from(groups.values()).sort((a, b) => {
            const typeDelta = order(a.type, TYPE_ORDER) - order(b.type, TYPE_ORDER);
            return typeDelta || (order(a.focus, FOCUS_ORDER) - order(b.focus, FOCUS_ORDER)) || String(a.focus).localeCompare(String(b.focus));
        });
    };
    const buildSectionView = ({ sectionKey, sectionData, exercisesMap, weightKg } = {}) => {
        const section = sectionData && typeof sectionData === 'object' ? sectionData : null;
        const items = section && section.type !== 'rest' && Array.isArray(section.exercises)
            ? section.exercises.map((item) => buildExerciseView({ item, exerciseDefinition: exercisesMap ? exercisesMap[item.exerciseId] : null, weightKg })).filter(Boolean)
            : [];
        return { key: sectionKey, isRest: !!(section && section.type === 'rest'), description: section ? (section.description || '') : '', items, groups: groupExerciseViews(items) };
    };
    const buildDayView = ({
        dayData,
        dayIndex = 0,
        dailyTargets = null,
        exercisesMap = null,
        defaultStepsCfg = null,
        walkingExercise = null,
        activityScoreEngine = null
    } = {}) => {
        const safeDay = dayData || {};
        const profile = getUserProfile();
        const weightKg = toNumber(profile.weight, 70);
        const heightCm = toNumber(profile.height, 0);
        const walker = walkingExercise || getWalkingExercise({ exercisesMap, defaultStepsCfg });
        const walkInfo = getWalkInfo(safeDay, { defaultStepsCfg, walkingExercise: walker });
        const baseCadence = walkInfo.cadenceBase || toNumber(walker.cadenceBase, toNumber(defaultStepsCfg && defaultStepsCfg.perMinute, 100));
        const stepsConfig = { stepsPerMin: walkInfo.stepsPerMin, baseStepsPerMin: baseCadence, met: walker.met || toNumber(defaultStepsCfg && defaultStepsCfg.met, 3.5) };
        const stepsKcal = ActivityEngine.calculateStepsKcal(walkInfo.steps, { weightKg, stepsConfig });
        const stepsMinutes = walkInfo.stepsPerMin > 0 ? walkInfo.steps / walkInfo.stepsPerMin : 0;
        const stepsIntensityFactor = ActivityEngine.calculateStepsIntensityFactor(walkInfo.stepsPerMin, { baseStepsPerMin: stepsConfig.baseStepsPerMin, a: 1, b: 2 });
        const stepsMet = toNumber(walker.met, 0) * stepsIntensityFactor;
        const sections = {
            gym: buildSectionView({ sectionKey: 'gym', sectionData: safeDay.gym, exercisesMap, weightKg }),
            extra_activity: buildSectionView({ sectionKey: 'extra_activity', sectionData: safeDay.extra_activity, exercisesMap, weightKg })
        };
        const combinedItems = [...sections.gym.items, ...sections.extra_activity.items].map((entry) => entry.item);
        const trainingTotals = ActivityEngine.calculateTrainingTotals({ exercises: combinedItems }, null, exercisesMap || {}, { weightKg, bodyWeightKg: weightKg });
        const totalMinutes = trainingTotals.min + stepsMinutes;
        const dayTargets = DayContracts.buildDayTargets({
            day: safeDay.day || WEEK_DAYS[dayIndex] || '',
            target: (dailyTargets && (dailyTargets[safeDay.day] || dailyTargets[WEEK_DAYS[dayIndex]])) || {}
        });
        const dayConsumption = DayContracts.buildDayConsumption({
            day: dayTargets.day,
            consumption: {
                totalKcal: trainingTotals.kcal + stepsKcal,
                trainingKcal: trainingTotals.kcal,
                stepsKcal,
                totalMinutes,
                trainingMinutes: trainingTotals.min,
                stepsMinutes,
                metAvg: totalMinutes > 0 ? (((trainingTotals.metMinSum || 0) + (stepsMet * stepsMinutes)) / totalMinutes) : 0,
                intensityAvg: trainingTotals.intensityAvg || 0
            }
        });
        return {
            day: dayTargets.day,
            dayData: safeDay,
            walkInfo,
            walkingExercise: walker,
            movement: {
                steps: walkInfo.steps,
                stepsPerMin: walkInfo.stepsPerMin,
                stepsKcal,
                totalMin: stepsMinutes,
                distanceKm: ActivityEngine.calculateStepsDistanceKm(walkInfo.steps, { heightCm }),
                stepsIntensityFactor,
                stepsMet,
                description: safeDay.walk && safeDay.walk.description ? safeDay.walk.description : ''
            },
            sections,
            totals: {
                totalKcal: dayConsumption.totalKcal,
                trainingKcal: dayConsumption.trainingKcal,
                stepsKcal: dayConsumption.stepsKcal,
                totalMinutes: dayConsumption.totalMinutes,
                trainingMinutes: dayConsumption.trainingMinutes,
                stepsMinutes: dayConsumption.stepsMinutes,
                metAvg: dayConsumption.metAvg,
                intensityAvg: dayConsumption.intensityAvg
            },
            dayTargets,
            dayConsumption,
            dayAssessment: DayAssessmentEngine.createDayAssessment({ dayTargets, dayConsumption, activityScoreEngine })
        };
    };
    const getActivityPageModel = ({
        planData,
        currentFile = null,
        exercisesMap = null,
        defaultStepsCfg = null,
        targets = null,
        formulas = null,
        activityScoreEngine = null,
        browserDomain = null
    } = {}) => {
        const normalizedPlanData = normalizePlanData(planData, currentFile);
        const dailyTargets = ensureTargets({ targets, formulas, browserDomain, weeklyPlan: normalizedPlanData, exercisesMap });
        const walkingExercise = getWalkingExercise({ exercisesMap, defaultStepsCfg });
        return {
            planData: normalizedPlanData,
            dailyTargets,
            walkingExercise,
            days: Array.isArray(normalizedPlanData)
                ? normalizedPlanData.map((dayData, index) => buildDayView({ dayData, dayIndex: index, dailyTargets, exercisesMap, defaultStepsCfg, walkingExercise, activityScoreEngine }))
                : []
        };
    };
    return { getWalkingExercise, getWalkInfo, buildExerciseView, getActivityPageModel };
})();

window.ActivityApplicationService = ActivityApplicationService;
