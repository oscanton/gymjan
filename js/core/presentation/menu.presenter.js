const MenuPresenter = (() => {
    const METRICS = typeof MetricsRegistry !== 'undefined' ? MetricsRegistry : null;
    const NUTRITION_KEYS = METRICS && typeof METRICS.getOrderedKeys === 'function'
        ? METRICS.getOrderedKeys({ nutritionOnly: true })
        : ['kcal', 'protein', 'carbs', 'fat', 'fiber', 'sugar', 'saturatedFat', 'salt', 'processing'];
    const NUTRITION_METRIC_LABELS = METRICS && typeof METRICS.toLabelMap === 'function'
        ? METRICS.toLabelMap({ keys: NUTRITION_KEYS })
        : Object.fromEntries(NUTRITION_KEYS.map((key) => [key, key]));
    const PRIMARY_NUTRIENTS = ['protein', 'carbs', 'fat'];
    const SECONDARY_GROUPS = [
        ['salt', 'sugar', 'saturatedFat'],
        ['fiber', 'processing']
    ];
    const t = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');

    const getMetricLabel = (key, options = {}) => (
        METRICS && typeof METRICS.getLabel === 'function'
            ? METRICS.getLabel(key, options)
            : String(key || '')
    );
    const getMetricDecimals = (key, fallback = 0) => (
        METRICS && typeof METRICS.getDecimals === 'function'
            ? METRICS.getDecimals(key, fallback)
            : fallback
    );
    const safeText = (escapeHtml, value) => typeof escapeHtml === 'function' ? escapeHtml(value) : String(value || '');
    const metricRow = (label, value, target = '', css = '') => `
        <div class="stat-pill nutrition-pill">
            <div class="nutrition-pill__label">${label}</div>
            <div><span class="${css}">${value}</span>${target}</div>
        </div>
    `;
    const tableHtml = (headers, rows, tableClass = 'adjustments-table') => `
        <div class="table-scroller">
            <table class="${tableClass}">
                <thead><tr>${headers.map((header) => `<th${header.right ? ' class="text-right"' : ''}>${header.label}</th>`).join('')}</tr></thead>
                <tbody>${rows.map((row) => `<tr>${row.map((cell, index) => `<td${index ? ' class="text-right"' : ''}>${cell}</td>`).join('')}</tr>`).join('')}</tbody>
            </table>
        </div>
    `;

    const renderMealMacroPills = (nut = {}) => [
        ['kcal', Math.round(nut.kcal || 0)],
        ['protein', `${Math.round(nut.protein || 0)}g`],
        ['carbs', `${Math.round(nut.carbs || 0)}g`],
        ['fat', `${Math.round(nut.fat || 0)}g`]
    ]
        .map(([key, value], index) => `<div class="stat-pill${index ? '' : ' stat-pill--kcal'} stat-pill--xs">${getMetricLabel(key, { short: key !== 'kcal' })} ${value}</div>`)
        .join('');

    const renderNutritionScorePill = (nutritionAssessment, { formatNumber, getStatusClassFromCode, encodePayload } = {}) => {
        const score = nutritionAssessment && nutritionAssessment.score;
        if (!score || typeof formatNumber !== 'function' || typeof encodePayload !== 'function') return '';
        return `
            <button type="button" class="stat-pill stat-pill--nutritional-score stat-pill--block pill-trigger nutritional-score-info-trigger" data-nutritional-score="${encodePayload({
                score: score.score,
                penalties: score.penalties,
                deviationsPct: score.deviationsPct
            })}">
                ${t('menu.nutrition.nutritional_score', {}, 'Score nutricional')}: <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(score.status) : ''}">${Number.isFinite(score.score) ? formatNumber(score.score, 1) : '-'}</span>
            </button>
        `;
    };

    const renderPrimaryNutrientsHtml = (nutrients = {}, { helpers = {}, targets = null, statusClasses = {}, kcalSizeClass = 'stat-pill--sm', kcalDebugPayload = '' } = {}) => {
        const { formatKcal } = helpers;
        if (typeof formatKcal !== 'function') return '';
        const kcalTarget = targets && Number.isFinite(targets.kcal) ? `${Math.round(targets.kcal * 0.9)} - ${Math.round(targets.kcal * 1.1)} kcal` : '';
        const kcalInner = `${getMetricLabel('kcal')} <span class="${statusClasses.kcal || ''}">${formatKcal(nutrients.kcal)}</span>${kcalTarget ? ` <span>/ ${kcalTarget}</span>` : ''}`;
        const kcalHtml = kcalDebugPayload
            ? `<button type="button" class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block pill-trigger kcal-info-trigger" data-kcal-debug="${kcalDebugPayload}">${kcalInner}</button>`
            : `<div class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block">${kcalInner}</div>`;
        return `
            ${kcalHtml}
            <div class="nutrition-row">${PRIMARY_NUTRIENTS.map((key) => metricRow(
                getMetricLabel(key, { short: true }),
                `${Math.round(nutrients[key] || 0)}g`,
                targets && Number.isFinite(targets[key]) ? ` <span class="text-muted">/ ${targets[key]}g</span>` : '',
                statusClasses[key] || ''
            )).join('')}</div>
        `;
    };

    const renderSecondaryNutrientsHtml = ({
        salt,
        fiber,
        sugar,
        saturatedFat,
        processing,
        containerClass = '',
        targets = null,
        statusClasses = {},
        decimals = {}
    } = {}, { helpers = {} } = {}) => {
        const { formatNumber, formatGrams } = helpers;
        if (typeof formatNumber !== 'function' || typeof formatGrams !== 'function') return '';
        const values = { salt, fiber, sugar, saturatedFat, processing };
        return SECONDARY_GROUPS.map((group, index) => {
            const className = `${index ? 'modal-grid-2 modal-grid-2--compact' : 'modal-grid-3 modal-grid-3--compact'}${containerClass ? ` ${containerClass}` : ''}`;
            return `
                <div class="${className}">${group.map((key) => {
                    const currentDecimals = Number.isFinite(decimals[key]) ? decimals[key] : getMetricDecimals(key, 0);
                    const value = key === 'processing'
                        ? (Number.isFinite(values[key]) ? `${formatNumber(values[key], currentDecimals)}/10` : '-')
                        : formatGrams(values[key], currentDecimals);
                    const target = targets && Number.isFinite(targets[key])
                        ? ` <span class="text-muted">/ ${formatNumber(targets[key], currentDecimals)}${key === 'processing' ? '/10' : 'g'}</span>`
                        : '';
                    return metricRow(getMetricLabel(key), value, target, statusClasses[key] || '');
                }).join('')}</div>
            `;
        }).join('');
    };

    const renderCompleteNutritionHtml = (nutrients = {}, options = {}) => `
        <div class="nutrition-stack">
            ${renderPrimaryNutrientsHtml(nutrients, options)}
            ${renderSecondaryNutrientsHtml({
                salt: nutrients.salt,
                fiber: nutrients.fiber,
                sugar: nutrients.sugar,
                saturatedFat: nutrients.saturatedFat,
                processing: nutrients.processing,
                containerClass: options.secondaryContainerClass,
                targets: options.targets,
                statusClasses: options.statusClasses,
                decimals: options.secondaryDecimals
            }, options)}
        </div>
    `;

    const renderHydrationTotalsPill = (dayTargets, dayIntake, hydrationCheck, { formatMl, getStatusClassFromCode } = {}) => {
        if (typeof formatMl !== 'function') return '';
        const min = dayTargets && Number.isFinite(parseFloat(dayTargets.hydrationMin)) ? parseFloat(dayTargets.hydrationMin) : 0;
        const max = dayTargets && Number.isFinite(parseFloat(dayTargets.hydrationMax)) ? parseFloat(dayTargets.hydrationMax) : 0;
        const total = dayIntake && Number.isFinite(parseFloat(dayIntake.hydrationTotalMl)) ? parseFloat(dayIntake.hydrationTotalMl) : 0;
        return `
            <div class="stat-pill stat-pill--hydration stat-pill--sm stat-pill--block">
                ${t('menu.nutrition.water', {}, 'Agua')} <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(hydrationCheck ? hydrationCheck.status : '') : ''}">${formatMl(total)}</span> / ${min > 0 ? Math.round(min) : '-'} - ${max > 0 ? formatMl(max) : '-'}
            </div>
        `;
    };

    const buildKcalPayload = (dayIntake = {}, dayTargets = {}) => ({
        actuals: {
            kcal: dayIntake.kcal,
            protein: dayIntake.protein,
            carbs: dayIntake.carbs,
            fat: dayIntake.fat,
            fiber: dayIntake.fiber,
            sugar: dayIntake.sugar,
            saturatedFat: dayIntake.saturatedFat,
            salt: dayIntake.salt,
            processing: dayIntake.processing
        },
        targets: dayTargets,
        kcalFromMacros: (parseFloat(dayIntake.protein) * 4) + (parseFloat(dayIntake.carbs) * 4) + (parseFloat(dayIntake.fat) * 9)
    });

    const renderDayTotals = (dayView = {}, { helpers = {}, encodePayload, getStatusClassFromCode } = {}) => {
        const dayTargets = dayView.dayTargets || {};
        const dayIntake = dayView.dayIntake || {};
        const nutrition = dayView.dayAssessment ? dayView.dayAssessment.nutrition : null;
        const checks = nutrition ? (nutrition.checks || {}) : {};
        const status = Object.fromEntries(NUTRITION_KEYS.map((key) => [
            key,
            typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(checks[key] ? checks[key].status : '') : ''
        ]));
        return `
            <div class="totals-stack">
                ${renderHydrationTotalsPill(dayTargets, dayIntake, checks.hydration, { formatMl: helpers.formatMl, getStatusClassFromCode })}
                ${renderCompleteNutritionHtml(dayIntake, {
                    helpers,
                    targets: dayTargets,
                    statusClasses: status,
                    kcalSizeClass: 'stat-pill--sm',
                    secondaryContainerClass: 'totals-secondary-grid',
                    secondaryDecimals: {
                        salt: getMetricDecimals('salt', 2),
                        fiber: 0,
                        sugar: 0,
                        saturatedFat: 0,
                        processing: getMetricDecimals('processing', 1)
                    },
                    kcalDebugPayload: typeof encodePayload === 'function' ? encodePayload(buildKcalPayload(dayIntake, dayTargets)) : ''
                })}
                ${renderNutritionScorePill(nutrition, { formatNumber: helpers.formatNumber, getStatusClassFromCode, encodePayload })}
            </div>
        `;
    };

    const buildMealInfoModal = ({ title = '', description = '', recipe = '', escapeHtml } = {}) => ({
        id: 'meal-info-modal',
        titleHtml: `<h3 class="text-primary modal-title">${safeText(escapeHtml, title || t('menu.meals.default_title', {}, 'Comida'))}</h3>`,
        bodyHtml: `
            <div class="text-sm">
                ${description ? `<p class="mb-sm">${safeText(escapeHtml, description)}</p>` : `<p class="text-muted mb-sm">${t('menu.states.no_description', {}, 'Sin descripción.')}</p>`}
                <div class="text-xs text-muted mb-xs">${t('menu.nutrition.recipe', {}, 'Receta')}</div>
                ${recipe ? `<p>${safeText(escapeHtml, recipe)}</p>` : `<p class="text-muted">${t('menu.states.no_recipe', {}, 'Sin receta.')}</p>`}
            </div>
        `
    });

    const buildNutritionScoreModal = ({ payload = {}, metricLabels = NUTRITION_METRIC_LABELS, formatNumber, getStatusClassFromCode, nutritionScore, escapeHtml } = {}) => {
        if (typeof formatNumber !== 'function') return null;
        const scoreText = Number.isFinite(payload.score) ? formatNumber(payload.score, 1) : '-';
        return {
            id: 'nutrition-score-modal',
            titleHtml: `<h3 class="text-primary modal-title">${t('menu.nutrition.nutritional_score', {}, 'Score nutricional')}</h3>`,
            bodyHtml: `
                ${tableHtml(
                    [
                        { label: t('menu.nutrition.metric', {}, 'Métrica') },
                        { label: t('menu.nutrition.deviation', {}, 'Desviación'), right: true },
                        { label: t('menu.nutrition.penalty', {}, 'Penalización'), right: true }
                    ],
                    NUTRITION_KEYS.map((key) => [
                        safeText(escapeHtml, metricLabels[key]),
                        safeText(escapeHtml, Number.isFinite(payload.deviationsPct && payload.deviationsPct[key]) ? `${formatNumber(payload.deviationsPct[key], 1)}%` : '-'),
                        safeText(escapeHtml, Number.isFinite(payload.penalties && payload.penalties[key]) ? formatNumber(payload.penalties[key], 2) : '-')
                    ])
                )}
                <div class="stats-pills stats-pills--center mt-lg">
                    <div class="stat-pill stat-pill--nutritional-score nutritional-score-modal-score-pill">
                        ${t('menu.nutrition.score_value', {}, 'Puntuación')}: <span class="${nutritionScore && typeof nutritionScore.getStatusClass === 'function' ? nutritionScore.getStatusClass(payload.score) : (typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(payload.status || '') : '')}">${scoreText}</span>
                    </div>
                </div>
            `
        };
    };

    const buildKcalDebugModal = ({ payload = {}, helpers = {} } = {}) => {
        const actuals = payload.actuals || {};
        const targets = payload.targets || {};
        const { formatKcal, formatGrams, formatScore } = helpers;
        if (typeof formatKcal !== 'function' || typeof formatGrams !== 'function' || typeof formatScore !== 'function') return null;
        const formatMetricValue = (key, value) => {
            if (key === 'kcal') return formatKcal(value);
            if (key === 'processing') return formatScore(value, getMetricDecimals(key, 1), 10);
            return formatGrams(value, getMetricDecimals(key, 0));
        };
        return {
            id: 'kcal-debug-modal',
            titleHtml: `<h3 class="text-primary modal-title">${t('menu.nutrition.kcal_debug_title', {}, 'Cálculo de kcal y macros')}</h3>`,
            bodyHtml: `
                ${tableHtml(
                    [
                        { label: t('menu.nutrition.metric', {}, 'Métrica') },
                        { label: t('menu.nutrition.actual', {}, 'Actual'), right: true },
                        { label: t('menu.nutrition.target', {}, 'Objetivo'), right: true }
                    ],
                    NUTRITION_KEYS.map((key) => [NUTRITION_METRIC_LABELS[key], formatMetricValue(key, actuals[key]), formatMetricValue(key, targets[key])])
                )}
                <div class="stats-pills stats-pills--center mt-lg"><div class="stat-pill stat-pill--kcal">${formatKcal(Number.isFinite(payload.kcalFromMacros) ? payload.kcalFromMacros : 0)}</div></div>
            `
        };
    };

    return {
        NUTRITION_METRIC_LABELS,
        renderMealMacroPills,
        renderCompleteNutritionHtml,
        renderDayTotals,
        buildMealInfoModal,
        buildNutritionScoreModal,
        buildKcalDebugModal
    };
})();

window.MenuPresenter = MenuPresenter;
