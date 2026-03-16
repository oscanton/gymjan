/* =========================================
   core/ui.js - UTILIDADES DE UI
   ========================================= */

const UI = {
    // Detectar si estamos en subdirectorio views/
    isInViews: () => window.location.pathname.includes('/views/'),

    // Resolver ruta relativa desde la raz del proyecto
    resolvePath: (path) => {
        const prefix = UI.isInViews() ? '../' : '';
        return prefix + path;
    },

    // Cargar script dinmicamente (Promesa)
    loadScript: (path, id = null) => {
        return new Promise((resolve, reject) => {
            const resolvedPath = UI.resolvePath(path) + `?v=${Date.now()}`;
            if (id) {
                const old = document.getElementById(id);
                if (old) old.remove();
            }
            const script = document.createElement('script');
            if (id) script.id = id;
            script.src = resolvedPath;
            script.onload = resolve;
            script.onerror = () => reject(path);
            document.body.appendChild(script);
        });
    },

    // Cargar dependencias con condicin
    loadDependencies: (deps, { settled = false } = {}) => {
        const loads = (deps || []).filter(dep => {
            if (typeof dep.when === 'function') return dep.when();
            if (typeof dep.when === 'boolean') return dep.when;
            return true;
        }).map(dep => UI.loadScript(dep.path, dep.id));

        return settled ? Promise.allSettled(loads) : Promise.all(loads);
    },

    ensureDependencies: (deps, { settled = false } = {}) => {
        const normalizedDeps = (deps || []).map(dep => {
            const globalName = dep && dep.global;
            const shouldLoad = () => !globalName || typeof window[globalName] === 'undefined';
            return {
                when: shouldLoad,
                path: dep.path,
                id: dep.id
            };
        });
        return UI.loadDependencies(normalizedDeps, { settled });
    },

    bootstrapPage: ({
        rootId,
        requiredDeps = [],
        optionalDeps = [],
        afterRequired = null,
        afterOptional = null,
        run = null,
        onError = null
    } = {}) => {
        const root = document.getElementById(rootId);
        if (!root || typeof run !== 'function') return Promise.resolve(false);

        const callMaybe = (fn) => (typeof fn === 'function' ? Promise.resolve().then(fn) : Promise.resolve());

        return UI.ensureDependencies(requiredDeps)
            .then(() => callMaybe(afterRequired))
            .then(() => UI.ensureDependencies(optionalDeps, { settled: true }))
            .then(() => callMaybe(afterOptional))
            .then(() => {
                run(root);
                return true;
            })
            .catch((err) => {
                if (typeof onError === 'function') {
                    onError(root, err);
                } else {
                    UI.showError(root, 'Error cargando dependencias.');
                }
                return false;
            });
    },

    // Renderizar mensaje de error en contenedor
    showError: (container, message) => {
        container.innerHTML = `<div class="glass-card card"><p class="text-status--danger">${message}</p></div>`;
    },

    // Status class for totals (target compliance indicator)
    getStatusClass: (current, target) => {
        if (!target || target === 0) return '';
        const pct = (current / target) * 100;
        if (pct > 110) return 'text-status--danger';
        if (pct < 90) return 'text-status--warning';
        return 'text-status--ok';
    },

    getStatusClassByRule: (current, target, { rule = 'target', tolerancePct = 10 } = {}) => {
        const currentValue = parseFloat(current);
        const targetValue = parseFloat(target);
        if (!Number.isFinite(currentValue) || !Number.isFinite(targetValue) || targetValue <= 0) return '';

        if (rule === 'min') {
            if (currentValue >= targetValue) return 'text-status--ok';
            if (currentValue >= targetValue * (1 - (tolerancePct / 100))) return 'text-status--warning';
            return 'text-status--danger';
        }

        if (rule === 'max') {
            if (currentValue <= targetValue) return 'text-status--ok';
            if (currentValue <= targetValue * (1 + (tolerancePct / 100))) return 'text-status--warning';
            return 'text-status--danger';
        }

        return UI.getStatusClass(currentValue, targetValue);
    },
    showModal: ({ id = null, titleHtml = '', bodyHtml = '' } = {}) => {
        const existing = id ? document.getElementById(id) : document.querySelector('.modal-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        if (id) overlay.id = id;

        overlay.innerHTML = `
            <div class="modal-content">
                ${titleHtml}
                ${bodyHtml}
            </div>
        `;

        const close = () => {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
        };
        const onKey = (e) => {
            if (e.key === 'Escape') close();
        };
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', onKey);

        document.body.appendChild(overlay);
        return overlay;
    },

    getTodayIndex: () => DateUtils.getTodayIndex(),

    scrollToTodayColumn: (table, todayIndex) => {
        if (!table || !table.parentElement) return;
        const targetTh = table.querySelectorAll('thead th')[todayIndex + 1];
        const stickyTh = table.querySelector('thead th');
        if (!targetTh || !stickyTh) return;
        const scroller = table.parentElement;
        const scrollLeft = targetTh.offsetLeft - stickyTh.offsetWidth;
        scroller.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    },

    formatLabel: (value) => {
        if (!value) return '-';
        return String(value)
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    },
    formatNumber: (value, decimals = 1) => {
        const numeric = Number.isFinite(value) ? value : 0;
        return numeric.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
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
            console.error('Error parseando payload:', err);
            return null;
        }
    },

    formatMinutes: (minutes) => {
        const val = Math.round(minutes * 10) / 10;
        return `${val}`;
    },

    parseReps: (reps) => {
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
    },
    isTimedItem: (item) => {
        if (!item) return false;
        const sets = parseFloat(item.sets);
        const reps = parseFloat(item.reps);
        const secPerRep = parseFloat(item.secPerRep);
        return Number.isFinite(sets)
            && sets > 0
            && Number.isFinite(reps)
            && reps === 1
            && Number.isFinite(secPerRep)
            && secPerRep >= 30;
    },

    formatTrabajo: (item) => {
        if (item && UI.isTimedItem(item)) {
            const sets = Math.round(item.sets || 0);
            const secPerRep = Math.round(item.secPerRep || 0);
            if (sets > 1) return `⏱️ ${sets} x ${secPerRep}s`;
            const totalMin = secPerRep / 60;
            if (Number.isFinite(totalMin)) return `⏱️ ${UI.formatMinutes(totalMin)} min`;
        }
        if (item && item.sets && item.reps) return `🔁 ${item.sets} x ${item.reps}`;
        return '-';
    },

    getExerciseTimeBreakdown: (item, ex, { routineTimes = null } = {}) => {
        if (!ex || !item) return { workMin: 0, restMin: 0, totalMin: 0 };

        const defaults = (typeof ROUTINE_TIME_DEFAULTS !== 'undefined') ? ROUTINE_TIME_DEFAULTS : {
            secPerRep: 4,
            restSec: 90
        };
        const safeRoutineTimes = routineTimes || {};
        const pickTime = (...values) => {
            for (let i = 0; i < values.length; i += 1) {
                const val = values[i];
                if (Number.isFinite(val)) return val;
            }
            return null;
        };

        const repsAvg = UI.parseReps(item.reps);
        const sets = item.sets || 0;
        if (!sets || !repsAvg) return { workMin: 0, restMin: 0, totalMin: 0 };
        const secPerRep = pickTime(item.secPerRep, safeRoutineTimes.secPerRep, defaults.secPerRep) || 4;
        const restSeconds = pickTime(item.restSec, safeRoutineTimes.restSec, defaults.restSec) || 60;
        const workSec = repsAvg * sets * secPerRep;
        const restSec = sets > 1 ? (sets - 1) * restSeconds : 0;
        const workMin = workSec / 60;
        const restMin = restSec / 60;
        return { workMin, restMin, totalMin: workMin + restMin };
    },

    estimateExerciseMinutes: (item, ex, { routineTimes = null } = {}) => {
        return UI.getExerciseTimeBreakdown(item, ex, { routineTimes }).totalMin;
    },

    getEstimatedOneRmEpley: (weightKg, reps) => {
        const weight = parseFloat(weightKg);
        const repsVal = parseFloat(reps);
        if (!Number.isFinite(weight) || weight <= 0) return null;
        if (!Number.isFinite(repsVal) || repsVal <= 0) return null;
        return weight * (1 + (repsVal / 30));
    },

    getIntensityFactorFromEpley: (weightKg, reps) => {
        const weight = parseFloat(weightKg);
        const oneRm = UI.getEstimatedOneRmEpley(weight, reps);
        if (!oneRm || !Number.isFinite(weight) || weight <= 0) return 1;
        const intensity = Math.min(Math.max(weight / oneRm, 0), 1);
        return 0.7 + (0.8 * intensity);
    },
    getExerciseKcalCoef: (item, ex, { routineTimes = null } = {}) => {
        if (!ex || !item) return 0;
        const met = ex.met || 0;
        if (!met) return 0;

        const { workMin, restMin } = UI.getExerciseTimeBreakdown(item, ex, { routineTimes });
        if (!workMin && !restMin) return 0;
        const restMet = 1.5;
        const workCoef = (met / 60) * workMin;
        const restCoef = (restMet / 60) * restMin;
        if (ex.type === 'fuerza') {
            const repsAvg = UI.parseReps(item.reps);
            const intensityFactor = UI.getIntensityFactorFromEpley(item.weightKg, repsAvg);
            return (workCoef * intensityFactor) + restCoef;
        }
        return workCoef + restCoef;
    },

    calculateExerciseKcal: (item, ex, { weightKg = null, routineTimes = null } = {}) => {
        if (!ex || !item) return 0;
        const effectiveWeight = UI.getEffectiveWeightKg(weightKg);
        const coef = UI.getExerciseKcalCoef(item, ex, { routineTimes });
        if (!coef) return 0;
        return coef * effectiveWeight;
    },

    getEffectiveWeightKg: (weightKg = null) => {
        if (weightKg && weightKg > 0) return weightKg;
        if (typeof DB === 'undefined') return 70;
        const profile = DB.get('user_profile', {});
        const val = parseFloat(profile.weight);
        return val > 0 ? val : 70;
    },

    calculateStepsKcal: (steps = 0, { weightKg = null, stepsConfig = null } = {}) => {
        const safeSteps = Math.max(0, parseInt(steps, 10) || 0);
        if (!safeSteps) return 0;
        const cfg = stepsConfig || {};
        const effectiveWeight = UI.getEffectiveWeightKg(weightKg);
        const stepsPerMin = cfg.stepsPerMin || 100;
        const met = cfg.met || ((typeof EXERCISES !== 'undefined' && EXERCISES.caminar) ? EXERCISES.caminar.met : 3.5) || 3.5;
        const minutes = safeSteps / stepsPerMin;
        return (met * effectiveWeight / 60) * minutes;
    },

    calcRoutineTotals: (routine, routineOverrides, exercisesMap, { weightKg = null } = {}) => {
        let totalKcal = 0;
        let totalMin = 0;
        let totalEj = 0;

        if (!routine) return { kcal: 0, min: 0, exerciseCount: 0 };
        const exercises = exercisesMap || (typeof EXERCISES !== 'undefined' ? EXERCISES : {});
        const routineTimes = routine.timings || null;

        routine.exercises.forEach(item => {
            const override = (routineOverrides && routineOverrides[item.exerciseId]) || {};
            const effectiveItem = { ...item, ...override };
            const ex = exercises[item.exerciseId];
            if (!ex) return;
            totalEj += 1;
            totalMin += UI.estimateExerciseMinutes(effectiveItem, ex, { routineTimes });
            totalKcal += UI.calculateExerciseKcal(effectiveItem, ex, { weightKg, routineTimes });
        });

        return { kcal: totalKcal, min: totalMin, exerciseCount: totalEj };
    },

    groupExercisesByTypeFocus: (routine, exercisesMap, { typeOrder = null, focusOrder = null } = {}) => {
        if (!routine || !routine.exercises) return [];
        const exercises = exercisesMap || (typeof EXERCISES !== 'undefined' ? EXERCISES : {});
        const groups = new Map();

        routine.exercises.forEach(item => {
            const ex = exercises[item.exerciseId];
            if (!ex) return;
            const exerciseType = ex.type || 'otros';
            const exerciseFocus = ex.focus || 'general';
            const key = `${exerciseType}__${exerciseFocus}`;
            if (!groups.has(key)) groups.set(key, { type: exerciseType, focus: exerciseFocus, items: [] });
            groups.get(key).items.push(item);
        });

        const resolvedTypeOrder = typeOrder || ['fuerza', 'cardio', 'recuperacion', 'otros'];
        const resolvedFocusOrder = focusOrder || ['tren_superior', 'tren_inferior', 'core', 'full_body', 'movilidad', 'recuperacion', 'general'];

        return Array.from(groups.values()).sort((a, b) => {
            const ta = resolvedTypeOrder.indexOf(a.type);
            const tb = resolvedTypeOrder.indexOf(b.type);
            if (ta !== tb) return (ta === -1 ? 999 : ta) - (tb === -1 ? 999 : tb);
            const ea = resolvedFocusOrder.indexOf(a.focus);
            const eb = resolvedFocusOrder.indexOf(b.focus);
            if (ea !== eb) return (ea === -1 ? 999 : ea) - (eb === -1 ? 999 : eb);
            return a.focus.localeCompare(b.focus);
        });
    },

    renderEditResetControls: ({ id, isEditMode, onToggle, onReset }) => {
        const btnContainer = document.createElement('div');
        btnContainer.id = id;
        btnContainer.className = 'menu-controls';

        const editBtn = document.createElement('button');
        editBtn.className = 'btn-back';
        editBtn.innerHTML = isEditMode ? ' Listo' : ' Editar';
        editBtn.classList.toggle('btn-back--active', isEditMode);
        editBtn.onclick = onToggle;

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-back';
        resetBtn.innerHTML = '🔄 Reset';
        resetBtn.onclick = onReset;

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(resetBtn);
        return btnContainer;
    }
};
window.UI = UI;


