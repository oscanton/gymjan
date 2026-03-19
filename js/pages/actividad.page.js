/* =========================================
   pages/actividad.page.js - ACTIVIDAD SEMANAL
   ========================================= */

function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    let isEditMode = false;
    const errorColspan = (typeof DAYS_COUNT !== 'undefined' && Number.isFinite(DAYS_COUNT))
        ? (DAYS_COUNT + 1)
        : 8;

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
    const normalizeOverrides = (overrides) => {
        if (!overrides || typeof overrides !== 'object') return overrides;
        let migrated = false;
        const normalized = {};
        Object.entries(overrides).forEach(([routineId, routineOverrides]) => {
            if (!routineOverrides || typeof routineOverrides !== 'object') return;
            const nextRoutineOverrides = {};
            Object.entries(routineOverrides).forEach(([exerciseId, entry]) => {
                if (!entry || typeof entry !== 'object') return;
                const nextEntry = { ...entry };
                if (Object.prototype.hasOwnProperty.call(entry, 'series')) {
                    nextEntry.sets = entry.series;
                    delete nextEntry.series;
                    migrated = true;
                }
                if (Object.prototype.hasOwnProperty.call(entry, 'pesoKg')) {
                    nextEntry.weightKg = entry.pesoKg;
                    delete nextEntry.pesoKg;
                    migrated = true;
                }
                if (Object.prototype.hasOwnProperty.call(entry, 'descansoSeg')) {
                    nextEntry.restSec = entry.descansoSeg;
                    delete nextEntry.descansoSeg;
                    migrated = true;
                }
                if (Object.prototype.hasOwnProperty.call(entry, 'segPorRep')) {
                    nextEntry.secPerRep = entry.segPorRep;
                    delete nextEntry.segPorRep;
                    migrated = true;
                }
                nextRoutineOverrides[exerciseId] = nextEntry;
            });
            normalized[routineId] = nextRoutineOverrides;
        });
        return { data: normalized, migrated };
    };
    const getOverrides = () => {
        const raw = DB.get(OVERRIDE_KEY, {});
        const { data, migrated } = normalizeOverrides(raw);
        if (migrated) DB.save(OVERRIDE_KEY, data);
        return data;
    };
    const saveOverrides = (overrides) => DB.save(OVERRIDE_KEY, overrides);
    const getSavedStepsConfig = () => DB.get(STEPS_CFG_KEY, {});
    const saveStepsConfig = (cfg) => DB.save(STEPS_CFG_KEY, cfg);
    const getRoutineById = (routineId, fallbackId) => (
        Routines.getById(routineId) || Routines.getById(fallbackId)
    );
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
            type: 'cardio',
            focus: 'full_body',
            muscles: 'piernas, core',
            equipment: 'ninguno',
            met: defaultStepsCfg.met,
            description: 'Actividad base de baja intensidad.',
            technique: 'Actividad diaria basada en pasos.'
        };
    };
    const getStepsRoutine = () => {
        if (typeof STEP_ROUTINE !== 'undefined' && STEP_ROUTINE) return STEP_ROUTINE;
        return {
            goal: 'Movimiento diario',
            exercises: [{ exerciseId: 'caminar', stepsPerMin: defaultStepsCfg.perMinute, totalSteps: defaultStepsCfg.target }]
        };
    };
    const getStepsConfig = () => {
        const routine = getStepsRoutine();
        const walkItem = (routine.exercises || []).find(e => e && e.exerciseId === 'caminar') || {};
        const walking = getWalkingExercise();
        const saved = getSavedStepsConfig();
        const baseStepTarget = parseInt(walkItem.totalSteps, 10)
            || parseInt(walkItem.totalPasos, 10)
            || parseInt(routine.totalSteps, 10)
            || parseInt(routine.totalPasos, 10)
            || parseInt(routine.goal, 10)
            || parseInt(routine.objetivo, 10)
            || defaultStepsCfg.target;
        const baseStepsPerMin = parseInt(walkItem.stepsPerMin, 10)
            || parseInt(walkItem.pasosPorMin, 10)
            || parseInt(routine.stepsPerMin, 10)
            || parseInt(routine.pasosPorMin, 10)
            || defaultStepsCfg.perMinute;
        const targetSteps = parseInt(saved.targetSteps, 10)
            || parseInt(saved.objetivo, 10)
            || baseStepTarget;
        const stepsPerMin = parseInt(saved.stepsPerMin, 10)
            || parseInt(saved.pasosPorMin, 10)
            || baseStepsPerMin;
        const normalized = {
            targetSteps,
            stepsPerMin,
            met: walking.met || defaultStepsCfg.met
        };
        if (saved.objetivo || saved.pasosPorMin) {
            saveStepsConfig({ targetSteps, stepsPerMin });
        }
        return normalized;
    };
    const getDefaultSteps = () => getStepsConfig().targetSteps;
    const formatMet = (value) => {
        const n = parseFloat(value);
        if (!Number.isFinite(n) || n <= 0) return '-';
        const rounded = Math.round(n * 10) / 10;
        return (rounded % 1 === 0) ? rounded.toFixed(0) : rounded.toFixed(1);
    };
    const formatFactor = (value) => {
        const n = parseFloat(value);
        if (!Number.isFinite(n) || n <= 0) return '-';
        return (Math.round(n * 100) / 100).toFixed(2);
    };
    const generateActivityTotalsHtml = ({ totalKcal, routineKcal, stepsKcal, min, metAvg, intensityAvg }) => {
        return `
            <div class="totals-stack">
                <div class="stat-pill stat-pill--kcal stat-pill--sm stat-pill--block">
                    &#128293; ${Math.round(totalKcal)} kcal
                </div>
                <div class="totals-row totals-row--nowrap">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div>&#128099; Pasos &middot; ${Math.round(stepsKcal)} kcal</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div>&#127947;&#65039; Rutina &middot; ${Math.round(routineKcal)} kcal</div>
                    </div>
                </div>
                <div class="totals-row">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">&#9889; MET</div>
                        <div>${(Number.isFinite(metAvg) && metAvg > 0) ? `${formatMet(metAvg)} MET` : '-'}</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">&#9878; Intensidad</div>
                        <div>${(Number.isFinite(intensityAvg) && intensityAvg > 0) ? `x${formatFactor(intensityAvg)}` : '-'}</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">&#9201;&#65039; Tiempo</div>
                        <div>${(Number.isFinite(min) && min > 0) ? `${UI.formatMinutes(min)} min` : '-'}</div>
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
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error: datos de actividad no disponibles.</td></tr>`;
            return;
        }

        const todayIndex = UI.getTodayIndex();
        const weeklyPlan = ActivityStore.getWeeklyPlan();
        const fallbackId = (typeof Routines !== 'undefined') ? Routines.getDefaultId() : 'recuperacion';
        const walkingExercise = getWalkingExercise();
        const stepsConfig = getStepsConfig();
        const defaultSteps = stepsConfig.targetSteps;
        const dailySteps = ActivityStore.getDailySteps(defaultSteps);
        const weights = getWeights();
        const overrides = getOverrides();

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

        const userHeightCm = (typeof UI !== 'undefined' && UI.getUserHeightCm) ? UI.getUserHeightCm() : 0;
        dailySteps.forEach((steps, dayIndex) => {
            const safeSteps = Math.max(0, parseInt(steps, 10) || 0);
            const stepsKcal = UI.calculateStepsKcal(safeSteps, { stepsConfig });
            const stepsPerMin = parseFloat(stepsConfig.stepsPerMin) || 0;
            const totalMin = stepsPerMin > 0 ? (safeSteps / stepsPerMin) : 0;
            const distanceKm = UI.calculateStepsDistanceKm(safeSteps, { heightCm: userHeightCm });

            movementHtml += `
                <td>
                    <div class="activity-exercise"
                        data-ex-name="${walkingExercise.name || 'Movimiento diario'}"
                        data-ex-tech="${walkingExercise.technique || ''}"
                        data-ex-kcal="${stepsKcal}"
                        data-ex-type="${walkingExercise.type || ''}"
                        data-ex-focus="${walkingExercise.focus || ''}"
                        data-ex-muscles="${walkingExercise.muscles || ''}"
                        data-ex-equipment="${walkingExercise.equipment || ''}">
                        <div class="activity-exercise__name modal-trigger">${walkingExercise.name || 'Movimiento diario'}</div>
                        <div class="activity-exercise__kv">
                            <div class="activity-exercise__kv-row">
                                <div class="activity-exercise__kv-label">Pasos</div>
                                ${isEditMode ? `
                                    <div class="activity-exercise__kv-value activity-exercise__kv-value--edit">
                                        <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                            data-steps-day-index="${dayIndex}" value="${safeSteps}">
                                    </div>
                                ` : `
                                    <div class="activity-exercise__kv-value">${safeSteps}</div>
                                `}
                            </div>
                            <div class="activity-exercise__kv-row">
                                <div class="activity-exercise__kv-label">Ritmo (pasos/min)</div>
                                ${isEditMode ? `
                                    <div class="activity-exercise__kv-value activity-exercise__kv-value--edit">
                                        <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                            data-steps-cfg-field="stepsPerMin" value="${stepsConfig.stepsPerMin}">
                                    </div>
                                ` : `
                                    <div class="activity-exercise__kv-value">${stepsPerMin > 0 ? `${stepsPerMin}` : '-'}</div>
                                `}
                            </div>
                        </div>
                        <div class="activity-exercise__row activity-exercise__row--split">
                            <div class="activity-exercise__pill">&#128293; ${Math.round(stepsKcal)} kcal</div>
                            ${(parseFloat(stepsConfig.met) > 0) ? `<div class="activity-exercise__pill">&#9889; ${formatMet(stepsConfig.met)} MET</div>` : '<div class="activity-exercise__pill">&#9889; - MET</div>'}
                        </div>
                        <div class="activity-exercise__row activity-exercise__row--split">
                            <div class="activity-exercise__pill">&#128207; ${(distanceKm > 0) ? `${UI.formatKm(distanceKm)} km` : '-'}</div>
                            <div class="activity-exercise__pill">&#9201;&#65039; ${UI.formatMinutes(totalMin)} min</div>
                        </div>
                        <div class="meal-description">${walkingExercise.description || ''}</div>
                    </div>
                </td>`;
        });

        movementRow.innerHTML = movementHtml;
        tableBody.appendChild(movementRow);

        const routineRow = document.createElement('tr');
        let routineHtml = `<td class="activity-row-header">Rutina</td>`;

        weeklyPlan.forEach((routineId, dayIndex) => {
            const routine = getRoutineById(routineId, fallbackId);
            const selectedId = routineId || fallbackId;
            const options = Routines.getOptionsHtml({ selectedId });
            const meta = routine ? `${routine.goal || ''}` : '';
            const routineTimes = routine && routine.timings ? routine.timings : null;

            const exercisesHtml = (routine && routine.exercises && routine.exercises.length)
                ? UI.groupExercisesByTypeFocus(routine, EXERCISES).map(group => {
                    const groupHeader = `
                        <div class="activity-exercise-group">
                            <div class="activity-exercise-group__title">${UI.formatLabel(group.type)} &middot; ${UI.formatLabel(group.focus)}</div>
                        </div>
                    `;

                    const groupItems = group.items.map(item => {
                    const override = (overrides[routine.id] && overrides[routine.id][item.exerciseId]) || {};
                    const effectiveItem = { ...item, ...override };
                    const ex = EXERCISES[item.exerciseId];
                    if (!ex) {
                        return `<div class="activity-exercise">Ejercicio no encontrado: ${item.exerciseId}</div>`;
                    }

                    const dayWeights = weights[dayIndex] || {};
                    const defaultWeight = effectiveItem.weightKg ?? '';
                    const currentWeight = (dayWeights[item.exerciseId] ?? defaultWeight);
                    const isTimeBased = UI.isTimedItem(effectiveItem);
                    const numericWeight = parseFloat(currentWeight);
                    const showWeight = ex.type === 'fuerza' && !isTimeBased && Number.isFinite(numericWeight) && numericWeight > 0;
                    const canEditWeight = ex.type === 'fuerza' && !isTimeBased;
                    const effectiveSecPerRep = isTimeBased
                        ? (parseFloat(effectiveItem.secPerRep)
                            || parseFloat(routineTimes && routineTimes.secPerRep)
                            || (typeof ROUTINE_TIME_DEFAULTS !== 'undefined' ? parseFloat(ROUTINE_TIME_DEFAULTS.secPerRep) : 0)
                            || 0)
                        : 0;
                    const setsDisplay = Math.round(parseFloat(effectiveItem.sets) || 0);
                    const repetitionsDisplay = isTimeBased
                        ? ((setsDisplay > 0 && effectiveSecPerRep > 0) ? `${setsDisplay} x ${Math.round(effectiveSecPerRep)}s` : '-')
                        : ((effectiveItem.sets && effectiveItem.reps) ? `${effectiveItem.sets} x ${effectiveItem.reps}` : '-');
                    const kcal = UI.calculateExerciseKcal(effectiveItem, ex, { routineTimes });
                    const estimatedMin = UI.estimateExerciseMinutes(effectiveItem, ex, { routineTimes });
                    const met = parseFloat(ex.met);
                    const showMet = Number.isFinite(met) && met > 0;
                    const repsAvg = UI.parseReps(effectiveItem.reps);
                    const intensityFactor = (ex.type === 'fuerza' && !isTimeBased && repsAvg > 0)
                        ? UI.getIntensityFactorFromEpley(effectiveItem.weightKg, repsAvg)
                        : 0;
                    const showIntensity = Number.isFinite(intensityFactor) && intensityFactor > 0 && ex.type === 'fuerza' && !isTimeBased;
                    const routineRest = routineTimes && Number.isFinite(routineTimes.restSec)
                        ? routineTimes.restSec
                        : (typeof ROUTINE_TIME_DEFAULTS !== 'undefined' && Number.isFinite(ROUTINE_TIME_DEFAULTS.restSec))
                            ? ROUTINE_TIME_DEFAULTS.restSec
                            : '';

                    return `
                        <div class="activity-exercise" data-ex-name="${ex.name}" data-ex-tech="${ex.technique || ''}" data-ex-kcal="${kcal}" data-ex-type="${ex.type || ''}" data-ex-focus="${ex.focus || ''}" data-ex-muscles="${ex.muscles || ''}" data-ex-equipment="${ex.equipment || ''}" data-ex-rest="${effectiveItem.restSec || routineRest || ''}">
                            <div class="activity-exercise__name modal-trigger">${ex.name}</div>
                            <div class="activity-exercise__kv">
                                <div class="activity-exercise__kv-row">
                                    <div class="activity-exercise__kv-label">Repeticiones</div>
                                    ${isEditMode ? `
                                        <div class="activity-exercise__kv-value activity-exercise__kv-value--edit activity-exercise__kv-value--inputs">
                                            <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                                data-routine-id="${routine.id}" data-exercise-id="${item.exerciseId}" data-field="sets" value="${effectiveItem.sets || ''}">
                                            <span class="activity-exercise__kv-sep">&times;</span>
                                            ${isTimeBased ? `
                                                <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                                    data-routine-id="${routine.id}" data-exercise-id="${item.exerciseId}" data-field="secPerRep" value="${effectiveSecPerRep || ''}">
                                                <span class="activity-exercise__kv-suffix">s</span>
                                            ` : `
                                                <input type="text" class="input-base input-base--table-edit"
                                                    data-routine-id="${routine.id}" data-exercise-id="${item.exerciseId}" data-field="reps" value="${effectiveItem.reps || ''}">
                                            `}
                                        </div>
                                    ` : `
                                        <div class="activity-exercise__kv-value">${repetitionsDisplay}</div>
                                    `}
                                </div>
                                <div class="activity-exercise__kv-row">
                                    <div class="activity-exercise__kv-label">Carga (kg)</div>
                                    ${isEditMode && canEditWeight ? `
                                        <div class="activity-exercise__kv-value activity-exercise__kv-value--edit">
                                            <input type="text" inputmode="decimal" class="input-base input-base--table-edit" data-day-index="${dayIndex}" data-exercise-id="${item.exerciseId}" value="${currentWeight}">
                                        </div>
                                    ` : `
                                        <div class="activity-exercise__kv-value">${showWeight ? `${currentWeight}` : '-'}</div>
                                    `}
                                </div>
                            </div>
                            <div class="activity-exercise__row activity-exercise__row--split">
                                <div class="activity-exercise__pill">&#128293; ${Math.round(kcal)} kcal</div>
                                <div class="activity-exercise__pill">&#9889; ${showMet ? `${formatMet(met)} MET` : '-'}</div>
                            </div>
                            <div class="activity-exercise__row activity-exercise__row--split">
                                <div class="activity-exercise__pill">&#9878; ${showIntensity ? `x${formatFactor(intensityFactor)}` : '-'}</div>
                                <div class="activity-exercise__pill">&#9201;&#65039; ${(estimatedMin > 0) ? `${UI.formatMinutes(estimatedMin)} min` : '-'}</div>
                            </div>
                            <div class="meal-description">${ex.description || ''}</div>
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
                        <div class="activity-routine__title">${routine ? routine.name : 'Rutina'}</div>
                        <div class="activity-routine__meta">${meta}</div>
                        <div class="activity-routine__meta">${routine ? routine.structure : ''}</div>
                        ${exercisesHtml}
                    </div>
                </td>`;
        });

        routineRow.innerHTML = routineHtml;
        tableBody.appendChild(routineRow);


        const totalsRow = document.createElement('tr');
        let totalsHtml = `<td class="activity-row-header">Totales</td>`;

        weeklyPlan.forEach((routineId, dayIndex) => {
            const routine = getRoutineById(routineId, fallbackId);
            const routineOverrides = (overrides && routine && overrides[routine.id]) || {};
            const routineTotals = UI.calcRoutineTotals(routine, routineOverrides, EXERCISES);
            const stepsKcal = UI.calculateStepsKcal(dailySteps[dayIndex], { stepsConfig });
            const totalKcal = routineTotals.kcal + stepsKcal;
            const daySteps = Math.max(0, parseInt(dailySteps[dayIndex], 10) || 0);
            const stepsMin = stepsConfig.stepsPerMin > 0 ? (daySteps / stepsConfig.stepsPerMin) : 0;
            const stepsMet = parseFloat(stepsConfig.met);
            const stepsMetMin = (Number.isFinite(stepsMet) && stepsMet > 0 && stepsMin > 0) ? (stepsMet * stepsMin) : 0;
            const totalMinForMet = (routineTotals.min || 0) + stepsMin;
            const metAvg = totalMinForMet > 0
                ? (((routineTotals.metMinSum || 0) + stepsMetMin) / totalMinForMet)
                : 0;
            const intensityAvg = routineTotals.intensityAvg || 0;

                    totalsHtml += `
                <td class="day-total">
                    ${generateActivityTotalsHtml({
                        totalKcal,
                        routineKcal: routineTotals.kcal,
                        stepsKcal,
                        min: routineTotals.min,
                        metAvg,
                        intensityAvg
                    })}
                </td>`;
        });

        totalsRow.innerHTML = totalsHtml;
        tableBody.appendChild(totalsRow);

        setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
    };

    const table = tableBody.closest('table');
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

    if (container && !document.getElementById('activity-controls-container')) {
        const controls = renderControls();
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
            const dayIndex = parseInt(e.target.dataset.dayIndex, 10);
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

            if (field === 'sets') {
                const val = parseInt(rawVal, 10);
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
            { global: 'EXERCISES', path: 'js/data/ejercicios.js' },
            { global: 'STEP_ROUTINE', path: 'js/data/rutinas/rutina_pasos.js' },
            { global: 'Routines', path: 'js/core/routines.js' }
        ],
        afterRequired: () => Routines.ensureLoaded(),
        run: () => renderTableContent(),
        onError: () => {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error cargando dependencias (ejercicios/rutinas).</td></tr>`;
        }
    });
}
