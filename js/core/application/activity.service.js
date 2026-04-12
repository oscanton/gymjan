const ActivityApplicationService = (() => {
    const TYPE_ORDER = ['strength', 'cardio', 'recovery', 'other'];
    const FOCUS_ORDER = ['upper_body', 'lower_body', 'core', 'full_body', 'mobility', 'recovery', 'general'];
    const DEFAULT_STEPS = { target: 8000, perMinute: 100, met: 3.5 };
    const WALK_EXERCISE_ID = 'walk';
    const JOINT_MOBILITY_EXERCISE_ID = 'joint_mobility';
    const TYPE_ALIASES = {
        strength: ['strength', 'fuerza'],
        cardio: ['cardio'],
        recovery: ['recovery', 'recuperacion'],
        other: ['other', 'otros']
    };
    const FOCUS_ALIASES = {
        upper_body: ['upper_body', 'tren_superior'],
        lower_body: ['lower_body', 'tren_inferior'],
        core: ['core'],
        full_body: ['full_body'],
        mobility: ['mobility', 'movilidad'],
        recovery: ['recovery', 'recuperacion'],
        general: ['general']
    };
    const EXERCISE_ID_ALIASES = {
        [WALK_EXERCISE_ID]: [WALK_EXERCISE_ID, 'caminar'],
        [JOINT_MOBILITY_EXERCISE_ID]: [JOINT_MOBILITY_EXERCISE_ID, 'movilidad_articular']
    };
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const normalizeToken = (value = '') => String(value || '').trim().toLowerCase();
    const normalizeAlias = (value, aliases = {}, fallback = '') => {
        const token = normalizeToken(value);
        const match = Object.entries(aliases).find(([, values]) => values.includes(token));
        return match ? match[0] : (fallback || token);
    };
    const normalizeExerciseType = (value = '') => normalizeAlias(value, TYPE_ALIASES, 'other');
    const normalizeExerciseFocus = (value = '') => normalizeAlias(value, FOCUS_ALIASES, 'general');
    const normalizeExerciseId = (value = '') => normalizeAlias(value, EXERCISE_ID_ALIASES, String(value || '').trim());
    const matchesExerciseId = (value = '', canonicalId = '') => normalizeExerciseId(value) === canonicalId;
    const findExerciseEntry = (exercisesMap = null, canonicalId = '') => {
        const aliases = EXERCISE_ID_ALIASES[canonicalId] || [canonicalId];
        return aliases.map((id) => exercisesMap?.[id] || null).find(Boolean) || null;
    };
    const resolveExerciseId = (canonicalId = '', exercisesMap = null) => findExerciseEntry(exercisesMap, canonicalId)?.id || canonicalId;
    const normalizeExerciseDefinition = (exercise = null) => !exercise ? null : ({
        ...exercise,
        canonicalId: normalizeExerciseId(exercise.id || ''),
        type: normalizeExerciseType(exercise.type),
        focus: normalizeExerciseFocus(exercise.focus)
    });
    const normalizeDayKey = (value) => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.normalizeDayKey === 'function'
            ? DateUtils.normalizeDayKey(value)
            : String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
    );
    const getWeekDayName = (index) => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.getWeekDayKey === 'function'
            ? DateUtils.getWeekDayKey(index)
            : (typeof WEEK_DAYS !== 'undefined' ? WEEK_DAYS[index] || '' : '')
    );
    const getFallbackFile = (availableFiles = []) => Array.isArray(availableFiles) && availableFiles.length ? availableFiles[0].file : null;
    const getSafePlan = (planData) => Array.isArray(planData) ? planData : [];
    const getStepsDefaults = (defaultStepsCfg = null) => defaultStepsCfg || APP_STEPS_DEFAULTS || DEFAULT_STEPS;
    const toNumber = (value, fallback = 0) => Number.isFinite(parseFloat(value)) ? parseFloat(value) : fallback;
    const getUserProfile = () => (
        typeof ProfileApplicationService !== 'undefined' && typeof ProfileApplicationService.getProfile === 'function'
            ? ProfileApplicationService.getProfile({})
            : (resolvePersistenceApi()?.getProfile({}) || {})
    );
    const persistIfNeeded = ({ currentFile = null, planData = null, persist = true } = {}) => (persist ? persistPlanData({ currentFile, planData }) : planData);
    const getSectionItems = (dayData, sectionKey) => (dayData && dayData[sectionKey] && Array.isArray(dayData[sectionKey].exercises) ? dayData[sectionKey].exercises : null);
    const getExerciseItem = (planData, dayIndex, sectionKey, exerciseId) => {
        const items = getSectionItems(getSafePlan(planData)[dayIndex], sectionKey);
        return items && items.find((item) => item && item.exerciseId === exerciseId);
    };
    const ensureDayData = (planData, dayIndex) => {
        const safePlan = getSafePlan(planData);
        if (!safePlan[dayIndex]) safePlan[dayIndex] = { day: getWeekDayName(dayIndex) };
        return safePlan[dayIndex];
    };
    const ensureSectionData = (dayData, sectionKey) => {
        if (!dayData[sectionKey] || dayData[sectionKey].type === 'rest') {
            dayData[sectionKey] = { exercises: [], description: dayData[sectionKey] ? (dayData[sectionKey].description || '') : '' };
        }
        if (!Array.isArray(dayData[sectionKey].exercises)) dayData[sectionKey].exercises = [];
        return dayData[sectionKey];
    };
    const resolveDailyTarget = (dailyTargets = null, day = '', fallbackDay = '') => {
        const targets = dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {};
        if (day && targets[day]) return targets[day];
        if (fallbackDay && targets[fallbackDay]) return targets[fallbackDay];
        const normalizedCandidates = [day, fallbackDay].map(normalizeDayKey).filter(Boolean);
        const match = Object.entries(targets).find(([key]) => normalizedCandidates.includes(normalizeDayKey(key)));
        return match ? (match[1] || {}) : {};
    };
    const getSelectedPlanFile = ({ availableFiles = [], selectedFile = null } = {}) => {
        const fallbackFile = getFallbackFile(availableFiles);
        const persistence = resolvePersistenceApi();
        const storedFile = selectedFile || persistence?.getSelectedActivityFile() || fallbackFile;
        const isValid = !Array.isArray(availableFiles) || !availableFiles.length || availableFiles.some((option) => option.file === storedFile);
        const resolvedFile = isValid ? storedFile : fallbackFile;
        if (resolvedFile) persistence?.setSelectedActivityFile(resolvedFile);
        return resolvedFile;
    };
    const setSelectedPlanFile = ({ file = null, availableFiles = [] } = {}) => getSelectedPlanFile({ availableFiles, selectedFile: file });
    const normalizePlanData = (planData, currentFile = null) => {
        const persistence = resolvePersistenceApi();
        const normalized = persistence?.normalizeActivityPlan(planData) || planData;
        if (normalized && normalized !== planData && currentFile) persistence?.saveActivityPlan(currentFile, normalized);
        return normalized;
    };
    const persistPlanData = ({ currentFile = null, planData = null } = {}) => {
        const persistence = resolvePersistenceApi();
        const normalized = normalizePlanData(planData, null);
        if (currentFile) persistence?.saveActivityPlan(currentFile, normalized);
        return normalized;
    };
    const clearSavedPlanData = ({ currentFile = null } = {}) => {
        if (currentFile) resolvePersistenceApi()?.clearActivityPlan(currentFile);
    };
    const ensureTargets = ({ targets, formulas, weeklyPlan = null, exercisesMap = null }) => (
        typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function'
            ? (TargetsApplicationService.ensureDailyTargets({ targets, formulas, weeklyPlan, exercisesMap, needsKcal: true }) || {})
            : {}
    );
    const createActivityAssessment = ({ dayTargets = null, dayConsumption = null, activityScoreEngine = null } = {}) => (
        typeof AssessmentApplicationService !== 'undefined' && typeof AssessmentApplicationService.createActivityAssessment === 'function'
            ? AssessmentApplicationService.createActivityAssessment({ dayTargets, dayConsumption, activityScoreEngine })
            : DayAssessmentEngine.createDayAssessment({ dayTargets, dayConsumption, activityScoreEngine })
    );
    const getWalkingExercise = ({ exercisesMap = null, defaultStepsCfg = null } = {}) => {
        const exercise = normalizeExerciseDefinition(findExerciseEntry(exercisesMap || {}, WALK_EXERCISE_ID));
        const defaults = getStepsDefaults(defaultStepsCfg);
        return exercise || {
            id: WALK_EXERCISE_ID,
            canonicalId: WALK_EXERCISE_ID,
            name: '',
            type: 'cardio',
            focus: 'full_body',
            muscles: 'piernas, core',
            equipment: 'ninguno',
            cadenceBase: defaults.perMinute,
            met: defaults.met,
            description: '',
            technique: ''
        };
    };
    const getWalkInfo = (dayData, { defaultStepsCfg = null, walkingExercise = null } = {}) => {
        const defaults = getStepsDefaults(defaultStepsCfg);
        const cadenceBase = toNumber(walkingExercise?.cadenceBase, toNumber(defaults.perMinute, 100));
        const walkItem = Array.isArray(dayData?.walk?.exercises)
            ? (dayData.walk.exercises.find((entry) => matchesExerciseId(entry?.exerciseId, WALK_EXERCISE_ID)) || dayData.walk.exercises[0])
            : null;
        const stepsPerMin = toNumber(walkItem?.stepsPerMin, cadenceBase);
        const secPerRep = toNumber(walkItem?.secPerRep, NaN);
        const safeSec = Number.isFinite(secPerRep) && secPerRep > 0 ? secPerRep : Math.round((toNumber(defaults.target, 8000) / stepsPerMin) * 60);
        return { steps: Math.max(0, Math.round((safeSec / 60) * stepsPerMin)), stepsPerMin, secPerRep: safeSec, cadenceBase };
    };
    const ensureWalkItem = (dayData, { defaultStepsCfg = null } = {}) => {
        if (!dayData) return null;
        const defaults = getStepsDefaults(defaultStepsCfg);
        const walk = ensureSectionData(dayData, 'walk');
        let item = walk.exercises.find((entry) => entry && matchesExerciseId(entry.exerciseId, WALK_EXERCISE_ID));
        if (!item) {
            item = { exerciseId: WALK_EXERCISE_ID, sets: 1, reps: 1, stepsPerMin: defaults.perMinute };
            walk.exercises.unshift(item);
        }
        return item;
    };
    const hasExtraActivity = (plan) => getSafePlan(plan).some((day) => (
        day && day.extra_activity && day.extra_activity.type !== 'rest'
        && Array.isArray(day.extra_activity.exercises) && day.extra_activity.exercises.length
    ));
    const getFirstExerciseByType = (exercisesMap, type) => (
        Object.values(exercisesMap || {}).find((entry) => entry && normalizeExerciseType(entry.type) === type) || null
    );
    const getDefaultExerciseId = ({ sectionKey = '', section = null, exerciseId = null, exercisesMap = null } = {}) => {
        const currentItems = getSectionItems({ [sectionKey]: section }, sectionKey) || [];
        if (exerciseId) return exerciseId;
        if (currentItems.length) return currentItems[0].exerciseId || null;
        const exercises = exercisesMap || {};
        if (sectionKey === 'gym') return resolveExerciseId(JOINT_MOBILITY_EXERCISE_ID, exercises) || (getFirstExerciseByType(exercises, 'strength') || {}).id || null;
        if (sectionKey === 'extra_activity') return (getFirstExerciseByType(exercises, 'strength') || {}).id || resolveExerciseId(WALK_EXERCISE_ID, exercises) || null;
        return resolveExerciseId(JOINT_MOBILITY_EXERCISE_ID, exercises) || resolveExerciseId(WALK_EXERCISE_ID, exercises) || null;
    };
    const buildDefaultExercise = ({ section = null, sectionKey = '', exerciseId = null, exercisesMap = null } = {}) => {
        const baseId = getDefaultExerciseId({ sectionKey, section, exerciseId, exercisesMap });
        if (!baseId) return null;
        const exercise = normalizeExerciseDefinition((exercisesMap || {})[baseId] || findExerciseEntry(exercisesMap || {}, normalizeExerciseId(baseId)) || null);
        if (!exercise) return { exerciseId: baseId, sets: 3, reps: '10-12', secPerRep: 3 };
        return exercise.type === 'cardio'
            ? { exerciseId: baseId, sets: 1, reps: 1, secPerRep: 600 }
            : { exerciseId: baseId, sets: 3, reps: '10-12', weightKg: 0, secPerRep: 3 };
    };
    const updateWalkField = ({
        currentFile = null,
        planData = null,
        dayIndex = -1,
        field = '',
        value = null,
        defaultStepsCfg = null,
        walkingExercise = null,
        persist = true
    } = {}) => {
        const safePlan = getSafePlan(planData);
        const dayData = ensureDayData(safePlan, dayIndex);
        const item = ensureWalkItem(dayData, { defaultStepsCfg });
        const current = getWalkInfo(dayData, { defaultStepsCfg, walkingExercise });
        const stepsPerMin = field === 'stepsPerMin' ? toNumber(value, current.stepsPerMin) : toNumber(item.stepsPerMin, current.stepsPerMin);
        const steps = field === 'steps' ? (parseInt(value, 10) || current.steps) : current.steps;
        item.stepsPerMin = stepsPerMin;
        item.secPerRep = stepsPerMin > 0 ? Math.round((steps / stepsPerMin) * 60) : 0;
        return persistIfNeeded({ currentFile, planData: safePlan, persist });
    };
    const updateExerciseField = ({
        currentFile = null,
        planData = null,
        dayIndex = -1,
        sectionKey = '',
        exerciseId = '',
        field = '',
        value = null,
        persist = true
    } = {}) => {
        const safePlan = getSafePlan(planData);
        const item = getExerciseItem(safePlan, dayIndex, sectionKey, exerciseId);
        if (!item || !field) return safePlan;
        item[field] = field === 'reps' ? value : (Number.isNaN(parseFloat(value)) ? '' : parseFloat(value));
        return persistIfNeeded({ currentFile, planData: safePlan, persist });
    };
    const replaceExercise = ({
        currentFile = null,
        planData = null,
        dayIndex = -1,
        sectionKey = '',
        exerciseId = '',
        nextExerciseId = '',
        persist = true
    } = {}) => {
        const safePlan = getSafePlan(planData);
        const item = getExerciseItem(safePlan, dayIndex, sectionKey, exerciseId);
        if (!item || !nextExerciseId || item.exerciseId === nextExerciseId) return safePlan;
        item.exerciseId = nextExerciseId;
        return persistIfNeeded({ currentFile, planData: safePlan, persist });
    };
    const addExercise = ({
        currentFile = null,
        planData = null,
        dayIndex = -1,
        sectionKey = '',
        chosenId = null,
        exercisesMap = null,
        persist = true
    } = {}) => {
        const safePlan = getSafePlan(planData);
        const section = ensureSectionData(ensureDayData(safePlan, dayIndex), sectionKey);
        const item = buildDefaultExercise({ section, sectionKey, exerciseId: chosenId, exercisesMap });
        if (item) section.exercises.push(item);
        return persistIfNeeded({ currentFile, planData: safePlan, persist });
    };
    const removeExercise = ({
        currentFile = null,
        planData = null,
        dayIndex = -1,
        sectionKey = '',
        exerciseId = '',
        persist = true
    } = {}) => {
        const safePlan = getSafePlan(planData);
        const items = getSectionItems(safePlan[dayIndex], sectionKey);
        if (!items) return safePlan;
        safePlan[dayIndex][sectionKey].exercises = items.filter((item) => item && item.exerciseId !== exerciseId);
        return persistIfNeeded({ currentFile, planData: safePlan, persist });
    };
    const buildExerciseView = ({ item, exerciseDefinition, weightKg = null } = {}) => {
        const exercise = normalizeExerciseDefinition(exerciseDefinition || null);
        if (!item || !exercise) return null;
        const effectiveWeightKg = toNumber(weightKg, toNumber(getUserProfile().weight, 70));
        const isTimeBased = ActivityEngine.isTimedItem(item);
        const numericWeight = toNumber(item.weightKg, NaN);
        const canEditWeight = exercise.type === 'strength' && !isTimeBased;
        const repsAvg = ActivityEngine.parseReps(item.reps);
        const intensityFactor = canEditWeight && repsAvg > 0
            ? ActivityEngine.getIntensityFactorFromEpley(item.weightKg, repsAvg, { bodyWeightKg: effectiveWeightKg, relativeLoad: exercise.relativeLoad })
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
            kcal: ActivityEngine.calculateExerciseKcal(item, exercise, { weightKg: effectiveWeightKg, bodyWeightKg: effectiveWeightKg }),
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
            const type = normalizeExerciseType(item.definition.type || 'other');
            const focus = normalizeExerciseFocus(item.definition.focus || 'general');
            const key = `${type}__${focus}`;
            if (!groups.has(key)) groups.set(key, { type, focus, items: [] });
            groups.get(key).items.push(item);
        });
        const getOrder = (value, list) => (list.indexOf(value) === -1 ? 999 : list.indexOf(value));
        return Array.from(groups.values()).sort((a, b) => (
            (getOrder(a.type, TYPE_ORDER) - getOrder(b.type, TYPE_ORDER))
            || (getOrder(a.focus, FOCUS_ORDER) - getOrder(b.focus, FOCUS_ORDER))
            || String(a.focus).localeCompare(String(b.focus))
        ));
    };
    const buildSectionView = ({ sectionKey, sectionData, exercisesMap, weightKg } = {}) => {
        const section = sectionData && typeof sectionData === 'object' ? sectionData : null;
        const items = section && section.type !== 'rest' && Array.isArray(section.exercises)
            ? section.exercises.map((item) => buildExerciseView({
                item,
                exerciseDefinition: exercisesMap ? (exercisesMap[item.exerciseId] || findExerciseEntry(exercisesMap, normalizeExerciseId(item.exerciseId))) : null,
                weightKg
            })).filter(Boolean)
            : [];
        return {
            key: sectionKey,
            isRest: !!(section && section.type === 'rest'),
            description: section ? (section.description || '') : '',
            items,
            groups: groupExerciseViews(items)
        };
    };
    const buildMovementStats = ({ safeDay, walkInfo, walker, defaultStepsCfg, weightKg, heightCm } = {}) => {
        const defaults = getStepsDefaults(defaultStepsCfg);
        const baseStepsPerMin = walkInfo.cadenceBase || toNumber(walker.cadenceBase, toNumber(defaults.perMinute, 100));
        const stepsConfig = { stepsPerMin: walkInfo.stepsPerMin, baseStepsPerMin, met: walker.met || toNumber(defaults.met, 3.5) };
        const stepsKcal = ActivityEngine.calculateStepsKcal(walkInfo.steps, { weightKg, stepsConfig });
        const totalMin = walkInfo.stepsPerMin > 0 ? walkInfo.steps / walkInfo.stepsPerMin : 0;
        const stepsIntensityFactor = ActivityEngine.calculateStepsIntensityFactor(walkInfo.stepsPerMin, { baseStepsPerMin: stepsConfig.baseStepsPerMin, a: 1, b: 2 });
        const stepsMet = toNumber(walker.met, 0) * stepsIntensityFactor;
        return {
            steps: walkInfo.steps,
            stepsPerMin: walkInfo.stepsPerMin,
            stepsKcal,
            totalMin,
            distanceKm: ActivityEngine.calculateStepsDistanceKm(walkInfo.steps, { heightCm }),
            stepsIntensityFactor,
            stepsMet,
            description: safeDay.walk && safeDay.walk.description ? safeDay.walk.description : ''
        };
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
        const movement = buildMovementStats({ safeDay, walkInfo, walker, defaultStepsCfg, weightKg, heightCm });
        const sections = {
            gym: buildSectionView({ sectionKey: 'gym', sectionData: safeDay.gym, exercisesMap, weightKg }),
            extra_activity: buildSectionView({ sectionKey: 'extra_activity', sectionData: safeDay.extra_activity, exercisesMap, weightKg })
        };
        const combinedItems = [...sections.gym.items, ...sections.extra_activity.items].map((entry) => entry.item);
        const trainingTotals = ActivityEngine.calculateTrainingTotals({ exercises: combinedItems }, null, exercisesMap || {}, { weightKg, bodyWeightKg: weightKg });
        const totalMinutes = trainingTotals.min + movement.totalMin;
        const dayTargets = DayContracts.buildDayTargets({
            day: safeDay.day || getWeekDayName(dayIndex),
            target: resolveDailyTarget(dailyTargets, safeDay.day || '', getWeekDayName(dayIndex))
        });
        const dayConsumption = DayContracts.buildDayConsumption({
            day: dayTargets.day,
            consumption: {
                totalKcal: trainingTotals.kcal + movement.stepsKcal,
                trainingKcal: trainingTotals.kcal,
                stepsKcal: movement.stepsKcal,
                totalMinutes,
                trainingMinutes: trainingTotals.min,
                stepsMinutes: movement.totalMin,
                metAvg: totalMinutes > 0 ? (((trainingTotals.metMinSum || 0) + (movement.stepsMet * movement.totalMin)) / totalMinutes) : 0,
                intensityAvg: trainingTotals.intensityAvg || 0
            }
        });
        return {
            day: dayTargets.day,
            dayData: safeDay,
            walkInfo,
            walkingExercise: walker,
            movement,
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
            dayAssessment: createActivityAssessment({ dayTargets, dayConsumption, activityScoreEngine })
        };
    };
    const getActivityPageModel = ({
        planData,
        currentFile = null,
        exercisesMap = null,
        defaultStepsCfg = null,
        targets = null,
        formulas = null,
        activityScoreEngine = null
    } = {}) => {
        const normalizedPlanData = normalizePlanData(planData, currentFile);
        const dailyTargets = ensureTargets({ targets, formulas, weeklyPlan: normalizedPlanData, exercisesMap });
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
    return {
        getSelectedPlanFile,
        setSelectedPlanFile,
        persistPlanData,
        clearSavedPlanData,
        getWalkingExercise,
        getWalkInfo,
        hasExtraActivity,
        updateWalkField,
        updateExerciseField,
        replaceExercise,
        addExercise,
        removeExercise,
        getActivityPageModel
    };
})();

window.ActivityApplicationService = ActivityApplicationService;
