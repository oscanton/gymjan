/* =========================================
   core/engine/formulas.engine.js - PURE NUTRITION CALCULATIONS
   ========================================= */

const FormulasEngine = (() => {
    let defaultMacroRatios = { p: 0.30, c: 0.40, f: 0.30 };

    const setDefaultMacroRatios = (ratios) => {
        const p = parseFloat(ratios && ratios.p);
        const c = parseFloat(ratios && ratios.c);
        const f = parseFloat(ratios && ratios.f);
        if (Number.isFinite(p) && Number.isFinite(c) && Number.isFinite(f)) {
            defaultMacroRatios = { p, c, f };
        }
    };

    const getDefaultMacroRatios = () => ({ ...defaultMacroRatios });

    const calcBMI = (weight, height) => {
        const heightMeters = height / 100;
        return (heightMeters > 0) ? (weight / (heightMeters * heightMeters)).toFixed(1) : 0;
    };

    const getBMICategory = (bmi) => {
        const numericBmi = parseFloat(bmi);
        if (numericBmi <= 0) return { label: '-', className: 'text-muted' };
        if (numericBmi < 18.5) return { label: 'Bajo peso', className: 'color-blue' };
        if (numericBmi < 25) return { label: 'Adecuado', className: 'color-success' };
        if (numericBmi < 30) return { label: 'Sobrepeso', className: 'color-warning' };
        if (numericBmi < 35) return { label: 'Obesidad', className: 'color-danger' };
        return { label: 'Gran obesidad', className: 'color-critical' };
    };

    const calcBMR = (weight, height, age, sex) => {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (sex === 'hombre') ? 5 : -161;
        return Math.round(bmr);
    };

    const calcMacros = (kcal, macroContext, overrideDefaults = null) => {
        const ctx = macroContext || {};
        const explicitRatios = (ctx && ctx.macroRatios) ? ctx.macroRatios : ctx;
        const hasValidRatios = explicitRatios
            && typeof explicitRatios.p === 'number'
            && typeof explicitRatios.c === 'number'
            && typeof explicitRatios.f === 'number';
        const fallback = overrideDefaults || defaultMacroRatios;
        const macroRatios = hasValidRatios ? explicitRatios : fallback;
        return {
            p: Math.round((kcal * macroRatios.p) / 4),
            c: Math.round((kcal * macroRatios.c) / 4),
            f: Math.round((kcal * macroRatios.f) / 9),
            pct: { p: Math.round(macroRatios.p * 100), c: Math.round(macroRatios.c * 100), f: Math.round(macroRatios.f * 100) }
        };
    };

    const createEmptyNutritionTotals = () => ({
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        saturatedFat: 0,
        fiber: 0,
        sugar: 0,
        salt: 0,
        waterMl: 0,
        processingWeightedSum: 0,
        processingKcalBase: 0,
        processingAvg: 0
    });

    const resolveMealKeys = (mealKeys, fallback = null) => {
        if (Array.isArray(mealKeys) && mealKeys.length) return mealKeys;
        if (Array.isArray(fallback) && fallback.length) return fallback;
        return ['breakfast', 'lunch', 'dinner'];
    };

    const calculateMealDetails = (items, foods) => {
        const totals = createEmptyNutritionTotals();
        if (!items || !Array.isArray(items)) return totals;

        const foodsData = foods || {};

        items.forEach(item => {
            const food = foodsData[item.foodId];
            if (!food) return;

            let ratio = 0;
            let nutrition = null;
            if (food.nutritionPer100) {
                ratio = (parseFloat(item.amount) || 0) / 100;
                nutrition = food.nutritionPer100;
            } else if (food.nutritionPerUnit) {
                ratio = parseFloat(item.amount) || 0;
                nutrition = food.nutritionPerUnit;
            }
            if (!nutrition || ratio <= 0) return;

            const itemKcal = (nutrition.kcal || 0) * ratio;
            totals.kcal += itemKcal;
            totals.protein += (nutrition.protein || 0) * ratio;
            totals.carbs += (nutrition.carbs || 0) * ratio;
            totals.fat += (nutrition.fat || 0) * ratio;
            totals.saturatedFat += (nutrition.saturatedFat || 0) * ratio;
            totals.fiber += (nutrition.fiber || 0) * ratio;
            totals.sugar += (nutrition.sugar || 0) * ratio;
            totals.salt += ((nutrition.sodiumMg || 0) * ratio * 2.5) / 1000;
            if (food.waterMlPer100 && food.nutritionPer100) {
                totals.waterMl += (food.waterMlPer100 || 0) * ratio;
            } else if (food.waterMlPerUnit && food.nutritionPerUnit) {
                totals.waterMl += (food.waterMlPerUnit || 0) * ratio;
            }

            if (Number.isFinite(food.processed) && itemKcal > 0) {
                totals.processingWeightedSum += food.processed * itemKcal;
                totals.processingKcalBase += itemKcal;
            }
        });

        totals.processingAvg = totals.processingKcalBase
            ? (totals.processingWeightedSum / totals.processingKcalBase)
            : 0;

        return totals;
    };

    const calculateDayTotals = (dayData, foods, mealKeys = ['breakfast', 'lunch', 'dinner']) => {
        const safeMealKeys = resolveMealKeys(mealKeys);
        const dayTotals = createEmptyNutritionTotals();
        if (!dayData || !Array.isArray(safeMealKeys)) return dayTotals;

        const mealKeysWithHydration = (dayData.hydration && !safeMealKeys.includes('hydration'))
            ? ['hydration', ...safeMealKeys]
            : safeMealKeys;

        mealKeysWithHydration.forEach(mealKey => {
            const items = dayData && dayData[mealKey] ? dayData[mealKey].items : [];
            const mealTotals = calculateMealDetails(items, foods);
            dayTotals.kcal += mealTotals.kcal;
            dayTotals.protein += mealTotals.protein;
            dayTotals.carbs += mealTotals.carbs;
            dayTotals.fat += mealTotals.fat;
            dayTotals.saturatedFat += mealTotals.saturatedFat;
            dayTotals.fiber += mealTotals.fiber;
            dayTotals.sugar += mealTotals.sugar;
            dayTotals.salt += mealTotals.salt;
            dayTotals.waterMl += mealTotals.waterMl;
            dayTotals.processingWeightedSum += mealTotals.processingWeightedSum;
            dayTotals.processingKcalBase += mealTotals.processingKcalBase;
        });

        dayTotals.processingAvg = dayTotals.processingKcalBase
            ? (dayTotals.processingWeightedSum / dayTotals.processingKcalBase)
            : 0;
        return dayTotals;
    };

    const calculateMeal = (items, foods) => {
        const details = calculateMealDetails(items, foods);
        return {
            kcal: details.kcal,
            protein: details.protein,
            carbs: details.carbs,
            fat: details.fat
        };
    };

    const calculateShoppingTotals = (menuData, mealKeys = ['breakfast', 'lunch', 'dinner']) => {
        const safeMealKeys = resolveMealKeys(mealKeys);
        const totals = {};
        if (!Array.isArray(menuData)) return totals;

        menuData.forEach(day => {
            const mealKeysWithHydration = (day && day.hydration && !safeMealKeys.includes('hydration'))
                ? ['hydration', ...safeMealKeys]
                : safeMealKeys;
            mealKeysWithHydration.forEach(mealKey => {
                const mealItems = day && day[mealKey] && Array.isArray(day[mealKey].items)
                    ? day[mealKey].items
                    : [];
                mealItems.forEach(item => {
                    if (!item || !item.foodId) return;
                    const amount = Number.parseFloat(item.amount) || 0;
                    totals[item.foodId] = (totals[item.foodId] || 0) + amount;
                });
            });
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
        createEmptyNutritionTotals,
        calculateMealDetails,
        calculateDayTotals,
        calculateMeal,
        calculateShoppingTotals,
        resolveMealKeys
    };
})();

var __root = (typeof globalThis !== 'undefined')
    ? globalThis
    : (typeof window !== 'undefined' ? window : this);
__root.FormulasEngine = FormulasEngine;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormulasEngine;
}
