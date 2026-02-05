/* =========================================
   core/targets.js - OBJETIVOS & MACROS
   ========================================= */

const Targets = {
    getAdjustedValues: (baseKcal, activityKey, customAdj) => {
        const targetKcal = baseKcal * (1 + customAdj.kcal);
        const m = Formulas.calcMacros(targetKcal, activityKey);

        const p = Math.round(m.p * (1 + customAdj.p));
        const c = Math.round(m.c * (1 + customAdj.c));
        const f = Math.round(m.f * (1 + customAdj.f));

        const finalKcal = (p * 4) + (c * 4) + (f * 9);
        return { p, c, f, kcal: Math.round(finalKcal) };
    },

    recalculateDailyTargets: (weeklyPlan, profile, adjustments) => {
        if (typeof Formulas === 'undefined') return null;

        const userProfile = profile || DB.get('user_profile', {});
        const weekly = weeklyPlan || DB.get('user_activity_plan', Array(7).fill('descanso'));
        const adj = adjustments || DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0 });

        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;

        const bmr = Formulas.calcBMR(
            userProfile.weight,
            userProfile.height,
            userProfile.age,
            userProfile.sex || 'hombre'
        );

        const dailyTargets = {};

        DIAS_SEMANA.forEach((day, index) => {
            const activityKey = weekly[index] || 'descanso';
            const factor = (Formulas.ACTIVITY_MULTIPLIERS && Formulas.ACTIVITY_MULTIPLIERS[activityKey]) || 1.2;
            const tdee = bmr * factor;
            const dayVals = Targets.getAdjustedValues(tdee, activityKey, adj);

            dailyTargets[day] = {
                kcal: dayVals.kcal,
                protein: dayVals.p,
                carbs: dayVals.c,
                fat: dayVals.f
            };
        });

        DB.save('daily_nutrition_targets', dailyTargets);
        return dailyTargets;
    }
};

window.Targets = Targets;
