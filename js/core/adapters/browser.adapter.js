const CoreBrowserAdapter = (() => {
    const SCRIPT_IDS = { menu: 'dynamic-menu-data', activity: 'activity-plan-' };
    const DATA_PATHS = { foods: 'js/data/foods.js', exercises: 'js/data/exercises.js' };
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
    const ensureRegistry = () => loadDeps([{ when: () => typeof window.CoreDataRegistry === 'undefined', path: 'js/core/adapters/data.registry.js' }]);
    const ensureCoreDomain = () => loadDeps(CORE_ENGINE_DEPS.map(([global, path]) => ({
        when: () => typeof window[global] === 'undefined',
        path
    }))).then(() => loadDeps([{ when: () => typeof CoreBrowserDomain === 'undefined', path: 'js/core/adapters/browser.domain.js' }]));
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

    const resolvePlanData = ({
        file,
        type,
        registryMethod,
        store,
        savedMethod,
        normalizeMethod,
        preferSaved = true,
        alwaysReload = true
    }) => {
        const cache = caches[type];
        const normalizer = store?.[normalizeMethod];
        if (!alwaysReload) {
            const cached = fromCache(cache, file, normalizer);
            if (cached) return Promise.resolve(cached);
        }
        const loadId = type === 'menu' ? SCRIPT_IDS.menu : `${SCRIPT_IDS.activity}${safeId(file)}`;
        return ensureRegistry()
            .then(() => file ? loadScriptFile(`js/data/${file}`, loadId, alwaysReload) : null)
            .then(() => {
                const saved = preferSaved && store?.[savedMethod]?.(file);
                if (saved) return cacheData(cache, file, saved, normalizer);
                const data = registry()?.[registryMethod]?.(file) || null;
                return Array.isArray(data) ? cacheData(cache, file, data, normalizer) : fromCache(cache, file, normalizer);
            });
    };

    const resolveMenuData = (menuFile, options = {}) => resolvePlanData({
        file: menuFile,
        type: 'menu',
        registryMethod: 'getMenuPlan',
        store: typeof MenuStore !== 'undefined' ? MenuStore : null,
        savedMethod: 'getSavedMenuData',
        normalizeMethod: 'normalizeMenuData',
        ...options
    });

    const resolveActivityPlanData = (activityPlanFile, options = {}) => resolvePlanData({
        file: activityPlanFile,
        type: 'activity',
        registryMethod: 'getActivityPlan',
        store: typeof ActivityStore !== 'undefined' ? ActivityStore : null,
        savedMethod: 'getSavedPlanData',
        normalizeMethod: 'normalizeActivityData',
        ...options
    });

    const resolvePageContext = ({
        requiredDeps = [],
        settled = false,
        globals = [],
        includeNutritionScore = false,
        foods = false,
        exercises = false,
        menuFile = null,
        activityPlanFile = null,
        applyMacroDefaults = true
    } = {}) => {
        const context = {};
        const tasks = [];
        const deps = Array.isArray(requiredDeps) && requiredDeps.length ? loadDeps(requiredDeps, { settled }) : Promise.resolve();
        return deps.then(ensureCoreDomain).then(() => {
            context.formulas = win('FormulasEngine');
            context.targets = win('TargetsEngine');
            context.browserDomain = win('CoreBrowserDomain');
            context.nutritionScore = includeNutritionScore ? win('NutritionScoreEngine') : null;
            if (!context.formulas || !context.targets) return Promise.reject('Core engines unavailable');
            if (includeNutritionScore && !context.nutritionScore) return Promise.reject('NutritionScoreEngine unavailable');
            if (applyMacroDefaults) context.browserDomain?.applyMacroDefaults?.(context.formulas);

            const missing = (globals || []).filter((name) => !(context[name] = win(name)));
            if (missing.length) return Promise.reject(`Missing globals: ${missing.join(', ')}`);

            if (foods) tasks.push(resolveStaticData('foods').then((data) => { context.foodsData = data || null; }));
            if (exercises) tasks.push(resolveStaticData('exercises').then((data) => { context.exercisesData = data || null; }));
            if (menuFile) tasks.push(resolveMenuData(menuFile).then((data) => { context.menuData = Array.isArray(data) ? data : null; }));
            if (activityPlanFile) tasks.push(resolveActivityPlanData(activityPlanFile).then((data) => { context.activityPlanData = Array.isArray(data) ? data : null; }));
            return Promise.all(tasks).then(() => context);
        });
    };

    const resetApplicationState = ({
        confirmReset = true,
        confirmMessage = 'Borrar todos los datos de la aplicaci\u00F3n?',
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
