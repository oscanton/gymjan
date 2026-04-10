function renderCalculatorPage() {
    UI.bootstrapPage({
        rootId: 'calculadora-container',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            requiredDeps: [
                { when: () => typeof TargetsApplicationService === 'undefined', path: 'js/core/application/targets.service.js' },
                { when: () => typeof CalculatorApplicationService === 'undefined', path: 'js/core/application/calculator.service.js' }
            ],
            settled: true,
            globals: ['CalculatorApplicationService'],
            exercises: true,
            activityPlanFile: Array.isArray(AVAILABLE_ACTIVITY_PLAN_FILES) && AVAILABLE_ACTIVITY_PLAN_FILES.length ? ActivityStore.getSelectedFile() : null
        }).catch(() => ({})),
        run: (container, context = {}) => {
            try {
                initCalculator(container, {
                    weeklyPlan: context.activityPlanData || null,
                    exercisesCatalog: context.exercisesData || null
                });
            } catch {
                UI.showError(container, 'Error renderizando la Calculadora.');
            }
        },
        onError: (container) => UI.showError(container, 'Error cargando dependencias (formulas/targets/stores).')
    });
}

function initCalculator(container, { weeklyPlan: initialWeeklyPlan = null, exercisesCatalog = null } = {}) {
    const formulas = window.FormulasEngine;
    const targets = window.TargetsEngine;
    const calculatorService = window.CalculatorApplicationService;
    if (!formulas || !targets || !calculatorService) {
        UI.showError(container, 'Error cargando dependencias (engine formulas/targets).');
        return;
    }
    if (typeof CoreBrowserDomain !== 'undefined') CoreBrowserDomain.applyMacroDefaults(formulas);

    const getDailyMacroRatios = () => CoreBrowserDomain.getDailyMacroRatios(targets, { formulas });
    const getUserMacroRatios = () => CoreBrowserDomain.getUserMacroRatios(targets, { formulas });
    const getObjectiveDescription = (key) => typeof targets.getObjectiveDescription === 'function' ? targets.getObjectiveDescription(key) : '';
    const initialState = calculatorService.getInitialState({
        formulas,
        targets,
        browserDomain: CoreBrowserDomain,
        weeklyPlan: initialWeeklyPlan
    });
    const userProfile = initialState.userProfile;
    const restBmrFactor = initialState.restBmrFactor;
    const weeklyPlan = initialState.weeklyPlan;
    const defaultSecondaryTargets = initialState.defaultSecondaryTargets;
    const hydrationDefaults = initialState.hydrationDefaults;
    const defaultMacroRatios = initialState.defaultMacroRatios;
    let adjustments = initialState.adjustments;
    let secondaryAdjustments = initialState.secondaryAdjustments;
    let macroRatios = initialState.macroRatios;
    const getRestMacroRatios = () => ({
        p: Number.isFinite(macroRatios.p) ? macroRatios.p : defaultMacroRatios.p,
        c: Number.isFinite(macroRatios.c) ? macroRatios.c : defaultMacroRatios.c,
        f: Number.isFinite(macroRatios.f) ? macroRatios.f : defaultMacroRatios.f
    });
    let restMacroRatios = getRestMacroRatios();

    const renderProfileRow = (label, control) => `<div class="row-item"><span class="row-item__title">${label}</span>${control}</div>`;
    const profileCard = document.createElement('div');
    profileCard.className = 'glass-card card';
    profileCard.innerHTML = `
        <h2>Datos Personales</h2>
        <div class="section-group__grid section-group__grid--center">
            ${renderProfileRow('Sexo', `<select id="calc-sex" class="input-base input-select w-auto"><option value="hombre" ${userProfile.sex === 'hombre' ? 'selected' : ''}>Hombre</option><option value="mujer" ${userProfile.sex === 'mujer' ? 'selected' : ''}>Mujer</option></select>`)}
            ${renderProfileRow('Edad', `<input type="number" id="calc-age" class="row-item__input" value="${userProfile.age}">`)}
            ${renderProfileRow('Altura (cm)', `<input type="number" id="calc-height" class="row-item__input" value="${userProfile.height}">`)}
            ${renderProfileRow('Peso (kg)', `<input type="number" id="calc-weight" class="row-item__input" value="${userProfile.weight}">`)}
        </div>
    `;
    container.appendChild(profileCard);

    const baseResultsCard = Object.assign(document.createElement('div'), { className: 'glass-card card mt-lg' });
    container.appendChild(baseResultsCard);

    const adjustmentsCard = Object.assign(document.createElement('div'), { className: 'glass-card card mt-lg' });
    const PCT_STEPS = [0.20, 0.15, 0.10, 0.05, 0, -0.05, -0.10, -0.15, -0.20];
    const renderAdjustmentOptions = (value) => PCT_STEPS.map((step) => {
        const label = step === 0 ? '0%' : `${step > 0 ? '+' : ''}${Math.round(step * 100)}%`;
        return `<option value="${step}" ${Math.abs(value - step) < 0.001 ? 'selected' : ''}>${label}</option>`;
    }).join('');
    const formatRuleValue = (value, decimals = 1) => UI.formatNumber(value, decimals);
    const formatHydrationRange = (minMl, maxMl) => (
        Number.isFinite(minMl) && Number.isFinite(maxMl) ? `${formatRuleValue(minMl / 1000, 1)}-${formatRuleValue(maxMl / 1000, 1)} L` : '-'
    );
    const formatMacroPct = (ratio) => Math.round((Number.isFinite(ratio) ? ratio : 0) * 100);
    const formatMetricValue = (key, value) => {
        if (key === 'hydration') return value && typeof value === 'object' ? formatHydrationRange(value.min, value.max) : '-';
        const safe = Number.isFinite(value) ? value : 0;
        if (key === 'kcal') return UI.formatKcal(safe);
        if (key === 'salt') return UI.formatGrams(safe, 2);
        if (key === 'processing') return UI.formatScore(safe, 1, 10);
        return UI.formatGrams(safe, new Set(['p', 'c', 'f', 'saturatedFat', 'fiber', 'sugar']).has(key) ? 0 : 1);
    };
    const renderMetricPill = (key, value) => `<div class="stats-pills"><div class="stat-pill stat-pill--xs${key === 'kcal' ? ' stat-pill--kcal' : ''}">${value}</div></div>`;
    const buildAdjustmentRow = (key, label, rule, adjustmentSource, adjustmentKey = key) => ({
        key,
        label,
        rule,
        description: getObjectiveDescription(key),
        adjustmentSource,
        adjustmentKey
    });
    const ADJUSTMENT_ROWS = [
        buildAdjustmentRow('kcal', 'Energ\u00EDa', () => 'Objetivo: 1,2 x BMR', 'macro'),
        buildAdjustmentRow('p', 'Prote\u00EDna', () => `Objetivo: ${formatRuleValue(restMacroRatios.p * 100, 1)}% de kcal (g = (kcal x %)/4)`, 'macro'),
        buildAdjustmentRow('c', 'Carbohidratos', () => `Objetivo: ${formatRuleValue(restMacroRatios.c * 100, 1)}% de kcal (g = (kcal x %)/4)`, 'macro'),
        buildAdjustmentRow('f', 'Grasas', () => `Objetivo: ${formatRuleValue(restMacroRatios.f * 100, 1)}% de kcal (g = (kcal x %)/9)`, 'macro'),
        buildAdjustmentRow('hydration', 'Hidrataci\u00F3n', () => `Objetivo: ${formatRuleValue(hydrationDefaults.minMlPerKg, 0)}-${formatRuleValue(hydrationDefaults.maxMlPerKg, 0)} ml/kg (+${formatRuleValue(hydrationDefaults.activityMlPerMin, 0)} ml/min actividad)`, 'macro'),
        buildAdjustmentRow('salt', 'Sal', () => `M\u00E1x: ${UI.formatGrams(defaultSecondaryTargets.saltMaxG, 2)} / d\u00EDa`, 'secondary', 'saltMaxG'),
        buildAdjustmentRow('fiber', 'Fibra', () => `M\u00EDn: ${UI.formatGrams(defaultSecondaryTargets.fiberPer1000Kcal, 1)} / 1000 kcal`, 'secondary', 'fiberPer1000Kcal'),
        buildAdjustmentRow('sugar', 'Az\u00FAcar', () => `M\u00E1x: ${formatRuleValue(defaultSecondaryTargets.sugarMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/4)`, 'secondary', 'sugarMaxPctKcal'),
        buildAdjustmentRow('saturatedFat', 'Grasa sat.', () => `M\u00E1x: ${formatRuleValue(defaultSecondaryTargets.satFatMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/9)`, 'secondary', 'satFatMaxPctKcal'),
        buildAdjustmentRow('processing', 'Procesado', () => `M\u00E1ximo: ${UI.formatScore(defaultSecondaryTargets.processingMaxScore, 1, 10)}`, 'secondary', 'processingMaxScore')
    ];
    const ADJUSTMENT_ROWS_BY_KEY = Object.fromEntries(ADJUSTMENT_ROWS.map((row) => [row.key, row]));
    const getAdjustmentSelectId = (row) => `${row.adjustmentSource === 'macro' ? 'adj' : 'sec-adj'}-${row.adjustmentKey}`;

    adjustmentsCard.innerHTML = `
        <h2>OBJETIVOS GENERALES (EN REPOSO)</h2>
        <div class="adjustments-table-wrap">
            <table class="adjustments-table">
                <thead><tr><th>Objetivo</th><th>RESULTADO BASE</th><th>Ajuste</th><th>RESULTADO AJUSTADO</th></tr></thead>
                <tbody>${ADJUSTMENT_ROWS.map((row) => `
                    <tr>
                        <td class="adjustments-table__label"><button type="button" class="adjustments-table__label-btn modal-trigger modal-trigger--button" data-rule-key="${row.key}">${row.label}</button></td>
                        <td class="adjustments-table__result-base" id="result-base-${row.key}">-</td>
                        <td class="adjustments-table__adj"><select id="${getAdjustmentSelectId(row)}" class="input-base input-select input-select--sm">${renderAdjustmentOptions(row.adjustmentSource === 'macro' ? (adjustments[row.adjustmentKey] || 0) : (secondaryAdjustments[row.adjustmentKey] || 0))}</select></td>
                        <td class="adjustments-table__result-objective" id="result-adjusted-${row.key}">-</td>
                    </tr>
                `).join('')}</tbody>
            </table>
        </div>
    `;
    container.appendChild(adjustmentsCard);

    const weeklyGoalsCard = Object.assign(document.createElement('div'), {
        className: 'glass-card card mt-lg',
        innerHTML: `
            <h2>OBJETIVOS DIARIOS</h2>
            <div class="table-scroller mt-sm">
                <table id="daily-goals-table" class="goals-table">
                    <thead id="daily-goals-head"></thead>
                    <tbody id="daily-goals-body"></tbody>
                </table>
            </div>
        `
    });
    container.appendChild(weeklyGoalsCard);

    const readAndSaveInputs = () => {
        const profile = {
            sex: document.getElementById('calc-sex').value,
            age: parseInt(document.getElementById('calc-age').value) || 0,
            height: parseInt(document.getElementById('calc-height').value) || 0,
            weight: parseFloat(document.getElementById('calc-weight').value) || 0
        };

        ADJUSTMENT_ROWS.forEach((row) => {
            const select = document.getElementById(getAdjustmentSelectId(row));
            const value = select ? parseFloat(select.value) : 0;
            if (row.adjustmentSource === 'macro') adjustments[row.adjustmentKey] = Number.isFinite(value) ? value : 0;
            else secondaryAdjustments[row.adjustmentKey] = Number.isFinite(value) ? value : 0;
        });

        let normalizedDaily = null;
        const macroInputs = document.querySelectorAll('input[data-macro-day-index][data-macro-key]');
        if (macroInputs.length) {
            const baseDaily = typeof getDailyMacroRatios === 'function' ? getDailyMacroRatios() : Array(DAYS_COUNT).fill(defaultMacroRatios);
            const dayData = Array.from({ length: DAYS_COUNT }, (_, index) => ({
                p: baseDaily[index] ? baseDaily[index].p * 100 : 30,
                c: baseDaily[index] ? baseDaily[index].c * 100 : 40,
                f: baseDaily[index] ? baseDaily[index].f * 100 : 30
            }));
            macroInputs.forEach((input) => {
                const dayIndex = parseInt(input.dataset.macroDayIndex, 10);
                const key = input.dataset.macroKey;
                const value = parseFloat(input.value);
                if (!Number.isNaN(dayIndex) && dayIndex >= 0 && dayIndex < dayData.length && key && Number.isFinite(value)) dayData[dayIndex][key] = value;
            });
            normalizedDaily = dayData.map((entry, index) => {
                const sum = entry.p + entry.c + entry.f;
                return sum > 0 ? { p: entry.p / sum, c: entry.c / sum, f: entry.f / sum } : (baseDaily[index] || defaultMacroRatios);
            });
            macroRatios = typeof getUserMacroRatios === 'function' ? getUserMacroRatios() : defaultMacroRatios;
            restMacroRatios = getRestMacroRatios();
        }

        calculatorService.saveProfileAndAdjustments({ profile, adjustments, secondaryAdjustments, dailyMacroRatios: normalizedDaily });
        return { profile, adjustments };
    };

    const renderBaseResults = (profile) => {
        const { bmi, bmiData, bmr } = calculatorService.getBaseResults({ profile, formulas });
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
                    <div class="stats-pills stats-pills--center my-sm"><div class="stat-pill stat-pill--kcal">${Number.isFinite(bmr) ? Math.round(bmr) : 0} kcal</div></div>
                    <div class="text-sm text-muted mt-auto">Basal</div>
                </div>
            </div>
        `;
        return bmr;
    };

    const renderAdjustmentsTable = (profile, adjustments) => {
        const restGoals = calculatorService.getRestGoalsModel({
            profile,
            adjustments,
            secondaryAdjustments,
            formulas,
            targets,
            browserDomain: CoreBrowserDomain,
            restBmrFactor
        });
        const valuesByKey = {
            kcal: { base: restGoals.baseKcal, adjusted: restGoals.objectiveVals.kcal },
            p: { base: restGoals.baseVals.p, adjusted: restGoals.objectiveVals.p },
            c: { base: restGoals.baseVals.c, adjusted: restGoals.objectiveVals.c },
            f: { base: restGoals.baseVals.f, adjusted: restGoals.objectiveVals.f },
            hydration: {
                base: restGoals.hydrationBase ? { min: restGoals.hydrationBase.min, max: restGoals.hydrationBase.max } : null,
                adjusted: restGoals.hydrationAdjusted ? { min: restGoals.hydrationAdjusted.min, max: restGoals.hydrationAdjusted.max } : null
            },
            salt: { base: restGoals.baseSecondary.salt, adjusted: restGoals.objectiveSecondary.salt },
            fiber: { base: restGoals.baseSecondary.fiber, adjusted: restGoals.objectiveSecondary.fiber },
            sugar: { base: restGoals.baseSecondary.sugar, adjusted: restGoals.objectiveSecondary.sugar },
            saturatedFat: { base: restGoals.baseSecondary.saturatedFat, adjusted: restGoals.objectiveSecondary.saturatedFat },
            processing: { base: restGoals.baseSecondary.processing, adjusted: restGoals.objectiveSecondary.processing }
        };
        ADJUSTMENT_ROWS.forEach((row) => {
            const values = valuesByKey[row.key];
            if (!values) return;
            const baseCell = document.getElementById(`result-base-${row.key}`);
            const adjustedCell = document.getElementById(`result-adjusted-${row.key}`);
            if (baseCell) baseCell.innerHTML = renderMetricPill(row.key, formatMetricValue(row.key, values.base));
            if (adjustedCell) adjustedCell.innerHTML = renderMetricPill(row.key, formatMetricValue(row.key, values.adjusted));
        });
    };

    const showRuleModal = (rowKey) => {
        const row = ADJUSTMENT_ROWS_BY_KEY[rowKey];
        if (!row) return;
        UI.showModal({
            id: 'rule-info-modal',
            titleHtml: `<h3 class="modal-title">${row.label}</h3>`,
            bodyHtml: `<div class="text-sm"><div class="text-label">C&aacute;lculo</div><p class="text-muted">${row.rule()}</p><div class="text-label">Descripci&oacute;n</div><p class="text-muted">${row.description || '-'}</p></div>`
        });
    };

    const renderWeeklyGoals = (profile, adjustments) => {
        const table = document.getElementById('daily-goals-table');
        const tableHead = document.getElementById('daily-goals-head');
        const tableBody = document.getElementById('daily-goals-body');
        if (!table || !tableHead || !tableBody) return;

        const weekRows = calculatorService.getWeeklyGoalsModel({
            profile,
            adjustments,
            formulas,
            targets,
            browserDomain: CoreBrowserDomain,
            weeklyPlan,
            exercisesMap: exercisesCatalog
        }).weekRows;
        const todayIndex = UI.getTodayIndex();
        const formatGoalCell = (row, dayData) => renderMetricPill(row.key, row.key === 'hydration'
            ? formatHydrationRange(dayData.hydrationMin, dayData.hydrationMax)
            : formatMetricValue(row.key, dayData[row.key]));
        const renderMacroInputs = (ratios, index) => ['p', 'c', 'f'].map((key) => `
            <div class="macro-inputs__row">
                <span class="text-muted">${key.toUpperCase()}</span>
                <input type="number" class="input-base input-base--table-edit" data-macro-day-index="${index}" data-macro-key="${key}" value="${formatMacroPct(ratios[key])}" min="0" max="100" step="1">
            </div>
        `).join('');

        tableHead.innerHTML = `<tr><th class="goals-row-header">Objetivo</th>${WEEK_DAYS.map((day, index) => `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${day}</th>`).join('')}</tr>`;
        tableBody.innerHTML = `
            <tr>
                <td class="goals-row-header">Macros (%)</td>
                ${weekRows.map((row, index) => `<td class="goals-table__cell"><div class="macro-inputs">${renderMacroInputs(row.macroRatios || defaultMacroRatios, index)}</div></td>`).join('')}
            </tr>
            <tr>
                <td class="goals-row-header">Actividad</td>
                ${weekRows.map((row) => `<td class="goals-table__cell"><div class="stats-pills"><div class="stat-pill stat-pill--xs">${row.activityLabel || 'Actividad'}</div><div class="stat-pill stat-pill--xs">${Math.max(0, parseInt(row.steps, 10) || 0)} pasos</div></div></td>`).join('')}
            </tr>
            ${ADJUSTMENT_ROWS.map((row) => `<tr><td class="goals-row-header">${row.label}</td>${weekRows.map((dayData) => `<td class="goals-table__cell">${formatGoalCell(row, dayData)}</td>`).join('')}</tr>`).join('')}
        `;
        setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };

    const updateAndCalculate = () => {
        try {
            const { profile, adjustments } = readAndSaveInputs();
            if (renderBaseResults(profile) > 0) {
                renderAdjustmentsTable(profile, adjustments);
                renderWeeklyGoals(profile, adjustments);
            }
        } catch {
            UI.showError(container, 'Error actualizando c\u00E1lculos de la Calculadora.');
        }
    };

    profileCard.querySelectorAll('input, select').forEach((element) => element.addEventListener('change', updateAndCalculate));
    adjustmentsCard.querySelectorAll('select').forEach((element) => element.addEventListener('change', updateAndCalculate));
    weeklyGoalsCard.addEventListener('change', (event) => {
        if (event.target && event.target.matches('input[data-macro-day-index][data-macro-key]')) updateAndCalculate();
    });
    adjustmentsCard.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-rule-key]');
        if (trigger) showRuleModal(trigger.dataset.ruleKey);
    });

    updateAndCalculate();
}
