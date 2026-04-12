const CoreBrowserAdapter = (() => {
    const SCRIPT_IDS = { menu: 'dynamic-menu-data', activity: 'activity-plan-' };
    const DATA_PATHS = { foods: 'js/data/foods.js', exercises: 'js/data/exercises.js' };
    const ADAPTER_DEPS = {
        persistence: { when: () => typeof window.PersistenceAdapter === 'undefined', path: 'js/core/adapters/persistence.adapter.js' }
    };
    const CORE_ENGINE_DEPS = [
        ['MetricsRegistry', 'js/core/engine/metrics.registry.js'],
        ['FormulasEngine', 'js/core/engine/formulas.engine.js'],
        ['TargetsEngine', 'js/core/engine/targets.engine.js'],
        ['NutritionScoreEngine', 'js/core/engine/nutrition-score.engine.js'],
        ['DayContracts', 'js/core/engine/day-contracts.js'],
        ['ActivityEngine', 'js/core/engine/activity.engine.js'],
        ['DayAssessmentEngine', 'js/core/engine/day-assessment.engine.js']
    ];
    const caches = { menu: new Map(), activity: new Map(), static: new Map() };

    const safeId = (value) => String(value || '').replace(/[^a-z0-9_-]/gi, '_');
    const win = (name) => window[name] || null;
    const registry = () => win('CoreDataRegistry');
    const persistence = () => win('PersistenceAdapter');
    const removeScript = (id) => id && document.getElementById(id)?.remove();
    const normalize = (data, method = null) => typeof method === 'function' ? method(data) : data;
    const cacheData = (cache, key, data, method = null) => {
        if (!key || !data || typeof data !== 'object') return null;
        const value = normalize(data, method);
        cache.set(key, value);
        return value;
    };
    const fromCache = (cache, key, method = null) => key && cache.has(key) ? normalize(cache.get(key), method) : null;
    const loadDeps = (deps, options = {}) => UI.loadDependencies(deps, options);
    const ensurePersistence = () => loadDeps([ADAPTER_DEPS.persistence]);
    const ensureRegistry = () => loadDeps([{ when: () => typeof window.CoreDataRegistry === 'undefined', path: 'js/core/adapters/data.registry.js' }]);
    const ensureCoreDomain = () => loadDeps(CORE_ENGINE_DEPS.map(([global, path]) => ({
        when: () => typeof window[global] === 'undefined',
        path
    })));
    const loadScriptFile = (path, id, alwaysReload = true) => (
        alwaysReload ? (removeScript(id), UI.loadScript(path, id)) : loadDeps([{ when: true, path, id }])
    );

    const clearLoadedData = ({ menu = false, activity = false } = {}) => {
        if (menu) {
            caches.menu.clear();
            removeScript(SCRIPT_IDS.menu);
        }
        if (activity) {
            caches.activity.clear();
            document.querySelectorAll(`script[id^="${SCRIPT_IDS.activity}"]`).forEach((node) => node.remove());
        }
    };

    const resolveStaticData = (key, { alwaysReload = false } = {}) => {
        if (!alwaysReload) {
            const cached = fromCache(caches.static, key);
            if (cached) return Promise.resolve(cached);
        }
        return ensureRegistry()
            .then(() => loadDeps([{ when: () => alwaysReload || !caches.static.has(key), path: DATA_PATHS[key] }]))
            .then(() => {
                const data = registry()?.getStaticData?.(key) || null;
                return data ? cacheData(caches.static, key, data) : null;
            });
    };

    const PLAN_CONFIGS = {
        menu: {
            registryMethod: 'getMenuPlan',
            selectedFileMethod: 'getSelectedMenuFile',
            savedDataMethod: 'getSavedMenuData',
            normalizeMethod: 'normalizeMenuData'
        },
        activity: {
            registryMethod: 'getActivityPlan',
            selectedFileMethod: 'getSelectedActivityFile',
            savedDataMethod: 'getSavedActivityPlan',
            normalizeMethod: 'normalizeActivityPlan'
        }
    };
    const resolvePlanData = ({
        file,
        type,
        preferSaved = true,
        alwaysReload = true
    }) => {
        const config = PLAN_CONFIGS[type];
        const cache = caches[type];
        return ensurePersistence()
            .then(() => {
                const resolvedFile = file || persistence()?.[config.selectedFileMethod]?.() || null;
                const normalizer = (value) => persistence()?.[config.normalizeMethod]?.(value) || value;
                if (!alwaysReload) {
                    const cached = fromCache(cache, resolvedFile, normalizer);
                    if (cached) return cached;
                }
                const loadId = type === 'menu' ? SCRIPT_IDS.menu : `${SCRIPT_IDS.activity}${safeId(resolvedFile)}`;
                return ensureRegistry()
                    .then(() => resolvedFile ? loadScriptFile(`js/data/${resolvedFile}`, loadId, alwaysReload) : null)
                    .then(() => {
                        const saved = preferSaved ? persistence()?.[config.savedDataMethod]?.(resolvedFile) : null;
                        if (saved) return cacheData(cache, resolvedFile, saved, normalizer);
                        const data = registry()?.[config.registryMethod]?.(resolvedFile) || null;
                        return Array.isArray(data) ? cacheData(cache, resolvedFile, data, normalizer) : fromCache(cache, resolvedFile, normalizer);
                    });
            });
    };

    const resolveMenuData = (menuFile = null, options = {}) => resolvePlanData({ file: menuFile, type: 'menu', ...options });

    const resolveActivityPlanData = (activityPlanFile = null, options = {}) => resolvePlanData({ file: activityPlanFile, type: 'activity', ...options });

    const resolvePageContext = ({
        requiredDeps = [],
        settled = false,
        globals = [],
        includeNutritionScore = false,
        foods = false,
        exercises = false,
        menuFile = null,
        activityPlanFile = null,
        selectedMenuData = false,
        selectedActivityPlanData = false,
        applyMacroDefaults = true
    } = {}) => {
        const context = {};
        const tasks = [];
        const deps = Array.isArray(requiredDeps) ? [...requiredDeps, ADAPTER_DEPS.persistence] : [ADAPTER_DEPS.persistence];
        const loadRequiredDeps = deps.length ? loadDeps(deps, { settled }) : Promise.resolve();
        return loadRequiredDeps.then(ensureCoreDomain).then(() => {
            context.formulas = win('FormulasEngine');
            context.targets = win('TargetsEngine');
            context.nutritionScore = includeNutritionScore ? win('NutritionScoreEngine') : null;
            if (!context.formulas || !context.targets) return Promise.reject('Core engines unavailable');
            if (includeNutritionScore && !context.nutritionScore) return Promise.reject('NutritionScoreEngine unavailable');
            if (applyMacroDefaults) win('TargetsApplicationService')?.applyMacroDefaults?.(context.formulas);

            const missing = (globals || []).filter((name) => !(context[name] = win(name)));
            if (missing.length) return Promise.reject(`Missing globals: ${missing.join(', ')}`);

            if (foods) tasks.push(resolveStaticData('foods').then((data) => { context.foodsData = data || null; }));
            if (exercises) tasks.push(resolveStaticData('exercises').then((data) => { context.exercisesData = data || null; }));
            if (menuFile || selectedMenuData) tasks.push(resolveMenuData(menuFile).then((data) => { context.menuData = Array.isArray(data) ? data : null; }));
            if (activityPlanFile || selectedActivityPlanData) tasks.push(resolveActivityPlanData(activityPlanFile).then((data) => { context.activityPlanData = Array.isArray(data) ? data : null; }));
            return Promise.all(tasks).then(() => context);
        });
    };

    const resetApplicationState = ({
        confirmReset = true,
        confirmMessage = null,
        reload = true
    } = {}) => {
        clearLoadedData({ menu: true, activity: true });
        return typeof DB !== 'undefined' && typeof DB.clearAll === 'function'
            ? DB.clearAll({ confirmReset, confirmMessage, reload })
            : false;
    };

    return {
        clearLoadedData,
        resolveMenuData,
        resolveActivityPlanData,
        resolvePageContext,
        resetApplicationState
    };
})();

window.CoreBrowserAdapter = CoreBrowserAdapter;
