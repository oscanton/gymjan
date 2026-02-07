/* =========================================
   pages/actividad.page.js - ACTIVIDAD SEMANAL
   ========================================= */

function renderActivityPage() {
    const tableBody = document.getElementById('actividad-body');
    if (!tableBody) return;

    let container = document.getElementById('actividad-container');
    if (!container) {
        const table = tableBody.closest('table');
        if (table) container = table.parentElement;
    }

    const WEIGHT_KEY = 'activity_weights';

    const getWeights = () => DB.get(WEIGHT_KEY, {});
    const saveWeights = (weights) => DB.save(WEIGHT_KEY, weights);

    const parseReps = (reps) => {
        if (!reps) return 0;
        if (typeof reps === 'number') return reps;
        const str = String(reps).trim();
        if (str.includes('-')) {
            const parts = str.split('-').map(v => parseFloat(v));
            if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
                return (parts[0] + parts[1]) / 2;
            }
        }
        const val = parseFloat(str);
        return Number.isNaN(val) ? 0 : val;
    };

    const calculateRoutineTotals = (routine) => {
        let totalKcal = 0;
        let totalMin = 0;
        let totalEj = 0;

        if (!routine) return { kcal: 0, min: 0, ejercicios: 0 };

        routine.ejercicios.forEach(item => {
            const ex = EJERCICIOS[item.ejercicioId];
            if (!ex) return;
            totalEj += 1;

            if (ex.unidad === 'min' && item.tiempoMin) {
                totalMin += item.tiempoMin;
                totalKcal += (ex.kcalPerMin || 0) * item.tiempoMin;
            } else if (ex.unidad === 'rep' && item.series && item.reps) {
                const repsAvg = parseReps(item.reps);
                const repsTotal = repsAvg * item.series;
                totalKcal += (ex.kcalPerRep || 0) * repsTotal;
            }
        });

        const estimatedMin = routine.duracionMin && routine.duracionMin > 0 ? routine.duracionMin : totalMin;
        return { kcal: totalKcal, min: estimatedMin, ejercicios: totalEj };
    };

    const formatTrabajo = (item, ex) => {
        if (item.tiempoMin) return `${item.tiempoMin} min`;
        if (item.series && item.reps) return `${item.series} x ${item.reps}`;
        if (ex && ex.unidad === 'min') return 'Tiempo libre';
        return '—';
    };

    const renderTableContent = () => {
        if (typeof Routines === 'undefined' || typeof EJERCICIOS === 'undefined') {
            tableBody.innerHTML = `<tr><td colspan="8" class="text-status--danger text-center">Error: datos de actividad no disponibles.</td></tr>`;
            return;
        }

        const todayIndex = DateUtils.getTodayIndex();
        const weeklyPlanRaw = ActivityStore.getWeeklyPlan();
        const fallbackId = (typeof DEFAULT_RUTINA_ID !== 'undefined') ? DEFAULT_RUTINA_ID : 'descanso';
        const weeklyPlan = Array.isArray(weeklyPlanRaw) ? weeklyPlanRaw.slice(0, 7) : Array(7).fill(fallbackId);
        while (weeklyPlan.length < 7) weeklyPlan.push(fallbackId);
        const weights = getWeights();
        const routines = Routines.getAll();

        const table = tableBody.closest('table');
        const thead = table.querySelector('thead');
        if (thead) {
            let headerHtml = `<tr><th class="activity-row-header"></th>`;
            DIAS_SEMANA.forEach((dia, index) => {
                const isToday = index === todayIndex;
                const activeClass = isToday ? 'text-status--ok' : '';
                const selectedId = weeklyPlan[index] || fallbackId;

                const options = routines.map(r =>
                    `<option value="${r.id}" ${r.id === selectedId ? 'selected' : ''}>${r.nombre}</option>`
                ).join('');

                headerHtml += `
                    <th class="${activeClass}">
                        <div class="activity-day-header">
                            <div class="activity-day-title">${dia}</div>
                            <select class="input-base input-select input-select--sm" data-day-index="${index}">
                                ${options}
                            </select>
                        </div>
                    </th>`;
            });
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;
        }

        tableBody.innerHTML = '';

        const routineRow = document.createElement('tr');
        let routineHtml = `<td class="activity-row-header">Rutina</td>`;

        weeklyPlan.forEach((routineId, dayIndex) => {
            const routine = Routines.getById(routineId) || Routines.getById(fallbackId);
            const meta = routine ? `${routine.objetivo || ''}` : '';

            const exercisesHtml = (routine && routine.ejercicios && routine.ejercicios.length)
                ? routine.ejercicios.map(item => {
                    const ex = EJERCICIOS[item.ejercicioId];
                    if (!ex) {
                        return `<div class="activity-exercise">Ejercicio no encontrado: ${item.ejercicioId}</div>`;
                    }

                    const showWeight = ex.tipo === 'fuerza' && ex.unidad === 'rep' && item.series && item.reps;
                    const dayWeights = weights[dayIndex] || {};
                    const currentWeight = dayWeights[item.ejercicioId] ?? '';

                    return `
                        <div class="activity-exercise">
                            <div class="activity-exercise__name">${ex.name}</div>
                            <div class="activity-exercise__desc">${ex.descripcion || ''}</div>
                            <div class="activity-exercise__tech">${ex.tecnica || ''}</div>
                            <div class="activity-exercise__row">
                                <div class="activity-exercise__pill">${formatTrabajo(item, ex)}</div>
                                ${showWeight ? `
                                    <div class="activity-exercise__weight">
                                        <span>Peso</span>
                                        <input type="number" class="input-base input-base--table-edit" min="0" step="0.5" data-day-index="${dayIndex}" data-exercise-id="${item.ejercicioId}" value="${currentWeight}">
                                        <span>kg</span>
                                    </div>
                                ` : '<span class="activity-exercise__pill">Sin carga</span>'}
                            </div>
                        </div>`;
                }).join('')
                : `<div class="activity-routine__meta">Sin ejercicios definidos.</div>`;

            routineHtml += `
                <td>
                    <div class="activity-routine">
                        <div class="activity-exercise__name">${routine ? routine.nombre : 'Rutina'}</div>
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

        weeklyPlan.forEach((routineId) => {
            const routine = Routines.getById(routineId) || Routines.getById(fallbackId);
            const totals = calculateRoutineTotals(routine);

            totalsHtml += `
                <td>
                    <div class="activity-totals">
                        <div class="stat-pill stat-pill--kcal stat-pill--sm">🔥 ${Math.round(totals.kcal)} kcal</div>
                        <div class="stat-pill stat-pill--sm">⏱️ ${Math.round(totals.min)} min</div>
                        <div class="stat-pill stat-pill--sm">🧩 ${totals.ejercicios} ejercicios</div>
                    </div>
                </td>`;
        });

        totalsRow.innerHTML = totalsHtml;
        tableBody.appendChild(totalsRow);

        setTimeout(() => {
            if (table && table.parentElement) {
                const scroller = table.parentElement;
                const targetTh = table.querySelectorAll('thead th')[todayIndex + 1];
                const stickyTh = table.querySelector('thead th');

                if (targetTh && stickyTh) {
                    const scrollLeft = targetTh.offsetLeft - stickyTh.offsetWidth;
                    scroller.scrollTo({ left: scrollLeft, behavior: 'smooth' });
                }
            }
        }, 100);
    };

    const table = tableBody.closest('table');

    if (table) table.addEventListener('change', (e) => {
        if (e.target.matches('select[data-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.dayIndex);
            const routineId = e.target.value;
            const weeklyPlan = ActivityStore.getWeeklyPlan();
            weeklyPlan[dayIndex] = routineId;
            ActivityStore.saveWeeklyPlan(weeklyPlan);
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
        }
    });

    const loadDependencies = () => {
        const baseLoads = [];
        if (typeof EJERCICIOS === 'undefined') baseLoads.push(UI.loadScript('js/data/ejercicios.js'));
        const routinesLoad = (typeof Routines === 'undefined') ? UI.loadScript('js/core/routines.js') : Promise.resolve();

        Promise.all([...baseLoads, routinesLoad])
            .then(() => Routines.ensureLoaded())
            .then(() => renderTableContent())
            .catch(() => {
                tableBody.innerHTML = `<tr><td colspan="8" class="text-status--danger text-center">Error cargando dependencias (ejercicios/rutinas).</td></tr>`;
            });
    };

    loadDependencies();
}
