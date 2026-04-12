const ActivityPresenter = (() => {
    const METRICS = typeof MetricsRegistry !== 'undefined' ? MetricsRegistry : null;
    const ACTIVITY_SCORE_KEYS = ['stepsKcal', 'trainingKcal', 'met', 'intensity'];
    const t = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');
    const humanize = (value = '') => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
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
    const ACTIVITY_METRIC_LABELS = Object.fromEntries(ACTIVITY_SCORE_KEYS.map((key) => [key, getMetricLabel(key)]));

    const safeText = (escapeHtml, value) => typeof escapeHtml === 'function' ? escapeHtml(value) : String(value || '');
    const getTaxonomyLabel = (group, value = '') => t(`activity.taxonomy.${group}.${value}`, {}, humanize(value));
    const scorePill = (score, statusClass) => `
        <div class="stats-pills stats-pills--center mt-lg">
            <div class="stat-pill stat-pill--activity-score activity-score-modal-score-pill">${t('activity.labels.score_value', {}, 'Puntuación')}: <span class="${statusClass}">${score}</span></div>
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
                ${t('activity.score.activity_score', {}, 'Score actividad')}: <span class="${typeof getStatusClassFromCode === 'function' ? getStatusClassFromCode(score.status) : ''}">${Number.isFinite(score.score) ? formatNumber(score.score, 1) : '-'}</span>
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
                    ${totalPill('', `${getMetricLabel('stepsKcal', { short: true })} &middot; ${Math.round(totals.stepsKcal || 0)} kcal`)}
                    ${totalPill('', `${getMetricLabel('trainingKcal', { short: true })} &middot; ${Math.round(totals.trainingKcal || 0)} kcal`)}
                </div>
                <div class="totals-row">
                    ${totalPill(getMetricLabel('met', { short: true }), numeric(totals.metAvg, formatMet, ' MET'))}
                    ${totalPill(getMetricLabel('intensity'), numeric(totals.intensityAvg, formatFactor).replace(/^/, 'x').replace(/^x-$/, '-'))}
                    ${totalPill(t('activity.labels.time', {}, 'Tiempo'), numeric(totals.totalMinutes, formatMinutes, ' min'))}
                </div>
                ${renderActivityScorePill(dayView.dayAssessment ? dayView.dayAssessment.activity : null, { formatNumber, getStatusClassFromCode, encodePayload })}
            </div>
        `;
    };

    const buildTechniqueModal = ({ name = '', type = '', focus = '', muscles = '', equipment = '', restSeconds = '', technique = '', kcal = 0, escapeHtml } = {}) => ({
        titleHtml: `<h3 class="modal-title">${safeText(escapeHtml, name || t('pages.activity.heading', {}, 'Actividad'))}</h3>`,
        bodyHtml: `
            <div class="text-sm">
                ${[
                    [t('activity.labels.type', {}, 'Tipo'), getTaxonomyLabel('types', type)],
                    [t('activity.labels.focus', {}, 'Enfoque'), getTaxonomyLabel('focuses', focus)],
                    [t('activity.labels.muscles', {}, 'Músculos'), muscles],
                    [t('activity.labels.equipment', {}, 'Equipo'), equipment]
                ].map(([label, value]) => `<div><span class="text-muted">${label}:</span> ${safeText(escapeHtml, value || '-')}</div>`).join('')}
                ${restSeconds ? `<div><span class="text-muted">${t('activity.labels.rest', {}, 'Descanso')}:</span> ${safeText(escapeHtml, restSeconds)} s</div>` : ''}
            </div>
            <p class="text-sm">${safeText(escapeHtml, technique || t('activity.states.technique_unavailable', {}, 'Técnica no disponible.'))}</p>
            <div class="stats-pills stats-pills--center mt-lg"><div class="stat-pill stat-pill--kcal">Kcal ${Math.round(kcal || 0)}</div></div>
        `
    });

    const buildScoreModal = ({ payload = {}, metricLabels = ACTIVITY_METRIC_LABELS, formatNumber, getStatusClassFromCode, escapeHtml } = {}) => {
        if (typeof formatNumber !== 'function') return null;
        const targets = payload.targets || {};
        const inputs = payload.inputs || {};
        const rows = ACTIVITY_SCORE_KEYS.map((key) => [
            key,
            getMetricDecimals(key, key === 'intensity' ? 2 : 1),
            key === 'stepsKcal' ? (targets.stepsKcal || targets.stepsKcalTarget) : targets[key]
        ]);
        return {
            id: 'activity-score-modal',
            titleHtml: `<h3 class="modal-title">${t('activity.score.activity_score_title', {}, 'Score de actividad')}</h3>`,
            bodyHtml: `
                <div class="activity-score-modal">
                    <table class="activity-score-table">
                        <thead><tr><th>${t('activity.labels.metrics', {}, 'Métricas')}</th><th class="text-right">${t('activity.labels.actual', {}, 'Actual')}</th><th class="text-right">${t('activity.labels.target', {}, 'Objetivo')}</th></tr></thead>
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
