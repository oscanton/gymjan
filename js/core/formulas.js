/* =========================================
   core/formulas.js - CÁLCULOS NUTRICIONALES
   ========================================= */

const Formulas = {
    // Ratios de macronutrientes según actividad
    MACRO_RATIOS: {
        "descanso":           { p: 0.30, c: 0.25, f: 0.45 },
        "descanso_activo":    { p: 0.30, c: 0.35, f: 0.35 },
        "cardio_1h":          { p: 0.25, c: 0.55, f: 0.20 },
        "fuerza_1h":          { p: 0.35, c: 0.40, f: 0.25 },
        "cardio_fuerza_1h":   { p: 0.30, c: 0.50, f: 0.20 },
        "cardio_fuerza_1_5h": { p: 0.30, c: 0.50, f: 0.20 }
    },

    // Multiplicadores de actividad (Factor sobre BMR)
    ACTIVITY_MULTIPLIERS: {
        "descanso":           1.2,
        "descanso_activo":    1.3,
        "cardio_1h":          1.5,
        "fuerza_1h":          1.45,
        "cardio_fuerza_1h":   1.6,
        "cardio_fuerza_1_5h": 1.75
    },

    calcIMC: (weight, height) => {
        const hM = height / 100;
        return (hM > 0) ? (weight / (hM * hM)).toFixed(1) : 0;
    },

    getIMCCategory: (imc) => {
        const v = parseFloat(imc);
        if (v <= 0) return { label: '-', className: 'text-muted' };
        if (v < 18.5) return { label: 'Bajo peso', className: 'color-blue' };
        if (v < 25)   return { label: 'Adecuado', className: 'color-success' };
        if (v < 30)   return { label: 'Sobrepeso', className: 'color-warning' };
        if (v < 35)   return { label: 'Obesidad', className: 'color-danger' };
        return { label: 'Gran obesidad', className: 'color-critical' };
    },

    calcBMR: (weight, height, age, sex) => {
        let bmr = (10 * weight) + (6.25 * height) - (5 * age);
        bmr += (sex === 'hombre') ? 5 : -161;
        return Math.round(bmr);
    },

    calcMacros: (kcal, activityKey) => {
        const r = Formulas.MACRO_RATIOS[activityKey] || { p: 0.30, c: 0.40, f: 0.30 };
        return {
            p: Math.round((kcal * r.p) / 4),
            c: Math.round((kcal * r.c) / 4),
            f: Math.round((kcal * r.f) / 9),
            pct: { p: Math.round(r.p * 100), c: Math.round(r.c * 100), f: Math.round(r.f * 100) }
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

window.Formulas = Formulas;
