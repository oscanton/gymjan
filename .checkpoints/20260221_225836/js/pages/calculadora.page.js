/* =========================================
   pages/calculadora.page.js - CALCULADORA
   ========================================= */

function renderCalculatorPage() {
    const container = document.getElementById('calculadora-container');
    if (!container) return;

    if (typeof Formulas === 'undefined' || typeof Targets === 'undefined' || typeof ActivityStore === 'undefined') {
        UI.showError(container, 'Error cargando dependencias (formulas/targets/stores).');
        return;
    }

    const optionalLoads = [
        { when: () => typeof Routines === 'undefined', path: 'js/core/routines.js' },
        { when: () => typeof EXERCISES === 'undefined', path: 'js/data/ejercicios.js' },
        { when: () => typeof STEP_ROUTINE === 'undefined', path: 'js/data/rutinas/rutina_pasos.js' }
    ];

    UI.loadDependencies(optionalLoads, { settled: true })
        .then(() => (typeof Routines !== 'undefined'
            ? Routines.ensureLoaded().catch((err) => {
                console.error('Routines.ensureLoaded() falló en calculadora:', err);
                return null;
            })
            : Promise.resolve()))
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
    const getMacroContextForRoutine = (routineId) => Targets.getMacroContext(routineId);

    const formatActivity = (key) => {
        if (typeof Routines !== 'undefined') {
            const r = Routines.getById(key);
            if (r && r.nombre) return r.nombre;
        }
        return (key || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // 1. Cargar datos (o defaults)
    const userProfile = DB.get('user_profile', {
        sex: 'hombre', age: 30, height: 175, weight: 75
    });

    const fallbackId = (typeof DEFAULT_ROUTINE_ID !== 'undefined') ? DEFAULT_ROUTINE_ID : 'recuperacion';
    const daysCount = DAYS_COUNT;
    const restBmrFactor = APP_REST_BMR_FACTOR;
    const defaultStepsCfg = APP_STEPS_DEFAULTS;
    const weeklyPlanRaw = ActivityStore.getWeeklyPlan();
    const weeklyPlan = Array.isArray(weeklyPlanRaw) ? weeklyPlanRaw.slice(0, daysCount) : Array(daysCount).fill(fallbackId);
    while (weeklyPlan.length < daysCount) weeklyPlan.push(fallbackId);

    let adjustments = DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0 });
    const defaultSecondaryTargets = Targets.getSecondaryDefaults();
    let secondaryAdjustments = DB.get('user_secondary_adjustments', {
        saltMaxG: 0,
        fiberPer1000Kcal: 0,
        sugarMaxPctKcal: 0,
        satFatMaxPctKcal: 0,
        processingMaxScore: 0
    });

    // --- SECCIÓN 1: DATOS PERSONALES ---
    const profileCard = document.createElement('div');
    profileCard.className = 'glass-card card';
    profileCard.innerHTML = `
        <h2>Datos Personales</h2>
        <div class="section-group__grid">
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

    // --- SECCIÓN 2: RESULTADOS BASE ---
    const baseResultsCard = document.createElement('div');
    baseResultsCard.className = 'glass-card card mt-lg';
    container.appendChild(baseResultsCard);

    // --- SECCIÓN 4: AJUSTES GENERALES ---
    const adjustmentsCard = document.createElement('div');
    adjustmentsCard.className = 'glass-card card mt-lg';
    const generateOpts = (val) => {
        const steps = [0.20, 0.15, 0.10, 0.05, 0, -0.05, -0.10, -0.15, -0.20];
        return steps.map(s => {
            const label = s === 0 ? "0%" : (s > 0 ? `+${Math.round(s * 100)}%` : `${Math.round(s * 100)}%`);
            return `<option value="${s}" ${Math.abs(val - s) < 0.001 ? 'selected' : ''}>${label}</option>`;
        }).join('');
    };

    const formatRuleValue = (value, decimals = 1) => {
        const safe = Number.isFinite(value) ? value : 0;
        const rounded = Math.round(safe * (10 ** decimals)) / (10 ** decimals);
        return Number.isInteger(rounded) ? `${rounded}` : `${rounded}`;
    };
    const formatRuleFactor = (value) => {
        const safe = Number.isFinite(value) ? value : 0;
        return safe.toFixed(2).replace('.', ',');
    };
    const getReposoMacroRatios = () => {
        const reposoContext = getMacroContextForRoutine(fallbackId);
        const source = reposoContext && reposoContext.macroRatios
            ? reposoContext.macroRatios
            : Formulas.DEFAULT_MACRO_RATIOS;
        return {
            p: Number.isFinite(source.p) ? source.p : Formulas.DEFAULT_MACRO_RATIOS.p,
            c: Number.isFinite(source.c) ? source.c : Formulas.DEFAULT_MACRO_RATIOS.c,
            f: Number.isFinite(source.f) ? source.f : Formulas.DEFAULT_MACRO_RATIOS.f
        };
    };
    const reposoMacroRatios = getReposoMacroRatios();
    const formatMetricValue = (key, value) => {
        const safe = Number.isFinite(value) ? value : 0;
        if (key === 'kcal') return `${Math.round(safe)} kcal`;
        if (key === 'p' || key === 'c' || key === 'f') return `${Math.round(safe)} g`;
        if (key === 'salt') return `${formatRuleValue(safe, 2)} g`;
        if (key === 'processing') return `${formatRuleValue(safe, 1)} /10`;
        return `${formatRuleValue(safe, 1)} g`;
    };
    const renderMetricPill = (key, icon, value) => `
        <div class="stats-pills">
            <div class="stat-pill stat-pill--xs ${key === 'kcal' ? 'stat-pill--kcal' : ''}">${icon} ${value}</div>
        </div>
    `;

    const ADJUSTMENT_ROWS = [
        { key: 'kcal', icon: '🔥', label: 'Energía', rule: () => 'Objetivo: 1,2 x BMR', adjustmentSource: 'macro', adjustmentKey: 'kcal' },
        { key: 'p', icon: '🥩', label: 'Proteína', rule: () => `Objetivo: (Kcals x ${formatRuleFactor(reposoMacroRatios.p)}) / 4`, adjustmentSource: 'macro', adjustmentKey: 'p' },
        { key: 'c', icon: '🍚', label: 'Carbo H', rule: () => `Objetivo: (Kcals x ${formatRuleFactor(reposoMacroRatios.c)}) / 4`, adjustmentSource: 'macro', adjustmentKey: 'c' },
        { key: 'f', icon: '🥑', label: 'Grasas', rule: () => `Objetivo: (Kcals x ${formatRuleFactor(reposoMacroRatios.f)}) / 9`, adjustmentSource: 'macro', adjustmentKey: 'f' },
        {
            key: 'salt',
            icon: '🧂',
            label: 'Sal',
            rule: () => `Máx: ${formatRuleValue(defaultSecondaryTargets.saltMaxG, 2)}g / día`,
            adjustmentSource: 'secondary',
            adjustmentKey: 'saltMaxG'
        },
        {
            key: 'fiber',
            icon: '🌾',
            label: 'Fibra',
            rule: () => `Mín: ${formatRuleValue(defaultSecondaryTargets.fiberPer1000Kcal, 1)}g / 1000kcals`,
            adjustmentSource: 'secondary',
            adjustmentKey: 'fiberPer1000Kcal'
        },
        {
            key: 'sugar',
            icon: '🍬',
            label: 'Azúcar',
            rule: () => `Máximo: ${formatRuleValue(defaultSecondaryTargets.sugarMaxPctKcal * 100, 1)}% kcals`,
            adjustmentSource: 'secondary',
            adjustmentKey: 'sugarMaxPctKcal'
        },
        {
            key: 'saturatedFat',
            icon: '🧈',
            label: 'Grasa sat.',
            rule: () => `Máximo: ${formatRuleValue(defaultSecondaryTargets.satFatMaxPctKcal * 100, 1)}% kcals`,
            adjustmentSource: 'secondary',
            adjustmentKey: 'satFatMaxPctKcal'
        },
        {
            key: 'processing',
            icon: '🏭',
            label: 'Procesado',
            rule: () => `Máximo: ${formatRuleValue(defaultSecondaryTargets.processingMaxScore, 1)}/10`,
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
        <h2>OBJETIVOS GENERALES EN REPOSO</h2>
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

    // --- SECCIÓN 5: OBJETIVOS SEMANALES ---
    const weeklyGoalsCard = document.createElement('div');
    weeklyGoalsCard.className = 'glass-card card mt-lg';
    weeklyGoalsCard.innerHTML = `
        <h2>OBJETIVOS DIARIOS CON ACTIVIDAD</h2>
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

        return { profile, adjustments };
    };

    const renderBaseResults = (profile) => {
        const bmi = Formulas.calcBMI(profile.weight, profile.height);
        const bmiData = Formulas.getBMICategory(bmi);
        const bmr = Formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex);

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
                        <div class="stat-pill stat-pill--kcal">🔥 ${bmr} kcal</div>
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
        const baseContext = getMacroContextForRoutine(fallbackId);
        const baseVals = Targets.getAdjustedValues(baseKcal, baseContext, zeroAdj);
        const objectiveVals = Targets.getAdjustedValues(baseKcal, baseContext, adjustments);

        const baseSecondary = (typeof Targets.getSecondaryTargetsForKcal === 'function')
            ? Targets.getSecondaryTargetsForKcal(baseVals.kcal, defaultSecondaryTargets, {
                saltMaxG: 0, fiberPer1000Kcal: 0, sugarMaxPctKcal: 0, satFatMaxPctKcal: 0, processingMaxScore: 0
            })
            : { salt: 0, fiber: 0, sugar: 0, saturatedFat: 0, processing: 0 };
        const objectiveSecondary = (typeof Targets.getSecondaryTargetsForKcal === 'function')
            ? Targets.getSecondaryTargetsForKcal(objectiveVals.kcal, defaultSecondaryTargets, secondaryAdjustments)
            : baseSecondary;

        const rawValues = {
            kcal: { base: baseKcal, adjusted: objectiveVals.kcal },
            p: { base: baseVals.p, adjusted: objectiveVals.p },
            c: { base: baseVals.c, adjusted: objectiveVals.c },
            f: { base: baseVals.f, adjusted: objectiveVals.f },
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
            bodyHtml: `<p class="text-muted">${row.rule()}</p>`
        });
    };

    const renderWeeklyGoals = (profile, adjustments) => {
        const table = document.getElementById('daily-goals-table');
        const tableHead = document.getElementById('daily-goals-head');
        const tableBody = document.getElementById('daily-goals-body');
        if (!table || !tableHead || !tableBody) return;
        tableBody.innerHTML = '';
        const exercises = (typeof EXERCISES !== 'undefined') ? EXERCISES : null;
        const dailyTargets = Targets.recalculateDailyTargets(weeklyPlan, profile, adjustments, exercises) || {};
        const normalizeSecondary = (vals) => ({
            salt: Number.isFinite(parseFloat(vals && vals.salt)) ? (Math.round(parseFloat(vals.salt) * 100) / 100) : 0,
            fiber: Number.isFinite(parseFloat(vals && vals.fiber)) ? (Math.round(parseFloat(vals.fiber) * 10) / 10) : 0,
            sugar: Number.isFinite(parseFloat(vals && vals.sugar)) ? (Math.round(parseFloat(vals.sugar) * 10) / 10) : 0,
            saturatedFat: Number.isFinite(parseFloat(vals && vals.saturatedFat)) ? (Math.round(parseFloat(vals.saturatedFat) * 10) / 10) : 0,
            processing: Number.isFinite(parseFloat(vals && vals.processing)) ? (Math.round(parseFloat(vals.processing) * 10) / 10) : 0
        });
        const formatGoalCell = (row, dayData) => {
            const dayMetricValue = dayData[DAY_METRIC_KEY[row.key]];
            return renderMetricPill(row.key, row.icon, formatMetricValue(row.key, dayMetricValue));
        };

        const baseRest = Formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex) * restBmrFactor;
        const savedStepsCfg = DB.get('activity_steps_config', {});
        const stepRoutine = (typeof STEP_ROUTINE !== 'undefined' && STEP_ROUTINE) ? STEP_ROUTINE : null;
        const walkItem = (stepRoutine && Array.isArray(stepRoutine.ejercicios))
            ? stepRoutine.ejercicios.find(e => e && e.ejercicioId === 'caminar')
            : null;
        const defaultSteps = parseInt(savedStepsCfg.objetivo, 10)
            || parseInt(walkItem && walkItem.totalPasos, 10)
            || parseInt(stepRoutine && stepRoutine.totalPasos, 10)
            || parseInt(stepRoutine && stepRoutine.objetivo, 10)
            || defaultStepsCfg.target;
        const dailySteps = ActivityStore.getDailySteps(defaultSteps);

        const todayIndex = UI.getTodayIndex();
        tableHead.innerHTML = `
            <tr>
                <th class="goals-row-header">Objetivo</th>
                ${WEEK_DAYS.map((day, index) => `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${day}</th>`).join('')}
            </tr>
        `;

        const weekRows = [];
        WEEK_DAYS.forEach((day, index) => {
            const routineId = weeklyPlan[index];
            const macroContext = getMacroContextForRoutine(routineId);
            const rawDayVals = dailyTargets[day] || Targets.getAdjustedValues(baseRest, macroContext, adjustments);
            const dayVals = {
                kcal: Number.isFinite(parseFloat(rawDayVals.kcal)) ? Math.round(parseFloat(rawDayVals.kcal)) : 0,
                p: Number.isFinite(parseFloat(rawDayVals.p)) ? Math.round(parseFloat(rawDayVals.p)) : Math.round(parseFloat(rawDayVals.protein) || 0),
                c: Number.isFinite(parseFloat(rawDayVals.c)) ? Math.round(parseFloat(rawDayVals.c)) : Math.round(parseFloat(rawDayVals.carbs) || 0),
                f: Number.isFinite(parseFloat(rawDayVals.f)) ? Math.round(parseFloat(rawDayVals.f)) : Math.round(parseFloat(rawDayVals.fat) || 0)
            };
            const secondaryVals = (dailyTargets[day] && Number.isFinite(parseFloat(dailyTargets[day].salt)))
                ? normalizeSecondary(dailyTargets[day])
                : normalizeSecondary(
                    (typeof Targets.getSecondaryTargetsForKcal === 'function')
                        ? Targets.getSecondaryTargetsForKcal(dayVals.kcal)
                        : {}
                );
            weekRows.push({
                routineId,
                steps: dailySteps[index] || 0,
                ...dayVals,
                ...secondaryVals
            });
        });

        const activityRowHtml = `
            <tr>
                <td class="goals-row-header">Actividad</td>
                ${weekRows.map((row) => `
                    <td class="goals-table__cell">
                        <div class="stats-pills">
                            <div class="stat-pill stat-pill--xs">🏋️ ${formatActivity(row.routineId)}</div>
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

        tableBody.innerHTML = activityRowHtml + goalsRowsHtml;
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
            UI.showError(container, 'Error actualizando cálculos de la Calculadora.');
        }
    };

    profileCard.querySelectorAll('input, select').forEach(el => el.addEventListener('change', updateAndCalculate));
    adjustmentsCard.querySelectorAll('select').forEach(el => el.addEventListener('change', updateAndCalculate));
    adjustmentsCard.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-rule-key]');
        if (!trigger) return;
        showRuleModal(trigger.dataset.ruleKey);
    });

    updateAndCalculate();
}


