const MenuApplicationService = (() => {
    const normalizeMenuData = (menuData, currentFile = null) => {
        if (typeof MenuStore === 'undefined' || typeof MenuStore.normalizeMenuData !== 'function') return menuData;
        const normalized = MenuStore.normalizeMenuData(menuData);
        if (normalized && normalized !== menuData && currentFile && typeof MenuStore.saveMenuData === 'function') MenuStore.saveMenuData(currentFile, normalized);
        return normalized;
    };
    const getHydrationDirectMl = (dayData, foods, formulas) => {
        if (!formulas || typeof formulas.calculateMealDetails !== 'function') return 0;
        const items = dayData && dayData.hydration && Array.isArray(dayData.hydration.items) ? dayData.hydration.items : [];
        const totals = formulas.calculateMealDetails(items, foods || {});
        return Number.isFinite(parseFloat(totals.waterMl)) ? parseFloat(totals.waterMl) : 0;
    };
    const ensureTargets = ({ targets, formulas, browserDomain, weeklyPlan = null, exercisesMap = null }) => (
        typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function'
            ? (TargetsApplicationService.ensureDailyTargets({ targets, formulas, browserDomain, weeklyPlan, exercisesMap, needsSecondary: true, needsHydration: true }) || {})
            : ((browserDomain && typeof browserDomain.ensureDailyTargets === 'function')
                ? (browserDomain.ensureDailyTargets(targets, formulas, { needsSecondary: true, needsHydration: true }) || {})
                : {})
    );
    const buildDayView = ({ dayData, dailyTargets, foods, mealKeys, formulas, nutritionScore } = {}) => {
        const safeDay = dayData || {};
        const dayTargets = DayContracts.buildDayTargets({ day: safeDay.day || '', target: dailyTargets && safeDay.day ? (dailyTargets[safeDay.day] || {}) : {} });
        const totals = formulas && typeof formulas.calculateDayTotals === 'function' ? formulas.calculateDayTotals(safeDay, foods || {}, mealKeys) : {};
        const dayIntake = DayContracts.buildDayIntake({ day: safeDay.day || '', totals, hydrationDirectMl: getHydrationDirectMl(safeDay, foods, formulas) });
        return {
            day: safeDay.day || '',
            dayData: safeDay,
            dayTargets,
            dayIntake,
            dayAssessment: DayAssessmentEngine.createDayAssessment({ dayTargets, dayIntake, nutritionScoreEngine: nutritionScore })
        };
    };
    const getMenuPageModel = ({
        menuData,
        currentFile = null,
        foods = null,
        mealKeys = null,
        formulas = null,
        targets = null,
        nutritionScore = null,
        browserDomain = null,
        weeklyPlan = null,
        exercisesMap = null
    } = {}) => {
        const normalizedMenuData = normalizeMenuData(menuData, currentFile);
        const dailyTargets = ensureTargets({ targets, formulas, browserDomain, weeklyPlan, exercisesMap });
        return {
            menuData: normalizedMenuData,
            dailyTargets,
            days: Array.isArray(normalizedMenuData) ? normalizedMenuData.map((dayData) => buildDayView({ dayData, dailyTargets, foods, mealKeys, formulas, nutritionScore })) : []
        };
    };
    const getDayView = (options = {}) => buildDayView(options);
    return { getMenuPageModel, getDayView };
})();

window.MenuApplicationService = MenuApplicationService;
