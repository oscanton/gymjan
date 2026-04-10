const ActivityPresenter = (() => {
    const ACTIVITY_METRIC_LABELS = {
        stepsKcal: 'Kcal pasos',
        trainingKcal: 'Kcal entrenamiento',
        met: 'MET entrenamiento',
        intensity: 'Intensidad'
    };

    const safeText = (escapeHtml, value) => typeof escapeHtml === 'function' ? escapeHtml(value) : String(value || '');
    const scorePill = (score, statusClass) => `
        <div class="stats-pills stats-pills--center mt-lg">
            <div class="stat-pill stat-pill--activity-score activity-score-modal-score-pill">Puntuaci\u00F3n: <span class="${statusClass}">${score}</span></div>
        </div>
    `;
    const totalPill = (label, value, { block = false, highlight = false } = {}) => (
        `<div class="stat-pill totals-pill stat-pill--sm${block ? ' stat-pill--block' : ''}${highlight ? ' stat-pill--kcal' : ''}">${label ? `<div class="totals-pill__label">${label}</div>` : ''}<div>${value}</div></div>`
    );

    const renderActivityScorePill = (activityAssessment, { formatNumber, getStatusClassFromCode, encodePayload } = {}) => {
        const score = activityAssessment && activityAssessment.score;
        if (!score || typeof formatNumber !== 'function' || typeof encodePayload !== 'function') return '';
        return `
            <button type="button" class="stat-pill stat-pill--activity-score stat-pill--block pill-trigger activity-score-info-trigger" data-activity-score="${encodePayload({
                score: score.score,
                status: score.status,
                scores: score.scores,
                targets: score.targets,
                inputs: activityAssessment.actuals || {}
            })}">
                Score actividad: <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(score.status) : ''}">${Number.isFinite(score.score) ? formatNumber(score.score, 1) : '-'}</span>
            </button>
        `;
    };

    const renderActivityTotals = (dayView = {}, { formatNumber, formatMet, formatFactor, formatMinutes, getStatusClassFromCode, encodePayload } = {}) => {
        const totals = dayView.totals || {};
        const numeric = (value, formatter, suffix = '') => Number.isFinite(value) && value > 0 && typeof formatter === 'function' ? `${formatter(value)}${suffix}` : '-';
        return `
            <div class="totals-stack">
                ${totalPill('', `${Math.round(totals.totalKcal || 0)} kcal`, { block: true, highlight: true })}
                <div class="totals-row totals-row--nowrap">
                    ${totalPill('', `Pasos &middot; ${Math.round(totals.stepsKcal || 0)} kcal`)}
                    ${totalPill('', `Entrenamiento &middot; ${Math.round(totals.trainingKcal || 0)} kcal`)}
                </div>
                <div class="totals-row">
                    ${totalPill('MET', numeric(totals.metAvg, formatMet, ' MET'))}
                    ${totalPill('Intensidad', numeric(totals.intensityAvg, formatFactor, '',).replace(/^/, 'x').replace(/^x-$/, '-'))}
                    ${totalPill('Tiempo', numeric(totals.totalMinutes, formatMinutes, ' min'))}
                </div>
                ${renderActivityScorePill(dayView.dayAssessment ? dayView.dayAssessment.activity : null, { formatNumber, getStatusClassFromCode, encodePayload })}
            </div>
        `;
    };

    const buildTechniqueModal = ({ name = 'Actividad', type = '', focus = '', muscles = '', equipment = '', restSeconds = '', technique = '', kcal = 0, escapeHtml } = {}) => ({
        titleHtml: `<h3 class="modal-title">${safeText(escapeHtml, name)}</h3>`,
        bodyHtml: `
            <div class="text-sm">
                ${[['Tipo', type], ['Enfoque', focus], ['M\u00FAsculos', muscles], ['Equipo', equipment]].map(([label, value]) => `<div><span class="text-muted">${label}:</span> ${safeText(escapeHtml, value || '-')}</div>`).join('')}
                ${restSeconds ? `<div><span class="text-muted">Descanso:</span> ${safeText(escapeHtml, restSeconds)} s</div>` : ''}
            </div>
            <p class="text-sm">${safeText(escapeHtml, technique || 'T\u00E9cnica no disponible.')}</p>
            <div class="stats-pills stats-pills--center mt-lg"><div class="stat-pill stat-pill--kcal">Kcal ${Math.round(kcal || 0)}</div></div>
        `
    });

    const buildScoreModal = ({ payload = {}, metricLabels = ACTIVITY_METRIC_LABELS, formatNumber, getStatusClassFromCode, escapeHtml } = {}) => {
        if (typeof formatNumber !== 'function') return null;
        const targets = payload.targets || {};
        const inputs = payload.inputs || {};
        const rows = [['stepsKcal', 1, targets.stepsKcal || targets.stepsKcalTarget], ['trainingKcal', 1, targets.trainingKcal], ['met', 1, targets.met], ['intensity', 2, targets.intensity]];
        return {
            id: 'activity-score-modal',
            titleHtml: '<h3 class="modal-title">Score de actividad</h3>',
            bodyHtml: `
                <div class="activity-score-modal">
                    <table class="activity-score-table">
                        <thead><tr><th>M\u00E9tricas</th><th class="text-right">Actual</th><th class="text-right">Objetivo</th></tr></thead>
                        <tbody>${rows.map(([key, decimals, target]) => `
                            <tr>
                                <td>${safeText(escapeHtml, metricLabels[key])}</td>
                                <td class="text-right">${safeText(escapeHtml, formatNumber(inputs[key], decimals))}</td>
                                <td class="text-right">${safeText(escapeHtml, formatNumber(target, decimals))}</td>
                            </tr>
                        `).join('')}</tbody>
                    </table>
                </div>
                ${scorePill(Number.isFinite(payload.score) ? formatNumber(payload.score, 1) : '-', typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(payload.status || '') : '')}
            `
        };
    };

    return {
        ACTIVITY_METRIC_LABELS,
        renderActivityTotals,
        buildTechniqueModal,
        buildScoreModal
    };
})();

window.ActivityPresenter = ActivityPresenter;
