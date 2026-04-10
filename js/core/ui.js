const STATUS_CLASSES = { ok: 'text-status--ok', warning: 'text-status--warning', danger: 'text-status--danger', critical: 'color-critical' };
const resolveMaybe = (fn) => (typeof fn === 'function' ? Promise.resolve().then(fn) : Promise.resolve());
const getProfileNumber = (key, fallback) => {
    if (typeof UserStore === 'undefined' || typeof UserStore.getProfile !== 'function') return fallback;
    const value = parseFloat(UserStore.getProfile({})?.[key]);
    return Number.isFinite(value) && value > 0 ? value : fallback;
};
const activityCall = (method, args = [], fallback = null) => (
    typeof ActivityEngine !== 'undefined' && typeof ActivityEngine[method] === 'function'
        ? ActivityEngine[method](...args)
        : fallback
);
const asContext = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});

const UI = {
    isInViews: () => window.location.pathname.includes('/views/'),
    resolvePath: (path) => `${UI.isInViews() ? '../' : ''}${path}`,
    loadScript: (path, id = null) => new Promise((resolve, reject) => {
        if (id) document.getElementById(id)?.remove();
        const script = document.createElement('script');
        if (id) script.id = id;
        script.src = `${UI.resolvePath(path)}?v=${Date.now()}`;
        script.onload = () => resolve(path);
        script.onerror = () => reject(path);
        document.body.appendChild(script);
    }),
    loadDependencies: (deps, { settled = false } = {}) => {
        const loads = (deps || [])
            .filter((dep) => typeof dep.when === 'function' ? dep.when() : dep.when !== false)
            .map(({ path, id }) => UI.loadScript(path, id));
        return settled ? Promise.allSettled(loads) : Promise.all(loads);
    },
    ensureDependencies: (deps, options = {}) => UI.loadDependencies((deps || []).map(({ global, ...dep }) => ({
        ...dep,
        when: () => !global || typeof window[global] === 'undefined'
    })), options),
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
        const context = {};
        return UI.ensureDependencies(requiredDeps)
            .then(() => resolveMaybe(afterRequired).then((value) => Object.assign(context, asContext(value))))
            .then(() => UI.ensureDependencies(optionalDeps, { settled: true }))
            .then(() => resolveMaybe(afterOptional).then((value) => Object.assign(context, asContext(value))))
            .then(() => Promise.resolve(run(root, context)).then(() => true))
            .catch((err) => {
                if (typeof onError === 'function') onError(root, err);
                else UI.showError(root, 'Error cargando dependencias.');
                return false;
            });
    },
    showError: (container, message) => {
        container.innerHTML = `<div class="glass-card card"><p class="text-status--danger">${message}</p></div>`;
    },
    getStatusClass: (current, target) => {
        if (!target) return '';
        const pct = (current / target) * 100;
        return pct > 110 ? STATUS_CLASSES.danger : pct < 90 ? STATUS_CLASSES.warning : STATUS_CLASSES.ok;
    },
    getStatusClassByRule: (current, target, { rule = 'target', tolerancePct = 10 } = {}) => {
        const value = parseFloat(current);
        const goal = parseFloat(target);
        if (!Number.isFinite(value) || !Number.isFinite(goal) || goal <= 0) return '';
        if (rule === 'min') return value >= goal ? STATUS_CLASSES.ok : value >= goal * (1 - tolerancePct / 100) ? STATUS_CLASSES.warning : STATUS_CLASSES.danger;
        if (rule === 'max') return value <= goal ? STATUS_CLASSES.ok : value <= goal * (1 + tolerancePct / 100) ? STATUS_CLASSES.warning : STATUS_CLASSES.danger;
        return UI.getStatusClass(value, goal);
    },
    getStatusClassFromCode: (status) => STATUS_CLASSES[status] || '',
    showModal: ({ id = null, titleHtml = '', bodyHtml = '' } = {}) => {
        (id ? document.getElementById(id) : document.querySelector('.modal-overlay'))?.remove();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        if (id) overlay.id = id;
        overlay.innerHTML = `<div class="modal-content">${titleHtml}${bodyHtml}</div>`;
        const close = () => {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
        };
        const onKey = (event) => event.key === 'Escape' && close();
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        return overlay;
    },
    getTodayIndex: () => DateUtils.getTodayIndex(),
    scrollToTodayColumn: (table, todayIndex) => {
        if (!table?.parentElement) return;
        const [stickyTh, targetTh] = [table.querySelector('thead th'), table.querySelectorAll('thead th')[todayIndex + 1]];
        if (!stickyTh || !targetTh) return;
        table.parentElement.scrollTo({ left: targetTh.offsetLeft - stickyTh.offsetWidth, behavior: 'smooth' });
    },
    formatLabel: (value) => value ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '-',
    formatNumber: (value, decimals = 1) => (Number.isFinite(value) ? value : 0).toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1'),
    formatInt: (value) => `${Math.round(Number.parseFloat(value) || 0)}`,
    formatKcal: (value) => `${UI.formatInt(value)} kcal`,
    formatMl: (value) => `${UI.formatInt(value)} ml`,
    formatGrams: (value, decimals = 0) => `${UI.formatNumber(Number.parseFloat(value) || 0, decimals)} g`,
    formatScore: (value, decimals = 1, max = 10) => `${UI.formatNumber(Number.parseFloat(value) || 0, decimals)}/${max}`,
    escapeHtml: (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),
    encodePayload: (payload) => encodeURIComponent(JSON.stringify(payload || {})),
    decodePayload: (encodedPayload) => {
        try { return JSON.parse(decodeURIComponent(encodedPayload || '')); } catch { return null; }
    },
    formatMinutes: (minutes) => `${Math.round(minutes * 10) / 10}`,
    callActivityEngine: activityCall,
    parseReps: (reps) => activityCall('parseReps', [reps], 0),
    isTimedItem: (item) => activityCall('isTimedItem', [item], false),
    getExerciseTimeBreakdown: (item, ex) => activityCall('getExerciseTimeBreakdown', [item, ex], { workMin: 0, restMin: 0, totalMin: 0 }),
    estimateExerciseMinutes: (item, ex) => activityCall('estimateExerciseMinutes', [item, ex], 0),
    getEstimatedOneRmEpley: (weightKg, reps) => activityCall('getEstimatedOneRmEpley', [weightKg, reps], null),
    calculateEpleyLikeFactor: (value, base, options = {}) => activityCall('calculateEpleyLikeFactor', [value, base, options], 1),
    getIntensityFactorFromEpley: (weightKg, reps, bodyWeightKg = null, relativeLoad = null) => activityCall('getIntensityFactorFromEpley', [weightKg, reps, {
        bodyWeightKg: Number.isFinite(parseFloat(bodyWeightKg)) && bodyWeightKg > 0 ? parseFloat(bodyWeightKg) : UI.getEffectiveWeightKg(),
        relativeLoad
    }], 1),
    getExerciseKcalCoef: (item, ex) => activityCall('getExerciseKcalCoef', [item, ex, { bodyWeightKg: UI.getEffectiveWeightKg() }], 0),
    calculateExerciseKcal: (item, ex, { weightKg = null } = {}) => {
        const effectiveWeight = UI.getEffectiveWeightKg(weightKg);
        return activityCall('calculateExerciseKcal', [item, ex, { weightKg: effectiveWeight, bodyWeightKg: effectiveWeight }], 0);
    },
    getEffectiveWeightKg: (weightKg = null) => (weightKg && weightKg > 0 ? weightKg : getProfileNumber('weight', 70)),
    getUserHeightCm: (heightCm = null) => {
        const direct = parseFloat(heightCm);
        return Number.isFinite(direct) && direct > 0 ? direct : getProfileNumber('height', 0);
    },
    calculateStepsDistanceKm: (steps = 0, { heightCm = null } = {}) => activityCall('calculateStepsDistanceKm', [steps, { heightCm: UI.getUserHeightCm(heightCm) }], 0),
    formatKm: (km) => {
        const value = parseFloat(km);
        if (!Number.isFinite(value) || value <= 0) return '-';
        const rounded = Math.round(value * 10) / 10;
        return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    },
    calculateStepsIntensityFactor: (stepsPerMin = 0, { baseStepsPerMin = 100, a = 1, b = 2 } = {}) => activityCall('calculateStepsIntensityFactor', [stepsPerMin, { baseStepsPerMin, a, b }], 1),
    calculateStepsKcal: (steps = 0, { weightKg = null, stepsConfig = null } = {}) => activityCall('calculateStepsKcal', [steps, {
        weightKg: UI.getEffectiveWeightKg(weightKg),
        stepsConfig
    }], 0),
    calcTrainingTotals: (exerciseBlock, exerciseOverrides, exercisesMap, { weightKg = null } = {}) => {
        const effectiveWeight = UI.getEffectiveWeightKg(weightKg);
        return activityCall('calculateTrainingTotals', [exerciseBlock, exerciseOverrides, exercisesMap || {}, {
            weightKg: effectiveWeight,
            bodyWeightKg: effectiveWeight
        }], { kcal: 0, min: 0, exerciseCount: 0, metAvg: 0, metMinSum: 0, intensityAvg: 0 });
    },
    groupExercisesByTypeFocus: (exerciseBlock, exercisesMap, {
        typeOrder = ['fuerza', 'cardio', 'recuperacion', 'otros'],
        focusOrder = ['tren_superior', 'tren_inferior', 'core', 'full_body', 'movilidad', 'recuperacion', 'general']
    } = {}) => {
        if (!exerciseBlock?.exercises) return [];
        const groups = new Map();
        exerciseBlock.exercises.forEach((item) => {
            const ex = (exercisesMap || {})[item.exerciseId];
            if (!ex) return;
            const type = ex.type || 'otros';
            const focus = ex.focus || 'general';
            const key = `${type}__${focus}`;
            if (!groups.has(key)) groups.set(key, { type, focus, items: [] });
            groups.get(key).items.push(item);
        });
        const getOrder = (list, value) => {
            const index = list.indexOf(value);
            return index === -1 ? 999 : index;
        };
        return [...groups.values()].sort((a, b) => (
            getOrder(typeOrder, a.type) - getOrder(typeOrder, b.type)
            || getOrder(focusOrder, a.focus) - getOrder(focusOrder, b.focus)
            || a.focus.localeCompare(b.focus)
        ));
    },
    renderEditResetControls: ({ id, isEditMode, onToggle, onReset }) => {
        const controls = document.createElement('div');
        controls.id = id;
        controls.className = 'menu-controls';
        [
            { text: isEditMode ? 'Listo' : 'Editar', active: isEditMode, action: onToggle },
            { text: 'Reset', action: onReset }
        ].forEach(({ text, active = false, action }) => {
            const button = document.createElement('button');
            button.className = 'btn-back';
            button.textContent = text;
            button.classList.toggle('btn-back--active', active);
            button.onclick = action;
            controls.appendChild(button);
        });
        return controls;
    }
};

window.UI = UI;
