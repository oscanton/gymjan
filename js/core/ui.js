/* =========================================
   core/ui.js - UTILIDADES DE UI
   ========================================= */

const UI = {
    // Detectar si estamos en subdirectorio views/
    isInViews: () => window.location.pathname.includes('/views/'),

    // Resolver ruta relativa desde la raíz del proyecto
    resolvePath: (path) => {
        const prefix = UI.isInViews() ? '../' : '';
        return prefix + path;
    },

    // Cargar script dinámicamente (Promesa)
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

    // Cargar dependencias con condición
    loadDependencies: (deps, { settled = false } = {}) => {
        const loads = (deps || []).filter(dep => {
            if (typeof dep.when === 'function') return dep.when();
            if (typeof dep.when === 'boolean') return dep.when;
            return true;
        }).map(dep => UI.loadScript(dep.path, dep.id));

        return settled ? Promise.allSettled(loads) : Promise.all(loads);
    },

    // Renderizar mensaje de error en contenedor
    showError: (container, message) => {
        container.innerHTML = `<div class="glass-card card"><p class="text-status--danger">${message}</p></div>`;
    },

    // Clase de estado para totales (Visualización de cumplimiento de objetivos)
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

        const close = () => overlay.remove();
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', function onKey(e) {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', onKey);
                close();
            }
        });

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

    formatTrabajo: (item, ex) => {
        if (item && item.tiempoMin) return `⏱️ ${item.tiempoMin} min`;
        if (item && item.series && item.reps) return `🔁 ${item.series} x ${item.reps}`;
        if (ex && ex.unidad === 'min') return 'Tiempo libre';
        return '-';
    },

    getExerciseTimeBreakdown: (item, ex) => {
        if (!ex || !item) return { workMin: 0, restMin: 0, transMin: 0, totalMin: 0 };
        if (item.tiempoMin) {
            const workMin = item.tiempoMin;
            return { workMin, restMin: 0, transMin: 0, totalMin: workMin };
        }
        if (ex.unidad !== 'rep') return { workMin: 0, restMin: 0, transMin: 0, totalMin: 0 };

        const repsAvg = UI.parseReps(item.reps);
        const series = item.series || 0;
        const secPerRep = item.segPorRep || ex.segPorRep || 4;
        const restSeconds = item.descansoSeg || ex.descansoSeg || 60;
        const segTransicion = item.segTransicion || ex.segTransicion || 0;
        const workSeg = repsAvg * series * secPerRep;
        const restSeg = series > 1 ? (series - 1) * restSeconds : 0;
        const transSeg = series > 0 ? series * segTransicion : 0;
        const workMin = workSeg / 60;
        const restMin = restSeg / 60;
        const transMin = transSeg / 60;
        return { workMin, restMin, transMin, totalMin: workMin + restMin + transMin };
    },

    estimateExerciseMinutes: (item, ex) => {
        return UI.getExerciseTimeBreakdown(item, ex).totalMin;
    },

    calculateExerciseKcal: (item, ex, { weightKg = null } = {}) => {
        if (!ex || !item) return 0;
        const effectiveWeight = UI.getEffectiveWeightKg(weightKg);
        const met = ex.met || 0;
        if (!met) return 0;

        if (ex.unidad === 'min' && item.tiempoMin) {
            return (met * effectiveWeight / 60) * item.tiempoMin;
        }

        if (ex.unidad === 'rep') {
            const { workMin, restMin, transMin } = UI.getExerciseTimeBreakdown(item, ex);
            const restMet = 1.5;
            const transMet = 2.0;
            const workKcal = (met * effectiveWeight / 60) * workMin;
            const restKcal = (restMet * effectiveWeight / 60) * restMin;
            const transKcal = (transMet * effectiveWeight / 60) * transMin;
            return workKcal + restKcal + transKcal;
        }
        return 0;
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
        const stepsPerMin = cfg.pasosPorMin || 100;
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

        routine.ejercicios.forEach(item => {
            const override = (routineOverrides && routineOverrides[item.ejercicioId]) || {};
            const effectiveItem = { ...item, ...override };
            const ex = exercises[item.ejercicioId];
            if (!ex) return;
            totalEj += 1;
            totalMin += UI.estimateExerciseMinutes(effectiveItem, ex);
            totalKcal += UI.calculateExerciseKcal(effectiveItem, ex, { weightKg });
        });

        return { kcal: totalKcal, min: totalMin, exerciseCount: totalEj };
    },

    groupExercisesByTypeFocus: (routine, exercisesMap, { tipoOrder = null, enfoqueOrder = null } = {}) => {
        if (!routine || !routine.ejercicios) return [];
        const exercises = exercisesMap || (typeof EXERCISES !== 'undefined' ? EXERCISES : {});
        const groups = new Map();

        routine.ejercicios.forEach(item => {
            const ex = exercises[item.ejercicioId];
            if (!ex) return;
            const exerciseType = ex.tipo || 'otros';
            const exerciseFocus = ex.enfoque || 'general';
            const key = `${exerciseType}__${exerciseFocus}`;
            if (!groups.has(key)) groups.set(key, { type: exerciseType, focus: exerciseFocus, items: [] });
            groups.get(key).items.push(item);
        });

        const typeOrder = tipoOrder || ['fuerza', 'cardio', 'recuperacion', 'otros'];
        const focusOrder = enfoqueOrder || ['tren_superior', 'tren_inferior', 'core', 'full_body', 'movilidad', 'recuperacion', 'general'];

        return Array.from(groups.values()).sort((a, b) => {
            const ta = typeOrder.indexOf(a.type);
            const tb = typeOrder.indexOf(b.type);
            if (ta !== tb) return (ta === -1 ? 999 : ta) - (tb === -1 ? 999 : tb);
            const ea = focusOrder.indexOf(a.focus);
            const eb = focusOrder.indexOf(b.focus);
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
        editBtn.innerHTML = isEditMode ? '✅ Listo' : '✏️ Editar';
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


