const MenuApplicationService = (() => {
    const resolvePersistenceApi = () => (
        typeof PersistenceAdapter !== 'undefined' ? PersistenceAdapter : null
    );
    const normalizeDayKey = (value) => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.normalizeDayKey === 'function'
            ? DateUtils.normalizeDayKey(value)
            : String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z]/g, '')
    );
    const resolveDailyTarget = (dailyTargets = null, day = '') => {
        const targets = dailyTargets && typeof dailyTargets === 'object' ? dailyTargets : {};
        if (day && targets[day]) return targets[day] || {};
        const normalizedDay = normalizeDayKey(day);
        if (!normalizedDay) return {};
        const match = Object.entries(targets).find(([key]) => normalizeDayKey(key) === normalizedDay);
        return match ? (match[1] || {}) : {};
    };
    const getFallbackFile = (availableMenus = []) => (
        Array.isArray(availableMenus) && availableMenus.length ? availableMenus[0].file : null
    );
    const getSelectedMenuFile = ({ availableMenus = [], selectedFile = null } = {}) => {
        const fallbackFile = getFallbackFile(availableMenus);
        const persistence = resolvePersistenceApi();
        const storedFile = selectedFile || persistence?.getSelectedMenuFile() || fallbackFile;
        const isValid = !Array.isArray(availableMenus) || !availableMenus.length || availableMenus.some((option) => option.file === storedFile);
        const resolvedFile = isValid ? storedFile : fallbackFile;
        if (resolvedFile) persistence?.setSelectedMenuFile(resolvedFile);
        return resolvedFile;
    };
    const setSelectedMenuFile = ({ file = null, availableMenus = [] } = {}) => getSelectedMenuFile({ availableMenus, selectedFile: file });
    const normalizeMenuData = (menuData, currentFile = null) => {
        const persistence = resolvePersistenceApi();
        const normalized = persistence?.normalizeMenuData(menuData) || menuData;
        if (normalized && normalized !== menuData && currentFile) persistence?.saveMenuData(currentFile, normalized);
        return normalized;
    };
    const persistMenuData = ({ currentFile = null, menuData = null } = {}) => {
        const persistence = resolvePersistenceApi();
        const normalized = normalizeMenuData(menuData, null);
        if (currentFile) persistence?.saveMenuData(currentFile, normalized);
        return normalized;
    };
    const clearSavedMenuData = ({ currentFile = null } = {}) => {
        if (currentFile) resolvePersistenceApi()?.clearMenuData(currentFile);
    };
    const getDefaultAmountForFood = (food) => (
        !food ? 0 : (food.nutritionPerUnit ? (food.unit === 'ml' ? 250 : 1) : 100)
    );
    const getMealData = (menuData, dayIndex, mealKey) => (
        Array.isArray(menuData) && menuData[dayIndex] && menuData[dayIndex][mealKey] && Array.isArray(menuData[dayIndex][mealKey].items)
            ? menuData[dayIndex][mealKey]
            : null
    );
    const getMealNutrition = ({ mealKey = '', mealData = null, foods = null, formulas = null } = {}) => (
        mealKey === 'hydration' || !formulas || typeof formulas.calculateMeal !== 'function'
            ? { kcal: 0, protein: 0, carbs: 0, fat: 0 }
            : formulas.calculateMeal((mealData && mealData.items) || [], foods || {})
    );
    const addMealItem = ({
        currentFile = null,
        menuData = null,
        dayIndex = -1,
        mealKey = '',
        foodId = '',
        amount = null,
        foods = null,
        persist = true
    } = {}) => {
        const mealData = getMealData(menuData, dayIndex, mealKey);
        if (!mealData || !foodId) return menuData;
        const food = foods && foods[foodId] ? foods[foodId] : null;
        const parsedAmount = parseFloat(amount);
        mealData.items.push({
            foodId,
            amount: Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : getDefaultAmountForFood(food)
        });
        return persist ? persistMenuData({ currentFile, menuData }) : menuData;
    };
    const removeMealItem = ({
        currentFile = null,
        menuData = null,
        dayIndex = -1,
        mealKey = '',
        itemIndex = -1,
        persist = true
    } = {}) => {
        const mealData = getMealData(menuData, dayIndex, mealKey);
        if (!mealData || itemIndex < 0 || itemIndex >= mealData.items.length) return menuData;
        mealData.items.splice(itemIndex, 1);
        return persist ? persistMenuData({ currentFile, menuData }) : menuData;
    };
    const updateMealItemAmount = ({
        currentFile = null,
        menuData = null,
        dayIndex = -1,
        mealKey = '',
        itemIndex = -1,
        amount = null,
        persist = true
    } = {}) => {
        const mealData = getMealData(menuData, dayIndex, mealKey);
        if (!mealData || itemIndex < 0 || itemIndex >= mealData.items.length) return menuData;
        mealData.items[itemIndex].amount = parseFloat(amount) || 0;
        return persist ? persistMenuData({ currentFile, menuData }) : menuData;
    };
    const replaceMealItemFood = ({
        currentFile = null,
        menuData = null,
        dayIndex = -1,
        mealKey = '',
        itemIndex = -1,
        foodId = '',
        foods = null,
        persist = true
    } = {}) => {
        const mealData = getMealData(menuData, dayIndex, mealKey);
        if (!mealData || itemIndex < 0 || itemIndex >= mealData.items.length || !foodId) return menuData;
        const item = mealData.items[itemIndex];
        if (!item || item.foodId === foodId) return menuData;
        const prevFood = foods && foods[item.foodId] ? foods[item.foodId] : null;
        const nextFood = foods && foods[foodId] ? foods[foodId] : null;
        item.foodId = foodId;
        if (nextFood && ((!prevFood || prevFood.unit !== nextFood.unit) || !Number.isFinite(parseFloat(item.amount)))) {
            item.amount = getDefaultAmountForFood(nextFood);
        }
        return persist ? persistMenuData({ currentFile, menuData }) : menuData;
    };
    const getHydrationDirectMl = (dayData, foods, formulas) => {
        if (!formulas || typeof formulas.calculateMealDetails !== 'function') return 0;
        const items = dayData && dayData.hydration && Array.isArray(dayData.hydration.items) ? dayData.hydration.items : [];
        const totals = formulas.calculateMealDetails(items, foods || {});
        return Number.isFinite(parseFloat(totals.waterMl)) ? parseFloat(totals.waterMl) : 0;
    };
    const ensureTargets = ({ targets, formulas, weeklyPlan = null, exercisesMap = null }) => (
        typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function'
            ? (TargetsApplicationService.ensureDailyTargets({ targets, formulas, weeklyPlan, exercisesMap, needsSecondary: true, needsHydration: true }) || {})
            : {}
    );
    const createNutritionAssessment = ({ dayTargets = null, dayIntake = null, nutritionScoreEngine = null } = {}) => (
        typeof AssessmentApplicationService !== 'undefined' && typeof AssessmentApplicationService.createNutritionAssessment === 'function'
            ? AssessmentApplicationService.createNutritionAssessment({ dayTargets, dayIntake, nutritionScoreEngine })
            : DayAssessmentEngine.createDayAssessment({ dayTargets, dayIntake, nutritionScoreEngine })
    );
    const buildDayView = ({ dayData, dailyTargets, foods, mealKeys, formulas, nutritionScore } = {}) => {
        const safeDay = dayData || {};
        const dayTargets = DayContracts.buildDayTargets({ day: safeDay.day || '', target: resolveDailyTarget(dailyTargets, safeDay.day || '') });
        const totals = formulas && typeof formulas.calculateDayTotals === 'function' ? formulas.calculateDayTotals(safeDay, foods || {}, mealKeys) : {};
        const dayIntake = DayContracts.buildDayIntake({ day: safeDay.day || '', totals, hydrationDirectMl: getHydrationDirectMl(safeDay, foods, formulas) });
        return {
            day: safeDay.day || '',
            dayData: safeDay,
            dayTargets,
            dayIntake,
            dayAssessment: createNutritionAssessment({ dayTargets, dayIntake, nutritionScoreEngine: nutritionScore })
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
        weeklyPlan = null,
        exercisesMap = null
    } = {}) => {
        const normalizedMenuData = normalizeMenuData(menuData, currentFile);
        const dailyTargets = ensureTargets({ targets, formulas, weeklyPlan, exercisesMap });
        return {
            menuData: normalizedMenuData,
            dailyTargets,
            days: Array.isArray(normalizedMenuData) ? normalizedMenuData.map((dayData) => buildDayView({ dayData, dailyTargets, foods, mealKeys, formulas, nutritionScore })) : []
        };
    };
    const getDayView = (options = {}) => buildDayView(options);
    return {
        getSelectedMenuFile,
        setSelectedMenuFile,
        persistMenuData,
        clearSavedMenuData,
        getDefaultAmountForFood,
        getMealNutrition,
        addMealItem,
        removeMealItem,
        updateMealItemAmount,
        replaceMealItemFood,
        getMenuPageModel,
        getDayView
    };
})();

window.MenuApplicationService = MenuApplicationService;
