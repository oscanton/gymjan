/* =========================================
   core/adapters/browser.adapter.js - CORE LOADERS (BROWSER)
   ========================================= */

const CoreBrowserAdapter = (() => {
    const loadEngines = () => UI.loadDependencies([
        { when: () => typeof FormulasEngine === 'undefined', path: 'js/core/engine/formulas.engine.js' },
        { when: () => typeof TargetsEngine === 'undefined', path: 'js/core/engine/targets.engine.js' },
        { when: () => typeof NutritionScoreEngine === 'undefined', path: 'js/core/engine/nutrition-score.engine.js' }
    ]);

    const loadLegacyWrappers = () => UI.loadDependencies([
        { when: () => typeof Formulas === 'undefined', path: 'js/core/legacy/formulas.js' },
        { when: () => typeof Targets === 'undefined', path: 'js/core/legacy/targets.js' },
        { when: () => typeof NutritionScore === 'undefined', path: 'js/core/legacy/nutrition-score.js' }
    ]);

    const loadDomain = () => UI.loadDependencies([
        { when: () => typeof CoreBrowserDomain === 'undefined', path: 'js/core/adapters/browser.domain.js' }
    ]);

    const ensureCore = () => loadEngines().then(() => loadLegacyWrappers());

    const ensureCoreDomain = () => loadDomain().then(() => loadEngines());

    const loadFoods = () => UI.loadDependencies([
        { when: () => typeof FOODS === 'undefined', path: 'js/data/foods.js' }
    ]);

    const loadExercises = () => UI.loadDependencies([
        { when: () => typeof EXERCISES === 'undefined', path: 'js/data/exercises.js' }
    ]);

    const loadMenuFile = (menuFile, { id = 'dynamic-menu-data', alwaysReload = true } = {}) => {
        if (!menuFile) return Promise.resolve();
        if (alwaysReload) {
            return UI.loadScript(`js/data/${menuFile}`, id);
        }
        return UI.loadDependencies([{ when: true, path: `js/data/${menuFile}`, id }]);
    };

    return {
        loadEngines,
        loadLegacyWrappers,
        loadDomain,
        ensureCore,
        ensureCoreDomain,
        loadFoods,
        loadExercises,
        loadMenuFile
    };
})();

window.CoreBrowserAdapter = CoreBrowserAdapter;
