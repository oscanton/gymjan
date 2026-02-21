/* =========================================
   core/formulas.js - CÃLCULOS NUTRICIONALES
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

    calculateMeal: (items) => {
        const total = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        if (!items || !Array.isArray(items)) return total;

        let foodsData = {};
        if (typeof FOODS !== 'undefined') foodsData = FOODS;
        else if (typeof window.FOODS !== 'undefined') foodsData = window.FOODS;

        items.forEach(item => {
            const food = foodsData[item.foodId];
            if (!food) return;

            let ratio = 0;
            if (food.nutritionPer100) {
                ratio = item.amount / 100;
                Object.keys(total).forEach(k => total[k] += (food.nutritionPer100[k] || 0) * ratio);
            } else if (food.nutritionPerUnit) {
                ratio = item.amount;
                Object.keys(total).forEach(k => total[k] += (food.nutritionPerUnit[k] || 0) * ratio);
            }
        });
        return total;
    }
};

Formulas.calcIMC = Formulas.calcBMI;
Formulas.getIMCCategory = Formulas.getBMICategory;

window.Formulas = Formulas;

