/* =========================================
   pages/calculator.page.js - CALCULATOR
   ========================================= */

function renderCalculatorPage() {
    const container = document.getElementById('calculadora-container');
    if (!container) return;

    if (typeof CoreBrowserAdapter === 'undefined' || typeof ActivityStore === 'undefined') {
        UI.showError(container, 'Error cargando dependencias (formulas/targets/stores).');
        return;
    }

    const optionalLoads = [
        { when: () => typeof EXERCISES === 'undefined', path: 'js/data/exercises.js' }
    ];

    const loadActivityPlan = () => {
        const available = Array.isArray(AVAILABLE_ACTIVITY_PLAN_FILES) ? AVAILABLE_ACTIVITY_PLAN_FILES : [];
        if (!available.length || typeof UI === 'undefined') return Promise.resolve();
        const selected = ActivityStore.getSelectedFile();
        if (!selected) return Promise.resolve();
        const safeId = String(selected).replace(/[^a-z0-9_-]/gi, '_');
        return UI.loadScript(`js/data/${selected}`, `activity-plan-${safeId}`);
    };

    CoreBrowserAdapter.ensureCoreDomain()
        .then(() => UI.loadDependencies(optionalLoads, { settled: true }))
        .then(() => loadActivityPlan())
        .then(() => {
            try {
                initCalculator(container);
            } catch (err) {
                console.error('Error renderizando Calculadora:', err);
                UI.showError(container, 'Error renderizando la Calculadora.');
            }
        })
        .catch((err) => {
            console.error('Error cargando dependencias opcionales de Calculadora:', err);
            try {
                initCalculator(container);
            } catch (renderErr) {
                console.error('Error renderizando Calculadora tras fallo opcional:', renderErr);
                UI.showError(container, 'Error renderizando la Calculadora.');
            }
        });
}

function initCalculator(container) {
    const formulas = window.FormulasEngine;
    const targets = window.TargetsEngine;
    if (!formulas || !targets) {
        UI.showError(container, 'Error cargando dependencias (engine formulas/targets).');
        return;
    }
    if (typeof CoreBrowserDomain !== 'undefined') {
        CoreBrowserDomain.applyMacroDefaults(formulas);
    }

    const getDefaultMacroRatios = () => CoreBrowserDomain.getDefaultMacroRatios(formulas);
    const getDailyMacroRatios = () => CoreBrowserDomain.getDailyMacroRatios(targets, { formulas });
    const getUserMacroRatios = () => CoreBrowserDomain.getUserMacroRatios(targets, { formulas });
    const getSecondaryDefaults = () => CoreBrowserDomain.getSecondaryDefaults(targets);
    const getSecondaryAdjustments = () => CoreBrowserDomain.getSecondaryAdjustments(targets);
    const getHydrationDefaults = () => CoreBrowserDomain.getHydrationDefaults(targets);
    const getHydrationAdjustments = () => CoreBrowserDomain.getHydrationAdjustments(targets);
    const calcSecondaryTargetsForKcal = (kcal, defaults = null, adjustments = null) => (
        CoreBrowserDomain.calcSecondaryTargetsForKcal(targets, kcal, defaults, adjustments)
    );
    const getMacroContext = () => CoreBrowserDomain.getMacroContext(targets, { formulas });
    const calcAdjustedValues = (baseKcal, macroContext, customAdj) => (
        CoreBrowserDomain.calcAdjustedValues(targets, formulas, baseKcal, macroContext, customAdj)
    );
    const computeDailyTargets = (weeklyPlan, profile, adjustments, exercisesMap) => (
        CoreBrowserDomain.computeDailyTargets(targets, formulas, weeklyPlan, profile, adjustments, exercisesMap)
    );

    const getObjectiveDescription = (key) => (
        (typeof targets.getObjectiveDescription === 'function')
            ? targets.getObjectiveDescription(key)
            : ''
    );

    const getDayActivityLabel = (dayData) => {
        const gym = dayData && dayData.gym;
        if (gym && gym.type === 'rest') return 'Descanso';
        if (gym && Array.isArray(gym.exercises) && gym.exercises.length) return 'Gimnasio';
        return 'Sin actividad';
    };
    const getDayWalkInfo = (dayData) => {
        if (typeof ActivityStore !== 'undefined' && ActivityStore.getWalkInfo) {
            return ActivityStore.getWalkInfo(dayData, { defaultStepsCfg: APP_STEPS_DEFAULTS });
        }
        return { steps: 0, stepsPerMin: APP_STEPS_DEFAULTS.perMinute };
    };
    const getActivityPlan = () => (
        (typeof ActivityStore !== 'undefined') ? ActivityStore.getActivePlanData() : null
    );

    // 1. Load data (or defaults)
    const userProfile = DB.get('user_profile', {
        sex: 'hombre', age: 30, height: 175, weight: 75
    });

    const restBmrFactor = APP_REST_BMR_FACTOR;
    const defaultStepsCfg = APP_STEPS_DEFAULTS;
    const weeklyPlan = getActivityPlan();

    let adjustments = DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0, hydration: 0 });
    const defaultSecondaryTargets = getSecondaryDefaults();
    let secondaryAdjustments = DB.get('user_secondary_adjustments', {
        saltMaxG: 0,
        fiberPer1000Kcal: 0,
        sugarMaxPctKcal: 0,
        satFatMaxPctKcal: 0,
        processingMaxScore: 0
    });
    const hydrationDefaults = getHydrationDefaults();
    const defaultMacroRatios = getDefaultMacroRatios();
    let macroRatios = getUserMacroRatios();

    // --- SECTION: PERSONAL DATA ---
    const profileCard = document.createElement('div');
    profileCard.className = 'glass-card card';
    profileCard.innerHTML = `
        <h2>Datos Personales</h2>
        <div class="section-group__grid section-group__grid--center">
            <div class="row-item">
                <span class="row-item__title">Sexo</span>
                <select id="calc-sex" class="input-base input-select w-auto">
                    <option value="hombre" ${userProfile.sex === 'hombre' ? 'selected' : ''}>Hombre</option>
                    <option value="mujer" ${userProfile.sex === 'mujer' ? 'selected' : ''}>Mujer</option>
                </select>
            </div>
            <div class="row-item">
                <span class="row-item__title">Edad</span>
                <input type="number" id="calc-age" class="row-item__input" value="${userProfile.age}">
            </div>
            <div class="row-item">
                <span class="row-item__title">Altura (cm)</span>
                <input type="number" id="calc-height" class="row-item__input" value="${userProfile.height}">
            </div>
            <div class="row-item">
                <span class="row-item__title">Peso (kg)</span>
                <input type="number" id="calc-weight" class="row-item__input" value="${userProfile.weight}">
            </div>
        </div>
    `;
    container.appendChild(profileCard);

    // --- SECTION: BASE RESULTS ---
    const baseResultsCard = document.createElement('div');
    baseResultsCard.className = 'glass-card card mt-lg';
    container.appendChild(baseResultsCard);

    // --- SECTION: GENERAL ADJUSTMENTS ---
    const adjustmentsCard = document.createElement('div');
    adjustmentsCard.className = 'glass-card card mt-lg';
    const generateOpts = (val) => {
        const steps = [0.20, 0.15, 0.10, 0.05, 0, -0.05, -0.10, -0.15, -0.20];
        return steps.map(s => {
            const label = s === 0 ? "0%" : (s > 0 ? `+${Math.round(s * 100)}%` : `${Math.round(s * 100)}%`);
            return `<option value="${s}" ${Math.abs(val - s) < 0.001 ? 'selected' : ''}>${label}</option>`;
        }).join('');
    };

    const formatRuleValue = (value, decimals = 1) => UI.formatNumber(value, decimals);
    const formatHydrationRange = (minMl, maxMl) => {
        if (!Number.isFinite(minMl) || !Number.isFinite(maxMl)) return '-';
        const minL = minMl / 1000;
        const maxL = maxMl / 1000;
        return `${formatRuleValue(minL, 1)}-${formatRuleValue(maxL, 1)} L`;
    };
    const formatMacroPct = (ratio) => {
        const safe = Number.isFinite(ratio) ? ratio : 0;
        return Math.round(safe * 100);
    };
    const getRestMacroRatios = () => ({
        p: Number.isFinite(macroRatios.p) ? macroRatios.p : defaultMacroRatios.p,
        c: Number.isFinite(macroRatios.c) ? macroRatios.c : defaultMacroRatios.c,
        f: Number.isFinite(macroRatios.f) ? macroRatios.f : defaultMacroRatios.f
    });
    let restMacroRatios = getRestMacroRatios();
    const GRAM_KEYS = new Set(['p', 'c', 'f', 'saturatedFat', 'fiber', 'sugar']);
    const formatMetricValue = (key, value) => {
        if (key === 'hydration') {
            if (value && typeof value === 'object') {
                return formatHydrationRange(value.min, value.max);
            }
            return '-';
        }
        const safe = Number.isFinite(value) ? value : 0;
        if (key === 'kcal') return UI.formatKcal(safe);
        if (GRAM_KEYS.has(key)) return UI.formatGrams(safe, 0);
        if (key === 'salt') return UI.formatGrams(safe, 2);
        if (key === 'processing') return UI.formatScore(safe, 1, 10);
        return UI.formatGrams(safe, 1);
    };
    const renderMetricPill = (key, icon, value) => `
        <div class="stats-pills">
            <div class="stat-pill stat-pill--xs ${key === 'kcal' ? 'stat-pill--kcal' : ''}">${icon} ${value}</div>
        </div>
    `;    const ADJUSTMENT_ROWS = [
        { key: 'kcal', icon: '🔥', label: 'Energía', rule: () => 'Objetivo: 1,2 x BMR', description: getObjectiveDescription('kcal'), adjustmentSource: 'macro', adjustmentKey: 'kcal' },
        { key: 'p', icon: '🥩', label: 'Proteína', rule: () => `Objetivo: ${formatRuleValue(restMacroRatios.p * 100, 1)}% de kcal (g = (kcal x %)/4)`, description: getObjectiveDescription('p'), adjustmentSource: 'macro', adjustmentKey: 'p' },
        { key: 'c', icon: '🍞', label: 'Carbohidratos', rule: () => `Objetivo: ${formatRuleValue(restMacroRatios.c * 100, 1)}% de kcal (g = (kcal x %)/4)`, description: getObjectiveDescription('c'), adjustmentSource: 'macro', adjustmentKey: 'c' },
        { key: 'f', icon: '🥑', label: 'Grasas', rule: () => `Objetivo: ${formatRuleValue(restMacroRatios.f * 100, 1)}% de kcal (g = (kcal x %)/9)`, description: getObjectiveDescription('f'), adjustmentSource: 'macro', adjustmentKey: 'f' },
        {
            key: 'hydration',
            icon: '💧',
            label: 'Hidratación',
            rule: () => `Objetivo: ${formatRuleValue(hydrationDefaults.minMlPerKg, 0)}-${formatRuleValue(hydrationDefaults.maxMlPerKg, 0)} ml/kg (+${formatRuleValue(hydrationDefaults.activityMlPerMin, 0)} ml/min actividad)`,
            description: getObjectiveDescription('hydration'),
            adjustmentSource: 'macro',
            adjustmentKey: 'hydration'
        },
        {
            key: 'salt',
            icon: '🧂',
            label: 'Sal',
            rule: () => `Máx: ${UI.formatGrams(defaultSecondaryTargets.saltMaxG, 2)} / día`,
            description: getObjectiveDescription('salt'),
            adjustmentSource: 'secondary',
            adjustmentKey: 'saltMaxG'
        },
        {
            key: 'fiber',
            icon: '🌾',
            label: 'Fibra',
            rule: () => `Mín: ${UI.formatGrams(defaultSecondaryTargets.fiberPer1000Kcal, 1)} / 1000 kcal`,
            description: getObjectiveDescription('fiber'),
            adjustmentSource: 'secondary',
            adjustmentKey: 'fiberPer1000Kcal'
        },
        {
            key: 'sugar',
            icon: '🍬',
            label: 'Azúcar',
            rule: () => `Máx: ${formatRuleValue(defaultSecondaryTargets.sugarMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/4)`,
            description: getObjectiveDescription('sugar'),
            adjustmentSource: 'secondary',
            adjustmentKey: 'sugarMaxPctKcal'
        },
        {
            key: 'saturatedFat',
            icon: '🧈',
            label: 'Grasa sat.',
            rule: () => `Máx: ${formatRuleValue(defaultSecondaryTargets.satFatMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/9)`,
            description: getObjectiveDescription('saturatedFat'),
            adjustmentSource: 'secondary',
            adjustmentKey: 'satFatMaxPctKcal'
        },
        {
            key: 'processing',
            icon: '🏭',
            label: 'Procesado',
            rule: () => `Máximo: ${UI.formatScore(defaultSecondaryTargets.processingMaxScore, 1, 10)}`,
            description: getObjectiveDescription('processing'),
            adjustmentSource: 'secondary',
            adjustmentKey: 'processingMaxScore'
        }
    ];
    const ADJUSTMENT_ROWS_BY_KEY = ADJUSTMENT_ROWS.reduce((acc, row) => {
        acc[row.key] = row;
        return acc;
    }, {});
    const DAY_METRIC_KEY = {
        kcal: 'kcal',
        p: 'p',
        c: 'c',
        f: 'f',
        hydration: 'hydration',
        salt: 'salt',
        fiber: 'fiber',
        sugar: 'sugar',
        saturatedFat: 'saturatedFat',
        processing: 'processing'
    };
    const getAdjustmentSelectId = (row) => (
        row.adjustmentSource === 'macro'
            ? `adj-${row.adjustmentKey}`
            : `sec-adj-${row.adjustmentKey}`
    );

    adjustmentsCard.innerHTML = `
        <h2>OBJETIVOS GENERALES (EN REPOSO)</h2>
        <div class="adjustments-table-wrap">
            <table class="adjustments-table">
                <thead>
                    <tr>
                        <th>Objetivo</th>
                        <th>RESULTADO BASE</th>
                        <th>Ajuste</th>
                        <th>RESULTADO AJUSTADO</th>
                    </tr>
                </thead>
                <tbody>
                    ${ADJUSTMENT_ROWS.map(row => {
                        const selectId = getAdjustmentSelectId(row);
                        const currentAdj = row.adjustmentSource === 'macro'
                            ? (adjustments[row.adjustmentKey] || 0)
                            : (secondaryAdjustments[row.adjustmentKey] || 0);
                        return `
                            <tr>
                                <td class="adjustments-table__label">
                                    <button type="button" class="adjustments-table__label-btn modal-trigger modal-trigger--button" data-rule-key="${row.key}">${row.label}</button>
                                </td>
                                <td class="adjustments-table__result-base" id="result-base-${row.key}">-</td>
                                <td class="adjustments-table__adj">
                                    <select id="${selectId}" class="input-base input-select input-select--sm">${generateOpts(currentAdj)}</select>
                                </td>
                                <td class="adjustments-table__result-objective" id="result-adjusted-${row.key}">-</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
    container.appendChild(adjustmentsCard);

    // --- SECTION: WEEKLY TARGETS ---
    const weeklyGoalsCard = document.createElement('div');
    weeklyGoalsCard.className = 'glass-card card mt-lg';
    weeklyGoalsCard.innerHTML = `
        <h2>OBJETIVOS DIARIOS</h2>
        <div class="table-scroller mt-sm">
            <table id="daily-goals-table" class="goals-table">
                <thead id="daily-goals-head"></thead>
                <tbody id="daily-goals-body"></tbody>
            </table>
        </div>
    `;
    container.appendChild(weeklyGoalsCard);

    const readAndSaveInputs = () => {
        const profile = {
            sex: document.getElementById('calc-sex').value,
            age: parseInt(document.getElementById('calc-age').value) || 0,
            height: parseInt(document.getElementById('calc-height').value) || 0,
            weight: parseFloat(document.getElementById('calc-weight').value) || 0,
        };
        DB.save('user_profile', profile);

        ADJUSTMENT_ROWS.forEach((row) => {
            const select = document.getElementById(getAdjustmentSelectId(row));
            const rawValue = select ? parseFloat(select.value) : 0;
            const safeAdj = Number.isFinite(rawValue) ? rawValue : 0;
            if (row.adjustmentSource === 'macro') {
                adjustments[row.adjustmentKey] = safeAdj;
            } else {
                secondaryAdjustments[row.adjustmentKey] = safeAdj;
            }
        });
        DB.save('user_adjustments', adjustments);
        DB.save('user_secondary_adjustments', secondaryAdjustments);

        const macroInputs = document.querySelectorAll('input[data-macro-day-index][data-macro-key]');
        if (macroInputs && macroInputs.length) {
            const baseDaily = (typeof getDailyMacroRatios === 'function')
                ? getDailyMacroRatios()
                : Array(DAYS_COUNT).fill(defaultMacroRatios);
            const dayData = Array.from({ length: DAYS_COUNT }, (_, i) => ({
                p: baseDaily[i] ? baseDaily[i].p * 100 : 30,
                c: baseDaily[i] ? baseDaily[i].c * 100 : 40,
                f: baseDaily[i] ? baseDaily[i].f * 100 : 30
            }));
            macroInputs.forEach((input) => {
                const dayIndex = parseInt(input.dataset.macroDayIndex, 10);
                const key = input.dataset.macroKey;
                const val = parseFloat(input.value);
                if (!Number.isNaN(dayIndex) && dayIndex >= 0 && dayIndex < dayData.length && key && Number.isFinite(val)) {
                    dayData[dayIndex][key] = val;
                }
            });

            const normalizedDaily = dayData.map((entry, idx) => {
                const sum = entry.p + entry.c + entry.f;
                if (sum <= 0) return baseDaily[idx] || defaultMacroRatios;
                return {
                    p: entry.p / sum,
                    c: entry.c / sum,
                    f: entry.f / sum
                };
            });
            DB.save('user_macro_ratios_by_day', normalizedDaily);
            macroRatios = (typeof getUserMacroRatios === 'function')
                ? getUserMacroRatios()
                : defaultMacroRatios;
            restMacroRatios = getRestMacroRatios();
        }

        return { profile, adjustments };
    };

    const renderBaseResults = (profile) => {
        const bmi = formulas.calcBMI(profile.weight, profile.height);
        const bmiData = formulas.getBMICategory(bmi);
        const bmr = formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex);

        baseResultsCard.innerHTML = `
            <h2>Resultados Base</h2>
            <div class="calc-grid-2">
                <div class="card-panel">
                    <div class="text-label">IMC</div>
                    <div class="text-value ${bmiData.className}">${bmi}</div>
                    <div class="text-sm text-muted ${bmiData.className} mt-auto">${bmiData.label}</div>
                </div>
                <div class="card-panel">
                    <div class="text-label">BMR</div>
                    <div class="stats-pills stats-pills--center my-sm">
                        <div class="stat-pill stat-pill--kcal">🔥 ${Number.isFinite(bmr) ? Math.round(bmr) : 0} kcal</div>
                    </div>
                    <div class="text-sm text-muted mt-auto">Basal</div>
                </div>
            </div>
        `;
        return bmr;
    };

    const renderAdjustmentsTable = (bmr, adjustments) => {
        const baseKcal = Math.round(bmr * restBmrFactor);
        const zeroAdj = { kcal: 0, p: 0, c: 0, f: 0 };
        const baseContext = getMacroContext();
        const baseVals = calcAdjustedValues(baseKcal, baseContext, zeroAdj);
        const objectiveVals = calcAdjustedValues(baseKcal, baseContext, adjustments);

        const baseSecondary = (typeof calcSecondaryTargetsForKcal === 'function')
            ? calcSecondaryTargetsForKcal(baseVals.kcal, defaultSecondaryTargets, {
                saltMaxG: 0, fiberPer1000Kcal: 0, sugarMaxPctKcal: 0, satFatMaxPctKcal: 0, processingMaxScore: 0
            })
            : { salt: 0, fiber: 0, sugar: 0, saturatedFat: 0, processing: 0 };
        const objectiveSecondary = (typeof calcSecondaryTargetsForKcal === 'function')
            ? calcSecondaryTargetsForKcal(objectiveVals.kcal, defaultSecondaryTargets, secondaryAdjustments)
            : baseSecondary;
        const hydrationBase = targets.getHydrationBaseTargets(userProfile, hydrationDefaults, { hydration: 0 });
        const hydrationAdjusted = targets.getHydrationBaseTargets(userProfile, hydrationDefaults, { hydration: adjustments.hydration || 0 });

        const rawValues = {
            kcal: { base: baseKcal, adjusted: objectiveVals.kcal },
            p: { base: baseVals.p, adjusted: objectiveVals.p },
            c: { base: baseVals.c, adjusted: objectiveVals.c },
            f: { base: baseVals.f, adjusted: objectiveVals.f },
            hydration: {
                base: hydrationBase ? { min: hydrationBase.min, max: hydrationBase.max } : null,
                adjusted: hydrationAdjusted ? { min: hydrationAdjusted.min, max: hydrationAdjusted.max } : null
            },
            salt: { base: baseSecondary.salt, adjusted: objectiveSecondary.salt },
            fiber: { base: baseSecondary.fiber, adjusted: objectiveSecondary.fiber },
            sugar: { base: baseSecondary.sugar, adjusted: objectiveSecondary.sugar },
            saturatedFat: { base: baseSecondary.saturatedFat, adjusted: objectiveSecondary.saturatedFat },
            processing: { base: baseSecondary.processing, adjusted: objectiveSecondary.processing }
        };
        const rowValues = Object.keys(rawValues).reduce((acc, key) => {
            acc[key] = {
                base: formatMetricValue(key, rawValues[key].base),
                adjusted: formatMetricValue(key, rawValues[key].adjusted)
            };
            return acc;
        }, {});

        ADJUSTMENT_ROWS.forEach(row => {
            const baseCell = document.getElementById(`result-base-${row.key}`);
            const adjustedCell = document.getElementById(`result-adjusted-${row.key}`);
            if (rowValues[row.key]) {
                if (baseCell) baseCell.innerHTML = renderMetricPill(row.key, row.icon, rowValues[row.key].base);
                if (adjustedCell) adjustedCell.innerHTML = renderMetricPill(row.key, row.icon, rowValues[row.key].adjusted);
            }
        });
    };

    const showRuleModal = (rowKey) => {
        const row = ADJUSTMENT_ROWS_BY_KEY[rowKey];
        if (!row) return;
        UI.showModal({
            id: 'rule-info-modal',
            titleHtml: `<h3 class="modal-title">${row.label}</h3>`,
            bodyHtml: `
                <div class="text-sm">
                    <div class="text-label">C&aacute;lculo</div>
                    <p class="text-muted">${row.rule()}</p>
                    <div class="text-label">Descripci&oacute;n</div>
                    <p class="text-muted">${row.description || '-'}</p>
                </div>
            `
        });
    };

    const renderWeeklyGoals = (profile, adjustments) => {
        const table = document.getElementById('daily-goals-table');
        const tableHead = document.getElementById('daily-goals-head');
        const tableBody = document.getElementById('daily-goals-body');
        if (!table || !tableHead || !tableBody) return;
        tableBody.innerHTML = '';
        const exercises = (typeof EXERCISES !== 'undefined') ? EXERCISES : null;
        const dailyTargets = computeDailyTargets(weeklyPlan, profile, adjustments, exercises) || {};
        const roundTo = (value, decimals) => {
            const factor = 10 ** decimals;
            return Math.round(value * factor) / factor;
        };
        const normalizeSecondary = (vals) => {
            const salt = parseFloat(vals && vals.salt);
            const fiber = parseFloat(vals && vals.fiber);
            const sugar = parseFloat(vals && vals.sugar);
            const saturatedFat = parseFloat(vals && vals.saturatedFat);
            const processing = parseFloat(vals && vals.processing);
            return {
                salt: Number.isFinite(salt) ? roundTo(salt, 2) : 0,
                fiber: Number.isFinite(fiber) ? roundTo(fiber, 1) : 0,
                sugar: Number.isFinite(sugar) ? roundTo(sugar, 1) : 0,
                saturatedFat: Number.isFinite(saturatedFat) ? roundTo(saturatedFat, 1) : 0,
                processing: Number.isFinite(processing) ? roundTo(processing, 1) : 0
            };
        };
        const formatGoalCell = (row, dayData) => {
            if (row.key === 'hydration') {
                return renderMetricPill(row.key, row.icon, formatHydrationRange(dayData.hydrationMin, dayData.hydrationMax));
            }
            const dayMetricValue = dayData[DAY_METRIC_KEY[row.key]];
            return renderMetricPill(row.key, row.icon, formatMetricValue(row.key, dayMetricValue));
        };

        const baseRest = formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * restBmrFactor;
        const dailyMacroRatios = (typeof getDailyMacroRatios === 'function')
            ? getDailyMacroRatios()
            : Array(DAYS_COUNT).fill(defaultMacroRatios);
        const activityPlan = Array.isArray(weeklyPlan) ? weeklyPlan : [];

        const todayIndex = UI.getTodayIndex();
        tableHead.innerHTML = `
            <tr>
                <th class="goals-row-header">Objetivo</th>
                ${WEEK_DAYS.map((day, index) => `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${day}</th>`).join('')}
            </tr>
        `;

        const weekRows = [];
        WEEK_DAYS.forEach((day, index) => {
            const dayData = activityPlan[index] || {};
            const walkInfo = getDayWalkInfo(dayData);
            const macroContext = getMacroContext();
            const dayMacroRatios = dailyMacroRatios[index] || (defaultMacroRatios || { p: 0.30, c: 0.40, f: 0.30 });
            const macroContextWithRatios = { ...macroContext, macroRatios: dayMacroRatios };
            const rawDayVals = dailyTargets[day] || calcAdjustedValues(baseRest, macroContextWithRatios, adjustments);
            const dayVals = {
                kcal: Number.isFinite(parseFloat(rawDayVals.kcal)) ? Math.round(parseFloat(rawDayVals.kcal)) : 0,
                p: Number.isFinite(parseFloat(rawDayVals.p)) ? Math.round(parseFloat(rawDayVals.p)) : Math.round(parseFloat(rawDayVals.protein) || 0),
                c: Number.isFinite(parseFloat(rawDayVals.c)) ? Math.round(parseFloat(rawDayVals.c)) : Math.round(parseFloat(rawDayVals.carbs) || 0),
                f: Number.isFinite(parseFloat(rawDayVals.f)) ? Math.round(parseFloat(rawDayVals.f)) : Math.round(parseFloat(rawDayVals.fat) || 0),
                hydrationMin: Number.isFinite(parseFloat(rawDayVals.hydrationMin)) ? Math.round(parseFloat(rawDayVals.hydrationMin)) : 0,
                hydrationMax: Number.isFinite(parseFloat(rawDayVals.hydrationMax)) ? Math.round(parseFloat(rawDayVals.hydrationMax)) : 0
            };
            const secondaryVals = (dailyTargets[day] && Number.isFinite(parseFloat(dailyTargets[day].salt)))
                ? normalizeSecondary(dailyTargets[day])
                : normalizeSecondary(
                    (typeof calcSecondaryTargetsForKcal === 'function')
                        ? calcSecondaryTargetsForKcal(dayVals.kcal)
                        : {}
                );
            weekRows.push({
                activityLabel: getDayActivityLabel(dayData),
                steps: walkInfo.steps || 0,
                macroRatios: dayMacroRatios,
                ...dayVals,
                ...secondaryVals
            });
        });

        const macroRowHtml = `
            <tr>
                <td class="goals-row-header">Macros (%)</td>
                ${weekRows.map((row, index) => {
                    const ratios = row.macroRatios || defaultMacroRatios;
                    const p = formatMacroPct(ratios.p);
                    const c = formatMacroPct(ratios.c);
                    const f = formatMacroPct(ratios.f);
                    return `
                        <td class="goals-table__cell">
                            <div class="macro-inputs">
                                <div class="macro-inputs__row">
                                    <span class="text-muted">P</span>
                                    <input type="number" class="input-base input-base--table-edit"
                                        data-macro-day-index="${index}" data-macro-key="p" value="${p}" min="0" max="100" step="1">
                                </div>
                                <div class="macro-inputs__row">
                                    <span class="text-muted">C</span>
                                    <input type="number" class="input-base input-base--table-edit"
                                        data-macro-day-index="${index}" data-macro-key="c" value="${c}" min="0" max="100" step="1">
                                </div>
                                <div class="macro-inputs__row">
                                    <span class="text-muted">F</span>
                                    <input type="number" class="input-base input-base--table-edit"
                                        data-macro-day-index="${index}" data-macro-key="f" value="${f}" min="0" max="100" step="1">
                                </div>
                            </div>
                        </td>
                    `;
                }).join('')}
            </tr>
        `;

        const activityRowHtml = `
            <tr>
                <td class="goals-row-header">Actividad</td>
                ${weekRows.map((row) => `
                    <td class="goals-table__cell">
                        <div class="stats-pills">
                            <div class="stat-pill stat-pill--xs">🏋️ ${row.activityLabel || 'Actividad'}</div>
                            <div class="stat-pill stat-pill--xs">👣 ${Math.max(0, parseInt(row.steps, 10) || 0)} pasos</div>
                        </div>
                    </td>
                `).join('')}
            </tr>
        `;

        const goalsRowsHtml = ADJUSTMENT_ROWS.map((row) => `
            <tr>
                <td class="goals-row-header">${row.label}</td>
                ${weekRows.map(dayData => `<td class="goals-table__cell">${formatGoalCell(row, dayData)}</td>`).join('')}
            </tr>
        `).join('');

        tableBody.innerHTML = macroRowHtml + activityRowHtml + goalsRowsHtml;
        setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };

    const updateAndCalculate = () => {
        try {
            const { profile, adjustments } = readAndSaveInputs();
            const bmr = renderBaseResults(profile);
            if (bmr > 0) {
                renderAdjustmentsTable(bmr, adjustments);
                renderWeeklyGoals(profile, adjustments);
            }
        } catch (err) {
            console.error('Error en updateAndCalculate (Calculadora):', err);
            UI.showError(container, 'Error actualizando Cálculos de la Calculadora.');
        }
    };

    profileCard.querySelectorAll('input, select').forEach(el => el.addEventListener('change', updateAndCalculate));
    adjustmentsCard.querySelectorAll('select').forEach(el => el.addEventListener('change', updateAndCalculate));
    weeklyGoalsCard.addEventListener('change', (event) => {
        if (event.target && event.target.matches('input[data-macro-day-index][data-macro-key]')) {
            updateAndCalculate();
        }
    });
    adjustmentsCard.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-rule-key]');
        if (!trigger) return;
        showRuleModal(trigger.dataset.ruleKey);
    });

    updateAndCalculate();
}






