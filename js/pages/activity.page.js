function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    const activityT = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');
    let formulas = null;
    let targets = null;
    let activityService = null;
    let activityPresenter = null;
    let currentPlanData = null;
    let exercisesCatalog = null;
    let isEditMode = false;
    const metrics = window.MetricsRegistry || null;

    const pendingAdds = {};
    const PLAN_KEY = 'activity_plan_selector';
    const defaultStepsCfg = APP_STEPS_DEFAULTS;
    const errorColspan = Number.isFinite(DAYS_COUNT) ? DAYS_COUNT + 1 : 8;
    const table = tableBody.closest('table');
    let container = document.getElementById('actividad-container');
    if (!container && table) container = table.parentElement;

    const getPlanFiles = () => Array.isArray(AVAILABLE_ACTIVITY_PLAN_FILES) ? AVAILABLE_ACTIVITY_PLAN_FILES : [];
    let currentFile = getPlanFiles().length ? getPlanFiles()[0].file : null;
    const getPlanData = () => currentPlanData;
    const setPlanData = (planData) => (currentPlanData = planData);
    const clearPlanData = () => {
        setPlanData(null);
        activityService.clearSavedPlanData({ currentFile });
    };
    const resetActivityData = () => clearPlanData();
    const confirmAndResetActivity = () => {
        if (!confirm(activityT('activity.states.reset_confirm', {}, 'Restablecer actividad por defecto? Se perderan los cambios.'))) return;
        resetActivityData();
        if (isEditMode) isEditMode = false;
        loadPlanFile(currentFile).then(renderTableContent);
    };

    const getWalkingExercise = () => activityService.getWalkingExercise({ exercisesMap: exercisesCatalog || {}, defaultStepsCfg });
    const mutatePlan = (method, payload = {}, { rerender = true } = {}) => {
        setPlanData(activityService[method]({
            currentFile,
            planData: getPlanData() || [],
            persist: true,
            ...payload
        }));
        if (rerender) renderTableContent();
        return getPlanData();
    };

    const formatMet = (value) => {
        const numeric = parseFloat(value);
        if (!Number.isFinite(numeric) || numeric <= 0) return '-';
        const rounded = Math.round(numeric * 10) / 10;
        return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    };
    const formatFactor = (value) => {
        const numeric = parseFloat(value);
        return Number.isFinite(numeric) && numeric > 0 ? (Math.round(numeric * 100) / 100).toFixed(2) : '-';
    };

    const formatNumber = UI.formatNumber;
    const encodePayload = UI.encodePayload;
    const decodePayload = UI.decodePayload;
    const escapeHtml = UI.escapeHtml;
    const getWeekDayLabel = (value, fallback = '') => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.getWeekDayLabel === 'function'
            ? DateUtils.getWeekDayLabel(value, fallback)
            : (fallback || String(value || ''))
    );
    const formatTaxonomyFallback = (value = '') => UI.formatLabel(String(value || '').trim());
    const getTaxonomyLabel = (group, value, fallback = '') => (
        activityT(`activity.taxonomy.${group}.${value}`, {}, fallback || formatTaxonomyFallback(value))
    );
    const getExerciseName = (exerciseId, fallback = '') => window.ContentI18n?.exerciseName?.(exerciseId, fallback || exerciseId) || fallback || exerciseId;
    const getExerciseDescription = (exerciseId, fallback = '') => window.ContentI18n?.exerciseDescription?.(exerciseId, fallback) || fallback;
    const getExerciseTechnique = (exerciseId, fallback = '') => window.ContentI18n?.exerciseTechnique?.(exerciseId, fallback) || fallback;
    const getMetricLabel = (key, options = {}) => (
        metrics && typeof metrics.getLabel === 'function'
            ? metrics.getLabel(key, options)
            : String(key || '')
    );
    const dataAttrs = (attrs = {}) => Object.entries(attrs)
        .map(([key, value]) => ` data-${key}="${escapeHtml(String(value == null ? '' : value))}"`)
        .join('');
    const editInput = (attrs, value, { numeric = true } = {}) => (
        `<input type="text"${numeric ? ' inputmode="numeric" pattern="[0-9]*"' : ''} class="input-base input-base--table-edit"${dataAttrs(attrs)} value="${escapeHtml(String(value == null ? '' : value))}">`
    );
    const kvRow = (label, valueHtml, valueClass = '') => `
        <div class="activity-exercise__kv-row">
            <div class="activity-exercise__kv-label">${label}</div>
            <div class="activity-exercise__kv-value${valueClass ? ` ${valueClass}` : ''}">${valueHtml}</div>
        </div>
    `;
    const pill = (label, value) => `<div class="activity-exercise__pill">${label} ${value}</div>`;
    const splitRow = (left, right) => `<div class="activity-exercise__row activity-exercise__row--split">${left}${right}</div>`;
    const cardHtml = ({ data = {}, nameHtml = '', kvRows = '', statRows = '', description = '', className = '' } = {}) => `
        <div class="activity-exercise${className ? ` ${className}` : ''}"${dataAttrs(data)}>
            ${nameHtml}
            ${kvRows ? `<div class="activity-exercise__kv">${kvRows}</div>` : ''}
            ${statRows}
            <div class="meal-description">${description || ''}</div>
        </div>
    `;
    const addButton = (sectionKey, dayIndex) => (
        isEditMode
            ? `<button type="button" class="activity-training__add"${dataAttrs({ 'ex-add-section': sectionKey, 'ex-add-day-index': dayIndex })}>${activityT('activity.actions.add_exercise', {}, 'Añadir')}</button>`
            : ''
    );
    const trainingCell = ({ title, sectionKey, dayIndex, description = '', body = '' } = {}) => `
        <td>
            <div class="activity-training">
                <div class="activity-training__title-row">
                    <div class="activity-training__title">${title}</div>
                    ${addButton(sectionKey, dayIndex)}
                </div>
                <div class="activity-training__meta">${description}</div>
                ${body}
            </div>
        </td>
    `;
    const generateActivityTotalsHtml = (dayView) => activityPresenter.renderActivityTotals(dayView, {
        formatNumber,
        formatMet,
        formatFactor,
        formatMinutes: UI.formatMinutes,
        getStatusClassFromCode: UI.getStatusClassFromCode,
        encodePayload
    });
    const showTechniqueModal = (exercise) => UI.showModal(activityPresenter.buildTechniqueModal({ ...exercise, escapeHtml }));
    const showScoreModal = (payload) => UI.showModal(activityPresenter.buildScoreModal({
        payload,
        formatNumber,
        getStatusClassFromCode: UI.getStatusClassFromCode,
        escapeHtml
    }));
    const setTableMessage = (message, status = 'danger') => {
        tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--${status} text-center">${message}</td></tr>`;
    };
    const appendTableRow = (label, cellsHtml) => tableBody.appendChild(Object.assign(document.createElement('tr'), {
        innerHTML: `<td class="activity-row-header">${label}</td>${cellsHtml}`
    }));

    const buildPlanSelector = () => {
        const plans = getPlanFiles();
        const title = document.querySelector('h1');
        if (!title) return;
        title.classList.add('header-with-controls');
        let wrapper = document.getElementById(PLAN_KEY);
        if (!plans.length) {
            if (wrapper) wrapper.remove();
            return;
        }
        if (!wrapper) {
            wrapper = document.createElement('span');
            wrapper.id = PLAN_KEY;
            title.appendChild(wrapper);
        }
        wrapper.innerHTML = `<select id="activity-plan-select" class="input-base input-select input-select--header">${plans.map((plan) => (
            `<option value="${plan.file}" ${plan.file === currentFile ? 'selected' : ''}>${escapeHtml(activityT(`activity.plans.${plan.label}`, {}, plan.label))}</option>`
        )).join('')}</select>`;
        const select = document.getElementById('activity-plan-select');
        if (select) {
            select.addEventListener('change', (event) => {
                currentFile = activityService.setSelectedPlanFile({ file: event.target.value, availableFiles: plans });
                loadPlanFile(currentFile).then(renderTableContent);
            });
        }
    };
    const loadPlanFile = (file) => CoreBrowserAdapter.resolveActivityPlanData(file)
        .then((planData) => setPlanData(Array.isArray(planData) ? planData : null))
        .catch(() => null);

    const renderTableContent = () => {
        if (!exercisesCatalog) {
            setTableMessage(activityT('activity.states.missing_exercises', {}, 'Error: datos de ejercicios no disponibles.'));
            return;
        }

        const planData = getPlanData();
        if (!Array.isArray(planData) || !planData.length) {
            setTableMessage(activityT('activity.states.no_plan', {}, 'No hay plan semanal seleccionado o disponible.'), 'warning');
            return;
        }

        const pageModel = activityService.getActivityPageModel({
            planData,
            currentFile,
            exercisesMap: exercisesCatalog,
            defaultStepsCfg,
            targets,
            formulas,
            activityScoreEngine: ActivityScore
        });
        currentPlanData = pageModel.planData || planData;

        const dayViews = pageModel.days;
        const todayIndex = UI.getTodayIndex();
        const walkingExercise = pageModel.walkingExercise;

        if (table) {
            const thead = table.querySelector('thead');
            if (thead) {
                thead.innerHTML = `<tr><th class="activity-row-header"></th>${WEEK_DAYS.map((dayKey, index) => `
                    <th class="${index === todayIndex ? 'text-status--ok' : ''}">
                        <div class="activity-day-header"><div class="activity-day-title">${getWeekDayLabel(dayKey, dayKey)}</div></div>
                    </th>
                `).join('')}</tr>`;
            }
        }

        const renderMovementCell = (dayData, dayIndex, dayView) => {
            const walkInfo = dayView.walkInfo;
            const movement = dayView.movement || {};
            const currentWalkingExercise = dayView.walkingExercise || walkingExercise;
            const movementName = getExerciseName(currentWalkingExercise.id, currentWalkingExercise.name || activityT('activity.titles.daily_movement', {}, 'Movimiento diario'));
            const movementTechnique = getExerciseTechnique(currentWalkingExercise.id, currentWalkingExercise.technique || '');
            const stepsKcal = movement.stepsKcal || 0;
            const totalMin = movement.totalMin || 0;
            const distanceKm = movement.distanceKm || 0;
            const stepsMet = movement.stepsMet || 0;
            return `
                <td>
                    ${cardHtml({
                        data: {
                            'ex-name': movementName,
                            'ex-tech': movementTechnique,
                            'ex-kcal': stepsKcal,
                            'ex-type': currentWalkingExercise.type || '',
                            'ex-focus': currentWalkingExercise.focus || '',
                            'ex-muscles': currentWalkingExercise.muscles || '',
                            'ex-equipment': currentWalkingExercise.equipment || ''
                        },
                        nameHtml: `<div class="activity-exercise__name modal-trigger">${movementName}</div>`,
                        kvRows: [
                            kvRow(activityT('activity.labels.steps', {}, 'Pasos'), isEditMode
                                ? editInput({ 'walk-day-index': dayIndex, 'walk-field': 'steps' }, walkInfo.steps)
                                : walkInfo.steps, isEditMode ? 'activity-exercise__kv-value--edit' : ''),
                            kvRow(activityT('activity.labels.steps_per_min', {}, 'Ritmo (pasos/min)'), isEditMode
                                ? editInput({ 'walk-day-index': dayIndex, 'walk-field': 'stepsPerMin' }, walkInfo.stepsPerMin)
                                : (walkInfo.stepsPerMin > 0 ? walkInfo.stepsPerMin : '-'), isEditMode ? 'activity-exercise__kv-value--edit' : '')
                        ].join(''),
                        statRows: [
                            splitRow(pill(getMetricLabel('kcal'), Math.round(stepsKcal)), pill(getMetricLabel('met', { short: true }), parseFloat(stepsMet) > 0 ? formatMet(stepsMet) : '-')),
                            splitRow(pill(activityT('activity.labels.distance', {}, 'Distancia'), distanceKm > 0 ? `${UI.formatKm(distanceKm)} km` : '-'), pill(activityT('activity.labels.time', {}, 'Tiempo'), `${UI.formatMinutes(totalMin)} min`))
                        ].join(''),
                        description: movement.description || ((dayData.walk && dayData.walk.description) ? dayData.walk.description : '')
                    })}
                </td>
            `;
        };

        const renderPendingAdd = (sectionKey, dayIndex) => {
            if (!isEditMode || !pendingAdds[`${dayIndex}:${sectionKey}`]) return '';
            const options = Object.values(exercisesCatalog || {}).map((exercise) => (
                exercise && exercise.id ? `<option value="${exercise.id}">${getExerciseName(exercise.id, exercise.name || exercise.id)}</option>` : ''
            )).join('');
            return cardHtml({
                className: 'activity-exercise--pending',
                nameHtml: `
                    <div class="activity-exercise__name-row">
                        <div class="activity-exercise__name activity-exercise__name--select">
                            <select class="input-base input-select input-select--sm"${dataAttrs({ 'ex-add-select-section': sectionKey, 'ex-add-select-day-index': dayIndex })}>${options}</select>
                        </div>
                        <button type="button" class="activity-exercise__add-done"${dataAttrs({ 'ex-add-done-section': sectionKey, 'ex-add-done-day-index': dayIndex })}>${activityT('common.ok', {}, 'OK')}</button>
                    </div>
                `,
                description: activityT('activity.states.adding_exercise', {}, 'Añadiendo ejercicio...')
            });
        };

        const renderExerciseCard = (sectionKey, dayIndex, view) => {
            const exercise = view && view.definition ? view.definition : null;
            const item = view && view.item ? view.item : null;
            if (!exercise || !item) return '';

            const isTimeBased = view.isTimeBased;
            const numericWeight = view.numericWeight;
            const showWeight = !!view.showWeight;
            const canEditWeight = !!view.canEditWeight;
            const effectiveSecPerRep = view.effectiveSecPerRep || 0;
            const repetitionsDisplay = view.repetitionsDisplay || '-';
            const kcal = view.kcal || 0;
            const estimatedMin = view.estimatedMin || 0;
            const met = view.met;
            const showMet = !!view.showMet;
            const intensityFactor = view.intensityFactor || 0;
            const showIntensity = !!view.showIntensity;
            const exerciseRest = view.exerciseRest || '';
            const localizedName = getExerciseName(exercise.id, exercise.name || item.exerciseId || '');
            const localizedDescription = getExerciseDescription(exercise.id, exercise.description || '');
            const localizedTechnique = getExerciseTechnique(exercise.id, exercise.technique || '');
            const sameTypeOptions = Object.values(exercisesCatalog)
                .filter((entry) => entry && entry.type === exercise.type)
                .map((entry) => `<option value="${entry.id}" ${entry.id === exercise.id ? 'selected' : ''}>${getExerciseName(entry.id, entry.name || entry.id)}</option>`)
                .join('');

            return cardHtml({
                data: {
                    'ex-name': localizedName,
                    'ex-tech': localizedTechnique,
                    'ex-kcal': kcal,
                    'ex-type': exercise.type || '',
                    'ex-focus': exercise.focus || '',
                    'ex-muscles': exercise.muscles || '',
                    'ex-equipment': exercise.equipment || '',
                    'ex-rest': exerciseRest
                },
                nameHtml: isEditMode
                    ? `
                        <div class="activity-exercise__name-row">
                            <div class="activity-exercise__name activity-exercise__name--select">
                                <select class="input-base input-select input-select--sm"${dataAttrs({ 'ex-swap-section': sectionKey, 'ex-swap-day-index': dayIndex, 'ex-swap-id': item.exerciseId })}>${sameTypeOptions}</select>
                            </div>
                            <button type="button" class="activity-exercise__delete"${dataAttrs({ 'ex-delete-section': sectionKey, 'ex-delete-day-index': dayIndex, 'ex-delete-id': item.exerciseId })} title="${escapeHtml(activityT('activity.actions.remove_exercise', {}, 'Borrar'))}">&times;</button>
                        </div>
                    `
                    : `<div class="activity-exercise__name modal-trigger">${localizedName}</div>`,
                kvRows: [
                    kvRow(activityT('activity.labels.reps', {}, 'Repeticiones'), isEditMode
                        ? `
                            ${editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'sets' }, item.sets || '')}
                            <span class="activity-exercise__kv-sep">&times;</span>
                            ${isTimeBased
                                ? `${editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'secPerRep' }, effectiveSecPerRep || '')}<span class="activity-exercise__kv-suffix">s</span>`
                                : editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'reps' }, item.reps || '', { numeric: false })}
                        `
                        : repetitionsDisplay, isEditMode ? 'activity-exercise__kv-value--edit activity-exercise__kv-value--inputs' : ''),
                    kvRow(activityT('activity.labels.load', {}, 'Carga'), isEditMode && canEditWeight
                        ? editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'weightKg' }, Number.isFinite(numericWeight) ? numericWeight : '')
                        : (showWeight ? `${numericWeight} kg` : '-'), isEditMode && canEditWeight ? 'activity-exercise__kv-value--edit' : '')
                ].join(''),
                statRows: [
                    splitRow(pill(getMetricLabel('kcal'), Math.round(kcal)), pill(getMetricLabel('met', { short: true }), showMet ? formatMet(met) : '-')),
                    splitRow(pill(getMetricLabel('intensity'), showIntensity ? `x${formatFactor(intensityFactor)}` : '-'), pill(activityT('activity.labels.time', {}, 'Tiempo'), `${UI.formatMinutes(estimatedMin)} min`))
                ].join(''),
                description: localizedDescription
            });
        };

        const renderExerciseGroups = (sectionKey, dayView, dayIndex) => {
            const sectionView = dayView && dayView.sections ? dayView.sections[sectionKey] : null;
            if (sectionView && sectionView.isRest) return '';
            const pendingHtml = renderPendingAdd(sectionKey, dayIndex);
            const groups = sectionView && Array.isArray(sectionView.groups) ? sectionView.groups : [];
            if (!groups.length) return pendingHtml || `<div class="activity-training__meta">${activityT('activity.states.no_exercises_defined', {}, 'Sin ejercicios definidos.')}</div>`;
            return pendingHtml + groups.map((group) => `
                <div class="activity-exercise-group"><div class="activity-exercise-group__title">${getTaxonomyLabel('types', group.type)} · ${getTaxonomyLabel('focuses', group.focus)}</div></div>
                ${group.items.map((item) => renderExerciseCard(sectionKey, dayIndex, item)).join('')}
            `).join('');
        };

        tableBody.innerHTML = '';
        appendTableRow(activityT('activity.sections.movement', {}, 'Movimiento'), currentPlanData.map((dayData, dayIndex) => renderMovementCell(dayData, dayIndex, dayViews[dayIndex])).join(''));
        appendTableRow(activityT('activity.sections.gym', {}, 'Gimnasio'), currentPlanData.map((dayData, dayIndex) => trainingCell({
            title: dayData.gym && dayData.gym.type === 'rest' ? activityT('activity.titles.rest', {}, 'Descanso') : activityT('activity.titles.training', {}, 'Entrenamiento'),
            sectionKey: 'gym',
            dayIndex,
            description: dayData.gym && dayData.gym.description ? dayData.gym.description : '',
            body: renderExerciseGroups('gym', dayViews[dayIndex], dayIndex)
        })).join(''));
        if (activityService.hasExtraActivity(currentPlanData) || isEditMode) {
            appendTableRow(activityT('activity.sections.extra', {}, 'Extra'), currentPlanData.map((dayData, dayIndex) => trainingCell({
                title: activityT('activity.titles.extra', {}, 'Extra'),
                sectionKey: 'extra_activity',
                dayIndex,
                description: dayData.extra_activity && dayData.extra_activity.description ? dayData.extra_activity.description : '',
                body: renderExerciseGroups('extra_activity', dayViews[dayIndex], dayIndex)
            })).join(''));
        }
        appendTableRow(activityT('activity.sections.totals', {}, 'Totales'), dayViews.map((dayView) => `<td>${generateActivityTotalsHtml(dayView)}</td>`).join(''));
        if (table) setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };

    const renderControls = () => UI.renderEditResetControls({
        id: 'activity-controls-container',
        isEditMode,
        onToggle: () => {
            isEditMode = !isEditMode;
            const fresh = renderControls();
            const current = document.getElementById('activity-controls-container');
            if (current) current.replaceWith(fresh);
            renderTableContent();
        },
        onReset: confirmAndResetActivity
    });

    if (container && !document.getElementById('activity-controls-container')) container.after(renderControls());

    if (table) table.addEventListener('change', (event) => {
        const target = event.target;

        if (target.matches('input[data-walk-day-index][data-walk-field]')) {
            mutatePlan('updateWalkField', {
                dayIndex: parseInt(target.dataset.walkDayIndex, 10),
                field: target.dataset.walkField,
                value: target.value,
                defaultStepsCfg,
                walkingExercise: getWalkingExercise()
            });
            return;
        }

        if (target.matches('input[data-ex-day-index][data-ex-section][data-ex-id][data-field]')) {
            mutatePlan('updateExerciseField', {
                dayIndex: parseInt(target.dataset.exDayIndex, 10),
                sectionKey: target.dataset.exSection,
                exerciseId: target.dataset.exId,
                field: target.dataset.field,
                value: target.value
            });
            return;
        }

        if (target.matches('select[data-ex-swap-section][data-ex-swap-day-index][data-ex-swap-id]')) {
            mutatePlan('replaceExercise', {
                dayIndex: parseInt(target.dataset.exSwapDayIndex, 10),
                sectionKey: target.dataset.exSwapSection,
                exerciseId: target.dataset.exSwapId,
                nextExerciseId: target.value
            });
        }
    });

    if (table) table.addEventListener('click', (event) => {
        const target = event.target;

        if (target.matches('button[data-ex-add-section][data-ex-add-day-index]')) {
            pendingAdds[`${parseInt(target.dataset.exAddDayIndex, 10)}:${target.dataset.exAddSection}`] = true;
            renderTableContent();
            return;
        }

        if (target.matches('button[data-ex-add-done-section][data-ex-add-done-day-index]')) {
            const dayIndex = parseInt(target.dataset.exAddDoneDayIndex, 10);
            const sectionKey = target.dataset.exAddDoneSection;
            const pendingKey = `${dayIndex}:${sectionKey}`;
            const select = document.querySelector(`select[data-ex-add-select-section="${sectionKey}"][data-ex-add-select-day-index="${dayIndex}"]`);
            mutatePlan('addExercise', {
                dayIndex,
                sectionKey,
                chosenId: select ? select.value : null,
                exercisesMap: exercisesCatalog
            });
            delete pendingAdds[pendingKey];
            return;
        }

        if (target.matches('button[data-ex-delete-section][data-ex-delete-day-index][data-ex-delete-id]')) {
            mutatePlan('removeExercise', {
                dayIndex: parseInt(target.dataset.exDeleteDayIndex, 10),
                sectionKey: target.dataset.exDeleteSection,
                exerciseId: target.dataset.exDeleteId
            });
            return;
        }

        if (target.matches('.activity-score-info-trigger')) {
            const payload = decodePayload(target.dataset.activityScore || '');
            if (!payload) return;
            showScoreModal(payload);
            return;
        }

        if (target.closest('input, select, button, a')) return;
        const exercise = target.closest('.activity-exercise');
        if (!exercise) return;
        showTechniqueModal({
            name: exercise.dataset.exName || activityT('pages.activity.heading', {}, 'Actividad'),
            type: getTaxonomyLabel('types', exercise.dataset.exType || '', exercise.dataset.exType || ''),
            focus: getTaxonomyLabel('focuses', exercise.dataset.exFocus || '', exercise.dataset.exFocus || ''),
            muscles: exercise.dataset.exMuscles || '',
            equipment: exercise.dataset.exEquipment || '',
            restSeconds: exercise.dataset.exRest || '',
            technique: exercise.dataset.exTech || '',
            kcal: parseFloat(exercise.dataset.exKcal || '0') || 0
        });
    });

    UI.bootstrapPage({
        rootId: 'actividad-body',
        requiredDeps: [
            { global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' },
            { global: 'ActivityScore', path: 'js/core/activity-score.js' },
            { global: 'ProfileApplicationService', path: 'js/core/application/profile.service.js' },
            { global: 'TargetsApplicationService', path: 'js/core/application/targets.service.js' },
            { global: 'AssessmentApplicationService', path: 'js/core/application/assessment.service.js' },
            { global: 'ActivityApplicationService', path: 'js/core/application/activity.service.js' },
            { global: 'ActivityPresenter', path: 'js/core/presentation/activity.presenter.js' }
        ],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            globals: ['ActivityApplicationService', 'ActivityPresenter'],
            exercises: true,
            selectedActivityPlanData: true
        }).then((context) => {
            formulas = context.formulas;
            targets = context.targets;
            activityService = context.ActivityApplicationService;
            activityPresenter = context.ActivityPresenter;
            currentFile = activityService.getSelectedPlanFile({ availableFiles: getPlanFiles(), selectedFile: currentFile });
            exercisesCatalog = context.exercisesData || null;
            currentPlanData = context.activityPlanData || null;
            return true;
        }),
        run: () => {
            currentFile = activityService.getSelectedPlanFile({ availableFiles: getPlanFiles(), selectedFile: currentFile });
            buildPlanSelector();
            if (!currentFile) {
                renderTableContent();
                return;
            }
            return Array.isArray(currentPlanData) && currentPlanData.length ? renderTableContent() : loadPlanFile(currentFile).then(renderTableContent);
        },
        onError: () => {
            setTableMessage(activityT('activity.states.dependencies_error', {}, 'Error cargando dependencias (ejercicios/actividad).'));
        }
    });
}
