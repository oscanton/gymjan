const TargetsApplicationService = (() => {
    const SECONDARY_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];
    const isFiniteValue = (value) => Number.isFinite(parseFloat(value));
    const anyTarget = (dailyTargets, predicate) => Object.values(dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {}).some(predicate);
    const hasRequiredTargets = (dailyTargets, { needsSecondary = false, needsKcal = false, needsHydration = false } = {}) => {
        const current = dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {};
        if (!Object.keys(current).length) return false;
        if (needsSecondary && !anyTarget(current, (target) => target && SECONDARY_KEYS.every((key) => isFiniteValue(target[key])))) return false;
        if (needsKcal && !anyTarget(current, (target) => target && isFiniteValue(target.kcal))) return false;
        if (needsHydration && !anyTarget(current, (target) => target && isFiniteValue(target.hydrationMin) && isFiniteValue(target.hydrationMax))) return false;
        return true;
    };
    const computeDailyTargets = ({
        targets,
        formulas,
        browserDomain,
        weeklyPlan = null,
        profile = null,
        adjustments = null,
        exercisesMap = null,
        persist = true
    } = {}) => {
        if (!browserDomain || typeof browserDomain.computeDailyTargets !== 'function') return null;
        const dailyTargets = browserDomain.computeDailyTargets(targets, formulas, weeklyPlan, profile, adjustments, exercisesMap);
        if (dailyTargets && persist && typeof UserStore !== 'undefined' && typeof UserStore.saveDailyNutritionTargets === 'function') {
            UserStore.saveDailyNutritionTargets(dailyTargets);
        }
        return dailyTargets;
    };
    const ensureDailyTargets = ({
        targets,
        formulas,
        browserDomain,
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
        const cachedTargets = storedTargets || UserStore.getDailyNutritionTargets({});
        return hasRequiredTargets(cachedTargets, { needsSecondary, needsKcal, needsHydration })
            ? cachedTargets
            : (computeDailyTargets({ targets, formulas, browserDomain, weeklyPlan, profile, adjustments, exercisesMap, persist }) || cachedTargets || {});
    };
    return { hasRequiredTargets, computeDailyTargets, ensureDailyTargets };
})();

window.TargetsApplicationService = TargetsApplicationService;
