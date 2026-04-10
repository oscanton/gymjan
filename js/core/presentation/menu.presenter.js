const MenuPresenter = (() => {
    const NUTRITION_METRIC_LABELS = {
        kcal: 'Kcal',
        protein: 'Prote\u00EDna',
        carbs: 'Carbohidratos',
        fat: 'Grasas',
        fiber: 'Fibra',
        sugar: 'Az\u00FAcar',
        saturatedFat: 'Grasa sat.',
        salt: 'Sal',
        processing: 'Procesamiento'
    };
    const PRIMARY_NUTRIENTS = [['protein', 'Prot'], ['carbs', 'Carbohidratos'], ['fat', 'Grasas']];
    const SECONDARY_GROUPS = [
        [['salt', 'Sal', 2], ['sugar', 'Az\u00FAcar', 1], ['saturatedFat', 'Grasa sat.', 1]],
        [['fiber', 'Fibra', 1], ['processing', 'Procesamiento', 1]]
    ];

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

    const renderMealMacroPills = (nut = {}) => [['Kcal', Math.round(nut.kcal || 0)], ['Prot', `${Math.round(nut.protein || 0)}g`], ['Carb', `${Math.round(nut.carbs || 0)}g`], ['Grasa', `${Math.round(nut.fat || 0)}g`]]
        .map(([label, value], index) => `<div class="stat-pill${index ? '' : ' stat-pill--kcal'} stat-pill--xs">${label} ${value}</div>`)
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
                Score nutricional: <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(score.status) : ''}">${Number.isFinite(score.score) ? formatNumber(score.score, 1) : '-'}</span>
            </button>
        `;
    };

    const renderPrimaryNutrientsHtml = (nutrients = {}, { helpers = {}, targets = null, statusClasses = {}, kcalSizeClass = 'stat-pill--sm', kcalDebugPayload = '' } = {}) => {
        const { formatKcal } = helpers;
        if (typeof formatKcal !== 'function') return '';
        const kcalTarget = targets && Number.isFinite(targets.kcal) ? `${Math.round(targets.kcal * 0.9)} - ${Math.round(targets.kcal * 1.1)} kcal` : '';
        const kcalInner = `Kcal <span class="${statusClasses.kcal || ''}">${formatKcal(nutrients.kcal)}</span>${kcalTarget ? ` <span>/ ${kcalTarget}</span>` : ''}`;
        const kcalHtml = kcalDebugPayload
            ? `<button type="button" class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block pill-trigger kcal-info-trigger" data-kcal-debug="${kcalDebugPayload}">${kcalInner}</button>`
            : `<div class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block">${kcalInner}</div>`;
        return `
            ${kcalHtml}
            <div class="nutrition-row">${PRIMARY_NUTRIENTS.map(([key, label]) => metricRow(
                label,
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
                <div class="${className}">${group.map(([key, label, fallbackDecimals]) => {
                    const currentDecimals = Number.isFinite(decimals[key]) ? decimals[key] : fallbackDecimals;
                    const value = key === 'processing'
                        ? (Number.isFinite(values[key]) ? `${formatNumber(values[key], currentDecimals)}/10` : '-')
                        : formatGrams(values[key], currentDecimals);
                    const target = targets && Number.isFinite(targets[key])
                        ? ` <span class="text-muted">/ ${formatNumber(targets[key], currentDecimals)}${key === 'processing' ? '/10' : 'g'}</span>`
                        : '';
                    return metricRow(label, value, target, statusClasses[key] || '');
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
                Agua <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(hydrationCheck ? hydrationCheck.status : '') : ''}">${formatMl(total)}</span> / ${min > 0 ? Math.round(min) : '-'} - ${max > 0 ? formatMl(max) : '-'}
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
        const status = Object.fromEntries(['kcal', 'protein', 'carbs', 'fat', 'salt', 'fiber', 'sugar', 'saturatedFat', 'processing']
            .map((key) => [key, typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(checks[key] ? checks[key].status : '') : '']));
        return `
            <div class="totals-stack">
                ${renderHydrationTotalsPill(dayTargets, dayIntake, checks.hydration, { formatMl: helpers.formatMl, getStatusClassFromCode })}
                ${renderCompleteNutritionHtml(dayIntake, {
                    helpers,
                    targets: dayTargets,
                    statusClasses: status,
                    kcalSizeClass: 'stat-pill--sm',
                    secondaryContainerClass: 'totals-secondary-grid',
                    secondaryDecimals: { salt: 2, fiber: 0, sugar: 0, saturatedFat: 0, processing: 1 },
                    kcalDebugPayload: typeof encodePayload === 'function' ? encodePayload(buildKcalPayload(dayIntake, dayTargets)) : ''
                })}
                ${renderNutritionScorePill(nutrition, { formatNumber: helpers.formatNumber, getStatusClassFromCode, encodePayload })}
            </div>
        `;
    };

    const buildMealInfoModal = ({ title = 'Comida', description = '', recipe = '', escapeHtml } = {}) => ({
        id: 'meal-info-modal',
        titleHtml: `<h3 class="text-primary modal-title">${safeText(escapeHtml, title)}</h3>`,
        bodyHtml: `
            <div class="text-sm">
                ${description ? `<p class="mb-sm">${safeText(escapeHtml, description)}</p>` : '<p class="text-muted mb-sm">Sin descripci\u00F3n.</p>'}
                <div class="text-xs text-muted mb-xs">Receta</div>
                ${recipe ? `<p>${safeText(escapeHtml, recipe)}</p>` : '<p class="text-muted">Sin receta.</p>'}
            </div>
        `
    });

    const buildNutritionScoreModal = ({ payload = {}, metricLabels = NUTRITION_METRIC_LABELS, formatNumber, getStatusClassFromCode, nutritionScore, escapeHtml } = {}) => {
        if (typeof formatNumber !== 'function') return null;
        const scoreText = Number.isFinite(payload.score) ? formatNumber(payload.score, 1) : '-';
        return {
            id: 'nutrition-score-modal',
            titleHtml: '<h3 class="text-primary modal-title">Score nutricional</h3>',
            bodyHtml: `
                ${tableHtml(
                    [{ label: 'M\u00E9trica' }, { label: 'Desviaci\u00F3n', right: true }, { label: 'Penalizaci\u00F3n', right: true }],
                    Object.keys(metricLabels).map((key) => [
                        safeText(escapeHtml, metricLabels[key]),
                        safeText(escapeHtml, Number.isFinite(payload.deviationsPct && payload.deviationsPct[key]) ? `${formatNumber(payload.deviationsPct[key], 1)}%` : '-'),
                        safeText(escapeHtml, Number.isFinite(payload.penalties && payload.penalties[key]) ? formatNumber(payload.penalties[key], 2) : '-')
                    ])
                )}
                <div class="stats-pills stats-pills--center mt-lg">
                    <div class="stat-pill stat-pill--nutritional-score nutritional-score-modal-score-pill">
                        Puntuaci\u00F3n: <span class="${nutritionScore && typeof nutritionScore.getStatusClass === 'function' ? nutritionScore.getStatusClass(payload.score) : (typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(payload.status || '') : '')}">${scoreText}</span>
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
        const formatters = {
            kcal: formatKcal,
            protein: (value) => formatGrams(value, 0),
            carbs: (value) => formatGrams(value, 0),
            fat: (value) => formatGrams(value, 0),
            fiber: (value) => formatGrams(value, 1),
            sugar: (value) => formatGrams(value, 1),
            saturatedFat: (value) => formatGrams(value, 1),
            salt: (value) => formatGrams(value, 2),
            processing: (value) => formatScore(value, 1, 10)
        };
        return {
            id: 'kcal-debug-modal',
            titleHtml: '<h3 class="text-primary modal-title">C\u00E1lculo de kcal y macros</h3>',
            bodyHtml: `
                ${tableHtml(
                    [{ label: 'M\u00E9trica' }, { label: 'Actual', right: true }, { label: 'Objetivo', right: true }],
                    Object.entries(NUTRITION_METRIC_LABELS).map(([key, label]) => [label, formatters[key](actuals[key]), formatters[key](targets[key])])
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
