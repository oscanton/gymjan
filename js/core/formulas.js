/* =========================================
   core/formulas.js - CÁLCULOS NUTRICIONALES
   ========================================= */

const Formulas = {
    DEFAULT_MACRO_RATIOS: APP_MACRO_RATIOS,

    calcBMI: (weight, height) => {
        const heightMeters = height / 100;
        return (heightMeters > 0) ? (weight / (heightMeters * heightMeters)).toFixed(1) : 0;
    },

    getBMICategory: (bmi) => {
        const numericBmi = parseFloat(bmi);
        if (numericBmi <= 0) return { label: '-', className: 'text-muted' };
        if (numericBmi < 18.5) return { label: 'Bajo peso', className: 'color-blue' };
        if (numericBmi < 25)   return { label: 'Adecuado', className: 'color-success' };
        if (numericBmi < 30)   return { label: 'Sobrepeso', className: 'color-warning' };
        if (numericBmi < 35)   return { label: 'Obesidad', className: 'color-danger' };
        return { label: 'Gran obesidad', className: 'color-critical' };
    },

    calcBMR: (weight, height, age, sex) => {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (sex === 'hombre') ? 5 : -161;
        return Math.round(bmr);
    },

    calcMacros: (kcal, macroContext) => {
        const ctx = macroContext || {};
        const explicitRatios = (ctx && ctx.macroRatios) ? ctx.macroRatios : ctx;
        const hasValidRatios = explicitRatios
            && typeof explicitRatios.p === 'number'
            && typeof explicitRatios.c === 'number'
            && typeof explicitRatios.f === 'number';
        const macroRatios = hasValidRatios ? explicitRatios : Formulas.DEFAULT_MACRO_RATIOS;
        return {
            p: Math.round((kcal * macroRatios.p) / 4),
            c: Math.round((kcal * macroRatios.c) / 4),
            f: Math.round((kcal * macroRatios.f) / 9),
            pct: { p: Math.round(macroRatios.p * 100), c: Math.round(macroRatios.c * 100), f: Math.round(macroRatios.f * 100) }
        };
    },

    createEmptyNutritionTotals: () => ({
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        saturatedFat: 0,
        fiber: 0,
        sugar: 0,
        salt: 0,
        processingWeightedSum: 0,
        processingKcalBase: 0,
        processingAvg: 0
    }),

    calculateMealDetails: (items) => {
        const totals = Formulas.createEmptyNutritionTotals();
        if (!items || !Array.isArray(items)) return totals;

        let foodsData = {};
        if (typeof FOODS !== 'undefined') foodsData = FOODS;
        else if (typeof window.FOODS !== 'undefined') foodsData = window.FOODS;

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
            totals.saturatedFat += (nutrition.saturated_fat || 0) * ratio;
            totals.fiber += (nutrition.fiber || 0) * ratio;
            totals.sugar += (nutrition.sugar || 0) * ratio;
            totals.salt += ((nutrition.sodium || 0) * ratio * 2.5) / 1000;

            if (Number.isFinite(food.processed) && itemKcal > 0) {
                totals.processingWeightedSum += food.processed * itemKcal;
                totals.processingKcalBase += itemKcal;
            }
        });

        totals.processingAvg = totals.processingKcalBase
            ? (totals.processingWeightedSum / totals.processingKcalBase)
            : 0;

        return totals;
    },

    calculateDayTotals: (dayData, mealKeys = ['desayuno', 'comida', 'cena']) => {
        const safeMealKeys = (Array.isArray(mealKeys) && mealKeys.length)
            ? mealKeys
            : ((typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length)
                ? MEAL_KEYS
                : ['desayuno', 'comida', 'cena']);
        const dayTotals = Formulas.createEmptyNutritionTotals();
        if (!dayData || !Array.isArray(safeMealKeys)) return dayTotals;

        safeMealKeys.forEach(mealKey => {
            const items = dayData && dayData[mealKey] ? dayData[mealKey].items : [];
            const mealTotals = Formulas.calculateMealDetails(items);
            dayTotals.kcal += mealTotals.kcal;
            dayTotals.protein += mealTotals.protein;
            dayTotals.carbs += mealTotals.carbs;
            dayTotals.fat += mealTotals.fat;
            dayTotals.saturatedFat += mealTotals.saturatedFat;
            dayTotals.fiber += mealTotals.fiber;
            dayTotals.sugar += mealTotals.sugar;
            dayTotals.salt += mealTotals.salt;
            dayTotals.processingWeightedSum += mealTotals.processingWeightedSum;
            dayTotals.processingKcalBase += mealTotals.processingKcalBase;
        });

        dayTotals.processingAvg = dayTotals.processingKcalBase
            ? (dayTotals.processingWeightedSum / dayTotals.processingKcalBase)
            : 0;
        return dayTotals;
    },

    calculateMeal: (items) => {
        const details = Formulas.calculateMealDetails(items);
        return {
            kcal: details.kcal,
            protein: details.protein,
            carbs: details.carbs,
            fat: details.fat
        };
    },

    calculateShoppingTotals: (menuData, mealKeys = null) => {
        const safeMealKeys = (Array.isArray(mealKeys) && mealKeys.length)
            ? mealKeys
            : ((typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length)
                ? MEAL_KEYS
                : ['desayuno', 'comida', 'cena']);
        const totals = {};
        if (!Array.isArray(menuData)) return totals;

        menuData.forEach(day => {
            safeMealKeys.forEach(mealKey => {
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
    }
};

window.Formulas = Formulas;

