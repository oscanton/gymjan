/* =========================================
   core/nutrition-ui.js - UI NUTRICIONAL
   ========================================= */

const NutritionUI = {
    formatNumber: (value, decimals = 1) => {
        const numeric = Number.isFinite(value) ? value : 0;
        return numeric.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    },

    toSafeNumber: (value, fallback = 0) => {
        const parsed = parseFloat(value);
        return Number.isFinite(parsed) ? parsed : fallback;
    },

    escapeHtml: (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),

    encodePayload: (payload) => encodeURIComponent(JSON.stringify(payload || {})),

    decodePayload: (encodedPayload) => {
        try {
            return JSON.parse(decodeURIComponent(encodedPayload || ''));
        } catch (err) {
            console.error('Error parseando payload modal:', err);
            return null;
        }
    },

    normalizeTarget: (target) => ({
        kcal: target && Number.isFinite(parseFloat(target.kcal)) ? parseFloat(target.kcal) : 0,
        protein: target && Number.isFinite(parseFloat(target.protein)) ? parseFloat(target.protein) : 0,
        carbs: target && Number.isFinite(parseFloat(target.carbs)) ? parseFloat(target.carbs) : 0,
        fat: target && Number.isFinite(parseFloat(target.fat)) ? parseFloat(target.fat) : 0,
        salt: target && Number.isFinite(parseFloat(target.salt)) ? parseFloat(target.salt) : null,
        fiber: target && Number.isFinite(parseFloat(target.fiber)) ? parseFloat(target.fiber) : null,
        sugar: target && Number.isFinite(parseFloat(target.sugar)) ? parseFloat(target.sugar) : null,
        saturatedFat: target && Number.isFinite(parseFloat(target.saturatedFat)) ? parseFloat(target.saturatedFat) : null,
        processing: target && Number.isFinite(parseFloat(target.processing)) ? parseFloat(target.processing) : null
    }),

    getStatusClasses: (dayTotals, targets) => ({
        kcal: UI.getStatusClass(dayTotals.kcal, targets.kcal),
        protein: UI.getStatusClass(dayTotals.protein, targets.protein),
        carbs: UI.getStatusClass(dayTotals.carbs, targets.carbs),
        fat: UI.getStatusClass(dayTotals.fat, targets.fat),
        salt: UI.getStatusClassByRule(dayTotals.salt, targets.salt, { rule: 'max', tolerancePct: 10 }),
        fiber: UI.getStatusClassByRule(dayTotals.fiber, targets.fiber, { rule: 'min', tolerancePct: 10 }),
        sugar: UI.getStatusClassByRule(dayTotals.sugar, targets.sugar, { rule: 'max', tolerancePct: 10 }),
        saturatedFat: UI.getStatusClassByRule(dayTotals.saturatedFat, targets.saturatedFat, { rule: 'max', tolerancePct: 10 }),
        processing: UI.getStatusClassByRule(dayTotals.processingAvg, targets.processing, { rule: 'max', tolerancePct: 10 })
    }),

    renderPrimaryNutrientsHtml: ({ kcal, protein, carbs, fat }, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm',
        kcalDebugPayload = ''
    } = {}) => {
        const targetKcal = targets ? targets.kcal : null;
        const targetProtein = targets ? targets.protein : null;
        const targetCarbs = targets ? targets.carbs : null;
        const targetFat = targets ? targets.fat : null;
        const kcalPillHtml = kcalDebugPayload
            ? `
                <button type="button" class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block pill-trigger kcal-info-trigger" data-kcal-debug="${kcalDebugPayload}">
                     <span class="${statusClasses.kcal || ''}">${Math.round(kcal)} kcal</span>
                    ${Number.isFinite(targetKcal) ? `<span class="text-muted">/ ${targetKcal} kcal</span>` : ''}
                </button>
            `
            : `
                <div class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block">
                     <span class="${statusClasses.kcal || ''}">${Math.round(kcal)} kcal</span>
                    ${Number.isFinite(targetKcal) ? `<span class="text-muted">/ ${targetKcal} kcal</span>` : ''}
                </div>
            `;

        return `
            ${kcalPillHtml}
            <div class="nutrition-row">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Prot</div>
                    <div><span class="${statusClasses.protein || ''}">${Math.round(protein)}g</span>${Number.isFinite(targetProtein) ? ` <span class="text-muted">/ ${targetProtein}g</span>` : ''}</div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Carbs</div>
                    <div><span class="${statusClasses.carbs || ''}">${Math.round(carbs)}g</span>${Number.isFinite(targetCarbs) ? ` <span class="text-muted">/ ${targetCarbs}g</span>` : ''}</div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Grasas</div>
                    <div><span class="${statusClasses.fat || ''}">${Math.round(fat)}g</span>${Number.isFinite(targetFat) ? ` <span class="text-muted">/ ${targetFat}g</span>` : ''}</div>
                </div>
            </div>
        `;
    },

    renderSecondaryNutrientsHtml: ({
        salt, fiber, sugar, saturatedFat, processing, containerClass = '', targets = null, statusClasses = {},
        decimals = {}
    }) => {
        const saltDecimals = Number.isFinite(decimals.salt) ? decimals.salt : 2;
        const fiberDecimals = Number.isFinite(decimals.fiber) ? decimals.fiber : 1;
        const sugarDecimals = Number.isFinite(decimals.sugar) ? decimals.sugar : 1;
        const saturatedFatDecimals = Number.isFinite(decimals.saturatedFat) ? decimals.saturatedFat : 1;
        const processingDecimals = Number.isFinite(decimals.processing) ? decimals.processing : 1;
        const classSuffix = containerClass ? ` ${containerClass}` : '';
        const processingValue = Number.isFinite(processing) ? `${NutritionUI.formatNumber(processing, processingDecimals)}/10` : '-';
        const targetSalt = targets ? targets.salt : null;
        const targetFiber = targets ? targets.fiber : null;
        const targetSugar = targets ? targets.sugar : null;
        const targetSaturatedFat = targets ? targets.saturatedFat : null;
        const targetProcessing = targets ? targets.processing : null;

        return `
            <div class="modal-grid-3 modal-grid-3--compact${classSuffix}">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Sal</div>
                    <div>
                        <span class="${statusClasses.salt || ''}">${NutritionUI.formatNumber(salt, saltDecimals)}g</span>
                        ${Number.isFinite(targetSalt) ? ` <span class="text-muted">/ ${NutritionUI.formatNumber(targetSalt, saltDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Azcar</div>
                    <div>
                        <span class="${statusClasses.sugar || ''}">${NutritionUI.formatNumber(sugar, sugarDecimals)}g</span>
                        ${Number.isFinite(targetSugar) ? ` <span class="text-muted">/ ${NutritionUI.formatNumber(targetSugar, sugarDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Grasa sat.</div>
                    <div>
                        <span class="${statusClasses.saturatedFat || ''}">${NutritionUI.formatNumber(saturatedFat, saturatedFatDecimals)}g</span>
                        ${Number.isFinite(targetSaturatedFat) ? ` <span class="text-muted">/ ${NutritionUI.formatNumber(targetSaturatedFat, saturatedFatDecimals)}g</span>` : ''}
                    </div>
                </div>
            </div>

            <div class="modal-grid-2 modal-grid-2--compact${classSuffix}">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Fibra</div>
                    <div>
                        <span class="${statusClasses.fiber || ''}">${NutritionUI.formatNumber(fiber, fiberDecimals)}g</span>
                        ${Number.isFinite(targetFiber) ? ` <span class="text-muted">/ ${NutritionUI.formatNumber(targetFiber, fiberDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label"> Procesamiento</div>
                    <div>
                        <span class="${statusClasses.processing || ''}">${processingValue}</span>
                        ${Number.isFinite(targetProcessing) ? ` <span class="text-muted">/ ${NutritionUI.formatNumber(targetProcessing, processingDecimals)}/10</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    renderCompleteNutritionHtml: (nutrients, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm',
        secondaryContainerClass = '',
        secondaryDecimals = {},
        kcalDebugPayload = ''
    } = {}) => `
        <div class="nutrition-stack">
            ${NutritionUI.renderPrimaryNutrientsHtml(nutrients, { targets, statusClasses, kcalSizeClass, kcalDebugPayload })}
            ${NutritionUI.renderSecondaryNutrientsHtml({
                salt: nutrients.salt,
                fiber: nutrients.fiber,
                sugar: nutrients.sugar,
                saturatedFat: nutrients.saturatedFat,
                processing: nutrients.processing,
                containerClass: secondaryContainerClass,
                targets,
                statusClasses,
                decimals: secondaryDecimals
            })}
        </div>
    `,

    renderNutritionalScorePill: (dayTotals, targets, { dayLabel = '' } = {}) => {
        if (typeof NutritionScore === 'undefined') return '';
        const result = NutritionScore.calculate({
            kcal: dayTotals.kcal,
            protein: dayTotals.protein,
            carbs: dayTotals.carbs,
            fat: dayTotals.fat,
            fiber: dayTotals.fiber,
            sugar: dayTotals.sugar,
            saturatedFat: dayTotals.saturatedFat,
            salt: dayTotals.salt,
            processing: dayTotals.processingAvg
        }, targets);
        const statusClass = NutritionScore.getStatusClass(result.score);
        const debugPayload = NutritionUI.encodePayload({
            dayLabel,
            score: result.score,
            penaltyTotal: result.penaltyTotal,
            penalties: result.penalties,
            deviationsPct: result.deviationsPct,
            actuals: {
                kcal: dayTotals.kcal,
                protein: dayTotals.protein,
                carbs: dayTotals.carbs,
                fat: dayTotals.fat,
                fiber: dayTotals.fiber,
                sugar: dayTotals.sugar,
                saturatedFat: dayTotals.saturatedFat,
                salt: dayTotals.salt,
                processing: dayTotals.processingAvg
            },
            targets
        });
        return `
            <button type="button" class="stat-pill stat-pill--nutritional-score stat-pill--sm stat-pill--block pill-trigger nutritional-score-info-trigger" data-nutritional-score-debug="${debugPayload}">
                 Nutritional Score: <span class="${statusClass}">${NutritionUI.formatNumber(result.score, 1)}</span>
            </button>
        `;
    },

    renderTotalsHtml: (dayTotals, target, {
        dayLabel = '',
        kcalSizeClass = 'stat-pill--sm',
        secondaryContainerClass = 'totals-secondary-grid',
        secondaryDecimals = { salt: 2, fiber: 0, sugar: 0, saturatedFat: 0, processing: 1 }
    } = {}) => {
        const targets = NutritionUI.normalizeTarget(target);
        const statusClasses = NutritionUI.getStatusClasses(dayTotals, targets);
        const kcalFromMacros = (NutritionUI.toSafeNumber(dayTotals.protein) * 4)
            + (NutritionUI.toSafeNumber(dayTotals.carbs) * 4)
            + (NutritionUI.toSafeNumber(dayTotals.fat) * 9);
        const kcalDiff = NutritionUI.toSafeNumber(dayTotals.kcal) - kcalFromMacros;
        const kcalDebugPayload = NutritionUI.encodePayload({
            dayLabel,
            actuals: {
                kcal: NutritionUI.toSafeNumber(dayTotals.kcal),
                protein: NutritionUI.toSafeNumber(dayTotals.protein),
                carbs: NutritionUI.toSafeNumber(dayTotals.carbs),
                fat: NutritionUI.toSafeNumber(dayTotals.fat)
            },
            targets: {
                kcal: NutritionUI.toSafeNumber(targets.kcal),
                protein: NutritionUI.toSafeNumber(targets.protein),
                carbs: NutritionUI.toSafeNumber(targets.carbs),
                fat: NutritionUI.toSafeNumber(targets.fat)
            },
            kcalFromMacros,
            kcalDiff
        });

        return `
            ${NutritionUI.renderCompleteNutritionHtml({
                kcal: dayTotals.kcal,
                protein: dayTotals.protein,
                carbs: dayTotals.carbs,
                fat: dayTotals.fat,
                salt: dayTotals.salt,
                fiber: dayTotals.fiber,
                sugar: dayTotals.sugar,
                saturatedFat: dayTotals.saturatedFat,
                processing: dayTotals.processingAvg
            }, {
                targets,
                statusClasses,
                kcalSizeClass,
                secondaryContainerClass,
                kcalDebugPayload,
                secondaryDecimals
            })}
            ${NutritionUI.renderNutritionalScorePill(dayTotals, targets, { dayLabel })}
        `;
    },

    renderBreakdownRowsHtml: (rows = []) => rows.map(row => `
        <tr>
            <td>${NutritionUI.escapeHtml(row.label || '-')}</td>
            <td class="text-right">${NutritionUI.escapeHtml(row.col2 || '-')}</td>
            <td class="text-right">${NutritionUI.escapeHtml(row.col3 || '-')}</td>
        </tr>
    `).join(''),

    showBreakdownModal: ({
        id,
        title,
        tableHeaders = ['Mtrica', 'Valor', 'Detalle'],
        rows = [],
        notes = [],
        bottomPillHtml = ''
    }) => {
        const notesHtml = notes.filter(Boolean).map(note => `<div class="text-xs text-muted mt-sm nutritional-score-modal-note">${note}</div>`).join('');
        UI.showModal({
            id,
            titleHtml: `<h3 class="text-primary modal-title">${title}</h3>`,
            bodyHtml: `
                <div class="table-scroller">
                    <table class="adjustments-table">
                        <thead>
                            <tr>
                                <th>${NutritionUI.escapeHtml(tableHeaders[0] || 'Mtrica')}</th>
                                <th class="text-right">${NutritionUI.escapeHtml(tableHeaders[1] || 'Valor')}</th>
                                <th class="text-right">${NutritionUI.escapeHtml(tableHeaders[2] || 'Detalle')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${NutritionUI.renderBreakdownRowsHtml(rows)}
                        </tbody>
                    </table>
                </div>
                ${notesHtml}
                ${bottomPillHtml}
            `
        });
    }
};

window.NutritionUI = NutritionUI;
