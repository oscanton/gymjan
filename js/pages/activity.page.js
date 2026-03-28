
/* =========================================
   pages/activity.page.js - ACTIVIDAD SEMANAL
   ========================================= */

function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    let isEditMode = false;
    const pendingAdds = {};
    const errorColspan = (typeof DAYS_COUNT !== 'undefined' && Number.isFinite(DAYS_COUNT))
        ? (DAYS_COUNT + 1)
        : 8;

    let container = document.getElementById('actividad-container');
    if (!container) {
        const table = tableBody.closest('table');
        if (table) container = table.parentElement;
    }

    const PLAN_KEY = 'activity_plan_selector';

    const getPlanFiles = () => (Array.isArray(AVAILABLE_ACTIVITY_PLAN_FILES) ? AVAILABLE_ACTIVITY_PLAN_FILES : []);
    const getSelectedFile = () => ActivityStore.getSelectedFile();
    const setSelectedFile = (file) => ActivityStore.setSelectedFile(file);
    const getPlanData = () => ActivityStore.getActivePlanData(getSelectedFile());
    const savePlanData = (data) => ActivityStore.savePlanData(getSelectedFile(), data);
    const clearPlanData = () => ActivityStore.clearSavedPlanData(getSelectedFile());

    const resetActivityData = () => {
        clearPlanData();
    };

    const confirmAndResetActivity = () => {
        if (!confirm("¿Restablecer actividad por defecto? Se perderán los cambios.")) return;
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
            cadenceBase: defaultStepsCfg.perMinute,
            met: defaultStepsCfg.met,
            description: 'Actividad base de baja intensidad.',
            technique: 'Actividad diaria basada en pasos.'
        };
    };

    const ensureWalkItem = (dayData) => {
        if (!dayData) return null;
        if (!dayData.walk || typeof dayData.walk !== 'object') {
            dayData.walk = { exercises: [], description: '' };
        }
        if (!Array.isArray(dayData.walk.exercises)) dayData.walk.exercises = [];
        let item = dayData.walk.exercises.find(e => e && e.exerciseId === 'caminar');
        if (!item) {
            item = { exerciseId: 'caminar', sets: 1, reps: 1, stepsPerMin: defaultStepsCfg.perMinute };
            dayData.walk.exercises.unshift(item);
        }
        return item;
    };

    const getWalkInfo = (dayData) => (
        (typeof ActivityStore !== 'undefined' && ActivityStore.getWalkInfo)
            ? ActivityStore.getWalkInfo(dayData, { defaultStepsCfg, walkingExercise: getWalkingExercise() })
            : { steps: 0, stepsPerMin: defaultStepsCfg.perMinute, secPerRep: 0, cadenceBase: defaultStepsCfg.perMinute }
    );

    const getGymExercises = (dayData) => {
        if (!dayData || !dayData.gym || dayData.gym.type === 'rest') return [];
        return Array.isArray(dayData.gym.exercises) ? dayData.gym.exercises : [];
    };

    const getExtraExercises = (dayData) => {
        if (!dayData || !dayData.extra_activity || dayData.extra_activity.type === 'rest') return [];
        return Array.isArray(dayData.extra_activity.exercises) ? dayData.extra_activity.exercises : [];
    };

    const dayHasExtra = (plan) => Array.isArray(plan) && plan.some(day => day && day.extra_activity && day.extra_activity.type !== 'rest'
        && Array.isArray(day.extra_activity.exercises) && day.extra_activity.exercises.length);

    const buildDefaultExercise = (section, sectionKey, exerciseId) => {
        const forcedId = exerciseId || null;
        const list = (section && Array.isArray(section.exercises)) ? section.exercises : [];
        let baseId = forcedId || (list.length ? list[0].exerciseId : null);
        if (!baseId && typeof EXERCISES !== 'undefined') {
            if (sectionKey === 'gym') {
                if (EXERCISES.movilidad_articular) baseId = 'movilidad_articular';
                else {
                    const firstStrength = Object.values(EXERCISES).find(ex => ex && ex.type === 'fuerza');
                    baseId = firstStrength ? firstStrength.id : null;
                }
            } else if (sectionKey === 'extra_activity') {
                const firstStrength = Object.values(EXERCISES).find(ex => ex && ex.type === 'fuerza');
                baseId = firstStrength ? firstStrength.id : (EXERCISES.caminar ? 'caminar' : null);
            } else {
                baseId = EXERCISES.movilidad_articular ? 'movilidad_articular' : (EXERCISES.caminar ? 'caminar' : null);
            }
        }
        if (!baseId) return null;
        const ex = (typeof EXERCISES !== 'undefined') ? EXERCISES[baseId] : null;
        if (!ex) return { exerciseId: baseId, sets: 3, reps: "10-12", secPerRep: 3 };
        if (ex.type === 'cardio') return { exerciseId: baseId, sets: 1, reps: 1, secPerRep: 600 };
        return { exerciseId: baseId, sets: 3, reps: "10-12", weightKg: 0, secPerRep: 3 };
    };

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
    const formatNumber = UI.formatNumber;
    const encodePayload = UI.encodePayload;
    const decodePayload = UI.decodePayload;
    const escapeHtml = UI.escapeHtml;

    const ACTIVITY_METRIC_LABELS = {
        stepsKcal: 'Kcal pasos',
        trainingKcal: 'Kcal entrenamiento',
        met: 'MET entrenamiento',
        intensity: 'Intensidad'
    };

    const ensureDailyTargets = () => {
        let storedTargets = DB.get('daily_nutrition_targets', {});
        const hasTargets = storedTargets && Object.keys(storedTargets).length > 0;
        const hasKcal = hasTargets && Object.values(storedTargets).some(dayTarget =>
            dayTarget && Number.isFinite(parseFloat(dayTarget.kcal))
        );
        if ((!hasTargets || !hasKcal) && typeof Targets !== 'undefined') {
            const recalculated = Targets.recalculateDailyTargets();
            if (recalculated) storedTargets = recalculated;
        }
        return storedTargets || {};
    };
    const renderActivityScorePill = ({ stepsKcal, trainingKcal, met, intensity, targetKcal }) => {
        if (typeof ActivityScore === 'undefined') return '';
        const result = ActivityScore.calculate({
            stepsKcal,
            trainingKcal,
            met,
            intensity,
            targetKcal
        });
        const scoreText = Number.isFinite(result.score) ? formatNumber(result.score, 1) : '-';
        const statusClass = ActivityScore.getStatusClass(result.score);
        const debugPayload = encodePayload({
            score: result.score,
            scores: result.scores,
            targets: result.targets,
            inputs: { stepsKcal, trainingKcal, met, intensity, targetKcal }
        });
        return `
            <button type="button" class="stat-pill stat-pill--activity-score stat-pill--block pill-trigger activity-score-info-trigger" data-activity-score="${debugPayload}">
                Score actividad: <span class="${statusClass}">${scoreText}</span>
            </button>
        `;
    };

    const generateActivityTotalsHtml = ({ totalKcal, trainingKcal, stepsKcal, min, metAvg, intensityAvg, scoreHtml = '' }) => {
        return `
            <div class="totals-stack">
                <div class="stat-pill stat-pill--kcal stat-pill--sm stat-pill--block">
                    🔥 ${Math.round(totalKcal)} kcal
                </div>
                <div class="totals-row totals-row--nowrap">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div>👟 Pasos · ${Math.round(stepsKcal)} kcal</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div>🏋️ Entrenamiento · ${Math.round(trainingKcal)} kcal</div>
                    </div>
                </div>
                <div class="totals-row">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">⚡ MET</div>
                        <div>${(Number.isFinite(metAvg) && metAvg > 0) ? `${formatMet(metAvg)} MET` : '-'}</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">✮ Intensidad</div>
                        <div>${(Number.isFinite(intensityAvg) && intensityAvg > 0) ? `x${formatFactor(intensityAvg)}` : '-'}</div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">⏱️ Tiempo</div>
                        <div>${(Number.isFinite(min) && min > 0) ? `${UI.formatMinutes(min)} min` : '-'}</div>
                    </div>
                </div>
                ${scoreHtml}
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
                    <div><span class="text-muted">Músculos:</span> ${muscles || '-'}</div>
                    <div><span class="text-muted">Equipo:</span> ${equipment || '-'}</div>
                    ${restSeconds ? `<div><span class="text-muted">Descanso:</span> ${restSeconds} s</div>` : ''}
                </div>
                <p class="text-sm">${technique || 'Técnica no disponible.'}</p>
                <div class="stats-pills stats-pills--center mt-lg">
                    <div class="stat-pill stat-pill--kcal">🔥 ${Math.round(kcal)} kcal</div>
                </div>
            `
        });
    };

    const buildPlanSelector = () => {
        const plans = getPlanFiles();
        const h1 = document.querySelector('h1');
        if (!h1) return;
        h1.classList.add('header-with-controls');
        let selectWrapper = document.getElementById(PLAN_KEY);
        if (!plans.length) {
            if (selectWrapper) selectWrapper.remove();
            return;
        }
        if (!selectWrapper) {
            selectWrapper = document.createElement('span');
            selectWrapper.id = PLAN_KEY;
            h1.appendChild(selectWrapper);
        }
        const selected = getSelectedFile();
        const options = plans.map(plan =>
            `<option value="${plan.file}" ${plan.file === selected ? 'selected' : ''}>${plan.label}</option>`
        ).join('');
        selectWrapper.innerHTML = `<select id="activity-plan-select" class="input-base input-select input-select--header">${options}</select>`;

        const select = document.getElementById('activity-plan-select');
        if (select) {
            select.addEventListener('change', (e) => {
                const file = e.target.value;
                setSelectedFile(file);
                loadPlanFile(file).then(() => renderTableContent());
            });
        }
    };

    const loadPlanFile = (file) => {
        const safeId = String(file).replace(/[^a-z0-9_-]/gi, '_');
        return UI.loadScript(`js/data/${file}`, `activity-plan-${safeId}`)
            .catch((err) => {
                console.error('Error cargando plan de actividad:', err);
                return null;
            });
    };
    const renderTableContent = () => {
        if (typeof EXERCISES === 'undefined') {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error: datos de ejercicios no disponibles.</td></tr>`;
            return;
        }

        const planData = getPlanData();
        if (!Array.isArray(planData) || !planData.length) {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--warning text-center">No hay plan semanal seleccionado o disponible.</td></tr>`;
            return;
        }

        const todayIndex = UI.getTodayIndex();
        const walkingExercise = getWalkingExercise();
        const storedTargets = ensureDailyTargets();

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
        planData.forEach((dayData, dayIndex) => {
            const walkInfo = getWalkInfo(dayData);
            const stepsKcal = UI.calculateStepsKcal(walkInfo.steps, {
                stepsConfig: {
                    stepsPerMin: walkInfo.stepsPerMin,
                    baseStepsPerMin: walkInfo.cadenceBase || parseFloat(walkingExercise.cadenceBase) || defaultStepsCfg.perMinute,
                    met: walkingExercise.met || defaultStepsCfg.met
                }
            });
            const totalMin = walkInfo.stepsPerMin > 0 ? (walkInfo.steps / walkInfo.stepsPerMin) : 0;
            const distanceKm = UI.calculateStepsDistanceKm(walkInfo.steps, { heightCm: userHeightCm });
            const dayStepsFactor = UI.calculateStepsIntensityFactor(walkInfo.stepsPerMin, {
                baseStepsPerMin: walkInfo.cadenceBase || parseFloat(walkingExercise.cadenceBase) || defaultStepsCfg.perMinute,
                a: 1,
                b: 2
            });
            const dayStepsMet = (parseFloat(walkingExercise.met) || 0) * dayStepsFactor;

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
                                            data-walk-day-index="${dayIndex}" data-walk-field="steps" value="${walkInfo.steps}">
                                    </div>
                                ` : `
                                    <div class="activity-exercise__kv-value">${walkInfo.steps}</div>
                                `}
                            </div>
                            <div class="activity-exercise__kv-row">
                                <div class="activity-exercise__kv-label">Ritmo (pasos/min)</div>
                                ${isEditMode ? `
                                    <div class="activity-exercise__kv-value activity-exercise__kv-value--edit">
                                        <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                            data-walk-day-index="${dayIndex}" data-walk-field="stepsPerMin" value="${walkInfo.stepsPerMin}">
                                    </div>
                                ` : `
                                    <div class="activity-exercise__kv-value">${walkInfo.stepsPerMin > 0 ? `${walkInfo.stepsPerMin}` : '-'}</div>
                                `}
                            </div>
                        </div>
                        <div class="activity-exercise__row activity-exercise__row--split">
                            <div class="activity-exercise__pill">🔥 ${Math.round(stepsKcal)} kcal</div>
                            ${(parseFloat(dayStepsMet) > 0) ? `<div class="activity-exercise__pill">⚡ ${formatMet(dayStepsMet)} MET</div>` : '<div class="activity-exercise__pill">⚡ - MET</div>'}
                        </div>
                        <div class="activity-exercise__row activity-exercise__row--split">
                            <div class="activity-exercise__pill">📏 ${(distanceKm > 0) ? `${UI.formatKm(distanceKm)} km` : '-'}</div>
                            <div class="activity-exercise__pill">⏱️ ${UI.formatMinutes(totalMin)} min</div>
                        </div>
                        <div class="meal-description">${(dayData.walk && dayData.walk.description) ? dayData.walk.description : ''}</div>
                    </div>
                </td>`;
        });

        movementRow.innerHTML = movementHtml;
        tableBody.appendChild(movementRow);

        const renderExerciseGroups = (sectionKey, dayData, dayIndex) => {
            const section = dayData && dayData[sectionKey];
            if (section && section.type === 'rest') {
                return '';
            }
            const items = (section && Array.isArray(section.exercises)) ? section.exercises : [];
            const pendingKey = `${dayIndex}:${sectionKey}`;
            const pendingHtml = (isEditMode && pendingAdds[pendingKey]) ? (() => {
                const allOptions = Object.values(EXERCISES || {}).map(opt => opt && opt.id
                    ? `<option value="${opt.id}">${opt.name}</option>`
                    : ''
                ).join('');
                return `
                    <div class="activity-exercise activity-exercise--pending">
                        <div class="activity-exercise__name-row">
                            <div class="activity-exercise__name activity-exercise__name--select">
                                <select class="input-base input-select input-select--sm"
                                    data-ex-add-select-section="${sectionKey}" data-ex-add-select-day-index="${dayIndex}">
                                    ${allOptions}
                                </select>
                            </div>
                            <button type="button" class="activity-exercise__add-done"
                                data-ex-add-done-section="${sectionKey}" data-ex-add-done-day-index="${dayIndex}">OK</button>
                        </div>
                    <div class="activity-exercise__pending-note">Añadiendo ejercicio…</div>
                </div>
            `;
        })() : '';

            if (!items.length) {
                return pendingHtml || `<div class="activity-training__meta">Sin ejercicios definidos.</div>`;
            }
            const trainingBlock = { exercises: items };
            const groupsHtml = UI.groupExercisesByTypeFocus(trainingBlock, EXERCISES).map(group => {
                const groupHeader = `
                    <div class="activity-exercise-group">
                        <div class="activity-exercise-group__title">${UI.formatLabel(group.type)} · ${UI.formatLabel(group.focus)}</div>
                    </div>
                `;
                const groupItems = group.items.map((item) => {
                    const ex = EXERCISES[item.exerciseId];
                    if (!ex) {
                        return `<div class="activity-exercise">Ejercicio no encontrado: ${item.exerciseId}</div>`;
                    }
                    const isTimeBased = UI.isTimedItem(item);
                    const numericWeight = parseFloat(item.weightKg);
                    const showWeight = ex.type === 'fuerza' && !isTimeBased && Number.isFinite(numericWeight) && numericWeight > 0;
                    const canEditWeight = ex.type === 'fuerza' && !isTimeBased;
                    const effectiveSecPerRep = isTimeBased ? (parseFloat(item.secPerRep) || 0) : 0;
                    const setsDisplay = Math.round(parseFloat(item.sets) || 0);
                    const repetitionsDisplay = isTimeBased
                        ? ((setsDisplay > 0 && effectiveSecPerRep > 0) ? `${setsDisplay} x ${Math.round(effectiveSecPerRep)}s` : '-')
                        : ((item.sets && item.reps) ? `${item.sets} x ${item.reps}` : '-');
                    const kcal = UI.calculateExerciseKcal(item, ex);
                    const estimatedMin = UI.estimateExerciseMinutes(item, ex);
                    const met = parseFloat(ex.met);
                    const showMet = Number.isFinite(met) && met > 0;
                    const repsAvg = UI.parseReps(item.reps);
                    const intensityFactor = (ex.type === 'fuerza' && !isTimeBased && repsAvg > 0)
                        ? UI.getIntensityFactorFromEpley(item.weightKg, repsAvg, null, ex.relativeLoad)
                        : 0;
                    const showIntensity = Number.isFinite(intensityFactor) && intensityFactor > 0 && ex.type === 'fuerza' && !isTimeBased;
                    const exerciseRest = Number.isFinite(parseFloat(ex.restSec)) ? ex.restSec : '';
                    const sameTypeOptions = Object.values(EXERCISES)
                        .filter(opt => opt && opt.type === ex.type)
                        .map(opt => `<option value="${opt.id}" ${opt.id === ex.id ? 'selected' : ''}>${opt.name}</option>`)
                        .join('');

                    return `
                        <div class="activity-exercise"
                            data-ex-name="${ex.name}"
                            data-ex-tech="${ex.technique || ''}"
                            data-ex-kcal="${kcal}"
                            data-ex-type="${ex.type || ''}"
                            data-ex-focus="${ex.focus || ''}"
                            data-ex-muscles="${ex.muscles || ''}"
                            data-ex-equipment="${ex.equipment || ''}"
                            data-ex-rest="${exerciseRest}">
                            ${isEditMode ? `
                                <div class="activity-exercise__name-row">
                                    <div class="activity-exercise__name activity-exercise__name--select">
                                        <select class="input-base input-select input-select--sm"
                                            data-ex-swap-section="${sectionKey}" data-ex-swap-day-index="${dayIndex}" data-ex-swap-id="${item.exerciseId}">
                                            ${sameTypeOptions}
                                        </select>
                                    </div>
                                    <button type="button" class="activity-exercise__delete"
                                        data-ex-delete-section="${sectionKey}" data-ex-delete-day-index="${dayIndex}" data-ex-delete-id="${item.exerciseId}"
                                        title="Borrar">🗑️</button>
                                </div>
                            ` : `
                                <div class="activity-exercise__name modal-trigger">${ex.name}</div>
                            `}
                            <div class="activity-exercise__kv">
                                <div class="activity-exercise__kv-row">
                                    <div class="activity-exercise__kv-label">Repeticiones</div>
                                    ${isEditMode ? `
                                        <div class="activity-exercise__kv-value activity-exercise__kv-value--edit activity-exercise__kv-value--inputs">
                                            <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                                data-ex-day-index="${dayIndex}" data-ex-section="${sectionKey}" data-ex-id="${item.exerciseId}" data-field="sets" value="${item.sets || ''}">
                                            <span class="activity-exercise__kv-sep">×</span>
                                            ${isTimeBased ? `
                                                <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                                    data-ex-day-index="${dayIndex}" data-ex-section="${sectionKey}" data-ex-id="${item.exerciseId}" data-field="secPerRep" value="${effectiveSecPerRep || ''}">
                                                <span class="activity-exercise__kv-suffix">s</span>
                                            ` : `
                                                <input type="text" class="input-base input-base--table-edit"
                                                    data-ex-day-index="${dayIndex}" data-ex-section="${sectionKey}" data-ex-id="${item.exerciseId}" data-field="reps" value="${item.reps || ''}">
                                            `}
                                        </div>
                                    ` : `
                                        <div class="activity-exercise__kv-value">${repetitionsDisplay}</div>
                                    `}
                                </div>
                                <div class="activity-exercise__kv-row">
                                    <div class="activity-exercise__kv-label">Carga</div>
                                    ${isEditMode && canEditWeight ? `
                                        <div class="activity-exercise__kv-value activity-exercise__kv-value--edit">
                                            <input type="text" inputmode="numeric" pattern="[0-9]*" class="input-base input-base--table-edit"
                                                data-ex-day-index="${dayIndex}" data-ex-section="${sectionKey}" data-ex-id="${item.exerciseId}" data-field="weightKg" value="${(Number.isFinite(numericWeight) ? numericWeight : '')}">
                                        </div>
                                    ` : `
                                        <div class="activity-exercise__kv-value">${showWeight ? `${numericWeight} kg` : '-'}</div>
                                    `}
                                </div>
                            </div>
                            <div class="activity-exercise__row activity-exercise__row--split">
                                <div class="activity-exercise__pill">🔥 ${Math.round(kcal)} kcal</div>
                                ${showMet ? `<div class="activity-exercise__pill">⚡ ${formatMet(met)} MET</div>` : '<div class="activity-exercise__pill">⚡ - MET</div>'}
                            </div>
                            <div class="activity-exercise__row activity-exercise__row--split">
                                ${showIntensity ? `<div class="activity-exercise__pill">✮ x${formatFactor(intensityFactor)}</div>` : '<div class="activity-exercise__pill">✮ -</div>'}
                                <div class="activity-exercise__pill">⏱️ ${UI.formatMinutes(estimatedMin)} min</div>
                            </div>
                            <div class="meal-description">${ex.description || ''}</div>
                        </div>
                    `;
                }).join('');
                return groupHeader + groupItems;
            }).join('');
            return pendingHtml + groupsHtml;
        };

        const gymRow = document.createElement('tr');
        let gymHtml = `<td class="activity-row-header">Gimnasio</td>`;
        planData.forEach((dayData, dayIndex) => {
            gymHtml += `
                <td>
                    <div class="activity-training">
                        <div class="activity-training__title-row">
                            <div class="activity-training__title">${(dayData.gym && dayData.gym.type === 'rest') ? 'Descanso' : 'Entrenamiento'}</div>
                            ${isEditMode ? `
                                <button type="button" class="activity-training__add"
                                    data-ex-add-section="gym" data-ex-add-day-index="${dayIndex}">Añadir</button>
                            ` : ''}
                        </div>
                        <div class="activity-training__meta">${(dayData.gym && dayData.gym.description) ? dayData.gym.description : ''}</div>
                        ${renderExerciseGroups('gym', dayData, dayIndex)}
                    </div>
                </td>`;
        });
        gymRow.innerHTML = gymHtml;
        tableBody.appendChild(gymRow);

        if (dayHasExtra(planData) || isEditMode) {
            const extraRow = document.createElement('tr');
            let extraHtml = `<td class="activity-row-header">Extra</td>`;
            planData.forEach((dayData, dayIndex) => {
                extraHtml += `
                    <td>
                        <div class="activity-training">
                        <div class="activity-training__title-row">
                            <div class="activity-training__title">Extra</div>
                            ${isEditMode ? `
                                <button type="button" class="activity-training__add"
                                    data-ex-add-section="extra_activity" data-ex-add-day-index="${dayIndex}">Añadir</button>
                            ` : ''}
                        </div>
                        <div class="activity-training__meta">${(dayData.extra_activity && dayData.extra_activity.description) ? dayData.extra_activity.description : ''}</div>
                        ${renderExerciseGroups('extra_activity', dayData, dayIndex)}
                    </div>
                </td>`;
            });
            extraRow.innerHTML = extraHtml;
            tableBody.appendChild(extraRow);
        }
        const totalsRow = document.createElement('tr');
        let totalsHtml = `<td class="activity-row-header">Totales</td>`;

        planData.forEach((dayData, dayIndex) => {
            const walkInfo = getWalkInfo(dayData);
            const stepsKcal = UI.calculateStepsKcal(walkInfo.steps, {
                stepsConfig: {
                    stepsPerMin: walkInfo.stepsPerMin,
                    baseStepsPerMin: walkInfo.cadenceBase || parseFloat(walkingExercise.cadenceBase) || defaultStepsCfg.perMinute,
                    met: walkingExercise.met || defaultStepsCfg.met
                }
            });
            const stepsMin = walkInfo.stepsPerMin > 0 ? (walkInfo.steps / walkInfo.stepsPerMin) : 0;
            const stepsFactor = UI.calculateStepsIntensityFactor(walkInfo.stepsPerMin, {
                baseStepsPerMin: walkInfo.cadenceBase || parseFloat(walkingExercise.cadenceBase) || defaultStepsCfg.perMinute,
                a: 1,
                b: 2
            });
            const stepsMet = (parseFloat(walkingExercise.met) || 0) * stepsFactor;
            const stepsMetMin = stepsMet * stepsMin;

            const combined = [...getGymExercises(dayData), ...getExtraExercises(dayData)];
            const trainingTotals = UI.calcTrainingTotals({ exercises: combined }, null, EXERCISES);
            const totalKcal = trainingTotals.kcal + stepsKcal;
            const totalMinForMet = (trainingTotals.min || 0) + stepsMin;
            const metAvg = totalMinForMet > 0
                ? (((trainingTotals.metMinSum || 0) + stepsMetMin) / totalMinForMet)
                : 0;
            const intensityAvg = trainingTotals.intensityAvg || 0;
            const scoreHtml = renderActivityScorePill({
                stepsKcal,
                trainingKcal: trainingTotals.kcal,
                met: metAvg,
                intensity: intensityAvg,
                targetKcal: (storedTargets[WEEK_DAYS[dayIndex]] && storedTargets[WEEK_DAYS[dayIndex]].kcal) || 0
            });

            totalsHtml += `
                <td>
                    ${generateActivityTotalsHtml({
                        totalKcal,
                        trainingKcal: trainingTotals.kcal,
                        stepsKcal,
                        min: trainingTotals.min + stepsMin,
                        metAvg,
                        intensityAvg,
                        scoreHtml
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
        if (e.target.matches('input[data-walk-day-index][data-walk-field]')) {
            const dayIndex = parseInt(e.target.dataset.walkDayIndex, 10);
            const field = e.target.dataset.walkField;
            const rawVal = e.target.value;
            const planData = getPlanData() || [];
            if (!planData[dayIndex]) planData[dayIndex] = { day: WEEK_DAYS[dayIndex] };
            const item = ensureWalkItem(planData[dayIndex]);
            const current = getWalkInfo(planData[dayIndex]);
            const safeStepsPerMin = field === 'stepsPerMin'
                ? (parseFloat(rawVal) || current.stepsPerMin)
                : (parseFloat(item.stepsPerMin) || current.stepsPerMin);
            const safeSteps = field === 'steps'
                ? (parseInt(rawVal, 10) || current.steps)
                : current.steps;
            item.stepsPerMin = safeStepsPerMin;
            item.secPerRep = Math.round((safeSteps / safeStepsPerMin) * 60);
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (e.target.matches('input[data-ex-day-index][data-ex-section][data-ex-id][data-field]')) {
            const dayIndex = parseInt(e.target.dataset.exDayIndex, 10);
            const sectionKey = e.target.dataset.exSection;
            const exerciseId = e.target.dataset.exId;
            const field = e.target.dataset.field;
            const rawVal = e.target.value;
            const planData = getPlanData() || [];
            const dayData = planData[dayIndex];
            if (!dayData || !dayData[sectionKey] || !Array.isArray(dayData[sectionKey].exercises)) return;
            const item = dayData[sectionKey].exercises.find(e => e && e.exerciseId === exerciseId);
            if (!item) return;
            if (field === 'reps') {
                item[field] = rawVal;
            } else {
                const val = parseFloat(rawVal);
                item[field] = Number.isNaN(val) ? '' : val;
            }
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (e.target.matches('select[data-ex-swap-section][data-ex-swap-day-index][data-ex-swap-id]')) {
            const dayIndex = parseInt(e.target.dataset.exSwapDayIndex, 10);
            const sectionKey = e.target.dataset.exSwapSection;
            const exerciseId = e.target.dataset.exSwapId;
            const nextId = e.target.value;
            const planData = getPlanData() || [];
            const dayData = planData[dayIndex];
            if (!dayData || !dayData[sectionKey] || !Array.isArray(dayData[sectionKey].exercises)) return;
            const item = dayData[sectionKey].exercises.find(e => e && e.exerciseId === exerciseId);
            if (!item || !nextId || item.exerciseId === nextId) return;
            item.exerciseId = nextId;
            savePlanData(planData);
            renderTableContent();
        }
    });

    if (table) table.addEventListener('click', (e) => {
        if (e.target.matches('button[data-ex-add-section][data-ex-add-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.exAddDayIndex, 10);
            const sectionKey = e.target.dataset.exAddSection;
            const pendingKey = `${dayIndex}:${sectionKey}`;
            pendingAdds[pendingKey] = true;
            renderTableContent();
            return;
        }

        if (e.target.matches('button[data-ex-add-done-section][data-ex-add-done-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.exAddDoneDayIndex, 10);
            const sectionKey = e.target.dataset.exAddDoneSection;
            const pendingKey = `${dayIndex}:${sectionKey}`;
            const select = document.querySelector(`select[data-ex-add-select-section="${sectionKey}"][data-ex-add-select-day-index="${dayIndex}"]`);
            const chosenId = select ? select.value : null;
            const planData = getPlanData() || [];
            const dayData = planData[dayIndex] || { day: WEEK_DAYS[dayIndex] };
            if (!dayData[sectionKey] || dayData[sectionKey].type === 'rest') {
                dayData[sectionKey] = { exercises: [], description: dayData[sectionKey] ? (dayData[sectionKey].description || '') : '' };
            }
            if (!Array.isArray(dayData[sectionKey].exercises)) dayData[sectionKey].exercises = [];
            const newItem = buildDefaultExercise(dayData[sectionKey], sectionKey, chosenId);
            if (newItem) dayData[sectionKey].exercises.push(newItem);
            delete pendingAdds[pendingKey];
            planData[dayIndex] = dayData;
            savePlanData(planData);
            renderTableContent();
            return;
        }
        if (e.target.matches('button[data-ex-delete-section][data-ex-delete-day-index][data-ex-delete-id]')) {
            const dayIndex = parseInt(e.target.dataset.exDeleteDayIndex, 10);
            const sectionKey = e.target.dataset.exDeleteSection;
            const exerciseId = e.target.dataset.exDeleteId;
            const planData = getPlanData() || [];
            const dayData = planData[dayIndex];
            if (!dayData || !dayData[sectionKey] || !Array.isArray(dayData[sectionKey].exercises)) return;
            const nextItems = dayData[sectionKey].exercises.filter(item => item && item.exerciseId !== exerciseId);
            dayData[sectionKey].exercises = nextItems;
            savePlanData(planData);
            renderTableContent();
            return;
        }

        if (e.target.matches('.activity-score-info-trigger')) {
            const payload = decodePayload(e.target.dataset.activityScore || '');
            if (!payload) return;
            const scoreText = Number.isFinite(payload.score) ? formatNumber(payload.score, 1) : '-';
            const statusClass = (typeof ActivityScore !== 'undefined') ? ActivityScore.getStatusClass(payload.score) : '';
            const rows = [
                { label: ACTIVITY_METRIC_LABELS.stepsKcal, col2: formatNumber(payload.inputs.stepsKcal, 1), col3: 'Objetivo', col4: formatNumber(payload.targets.stepsKcalTarget, 1) },
                { label: ACTIVITY_METRIC_LABELS.trainingKcal, col2: formatNumber(payload.inputs.trainingKcal, 1), col3: 'Objetivo', col4: formatNumber(payload.targets.trainingKcal, 1) },
                { label: ACTIVITY_METRIC_LABELS.met, col2: formatNumber(payload.inputs.met, 1), col3: 'Objetivo', col4: formatNumber(payload.targets.met, 1) },
                { label: ACTIVITY_METRIC_LABELS.intensity, col2: formatNumber(payload.inputs.intensity, 2), col3: 'Objetivo', col4: formatNumber(payload.targets.intensity, 2) }
            ];

            UI.showModal({
                id: 'activity-score-modal',
                titleHtml: '<h3 class="modal-title">Score de actividad</h3>',
                bodyHtml: `
                    <div class="activity-score-modal">
                        <table class="activity-score-table">
                            <thead>
                                <tr>
                                    <th>Metricas</th>
                                    <th class="text-right">Actual</th>
                                    <th class="text-right">Objetivo</th>
                                    <th class="text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(row => `
                                    <tr>
                                        <td>${escapeHtml(row.label)}</td>
                                        <td class="text-right">${escapeHtml(row.col2)}</td>
                                        <td class="text-right">${escapeHtml(row.col3)}</td>
                                        <td class="text-right">${escapeHtml(row.col4)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="stats-pills stats-pills--center mt-lg">
                        <div class="stat-pill stat-pill--activity-score activity-score-modal-score-pill">
                            Puntuación: <span class="${statusClass}">${scoreText}</span>
                        </div>
                    </div>
                `
            });
            return;
        }

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
            { global: 'Formulas', path: 'js/core/formulas.js' },
            { global: 'Targets', path: 'js/core/targets.js' },
            { global: 'ActivityScore', path: 'js/core/activity-score.js' },
            { global: 'EXERCISES', path: 'js/data/exercises.js' }
        ],
        afterRequired: () => {
            const plans = getPlanFiles();
            if (plans.length) {
                return loadPlanFile(getSelectedFile());
            }
            return Promise.resolve();
        },
        run: () => {
            buildPlanSelector();
            renderTableContent();
        },
        onError: () => {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error cargando dependencias (ejercicios/actividad).</td></tr>`;
        }
    });
}

