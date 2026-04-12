function renderCalculatorPage() {
    const calcT = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');

    UI.bootstrapPage({
        rootId: 'calculadora-container',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            requiredDeps: [
                { when: () => typeof ProfileApplicationService === 'undefined', path: 'js/core/application/profile.service.js' },
                { when: () => typeof TargetsApplicationService === 'undefined', path: 'js/core/application/targets.service.js' },
                { when: () => typeof CalculatorApplicationService === 'undefined', path: 'js/core/application/calculator.service.js' },
                { when: () => typeof ActivityApplicationService === 'undefined', path: 'js/core/application/activity.service.js' }
            ],
            settled: true,
            globals: ['CalculatorApplicationService', 'TargetsApplicationService', 'ActivityApplicationService'],
            exercises: true,
            selectedActivityPlanData: true
        }).catch(() => ({})),
        run: (container, context = {}) => {
            try {
                initCalculator(container, {
                    weeklyPlan: context.activityPlanData || null,
                    exercisesCatalog: context.exercisesData || null,
                    targetsService: context.TargetsApplicationService || window.TargetsApplicationService || null
                });
            } catch {
                UI.showError(container, calcT('calculator.errors.render', {}, 'Error renderizando la Calculadora.'));
            }
        },
        onError: (container) => UI.showError(container, calcT('calculator.errors.dependencies', {}, 'Error cargando dependencias (formulas/targets/stores).'))
    });
}

function initCalculator(container, {
    weeklyPlan: initialWeeklyPlan = null,
    exercisesCatalog = null,
    targetsService = null
} = {}) {
    const calcT = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');
    const formulas = window.FormulasEngine;
    const targets = window.TargetsEngine;
    const calculatorService = window.CalculatorApplicationService;
    const metrics = window.MetricsRegistry || null;
    if (!formulas || !targets || !calculatorService) {
        UI.showError(container, calcT('calculator.errors.engine_dependencies', {}, 'Error cargando dependencias (engine formulas/targets).'));
        return;
    }

    const targetsApi = targetsService || window.TargetsApplicationService;
    targetsApi?.applyMacroDefaults?.(formulas);
    const initialState = calculatorService.getInitialState({
        formulas,
        targets,
        targetsService: targetsApi,
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
    let restMacroRatios = getRestMacroRatios();

    function getRestMacroRatios() {
        return { p: Number.isFinite(macroRatios.p) ? macroRatios.p : defaultMacroRatios.p, c: Number.isFinite(macroRatios.c) ? macroRatios.c : defaultMacroRatios.c, f: Number.isFinite(macroRatios.f) ? macroRatios.f : defaultMacroRatios.f };
    }
    const getMetricMeta = (method, key, fallback, options = undefined) => (metrics && typeof metrics[method] === 'function')
        ? (options === undefined ? metrics[method](key, fallback) : metrics[method](key, options))
        : fallback;
    const normalizeMetricKey = (key) => getMetricMeta('normalizeKey', key, key);
    const getMetricLabel = (key, options = {}) => getMetricMeta('getLabel', key, String(key || ''), options);
    const getMetricDecimals = (key, fallback = 0) => getMetricMeta('getDecimals', key, fallback);
    const getMetricUnit = (key, fallback = '') => getMetricMeta('getUnit', key, fallback);
    const getObjectiveDescription = (key) => typeof targets.getObjectiveDescription === 'function' ? targets.getObjectiveDescription(key) : '';
    const getWeekDayLabel = (value, fallback = '') => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.getWeekDayLabel === 'function'
            ? DateUtils.getWeekDayLabel(value, fallback)
            : (fallback || String(value || ''))
    );
    const getProfileValue = (id, parser = parseFloat, fallback = 0) => parser(document.getElementById(id).value) || fallback;
    const getById = (id) => document.getElementById(id);
    const setHtml = (id, html) => { const node = getById(id); if (node) node.innerHTML = html; };
    const renderProfileRow = (label, control) => `<div class="row-item"><span class="row-item__title">${label}</span>${control}</div>`;
    const PCT_STEPS = [0.20, 0.15, 0.10, 0.05, 0, -0.05, -0.10, -0.15, -0.20];
    const renderAdjustmentOptions = (value) => PCT_STEPS.map((step) => {
        const label = step === 0 ? '0%' : `${step > 0 ? '+' : ''}${Math.round(step * 100)}%`;
        return `<option value="${step}" ${Math.abs(value - step) < 0.001 ? 'selected' : ''}>${label}</option>`;
    }).join('');
    const formatRuleValue = (value, decimals = 1) => UI.formatNumber(value, decimals);
    const formatHydrationRange = (minMl, maxMl) => Number.isFinite(minMl) && Number.isFinite(maxMl) ? `${formatRuleValue(minMl / 1000, 1)}-${formatRuleValue(maxMl / 1000, 1)} L` : '-';
    const formatMacroPct = (ratio) => Math.round((Number.isFinite(ratio) ? ratio : 0) * 100);
    const formatMetricValue = (key, value) => {
        if (key === 'hydration') return value && typeof value === 'object' ? formatHydrationRange(value.min, value.max) : '-';
        const metricKey = normalizeMetricKey(key);
        const safe = Number.isFinite(value) ? value : 0;
        if (metricKey === 'kcal') return UI.formatKcal(safe);
        if (getMetricUnit(metricKey) === 'score') return UI.formatScore(safe, getMetricDecimals(metricKey, 1), 10);
        return UI.formatGrams(safe, getMetricDecimals(metricKey, 0));
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
        buildAdjustmentRow('kcal', calcT('calculator.labels.energy', {}, 'Energía'), () => calcT('calculator.rules.objective_bmr', {}, 'Objetivo: 1,2 x BMR'), 'macro'),
        buildAdjustmentRow('p', getMetricLabel('p'), () => calcT('calculator.rules.objective_pct_kcal', { value: formatRuleValue(restMacroRatios.p * 100, 1), divisor: 4 }, `Objetivo: ${formatRuleValue(restMacroRatios.p * 100, 1)}% de kcal (g = (kcal x %)/4)`), 'macro'),
        buildAdjustmentRow('c', getMetricLabel('c'), () => calcT('calculator.rules.objective_pct_kcal', { value: formatRuleValue(restMacroRatios.c * 100, 1), divisor: 4 }, `Objetivo: ${formatRuleValue(restMacroRatios.c * 100, 1)}% de kcal (g = (kcal x %)/4)`), 'macro'),
        buildAdjustmentRow('f', getMetricLabel('f'), () => calcT('calculator.rules.objective_pct_kcal', { value: formatRuleValue(restMacroRatios.f * 100, 1), divisor: 9 }, `Objetivo: ${formatRuleValue(restMacroRatios.f * 100, 1)}% de kcal (g = (kcal x %)/9)`), 'macro'),
        buildAdjustmentRow('hydration', getMetricLabel('hydration'), () => calcT('calculator.rules.objective_hydration', {
            min: formatRuleValue(hydrationDefaults.minMlPerKg, 0),
            max: formatRuleValue(hydrationDefaults.maxMlPerKg, 0),
            activity: formatRuleValue(hydrationDefaults.activityMlPerMin, 0)
        }, `Objetivo: ${formatRuleValue(hydrationDefaults.minMlPerKg, 0)}-${formatRuleValue(hydrationDefaults.maxMlPerKg, 0)} ml/kg (+${formatRuleValue(hydrationDefaults.activityMlPerMin, 0)} ml/min actividad)`), 'macro'),
        buildAdjustmentRow('salt', getMetricLabel('salt'), () => calcT('calculator.rules.max_per_day', { value: UI.formatGrams(defaultSecondaryTargets.saltMaxG, getMetricDecimals('salt', 2)) }, `Máx: ${UI.formatGrams(defaultSecondaryTargets.saltMaxG, getMetricDecimals('salt', 2))} / día`), 'secondary', 'saltMaxG'),
        buildAdjustmentRow('fiber', getMetricLabel('fiber'), () => calcT('calculator.rules.min_per_1000_kcal', { value: UI.formatGrams(defaultSecondaryTargets.fiberPer1000Kcal, getMetricDecimals('fiber', 1)) }, `Mín: ${UI.formatGrams(defaultSecondaryTargets.fiberPer1000Kcal, getMetricDecimals('fiber', 1))} / 1000 kcal`), 'secondary', 'fiberPer1000Kcal'),
        buildAdjustmentRow('sugar', getMetricLabel('sugar'), () => calcT('calculator.rules.max_pct_kcal', { value: formatRuleValue(defaultSecondaryTargets.sugarMaxPctKcal * 100, 1), divisor: 4 }, `Máx: ${formatRuleValue(defaultSecondaryTargets.sugarMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/4)`), 'secondary', 'sugarMaxPctKcal'),
        buildAdjustmentRow('saturatedFat', getMetricLabel('saturatedFat'), () => calcT('calculator.rules.max_pct_kcal', { value: formatRuleValue(defaultSecondaryTargets.satFatMaxPctKcal * 100, 1), divisor: 9 }, `Máx: ${formatRuleValue(defaultSecondaryTargets.satFatMaxPctKcal * 100, 1)}% de kcal (g = (kcal x %)/9)`), 'secondary', 'satFatMaxPctKcal'),
        buildAdjustmentRow('processing', getMetricLabel('processing', { short: true }), () => calcT('calculator.rules.maximum_score', { value: UI.formatScore(defaultSecondaryTargets.processingMaxScore, getMetricDecimals('processing', 1), 10) }, `Máximo: ${UI.formatScore(defaultSecondaryTargets.processingMaxScore, getMetricDecimals('processing', 1), 10)}`), 'secondary', 'processingMaxScore')
    ];
    const ADJUSTMENT_ROWS_BY_KEY = Object.fromEntries(ADJUSTMENT_ROWS.map((row) => [row.key, row]));
    const getAdjustmentSelectId = (row) => `${row.adjustmentSource === 'macro' ? 'adj' : 'sec-adj'}-${row.adjustmentKey}`;
    const profileCard = document.createElement('div');
    profileCard.className = 'glass-card card';
    profileCard.innerHTML = `
        <h2>${calcT('calculator.sections.profile', {}, 'Datos Personales')}</h2>
        <div class="section-group__grid section-group__grid--center">
            ${renderProfileRow(calcT('calculator.profile.sex', {}, 'Sexo'), `<select id="calc-sex" class="input-base input-select w-auto"><option value="male" ${userProfile.sex === 'male' ? 'selected' : ''}>${calcT('calculator.profile.male', {}, 'Hombre')}</option><option value="female" ${userProfile.sex === 'female' ? 'selected' : ''}>${calcT('calculator.profile.female', {}, 'Mujer')}</option></select>`)}
            ${renderProfileRow(calcT('calculator.profile.age', {}, 'Edad'), `<input type="number" id="calc-age" class="row-item__input" value="${userProfile.age}">`)}
            ${renderProfileRow(calcT('calculator.profile.height', {}, 'Altura (cm)'), `<input type="number" id="calc-height" class="row-item__input" value="${userProfile.height}">`)}
            ${renderProfileRow(calcT('calculator.profile.weight', {}, 'Peso (kg)'), `<input type="number" id="calc-weight" class="row-item__input" value="${userProfile.weight}">`)}
        </div>
    `;
    container.appendChild(profileCard);

    const baseResultsCard = Object.assign(document.createElement('div'), { className: 'glass-card card mt-lg' });
    container.appendChild(baseResultsCard);
    const adjustmentsCard = Object.assign(document.createElement('div'), { className: 'glass-card card mt-lg' });
    adjustmentsCard.innerHTML = `
        <h2>${calcT('calculator.sections.general_rest_goals', {}, 'OBJETIVOS GENERALES (EN REPOSO)')}</h2>
        <div class="adjustments-table-wrap">
            <table class="adjustments-table">
                <thead><tr><th>${calcT('calculator.table.goal', {}, 'Objetivo')}</th><th>${calcT('calculator.table.base_result', {}, 'RESULTADO BASE')}</th><th>${calcT('calculator.table.adjustment', {}, 'Ajuste')}</th><th>${calcT('calculator.table.adjusted_result', {}, 'RESULTADO AJUSTADO')}</th></tr></thead>
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
            <h2>${calcT('calculator.sections.daily_goals', {}, 'OBJETIVOS DIARIOS')}</h2>
            <div class="table-scroller mt-sm">
                <table id="daily-goals-table" class="goals-table">
                    <thead id="daily-goals-head"></thead>
                    <tbody id="daily-goals-body"></tbody>
                </table>
            </div>
        `
    });
    container.appendChild(weeklyGoalsCard);
    const readProfileInputs = () => ({
        sex: getById('calc-sex').value,
        age: getProfileValue('calc-age', parseInt, 0),
        height: getProfileValue('calc-height', parseInt, 0),
        weight: getProfileValue('calc-weight', parseFloat, 0)
    });
    const readAdjustmentInputs = () => {
        ADJUSTMENT_ROWS.forEach((row) => {
            const value = parseFloat(getById(getAdjustmentSelectId(row))?.value);
            if (row.adjustmentSource === 'macro') adjustments[row.adjustmentKey] = Number.isFinite(value) ? value : 0;
            else secondaryAdjustments[row.adjustmentKey] = Number.isFinite(value) ? value : 0;
        });
    };
    const readDailyMacroRatios = () => {
        const macroInputs = document.querySelectorAll('input[data-macro-day-index][data-macro-key]');
        if (!macroInputs.length) return null;
        const baseDaily = targetsApi.getDailyMacroRatios(targets, { formulas });
        const dayData = Array.from({ length: DAYS_COUNT }, (_, index) => ({
            p: (baseDaily[index] || defaultMacroRatios).p * 100,
            c: (baseDaily[index] || defaultMacroRatios).c * 100,
            f: (baseDaily[index] || defaultMacroRatios).f * 100
        }));
        macroInputs.forEach((input) => {
            const dayIndex = parseInt(input.dataset.macroDayIndex, 10);
            const key = input.dataset.macroKey;
            const value = parseFloat(input.value);
            if (!Number.isNaN(dayIndex) && dayIndex >= 0 && dayIndex < dayData.length && key && Number.isFinite(value)) dayData[dayIndex][key] = value;
        });
        return dayData.map((entry, index) => {
            const sum = entry.p + entry.c + entry.f;
            return sum > 0 ? { p: entry.p / sum, c: entry.c / sum, f: entry.f / sum } : (baseDaily[index] || defaultMacroRatios);
        });
    };
    const readAndSaveInputs = () => {
        const profile = readProfileInputs();
        readAdjustmentInputs();
        const dailyMacroRatios = readDailyMacroRatios();
        if (dailyMacroRatios) {
            macroRatios = targetsApi.getUserMacroRatios(targets, { formulas });
            restMacroRatios = getRestMacroRatios();
        }
        calculatorService.saveProfileAndAdjustments({ profile, adjustments, secondaryAdjustments, dailyMacroRatios });
        return { profile, adjustments };
    };
    const renderBaseResults = (profile) => {
        const { bmi, bmiData, bmr } = calculatorService.getBaseResults({ profile, formulas });
        baseResultsCard.innerHTML = `
            <h2>${calcT('calculator.sections.base_results', {}, 'Resultados Base')}</h2>
            <div class="calc-grid-2">
                <div class="card-panel">
                    <div class="text-label">${calcT('calculator.labels.bmi', {}, 'IMC')}</div>
                    <div class="text-value ${bmiData.className}">${bmi}</div>
                    <div class="text-sm text-muted ${bmiData.className} mt-auto">${calcT(`calculator.bmi.${bmiData.code}`, {}, '-')}</div>
                </div>
                <div class="card-panel">
                    <div class="text-label">${calcT('calculator.labels.bmr', {}, 'BMR')}</div>
                    <div class="stats-pills stats-pills--center my-sm"><div class="stat-pill stat-pill--kcal">${Number.isFinite(bmr) ? Math.round(bmr) : 0} kcal</div></div>
                    <div class="text-sm text-muted mt-auto">${calcT('calculator.labels.basal', {}, 'Basal')}</div>
                </div>
            </div>
        `;
        return bmr;
    };
    const renderAdjustmentsTable = (profile, currentAdjustments) => {
        const restGoals = calculatorService.getRestGoalsModel({
            profile,
            adjustments: currentAdjustments,
            secondaryAdjustments,
            formulas,
            targets,
            targetsService: targetsApi,
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
            setHtml(`result-base-${row.key}`, renderMetricPill(row.key, formatMetricValue(row.key, values.base)));
            setHtml(`result-adjusted-${row.key}`, renderMetricPill(row.key, formatMetricValue(row.key, values.adjusted)));
        });
    };
    const showRuleModal = (rowKey) => {
        const row = ADJUSTMENT_ROWS_BY_KEY[rowKey];
        if (!row) return;
        UI.showModal({
            id: 'rule-info-modal',
            titleHtml: `<h3 class="modal-title">${row.label}</h3>`,
            bodyHtml: `<div class="text-sm"><div class="text-label">${calcT('calculator.labels.calculation', {}, 'Cálculo')}</div><p class="text-muted">${row.rule()}</p><div class="text-label">${calcT('calculator.labels.description', {}, 'Descripción')}</div><p class="text-muted">${row.description || '-'}</p></div>`
        });
    };
    const renderWeeklyGoals = (profile, currentAdjustments) => {
        const table = getById('daily-goals-table');
        const tableHead = getById('daily-goals-head');
        const tableBody = getById('daily-goals-body');
        if (!table || !tableHead || !tableBody) return;

        const weekRows = calculatorService.getWeeklyGoalsModel({
            profile,
            adjustments: currentAdjustments,
            formulas,
            targets,
            targetsService: targetsApi,
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

        tableHead.innerHTML = `<tr><th class="goals-row-header">${calcT('calculator.table.goal', {}, 'Objetivo')}</th>${weekRows.map((row, index) => `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${getWeekDayLabel(row.day, row.day || '')}</th>`).join('')}</tr>`;
        tableBody.innerHTML = `
            <tr>
                <td class="goals-row-header">${calcT('calculator.table.macros_pct', {}, 'Macros (%)')}</td>
                ${weekRows.map((row, index) => `<td class="goals-table__cell"><div class="macro-inputs">${renderMacroInputs(row.macroRatios || defaultMacroRatios, index)}</div></td>`).join('')}
            </tr>
            <tr>
                <td class="goals-row-header">${calcT('calculator.table.activity', {}, 'Actividad')}</td>
                ${weekRows.map((row) => `<td class="goals-table__cell"><div class="stats-pills"><div class="stat-pill stat-pill--xs">${calcT(`calculator.activity_labels.${row.activityLabel}`, {}, row.activityLabel || calcT('calculator.table.activity', {}, 'Actividad'))}</div><div class="stat-pill stat-pill--xs">${Math.max(0, parseInt(row.steps, 10) || 0)} ${calcT('calculator.labels.steps_suffix', {}, 'pasos')}</div></div></td>`).join('')}
            </tr>
            ${ADJUSTMENT_ROWS.map((row) => `<tr><td class="goals-row-header">${row.label}</td>${weekRows.map((dayData) => `<td class="goals-table__cell">${formatGoalCell(row, dayData)}</td>`).join('')}</tr>`).join('')}
        `;
        setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };
    const updateAndCalculate = () => {
        try {
            const { profile, adjustments: currentAdjustments } = readAndSaveInputs();
            if (renderBaseResults(profile) <= 0) return;
            renderAdjustmentsTable(profile, currentAdjustments);
            renderWeeklyGoals(profile, currentAdjustments);
        } catch {
            UI.showError(container, calcT('calculator.errors.update', {}, 'Error actualizando cálculos de la Calculadora.'));
        }
    };
    profileCard.querySelectorAll('input, select').forEach((element) => element.addEventListener('change', updateAndCalculate));
    adjustmentsCard.querySelectorAll('select').forEach((element) => element.addEventListener('change', updateAndCalculate));
    weeklyGoalsCard.addEventListener('change', (event) => {
        if (event.target?.matches('input[data-macro-day-index][data-macro-key]')) updateAndCalculate();
    });
    adjustmentsCard.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-rule-key]');
        if (trigger) showRuleModal(trigger.dataset.ruleKey);
    });

    updateAndCalculate();
}
