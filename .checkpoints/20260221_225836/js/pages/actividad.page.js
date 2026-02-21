/* =========================================
   pages/actividad.page.js - ACTIVIDAD SEMANAL
   ========================================= */

function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    let isEditMode = false;

    let container = document.getElementById('actividad-container');
    if (!container) {
        const table = tableBody.closest('table');
        if (table) container = table.parentElement;
    }

    const WEIGHT_KEY = 'activity_weights';
    const OVERRIDE_KEY = 'activity_overrides';
    const STEPS_CFG_KEY = 'activity_steps_config';

    const getWeights = () => DB.get(WEIGHT_KEY, {});
    const saveWeights = (weights) => DB.save(WEIGHT_KEY, weights);
    const getOverrides = () => DB.get(OVERRIDE_KEY, {});
    const saveOverrides = (overrides) => DB.save(OVERRIDE_KEY, overrides);
    const getSavedStepsConfig = () => DB.get(STEPS_CFG_KEY, {});
    const saveStepsConfig = (cfg) => DB.save(STEPS_CFG_KEY, cfg);
    const resetActivityData = () => {
        localStorage.removeItem(APP_PREFIX + OVERRIDE_KEY);
        localStorage.removeItem(APP_PREFIX + WEIGHT_KEY);
        localStorage.removeItem(APP_PREFIX + STEPS_CFG_KEY);
        localStorage.removeItem(APP_PREFIX + 'user_activity_steps');
    };
    const confirmAndResetActivity = () => {
        if (!confirm("\u00BFRestablecer rutina y pesos por defecto? Se perder\u00E1n los cambios.")) return;
        resetActivityData();
        if (isEditMode) isEditMode = false;
        renderTableContent();
    };
    const defaultStepsCfg = APP_STEPS_DEFAULTS;
    const getWalkingExercise = () => {
        if (typeof EXERCISES !== 'undefined' && EXERCISES.caminar) return EXERCISES.caminar;
        return {
            name: 'Caminar',
            tipo: 'cardio',
            enfoque: 'full_body',
            musculos: 'piernas, core',
            equipo: 'ninguno',
            unidad: 'min',
            met: defaultStepsCfg.met,
            descripcion: 'Actividad base de baja intensidad.',
            tecnica: 'Actividad diaria basada en pasos.'
        };
    };
    const getStepsRoutine = () => {
        if (typeof STEP_ROUTINE !== 'undefined' && STEP_ROUTINE) return STEP_ROUTINE;
        return {
            objetivo: 'Movimiento diario',
            ejercicios: [{ ejercicioId: 'caminar', pasosPorMin: defaultStepsCfg.perMinute, totalPasos: defaultStepsCfg.target }]
        };
    };
    const getStepsConfig = () => {
        const routine = getStepsRoutine();
        const walkItem = (routine.ejercicios || []).find(e => e && e.ejercicioId === 'caminar') || {};
        const walking = getWalkingExercise();
        const saved = getSavedStepsConfig();
        const baseStepTarget = parseInt(walkItem.totalPasos, 10) || parseInt(routine.totalPasos, 10) || parseInt(routine.objetivo, 10) || defaultStepsCfg.target;
        const baseStepsPerMin = parseInt(walkItem.pasosPorMin, 10) || parseInt(routine.pasosPorMin, 10) || defaultStepsCfg.perMinute;
        return {
            objetivo: parseInt(saved.objetivo, 10) || baseStepTarget,
            pasosPorMin: parseInt(saved.pasosPorMin, 10) || baseStepsPerMin,
            met: walking.met || defaultStepsCfg.met
        };
    };
    const getDefaultSteps = () => getStepsConfig().objetivo;
    const generateActivityTotalsHtml = ({ totalKcal, routineKcal, stepsKcal, min, exerciseCount }) => {
        return `
            <div class="totals-stack">
                <div class="stat-pill stat-pill--kcal stat-pill--sm stat-pill--block">
                    &#128293; ${Math.round(totalKcal)} kcal
                </div>
                <div class="totals-row">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">&#127947;&#65039; Rutina</div>
                        <div>${Math.round(routineKcal)} kcal</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">&#128099; Movimiento</div>
                        <div>${Math.round(stepsKcal)} kcal</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div>&#128202; ${Math.round(min)} min &middot; ${exerciseCount} ej</div>
                    </div>
                </div>
            </div>
        `;
    };


    const showTechniqueModal = ({ name, type, focus, muscles, equipment, restSeconds, technique, kcal }) => {
        UI.showModal({
            titleHtml: `<h3 class="modal-title">${name}</h3>`,
            bodyHtml: `
                <div class="text-sm">
                    <div><span class="text-muted">Tipo:</span> ${type || '-'}</div>
                    <div><span class="text-muted">Enfoque:</span> ${focus || '-'}</div>
                    <div><span class="text-muted">M&uacute;sculos:</span> ${muscles || '-'}</div>
                    <div><span class="text-muted">Equipo:</span> ${equipment || '-'}</div>
                    ${restSeconds ? `<div><span class="text-muted">Descanso:</span> ${restSeconds} s</div>` : ''}
                </div>
                <p class="text-sm">${technique || 'T&eacute;cnica no disponible.'}</p>
                <div class="stats-pills stats-pills--center mt-lg">
                    <div class="stat-pill stat-pill--kcal">&#128293; ${Math.round(kcal)} kcal</div>
                </div>
            `
        });
    };

    const renderTableContent = () => {
        if (typeof Routines === 'undefined' || typeof EXERCISES === 'undefined') {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-status--danger text-center">Error: datos de actividad no disponibles.</td></tr>`;
            return;
        }

        const todayIndex = UI.getTodayIndex();
        const daysCount = DAYS_COUNT;
        const weeklyPlanRaw = ActivityStore.getWeeklyPlan();
        const fallbackId = (typeof DEFAULT_ROUTINE_ID !== 'undefined') ? DEFAULT_ROUTINE_ID : 'recuperacion';
        const weeklyPlan = Array.isArray(weeklyPlanRaw) ? weeklyPlanRaw.slice(0, daysCount) : Array(daysCount).fill(fallbackId);
        while (weeklyPlan.length < daysCount) weeklyPlan.push(fallbackId);
        const walkingExercise = getWalkingExercise();
        const stepsConfig = getStepsConfig();
        const defaultSteps = stepsConfig.objetivo;
        const dailySteps = ActivityStore.getDailySteps(defaultSteps);
        const weights = getWeights();
        const overrides = getOverrides();
        const routines = Routines.getAll();

        const table = tableBody.closest('table');
        const thead = table.querySelector('thead');
        if (thead) {
            let headerHtml = `<tr><th class="activity-row-header"></th>`;
            WEEK_DAYS.forEach((dayLabel, index) => {
                const isToday = index === todayIndex;
                const activeClass = isToday ? 'text-status--ok' : '';

                headerHtml += `
                    <th class="${activeClass}">
                        <div class="activity-day-header">
                            <div class="activity-day-title">${dayLabel}</div>
                        </div>
                    </th>`;
            });
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;
        }

        tableBody.innerHTML = '';

        const movementRow = document.createElement('tr');
        let movementHtml = `<td class="activity-row-header">Movimiento</td>`;

        dailySteps.forEach((steps, dayIndex) => {
            const safeSteps = Math.max(0, parseInt(steps, 10) || 0);
            const stepsKcal = UI.calculateStepsKcal(safeSteps, { stepsConfig });
            const totalMin = safeSteps / stepsConfig.pasosPorMin;

            movementHtml += `
                <td>
                    <div class="activity-exercise"
                        data-ex-name="${walkingExercise.name || 'Movimiento diario'}"
                        data-ex-tech="${walkingExercise.tecnica || ''}"
                        data-ex-kcal="${stepsKcal}"
                        data-ex-tipo="${walkingExercise.tipo || ''}"
                        data-ex-enfoque="${walkingExercise.enfoque || ''}"
                        data-ex-musculos="${walkingExercise.musculos || ''}"
                        data-ex-equipo="${walkingExercise.equipo || ''}">
                        <div class="activity-exercise__name modal-trigger">${walkingExercise.name || 'Movimiento diario'}</div>
                        <div class="activity-exercise__row">
                            ${isEditMode ? `
                                <div class="activity-exercise__weight">
                                    <span>&#127919;</span>
                                    <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                        data-steps-day-index="${dayIndex}" value="${safeSteps}">
                                    <span>pasos</span>
                                </div>
                                <div class="activity-exercise__weight">
                                    <span>&#128099;</span>
                                    <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                        data-steps-cfg-field="pasosPorMin" value="${stepsConfig.pasosPorMin}">
                                    <span>pasos/min</span>
                                </div>
                            ` : `
                                <div class="activity-exercise__pill">&#127919; ${safeSteps} pasos</div>
                                <div class="activity-exercise__pill">&#128099; ${stepsConfig.pasosPorMin} pasos/min</div>
                            `}
                        </div>
                        <div class="activity-exercise__row">
                            <div class="activity-exercise__pill">&#128293; ${Math.round(stepsKcal)} kcal</div>
                            <div class="activity-exercise__pill">&#9201;&#65039; ${UI.formatMinutes(totalMin)} min</div>
                        </div>
                        <div class="meal-description">${walkingExercise.descripcion || ''}</div>
                    </div>
                </td>`;
        });

        movementRow.innerHTML = movementHtml;
        tableBody.appendChild(movementRow);

        const routineRow = document.createElement('tr');
        let routineHtml = `<td class="activity-row-header">Gym</td>`;

        weeklyPlan.forEach((routineId, dayIndex) => {
            const routine = Routines.getById(routineId) || Routines.getById(fallbackId);
            const selectedId = routineId || fallbackId;
            const options = routines.map(r =>
                `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.nombre}</option>`
            ).join('');
            const meta = routine ? `${routine.objetivo || ''}` : '';

            const exercisesHtml = (routine && routine.ejercicios && routine.ejercicios.length)
                ? UI.groupExercisesByTypeFocus(routine, EXERCISES).map(group => {
                    const groupHeader = `
                        <div class="activity-exercise-group">
                            <div class="activity-exercise-group__title">${UI.formatLabel(group.type)} &middot; ${UI.formatLabel(group.focus)}</div>
                        </div>
                    `;

                    const groupItems = group.items.map(item => {
                    const override = (overrides[routine.id] && overrides[routine.id][item.ejercicioId]) || {};
                    const effectiveItem = { ...item, ...override };
                    const ex = EXERCISES[item.ejercicioId];
                    if (!ex) {
                        return `<div class="activity-exercise">Ejercicio no encontrado: ${item.ejercicioId}</div>`;
                    }

                    const showWeight = ex.tipo === 'fuerza' && ex.unidad === 'rep' && effectiveItem.series && effectiveItem.reps;
                    const dayWeights = weights[dayIndex] || {};
                    const defaultWeight = effectiveItem.pesoKg ?? '';
                    const currentWeight = (dayWeights[item.ejercicioId] ?? defaultWeight);
                    const kcal = UI.calculateExerciseKcal(effectiveItem, ex);
                    const estimatedMin = UI.estimateExerciseMinutes(effectiveItem, ex);

                    return `
                        <div class="activity-exercise" data-ex-name="${ex.name}" data-ex-tech="${ex.tecnica || ''}" data-ex-kcal="${kcal}" data-ex-tipo="${ex.tipo || ''}" data-ex-enfoque="${ex.enfoque || ''}" data-ex-musculos="${ex.musculos || ''}" data-ex-equipo="${ex.equipo || ''}" data-ex-descanso="${effectiveItem.descansoSeg || ex.descansoSeg || ''}">
                            <div class="activity-exercise__name modal-trigger">${ex.name}</div>
                            <div class="activity-exercise__row">
                                ${showWeight ? (
                                    isEditMode
                                        ? `
                                            <div class="activity-exercise__weight">
                                                <span>&#127947;&#65039;</span>
                                                <input type="text" inputmode="decimal" class="input-base input-base--table-edit" data-day-index="${dayIndex}" data-exercise-id="${item.ejercicioId}" value="${currentWeight}">
                                                <span>kg</span>
                                            </div>
                                        `
                                        : `<span class="activity-exercise__pill">&#127947;&#65039; ${currentWeight || 0} kg</span>`
                                ) : '<span class="activity-exercise__pill">Sin carga</span>'}
                                ${isEditMode && ex.unidad === 'rep' ? `
                                    <div class="activity-exercise__weight">
                                        <span>&#128290;</span>
                                        <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                            data-routine-id="${routine.id}" data-exercise-id="${item.ejercicioId}" data-field="series" value="${effectiveItem.series || ''}">
                                    </div>
                                    <div class="activity-exercise__weight">
                                        <span>&#128257;</span>
                                        <input type="text" class="input-base input-base--table-edit"
                                            data-routine-id="${routine.id}" data-exercise-id="${item.ejercicioId}" data-field="reps" value="${effectiveItem.reps || ''}">
                                    </div>
                                ` : ((isEditMode && ex.unidad === 'rep') || ex.unidad === 'min'
                                    ? ''
                                    : `<div class="activity-exercise__pill">${UI.formatTrabajo(effectiveItem, ex)}</div>`)}
                            </div>
                            <div class="activity-exercise__row">
                                <div class="activity-exercise__pill">&#128293; ${Math.round(kcal)} kcal</div>
                                ${estimatedMin > 0 ? `<div class="activity-exercise__pill">â±ï¸ ${UI.formatMinutes(estimatedMin)} min</div>` : ''}
                            </div>
                            <div class="meal-description">${ex.descripcion || ''}</div>
                        </div>`;
                    }).join('');

                    return groupHeader + groupItems;
                }).join('')
                : `<div class="activity-routine__meta">Sin ejercicios definidos.</div>`;

            routineHtml += `
                <td>
                    <div class="activity-routine">
                        <select class="input-base input-select input-select--sm" data-day-index="${dayIndex}">
                            ${options}
                        </select>
                        <div class="activity-routine__title">${routine ? routine.nombre : 'Rutina'}</div>
                        <div class="activity-routine__meta">${meta}</div>
                        <div class="activity-routine__meta">${routine ? routine.estructura : ''}</div>
                        ${exercisesHtml}
                    </div>
                </td>`;
        });

        routineRow.innerHTML = routineHtml;
        tableBody.appendChild(routineRow);


        const totalsRow = document.createElement('tr');
        let totalsHtml = `<td class="activity-row-header">Totales</td>`;

        weeklyPlan.forEach((routineId, dayIndex) => {
            const routine = Routines.getById(routineId) || Routines.getById(fallbackId);
            const routineOverrides = (overrides && routine && overrides[routine.id]) || {};
            const routineTotals = UI.calcRoutineTotals(routine, routineOverrides, EXERCISES);
            const stepsKcal = UI.calculateStepsKcal(dailySteps[dayIndex], { stepsConfig });
            const totalKcal = routineTotals.kcal + stepsKcal;

            totalsHtml += `
                <td class="day-total">
                    ${generateActivityTotalsHtml({
                        totalKcal,
                        routineKcal: routineTotals.kcal,
                        stepsKcal,
                        min: routineTotals.min,
                        exerciseCount: routineTotals.exerciseCount
                    })}
                </td>`;
        });

        totalsRow.innerHTML = totalsHtml;
        tableBody.appendChild(totalsRow);

        setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };

    const table = tableBody.closest('table');

    if (container && !document.getElementById('activity-controls-container')) {
        const controls = UI.renderEditResetControls({
            id: 'activity-controls-container',
            isEditMode,
            onToggle: () => {
                isEditMode = !isEditMode;
                const fresh = UI.renderEditResetControls({
                    id: 'activity-controls-container',
                    isEditMode,
                    onToggle: () => {
                        isEditMode = !isEditMode;
                        renderTableContent();
                    },
                    onReset: () => {
                        confirmAndResetActivity();
                    }
                });
                const current = document.getElementById('activity-controls-container');
                if (current) current.replaceWith(fresh);
                renderTableContent();
            },
            onReset: () => {
                confirmAndResetActivity();
            }
        });
        container.after(controls);
    }

    if (table) table.addEventListener('change', (e) => {
        if (e.target.matches('select[data-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.dayIndex, 10);
            const routineId = e.target.value;
            const weeklyPlan = ActivityStore.getWeeklyPlan();
            weeklyPlan[dayIndex] = routineId;
            ActivityStore.saveWeeklyPlan(weeklyPlan);
            renderTableContent();
            return;
        }

        if (e.target.matches('input[data-steps-day-index]')) {
            renderTableContent();
            return;
        }

        if (e.target.matches('input[data-steps-cfg-field]')) {
            renderTableContent();
        }
    });

    if (table) table.addEventListener('input', (e) => {
        if (e.target.matches('input[data-day-index][data-exercise-id]')) {
            const dayIndex = parseInt(e.target.dataset.dayIndex);
            const exerciseId = e.target.dataset.exerciseId;
            const value = parseFloat(e.target.value);

            const weights = getWeights();
            if (!weights[dayIndex]) weights[dayIndex] = {};
            weights[dayIndex][exerciseId] = Number.isNaN(value) ? '' : value;
            saveWeights(weights);
            return;
        }

        if (e.target.matches('input[data-routine-id][data-exercise-id][data-field]')) {
            const routineId = e.target.dataset.routineId;
            const exerciseId = e.target.dataset.exerciseId;
            const field = e.target.dataset.field;
            const rawVal = e.target.value;

            const overrides = getOverrides();
            if (!overrides[routineId]) overrides[routineId] = {};
            if (!overrides[routineId][exerciseId]) overrides[routineId][exerciseId] = {};

            if (field === 'series') {
                const val = parseInt(rawVal);
                overrides[routineId][exerciseId][field] = Number.isNaN(val) ? '' : val;
            } else {
                overrides[routineId][exerciseId][field] = rawVal;
            }

            saveOverrides(overrides);
            return;
        }

        if (e.target.matches('input[data-steps-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.stepsDayIndex, 10);
            const maxDayIndex = (DAYS_COUNT) - 1;
            if (Number.isNaN(dayIndex) || dayIndex < 0 || dayIndex > maxDayIndex) return;
            const raw = e.target.value.replace(/[^\d]/g, '');
            const val = raw === '' ? 0 : parseInt(raw, 10);
            const steps = ActivityStore.getDailySteps(getDefaultSteps());
            steps[dayIndex] = Number.isNaN(val) ? 0 : val;
            ActivityStore.saveDailySteps(steps);
            return;
        }

        if (e.target.matches('input[data-steps-cfg-field]')) {
            const field = e.target.dataset.stepsCfgField;
            const raw = e.target.value.replace(/[^\d]/g, '');
            const val = raw === '' ? 0 : parseInt(raw, 10);
            const cfg = getSavedStepsConfig();
            cfg[field] = Number.isNaN(val) || val <= 0 ? '' : val;
            saveStepsConfig(cfg);
        }
    });

    if (table) table.addEventListener('click', (e) => {
        if (e.target.closest('input, select, button, a')) return;
        const exercise = e.target.closest('.activity-exercise');
        if (!exercise) return;
        showTechniqueModal({
            name: exercise.dataset.exName || 'Actividad',
            type: exercise.dataset.exTipo || '',
            focus: exercise.dataset.exEnfoque || '',
            muscles: exercise.dataset.exMusculos || '',
            equipment: exercise.dataset.exEquipo || '',
            restSeconds: exercise.dataset.exDescanso || '',
            technique: exercise.dataset.exTech || '',
            kcal: parseFloat(exercise.dataset.exKcal || '0') || 0
        });
    });

    const loadDependencies = () => {
        UI.loadDependencies([
            { when: () => typeof EXERCISES === 'undefined', path: 'js/data/ejercicios.js' },
            { when: () => typeof STEP_ROUTINE === 'undefined', path: 'js/data/rutinas/rutina_pasos.js' },
            { when: () => typeof Routines === 'undefined', path: 'js/core/routines.js' }
        ])
            .then(() => Routines.ensureLoaded())
            .then(() => renderTableContent())
            .catch(() => {
                tableBody.innerHTML = `<tr><td colspan="8" class="text-status--danger text-center">Error cargando dependencias (ejercicios/rutinas).</td></tr>`;
            });
    };

    loadDependencies();
}




