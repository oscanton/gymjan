function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    let formulas = null;
    let targets = null;
    let activityService = null;
    let activityPresenter = null;
    let currentPlanData = null;
    let exercisesCatalog = null;
    let isEditMode = false;

    const pendingAdds = {};
    const PLAN_KEY = 'activity_plan_selector';
    const defaultStepsCfg = APP_STEPS_DEFAULTS;
    const errorColspan = Number.isFinite(DAYS_COUNT) ? DAYS_COUNT + 1 : 8;
    const table = tableBody.closest('table');
    let container = document.getElementById('actividad-container');
    if (!container && table) container = table.parentElement;

    const getPlanFiles = () => Array.isArray(AVAILABLE_ACTIVITY_PLAN_FILES) ? AVAILABLE_ACTIVITY_PLAN_FILES : [];
    const getSelectedFile = () => ActivityStore.getSelectedFile();
    const setSelectedFile = (file) => ActivityStore.setSelectedFile(file);
    const getPlanData = () => currentPlanData;
    const getSectionItems = (dayData, sectionKey) => (
        dayData && dayData[sectionKey] && Array.isArray(dayData[sectionKey].exercises) ? dayData[sectionKey].exercises : null
    );
    const getExerciseItem = (planData, dayIndex, sectionKey, exerciseId) => {
        const items = getSectionItems(planData[dayIndex], sectionKey);
        return items && items.find((item) => item && item.exerciseId === exerciseId);
    };
    const savePlanData = (data) => {
        currentPlanData = ActivityStore.normalizeActivityData(data);
        ActivityStore.savePlanData(getSelectedFile(), currentPlanData);
    };
    const clearPlanData = () => {
        currentPlanData = null;
        ActivityStore.clearSavedPlanData(getSelectedFile());
    };
    const resetActivityData = () => clearPlanData();
    const confirmAndResetActivity = () => {
        if (!confirm("\u00BFRestablecer actividad por defecto? Se perder\u00E1n los cambios.")) return;
        resetActivityData();
        if (isEditMode) isEditMode = false;
        loadPlanFile(getSelectedFile()).then(renderTableContent);
    };

    const getWalkingExercise = () => {
        if (activityService && typeof activityService.getWalkingExercise === 'function') {
            return activityService.getWalkingExercise({ exercisesMap: exercisesCatalog || {}, defaultStepsCfg });
        }
        if (exercisesCatalog && exercisesCatalog.caminar) return exercisesCatalog.caminar;
        return {
            name: 'Caminar',
            type: 'cardio',
            focus: 'full_body',
            muscles: 'piernas, core',
            equipment: 'ninguno',
            cadenceBase: defaultStepsCfg.perMinute,
            met: defaultStepsCfg.met,
            description: 'Actividad base de baja intensidad.',
            technique: 'Actividad diaria basada en pasos.'
        };
    };
    const ensureWalkItem = (dayData) => {
        if (!dayData) return null;
        if (!dayData.walk || typeof dayData.walk !== 'object') dayData.walk = { exercises: [], description: '' };
        if (!Array.isArray(dayData.walk.exercises)) dayData.walk.exercises = [];
        let item = dayData.walk.exercises.find((entry) => entry && entry.exerciseId === 'caminar');
        if (!item) {
            item = { exerciseId: 'caminar', sets: 1, reps: 1, stepsPerMin: defaultStepsCfg.perMinute };
            dayData.walk.exercises.unshift(item);
        }
        return item;
    };
    const getWalkInfo = (dayData) => (
        activityService && typeof activityService.getWalkInfo === 'function'
            ? activityService.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise: getWalkingExercise() })
            : (ActivityStore && ActivityStore.getWalkInfo
                ? ActivityStore.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise: getWalkingExercise() })
                : { steps: 0, stepsPerMin: defaultStepsCfg.perMinute, secPerRep: 0, cadenceBase: defaultStepsCfg.perMinute })
    );
    const dayHasExtra = (plan) => Array.isArray(plan) && plan.some((day) => (
        day && day.extra_activity && day.extra_activity.type !== 'rest' &&
        Array.isArray(day.extra_activity.exercises) && day.extra_activity.exercises.length
    ));
    const buildDefaultExercise = (section, sectionKey, exerciseId) => {
        const list = getSectionItems({ [sectionKey]: section }, sectionKey) || [];
        let baseId = exerciseId || (list.length ? list[0].exerciseId : null);
        if (!baseId && exercisesCatalog) {
            if (sectionKey === 'gym') {
                if (exercisesCatalog.movilidad_articular) baseId = 'movilidad_articular';
                else {
                    const firstStrength = Object.values(exercisesCatalog).find((entry) => entry && entry.type === 'fuerza');
                    baseId = firstStrength ? firstStrength.id : null;
                }
            } else if (sectionKey === 'extra_activity') {
                const firstStrength = Object.values(exercisesCatalog).find((entry) => entry && entry.type === 'fuerza');
                baseId = firstStrength ? firstStrength.id : (exercisesCatalog.caminar ? 'caminar' : null);
            } else {
                baseId = exercisesCatalog.movilidad_articular ? 'movilidad_articular' : (exercisesCatalog.caminar ? 'caminar' : null);
            }
        }
        if (!baseId) return null;
        const exercise = exercisesCatalog ? exercisesCatalog[baseId] : null;
        if (!exercise) return { exerciseId: baseId, sets: 3, reps: '10-12', secPerRep: 3 };
        return exercise.type === 'cardio'
            ? { exerciseId: baseId, sets: 1, reps: 1, secPerRep: 600 }
            : { exerciseId: baseId, sets: 3, reps: '10-12', weightKg: 0, secPerRep: 3 };
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
            ? `<button type="button" class="activity-training__add"${dataAttrs({ 'ex-add-section': sectionKey, 'ex-add-day-index': dayIndex })}>A\u00F1adir</button>`
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
            `<option value="${plan.file}" ${plan.file === getSelectedFile() ? 'selected' : ''}>${plan.label}</option>`
        )).join('')}</select>`;
        const select = document.getElementById('activity-plan-select');
        if (select) {
            select.addEventListener('change', (event) => {
                const file = event.target.value;
                setSelectedFile(file);
                loadPlanFile(file).then(renderTableContent);
            });
        }
    };
    const loadPlanFile = (file) => CoreBrowserAdapter.resolveActivityPlanData(file)
        .then((planData) => (currentPlanData = Array.isArray(planData) ? planData : null))
        .catch(() => null);

    const renderTableContent = () => {
        if (!exercisesCatalog) {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error: datos de ejercicios no disponibles.</td></tr>`;
            return;
        }

        const planData = getPlanData();
        if (!Array.isArray(planData) || !planData.length) {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--warning text-center">No hay plan semanal seleccionado o disponible.</td></tr>`;
            return;
        }

        const pageModel = activityService.getActivityPageModel({
            planData,
            currentFile: getSelectedFile(),
            exercisesMap: exercisesCatalog,
            defaultStepsCfg,
            targets,
            formulas,
            activityScoreEngine: ActivityScore,
            browserDomain: CoreBrowserDomain
        });
        currentPlanData = pageModel.planData || planData;

        const dayViews = pageModel.days;
        const todayIndex = UI.getTodayIndex();
        const walkingExercise = pageModel.walkingExercise;

        if (table) {
            const thead = table.querySelector('thead');
            if (thead) {
                thead.innerHTML = `<tr><th class="activity-row-header"></th>${WEEK_DAYS.map((dayLabel, index) => `
                    <th class="${index === todayIndex ? 'text-status--ok' : ''}">
                        <div class="activity-day-header"><div class="activity-day-title">${dayLabel}</div></div>
                    </th>
                `).join('')}</tr>`;
            }
        }

        const renderMovementCell = (dayData, dayIndex, dayView) => {
            const walkInfo = dayView ? dayView.walkInfo : getWalkInfo(dayData);
            const movement = dayView ? dayView.movement : null;
            const stepsKcal = movement ? movement.stepsKcal : 0;
            const totalMin = movement ? movement.totalMin : 0;
            const distanceKm = movement ? movement.distanceKm : 0;
            const stepsMet = movement ? movement.stepsMet : 0;
            return `
                <td>
                    ${cardHtml({
                        data: {
                            'ex-name': walkingExercise.name || 'Movimiento diario',
                            'ex-tech': walkingExercise.technique || '',
                            'ex-kcal': stepsKcal,
                            'ex-type': walkingExercise.type || '',
                            'ex-focus': walkingExercise.focus || '',
                            'ex-muscles': walkingExercise.muscles || '',
                            'ex-equipment': walkingExercise.equipment || ''
                        },
                        nameHtml: `<div class="activity-exercise__name modal-trigger">${walkingExercise.name || 'Movimiento diario'}</div>`,
                        kvRows: [
                            kvRow('Pasos', isEditMode
                                ? editInput({ 'walk-day-index': dayIndex, 'walk-field': 'steps' }, walkInfo.steps)
                                : walkInfo.steps, isEditMode ? 'activity-exercise__kv-value--edit' : ''),
                            kvRow('Ritmo (pasos/min)', isEditMode
                                ? editInput({ 'walk-day-index': dayIndex, 'walk-field': 'stepsPerMin' }, walkInfo.stepsPerMin)
                                : (walkInfo.stepsPerMin > 0 ? walkInfo.stepsPerMin : '-'), isEditMode ? 'activity-exercise__kv-value--edit' : '')
                        ].join(''),
                        statRows: [
                            splitRow(pill('Kcal', Math.round(stepsKcal)), pill('MET', parseFloat(stepsMet) > 0 ? formatMet(stepsMet) : '-')),
                            splitRow(pill('Distancia', distanceKm > 0 ? `${UI.formatKm(distanceKm)} km` : '-'), pill('Tiempo', `${UI.formatMinutes(totalMin)} min`))
                        ].join(''),
                        description: movement ? movement.description : ((dayData.walk && dayData.walk.description) ? dayData.walk.description : '')
                    })}
                </td>
            `;
        };

        const renderPendingAdd = (sectionKey, dayIndex) => {
            if (!isEditMode || !pendingAdds[`${dayIndex}:${sectionKey}`]) return '';
            const options = Object.values(exercisesCatalog || {}).map((exercise) => (
                exercise && exercise.id ? `<option value="${exercise.id}">${exercise.name}</option>` : ''
            )).join('');
            return cardHtml({
                className: 'activity-exercise--pending',
                nameHtml: `
                    <div class="activity-exercise__name-row">
                        <div class="activity-exercise__name activity-exercise__name--select">
                            <select class="input-base input-select input-select--sm"${dataAttrs({ 'ex-add-select-section': sectionKey, 'ex-add-select-day-index': dayIndex })}>${options}</select>
                        </div>
                        <button type="button" class="activity-exercise__add-done"${dataAttrs({ 'ex-add-done-section': sectionKey, 'ex-add-done-day-index': dayIndex })}>OK</button>
                    </div>
                `,
                description: 'A\u00F1adiendo ejercicio...'
            });
        };

        const renderExerciseCard = (sectionKey, dayIndex, item) => {
            const exercise = exercisesCatalog[item.exerciseId];
            if (!exercise) return `<div class="activity-exercise">Ejercicio no encontrado: ${item.exerciseId}</div>`;

            const view = activityService && typeof activityService.buildExerciseView === 'function'
                ? activityService.buildExerciseView({
                    item,
                    exerciseDefinition: exercise,
                    weightKg: typeof UI.getEffectiveWeightKg === 'function' ? UI.getEffectiveWeightKg() : 70
                })
                : null;
            const isTimeBased = view ? view.isTimeBased : UI.isTimedItem(item);
            const numericWeight = view ? view.numericWeight : parseFloat(item.weightKg);
            const showWeight = view ? view.showWeight : (exercise.type === 'fuerza' && !isTimeBased && Number.isFinite(numericWeight) && numericWeight > 0);
            const canEditWeight = view ? view.canEditWeight : (exercise.type === 'fuerza' && !isTimeBased);
            const effectiveSecPerRep = view ? view.effectiveSecPerRep : (isTimeBased ? (parseFloat(item.secPerRep) || 0) : 0);
            const repetitionsDisplay = view ? view.repetitionsDisplay : ((item.sets && item.reps) ? `${item.sets} x ${item.reps}` : '-');
            const kcal = view ? view.kcal : UI.calculateExerciseKcal(item, exercise);
            const estimatedMin = view ? view.estimatedMin : UI.estimateExerciseMinutes(item, exercise);
            const met = view ? view.met : parseFloat(exercise.met);
            const showMet = view ? view.showMet : (Number.isFinite(met) && met > 0);
            const intensityFactor = view ? view.intensityFactor : 0;
            const showIntensity = view ? view.showIntensity : false;
            const exerciseRest = view ? view.exerciseRest : (Number.isFinite(parseFloat(exercise.restSec)) ? exercise.restSec : '');
            const sameTypeOptions = Object.values(exercisesCatalog)
                .filter((entry) => entry && entry.type === exercise.type)
                .map((entry) => `<option value="${entry.id}" ${entry.id === exercise.id ? 'selected' : ''}>${entry.name}</option>`)
                .join('');

            return cardHtml({
                data: {
                    'ex-name': exercise.name,
                    'ex-tech': exercise.technique || '',
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
                            <button type="button" class="activity-exercise__delete"${dataAttrs({ 'ex-delete-section': sectionKey, 'ex-delete-day-index': dayIndex, 'ex-delete-id': item.exerciseId })} title="Borrar">&times;</button>
                        </div>
                    `
                    : `<div class="activity-exercise__name modal-trigger">${exercise.name}</div>`,
                kvRows: [
                    kvRow('Repeticiones', isEditMode
                        ? `
                            ${editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'sets' }, item.sets || '')}
                            <span class="activity-exercise__kv-sep">&times;</span>
                            ${isTimeBased
                                ? `${editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'secPerRep' }, effectiveSecPerRep || '')}<span class="activity-exercise__kv-suffix">s</span>`
                                : editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'reps' }, item.reps || '', { numeric: false })}
                        `
                        : repetitionsDisplay, isEditMode ? 'activity-exercise__kv-value--edit activity-exercise__kv-value--inputs' : ''),
                    kvRow('Carga', isEditMode && canEditWeight
                        ? editInput({ 'ex-day-index': dayIndex, 'ex-section': sectionKey, 'ex-id': item.exerciseId, field: 'weightKg' }, Number.isFinite(numericWeight) ? numericWeight : '')
                        : (showWeight ? `${numericWeight} kg` : '-'), isEditMode && canEditWeight ? 'activity-exercise__kv-value--edit' : '')
                ].join(''),
                statRows: [
                    splitRow(pill('Kcal', Math.round(kcal)), pill('MET', showMet ? formatMet(met) : '-')),
                    splitRow(pill('Intensidad', showIntensity ? `x${formatFactor(intensityFactor)}` : '-'), pill('Tiempo', `${UI.formatMinutes(estimatedMin)} min`))
                ].join(''),
                description: exercise.description || ''
            });
        };

        const renderExerciseGroups = (sectionKey, dayData, dayIndex) => {
            const section = dayData && dayData[sectionKey];
            if (section && section.type === 'rest') return '';
            const items = getSectionItems(dayData, sectionKey) || [];
            const pendingHtml = renderPendingAdd(sectionKey, dayIndex);
            if (!items.length) return pendingHtml || `<div class="activity-training__meta">Sin ejercicios definidos.</div>`;
            return pendingHtml + UI.groupExercisesByTypeFocus({ exercises: items }, exercisesCatalog).map((group) => `
                <div class="activity-exercise-group"><div class="activity-exercise-group__title">${UI.formatLabel(group.type)} \u00B7 ${UI.formatLabel(group.focus)}</div></div>
                ${group.items.map((item) => renderExerciseCard(sectionKey, dayIndex, item)).join('')}
            `).join('');
        };

        tableBody.innerHTML = '';
        tableBody.appendChild(Object.assign(document.createElement('tr'), {
            innerHTML: `<td class="activity-row-header">Movimiento</td>${currentPlanData.map((dayData, dayIndex) => renderMovementCell(dayData, dayIndex, dayViews[dayIndex])).join('')}`
        }));
        tableBody.appendChild(Object.assign(document.createElement('tr'), {
            innerHTML: `<td class="activity-row-header">Gimnasio</td>${currentPlanData.map((dayData, dayIndex) => trainingCell({
                title: dayData.gym && dayData.gym.type === 'rest' ? 'Descanso' : 'Entrenamiento',
                sectionKey: 'gym',
                dayIndex,
                description: dayData.gym && dayData.gym.description ? dayData.gym.description : '',
                body: renderExerciseGroups('gym', dayData, dayIndex)
            })).join('')}`
        }));
        if (dayHasExtra(currentPlanData) || isEditMode) {
            tableBody.appendChild(Object.assign(document.createElement('tr'), {
                innerHTML: `<td class="activity-row-header">Extra</td>${currentPlanData.map((dayData, dayIndex) => trainingCell({
                    title: 'Extra',
                    sectionKey: 'extra_activity',
                    dayIndex,
                    description: dayData.extra_activity && dayData.extra_activity.description ? dayData.extra_activity.description : '',
                    body: renderExerciseGroups('extra_activity', dayData, dayIndex)
                })).join('')}`
            }));
        }
        tableBody.appendChild(Object.assign(document.createElement('tr'), {
            innerHTML: `<td class="activity-row-header">Totales</td>${dayViews.map((dayView) => `<td>${generateActivityTotalsHtml(dayView)}</td>`).join('')}`
        }));
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
            const dayIndex = parseInt(target.dataset.walkDayIndex, 10);
            const field = target.dataset.walkField;
            const planData = getPlanData() || [];
            if (!planData[dayIndex]) planData[dayIndex] = { day: WEEK_DAYS[dayIndex] };
            const item = ensureWalkItem(planData[dayIndex]);
            const current = getWalkInfo(planData[dayIndex]);
            const stepsPerMin = field === 'stepsPerMin' ? (parseFloat(target.value) || current.stepsPerMin) : (parseFloat(item.stepsPerMin) || current.stepsPerMin);
            const steps = field === 'steps' ? (parseInt(target.value, 10) || current.steps) : current.steps;
            item.stepsPerMin = stepsPerMin;
            item.secPerRep = Math.round((steps / stepsPerMin) * 60);
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (target.matches('input[data-ex-day-index][data-ex-section][data-ex-id][data-field]')) {
            const planData = getPlanData() || [];
            const item = getExerciseItem(planData, parseInt(target.dataset.exDayIndex, 10), target.dataset.exSection, target.dataset.exId);
            if (!item) return;
            item[target.dataset.field] = target.dataset.field === 'reps' ? target.value : (Number.isNaN(parseFloat(target.value)) ? '' : parseFloat(target.value));
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (target.matches('select[data-ex-swap-section][data-ex-swap-day-index][data-ex-swap-id]')) {
            const planData = getPlanData() || [];
            const item = getExerciseItem(planData, parseInt(target.dataset.exSwapDayIndex, 10), target.dataset.exSwapSection, target.dataset.exSwapId);
            if (!item || !target.value || item.exerciseId === target.value) return;
            item.exerciseId = target.value;
            savePlanData(planData);
            renderTableContent();
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
            const chosenId = select ? select.value : null;
            const planData = getPlanData() || [];
            const dayData = planData[dayIndex] || { day: WEEK_DAYS[dayIndex] };
            if (!dayData[sectionKey] || dayData[sectionKey].type === 'rest') {
                dayData[sectionKey] = { exercises: [], description: dayData[sectionKey] ? (dayData[sectionKey].description || '') : '' };
            }
            if (!Array.isArray(dayData[sectionKey].exercises)) dayData[sectionKey].exercises = [];
            const item = buildDefaultExercise(dayData[sectionKey], sectionKey, chosenId);
            if (item) dayData[sectionKey].exercises.push(item);
            delete pendingAdds[pendingKey];
            planData[dayIndex] = dayData;
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (target.matches('button[data-ex-delete-section][data-ex-delete-day-index][data-ex-delete-id]')) {
            const dayIndex = parseInt(target.dataset.exDeleteDayIndex, 10);
            const sectionKey = target.dataset.exDeleteSection;
            const items = getSectionItems((getPlanData() || [])[dayIndex], sectionKey);
            if (!items) return;
            const planData = getPlanData() || [];
            planData[dayIndex][sectionKey].exercises = items.filter((item) => item && item.exerciseId !== target.dataset.exDeleteId);
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (target.matches('.activity-score-info-trigger')) {
            const payload = decodePayload(target.dataset.activityScore || '');
            if (!payload) return;
            UI.showModal(activityPresenter.buildScoreModal({
                payload,
                formatNumber,
                getStatusClassFromCode: UI.getStatusClassFromCode,
                escapeHtml
            }));
            return;
        }

        if (target.closest('input, select, button, a')) return;
        const exercise = target.closest('.activity-exercise');
        if (!exercise) return;
        showTechniqueModal({
            name: exercise.dataset.exName || 'Actividad',
            type: exercise.dataset.exType || '',
            focus: exercise.dataset.exFocus || '',
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
            { global: 'TargetsApplicationService', path: 'js/core/application/targets.service.js' },
            { global: 'ActivityApplicationService', path: 'js/core/application/activity.service.js' },
            { global: 'ActivityPresenter', path: 'js/core/presentation/activity.presenter.js' }
        ],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            globals: ['ActivityApplicationService', 'ActivityPresenter'],
            exercises: true,
            activityPlanFile: getPlanFiles().length ? getSelectedFile() : null
        }).then((context) => {
            formulas = context.formulas;
            targets = context.targets;
            activityService = context.ActivityApplicationService;
            activityPresenter = context.ActivityPresenter;
            exercisesCatalog = context.exercisesData || null;
            currentPlanData = context.activityPlanData || null;
            return true;
        }),
        run: () => {
            buildPlanSelector();
            renderTableContent();
        },
        onError: () => {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error cargando dependencias (ejercicios/actividad).</td></tr>`;
        }
    });
}
