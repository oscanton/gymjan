const __formulasRoot = typeof globalThis !== 'undefined' ? globalThis : (typeof window !== 'undefined' ? window : this);
const FormulasEngine = (() => {
    let defaultMacroRatios = { p: 0.30, c: 0.40, f: 0.30 };
    const MEAL_KEYS = ['breakfast', 'lunch', 'dinner'];
    const NUTRITION_KEYS = ['kcal', 'protein', 'carbs', 'fat', 'saturatedFat', 'fiber', 'sugar'];
    const EMPTY_TOTALS = () => ({
        kcal: 0, protein: 0, carbs: 0, fat: 0, saturatedFat: 0, fiber: 0, sugar: 0,
        salt: 0, waterMl: 0, processingWeightedSum: 0, processingKcalBase: 0, processingAvg: 0
    });
    const number = (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    };
    const sumInto = (target, source, keys) => keys.forEach((key) => { target[key] += source[key] || 0; });

    const setDefaultMacroRatios = (ratios) => {
        const next = { p: number(ratios && ratios.p, NaN), c: number(ratios && ratios.c, NaN), f: number(ratios && ratios.f, NaN) };
        if (Number.isFinite(next.p) && Number.isFinite(next.c) && Number.isFinite(next.f)) defaultMacroRatios = next;
    };
    const getDefaultMacroRatios = () => ({ ...defaultMacroRatios });
    const calcBMI = (weight, height) => {
        const meters = height / 100;
        return meters > 0 ? (weight / (meters * meters)).toFixed(1) : 0;
    };
    const normalizeSex = (value = '') => {
        const token = String(value || '').trim().toLowerCase();
        if (token === 'hombre' || token === 'male') return 'male';
        if (token === 'mujer' || token === 'female') return 'female';
        return 'male';
    };
    const getBMICategory = (bmi) => {
        const value = parseFloat(bmi);
        if (value <= 0) return { code: 'invalid', className: 'text-muted' };
        if (value < 18.5) return { code: 'underweight', className: 'color-blue' };
        if (value < 25) return { code: 'normal', className: 'color-success' };
        if (value < 30) return { code: 'overweight', className: 'color-warning' };
        if (value < 35) return { code: 'obesity', className: 'color-danger' };
        return { code: 'severe_obesity', className: 'color-critical' };
    };
    const calcBMR = (weight, height, age, sex) => Math.round((10 * weight) + (6.25 * height) - (5 * age) + (normalizeSex(sex) === 'male' ? 5 : -161));
    const calcMacros = (kcal, macroContext, overrideDefaults = null) => {
        const source = macroContext && macroContext.macroRatios ? macroContext.macroRatios : macroContext || {};
        const ratios = ['p', 'c', 'f'].every((key) => typeof source[key] === 'number') ? source : (overrideDefaults || defaultMacroRatios);
        return {
            p: Math.round((kcal * ratios.p) / 4),
            c: Math.round((kcal * ratios.c) / 4),
            f: Math.round((kcal * ratios.f) / 9),
            pct: { p: Math.round(ratios.p * 100), c: Math.round(ratios.c * 100), f: Math.round(ratios.f * 100) }
        };
    };
    const resolveMealKeys = (mealKeys, fallback = null) => Array.isArray(mealKeys) && mealKeys.length ? mealKeys : Array.isArray(fallback) && fallback.length ? fallback : MEAL_KEYS;

    const calculateMealDetails = (items, foods) => {
        const totals = EMPTY_TOTALS();
        if (!Array.isArray(items)) return totals;
        const foodsData = foods || {};
        items.forEach((item) => {
            const food = foodsData[item.foodId];
            if (!food) return;
            const per100 = !!food.nutritionPer100;
            const nutrition = food.nutritionPer100 || food.nutritionPerUnit;
            const ratio = per100 ? number(item.amount) / 100 : number(item.amount);
            if (!nutrition || ratio <= 0) return;
            const itemKcal = number(nutrition.kcal) * ratio;
            NUTRITION_KEYS.forEach((key) => { totals[key] += number(nutrition[key]) * ratio; });
            totals.salt += (number(nutrition.sodiumMg) * ratio * 2.5) / 1000;
            totals.waterMl += number(per100 ? food.waterMlPer100 : food.waterMlPerUnit) * ratio;
            if (Number.isFinite(food.processed) && itemKcal > 0) {
                totals.processingWeightedSum += food.processed * itemKcal;
                totals.processingKcalBase += itemKcal;
            }
        });
        totals.processingAvg = totals.processingKcalBase ? totals.processingWeightedSum / totals.processingKcalBase : 0;
        return totals;
    };

    const calculateDayTotals = (dayData, foods, mealKeys = MEAL_KEYS) => {
        const totals = EMPTY_TOTALS();
        if (!dayData) return totals;
        const keys = dayData.hydration && !resolveMealKeys(mealKeys).includes('hydration') ? ['hydration', ...resolveMealKeys(mealKeys)] : resolveMealKeys(mealKeys);
        keys.forEach((mealKey) => sumInto(totals, calculateMealDetails(dayData[mealKey] ? dayData[mealKey].items : [], foods), Object.keys(totals)));
        totals.processingAvg = totals.processingKcalBase ? totals.processingWeightedSum / totals.processingKcalBase : 0;
        return totals;
    };

    const calculateMeal = (items, foods) => {
        const details = calculateMealDetails(items, foods);
        return { kcal: details.kcal, protein: details.protein, carbs: details.carbs, fat: details.fat };
    };

    const calculateShoppingTotals = (menuData, mealKeys = MEAL_KEYS) => {
        const totals = {};
        if (!Array.isArray(menuData)) return totals;
        menuData.forEach((day) => {
            const keys = day && day.hydration && !resolveMealKeys(mealKeys).includes('hydration') ? ['hydration', ...resolveMealKeys(mealKeys)] : resolveMealKeys(mealKeys);
            keys.forEach((mealKey) => (Array.isArray(day && day[mealKey] && day[mealKey].items) ? day[mealKey].items : []).forEach((item) => {
                if (!item || !item.foodId) return;
                totals[item.foodId] = (totals[item.foodId] || 0) + number(item.amount);
            }));
        });
        return totals;
    };

    return {
        setDefaultMacroRatios,
        getDefaultMacroRatios,
        calcBMI,
        getBMICategory,
        calcBMR,
        calcMacros,
        createEmptyNutritionTotals: EMPTY_TOTALS,
        calculateMealDetails,
        calculateDayTotals,
        calculateMeal,
        calculateShoppingTotals,
        resolveMealKeys
    };
})();

__formulasRoot.FormulasEngine = FormulasEngine;
if (typeof module !== 'undefined' && module.exports) module.exports = FormulasEngine;
