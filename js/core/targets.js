/* =========================================
   core/targets.js - OBJETIVOS & MACROS
   ========================================= */

const Targets = {
    getObjectiveDescriptions: () => ({
        kcal: 'Define la energia diaria total. Un exceso sostenido puede favorecer ganancia de grasa; un deficit excesivo puede reducir rendimiento y recuperacion.',
        p: 'La proteina ayuda a conservar y construir masa muscular, y mejora la saciedad. Un aporte bajo sostenido puede limitar recuperacion y mantenimiento muscular.',
        c: 'Los carbohidratos son combustible principal para entrenar y recuperar glucogeno. Un aporte muy bajo puede reducir energia, rendimiento e intensidad.',
        f: 'Las grasas son clave para funcion hormonal, absorcion de vitaminas y salud celular. Un aporte muy bajo puede afectar hormonas y bienestar general.',
        salt: 'Controla el sodio total aproximado (expresado como sal). Exceso mantenido puede empeorar retencion de liquidos y tension arterial en personas sensibles.',
        fiber: 'La fibra mejora salud digestiva, saciedad y control glucemico. Un aporte bajo suele empeorar transito intestinal y calidad global de la dieta.',
        sugar: 'Limita azucares libres para mejorar calidad nutricional y estabilidad energetica. Regla base: maximo % de kcal y conversion a gramos con (kcal x %)/4. Un exceso sostenido facilita picos de apetito y desplazamiento de alimentos de calidad.',
        saturatedFat: 'Limita grasas saturadas para proteger perfil lipidico y salud cardiovascular. Un exceso habitual puede empeorar marcadores cardiometabolicos.',
        processing: 'Refleja el grado medio de procesado de la dieta. Cuanto mas alto, mayor riesgo de baja densidad nutricional y peor adherencia a largo plazo.'
    }),

    getObjectiveDescription: (key) => {
        const all = Targets.getObjectiveDescriptions();
        return all[key] || '';
    },

    normalizeMacroRatios: (ratios, fallback = null) => {
        const fb = fallback || ((typeof Formulas !== 'undefined' && Formulas.DEFAULT_MACRO_RATIOS)
            ? Formulas.DEFAULT_MACRO_RATIOS
            : { p: 0.30, c: 0.40, f: 0.30 });
        const p = parseFloat(ratios && ratios.p);
        const c = parseFloat(ratios && ratios.c);
        const f = parseFloat(ratios && ratios.f);
        const hasAll = Number.isFinite(p) && Number.isFinite(c) && Number.isFinite(f);
        const sum = hasAll ? (p + c + f) : 0;
        if (!hasAll || sum <= 0) return fb;
        return { p: p / sum, c: c / sum, f: f / sum };
    },

    getDailyMacroRatios: () => {
        const fallback = Targets.normalizeMacroRatios(null);
        const raw = DB.get('user_macro_ratios_by_day', null);
        const list = Array.isArray(raw) ? raw.slice(0, DAYS_COUNT) : [];
        while (list.length < DAYS_COUNT) list.push(null);
        return list.map(entry => Targets.normalizeMacroRatios(entry, fallback));
    },

    getUserMacroRatios: () => {
        const daily = DB.get('user_macro_ratios_by_day', null);
        if (Array.isArray(daily) && daily.length) {
            const first = daily.find(v => v && typeof v === 'object') || daily[0];
            return Targets.normalizeMacroRatios(first);
        }
        const saved = DB.get('user_macro_ratios', null);
        return Targets.normalizeMacroRatios(saved);
    },

    getSecondaryDefaults: () => {
        const secondaryDefaults = APP_SECONDARY_DEFAULTS;
        const savedRules = DB.get('user_secondary_rules', null);
        const legacyTargets = DB.get('user_secondary_targets', null);
        const source = savedRules || legacyTargets || {};
        const num = (value, fallback) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
        };
        return {
            saltMaxG: num(source.saltMaxG, secondaryDefaults.saltMaxG),
            fiberPer1000Kcal: num(source.fiberPer1000Kcal, secondaryDefaults.fiberPer1000Kcal),
            sugarMaxPctKcal: num(source.sugarMaxPctKcal, secondaryDefaults.sugarMaxPctKcal),
            satFatMaxPctKcal: num(source.satFatMaxPctKcal, secondaryDefaults.satFatMaxPctKcal),
            processingMaxScore: num(source.processingMaxScore, secondaryDefaults.processingMaxScore)
        };
    },

    getSecondaryAdjustments: () => {
        const saved = DB.get('user_secondary_adjustments', {});
        const num = (value) => {
            const parsed = parseFloat(value);
            return Number.isFinite(parsed) ? parsed : 0;
        };
        return {
            saltMaxG: num(saved.saltMaxG),
            fiberPer1000Kcal: num(saved.fiberPer1000Kcal),
            sugarMaxPctKcal: num(saved.sugarMaxPctKcal),
            satFatMaxPctKcal: num(saved.satFatMaxPctKcal),
            processingMaxScore: num(saved.processingMaxScore)
        };
    },

    getSecondaryTargetsForKcal: (kcal, defaults = null, adjustments = null) => {
        const cfg = defaults || Targets.getSecondaryDefaults();
        const adj = adjustments || Targets.getSecondaryAdjustments();
        const safeKcal = Number.isFinite(kcal) && kcal > 0 ? kcal : 0;
        const round = (value, decimals) => {
            const factor = 10 ** decimals;
            return Math.round(value * factor) / factor;
        };
        const adjusted = (baseValue, adjustmentPct) => baseValue * (1 + (Number.isFinite(adjustmentPct) ? adjustmentPct : 0));

        const baseSalt = cfg.saltMaxG;
        const baseFiber = (safeKcal / 1000) * cfg.fiberPer1000Kcal;
        const baseSugar = (safeKcal * cfg.sugarMaxPctKcal) / 4;
        const baseSatFat = (safeKcal * cfg.satFatMaxPctKcal) / 9;
        const baseProcessing = cfg.processingMaxScore;

        return {
            salt: round(adjusted(baseSalt, adj.saltMaxG), 2),
            fiber: round(adjusted(baseFiber, adj.fiberPer1000Kcal), 1),
            sugar: round(adjusted(baseSugar, adj.sugarMaxPctKcal), 1),
            saturatedFat: round(adjusted(baseSatFat, adj.satFatMaxPctKcal), 1),
            processing: round(adjusted(baseProcessing, adj.processingMaxScore), 1)
        };
    },

    getMacroContext: () => ({
        activityKey: 'actividad',
        macroRatios: Targets.getUserMacroRatios()
    }),

    getAdjustedValues: (baseKcal, macroContext, customAdj) => {
        const safeAdj = customAdj || { kcal: 0, p: 0, c: 0, f: 0 };
        const targetKcal = baseKcal * (1 + safeAdj.kcal);
        const context = (typeof macroContext === 'string')
            ? { activityKey: macroContext, macroRatios: Targets.getUserMacroRatios() }
            : (macroContext || {});
        const m = Formulas.calcMacros(targetKcal, context);

        const p = Math.round(m.p * (1 + safeAdj.p));
        const c = Math.round(m.c * (1 + safeAdj.c));
        const f = Math.round(m.f * (1 + safeAdj.f));

        const finalKcal = (p * 4) + (c * 4) + (f * 9);
        return { p, c, f, kcal: Math.round(finalKcal) };
    },

    recalculateDailyTargets: (weeklyPlan, profile, adjustments, exercisesMap) => {
        if (typeof Formulas === 'undefined') return null;

        const daysCount = DAYS_COUNT;
        const userProfile = profile || DB.get('user_profile', {});
        const adj = adjustments || DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0 });

        if (!userProfile.weight || !userProfile.height || !userProfile.age) return null;

        const bmr = Formulas.calcBMR(
            userProfile.weight,
            userProfile.height,
            userProfile.age,
            userProfile.sex || 'hombre'
        );

        const dailyTargets = {};
        const restFactor = APP_REST_BMR_FACTOR;
        const restKcal = bmr * restFactor;
        const exercises = exercisesMap || (typeof EXERCISES !== 'undefined' ? EXERCISES : null);
        const defaultStepsCfg = APP_STEPS_DEFAULTS;
        const walkingExercise = exercises && exercises.caminar
            ? exercises.caminar
            : { met: defaultStepsCfg.met, cadenceBase: defaultStepsCfg.perMinute };
        const baseCadence = parseInt(walkingExercise.cadenceBase, 10) || defaultStepsCfg.perMinute;
        const stepsConfig = {
            targetSteps: defaultStepsCfg.target,
            stepsPerMin: baseCadence,
            met: walkingExercise.met || defaultStepsCfg.met,
            baseStepsPerMin: baseCadence
        };
        const weekly = Array.isArray(weeklyPlan)
            ? weeklyPlan.slice(0, daysCount)
            : ((typeof ActivityStore !== 'undefined')
                ? ActivityStore.getActivePlanData()
                : null);
        const dailyMacroRatios = Targets.getDailyMacroRatios();

        const secondaryDefaults = Targets.getSecondaryDefaults();
        const secondaryAdjustments = Targets.getSecondaryAdjustments();
        WEEK_DAYS.forEach((day, index) => {
            const dayData = Array.isArray(weekly) ? (weekly[index] || {}) : {};
            const macroContext = Targets.getMacroContext();
            const dayMacroRatios = dailyMacroRatios[index] || Targets.getUserMacroRatios();
            const macroContextWithRatios = { ...macroContext, macroRatios: dayMacroRatios };

            const walkInfo = (typeof ActivityStore !== 'undefined' && ActivityStore.getWalkInfo)
                ? ActivityStore.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise })
                : { steps: defaultStepsCfg.target, stepsPerMin: stepsConfig.stepsPerMin, secPerRep: 0, cadenceBase: stepsConfig.baseStepsPerMin };
            const daySteps = walkInfo.steps;
            const dayStepsPerMin = walkInfo.stepsPerMin;
            const perDayStepsConfig = {
                ...stepsConfig,
                stepsPerMin: dayStepsPerMin,
                baseStepsPerMin: stepsConfig.baseStepsPerMin
            };
            const stepsKcal = (typeof UI !== 'undefined')
                ? UI.calculateStepsKcal(daySteps, { weightKg: userProfile.weight, stepsConfig: perDayStepsConfig })
                : 0;

            let gymKcal = 0;
            const gymSection = dayData.gym;
            if (gymSection && gymSection.type !== 'rest' && Array.isArray(gymSection.exercises) && typeof UI !== 'undefined') {
                gymSection.exercises.forEach((item) => {
                    const ex = exercises && item ? exercises[item.exerciseId] : null;
                    if (!ex) return;
                    gymKcal += UI.calculateExerciseKcal(item, ex, { weightKg: userProfile.weight });
                });
            }

            let extraKcal = 0;
            const extraSection = dayData.extra_activity;
            if (extraSection && extraSection.type !== 'rest' && Array.isArray(extraSection.exercises) && typeof UI !== 'undefined') {
                extraSection.exercises.forEach((item) => {
                    const ex = exercises && item ? exercises[item.exerciseId] : null;
                    if (!ex) return;
                    extraKcal += UI.calculateExerciseKcal(item, ex, { weightKg: userProfile.weight });
                });
            }

            const totalActivityKcal = stepsKcal + gymKcal + extraKcal;
            const tdee = restKcal + totalActivityKcal;
            const dayVals = Targets.getAdjustedValues(tdee, macroContextWithRatios, adj);
            const secondaryTargets = Targets.getSecondaryTargetsForKcal(dayVals.kcal, secondaryDefaults, secondaryAdjustments);

            dailyTargets[day] = {
                kcal: dayVals.kcal,
                protein: dayVals.p,
                carbs: dayVals.c,
                fat: dayVals.f,
                salt: secondaryTargets.salt,
                fiber: secondaryTargets.fiber,
                sugar: secondaryTargets.sugar,
                saturatedFat: secondaryTargets.saturatedFat,
                processing: secondaryTargets.processing
            };
        });

        DB.save('daily_nutrition_targets', dailyTargets);
        return dailyTargets;
    }
};

window.Targets = Targets;
