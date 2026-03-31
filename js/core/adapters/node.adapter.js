/* =========================================
   core/adapters/node.adapter.js - CORE LOADERS (NODE)
   ========================================= */

const CoreNodeAdapter = (() => {
    const resolveEngines = (engines = {}) => {
        const ctx = engines && Object.keys(engines).length ? engines : (typeof globalThis !== 'undefined' ? globalThis : {});
        const FormulasEngine = ctx.FormulasEngine;
        const TargetsEngine = ctx.TargetsEngine;
        const NutritionScoreEngine = ctx.NutritionScoreEngine;

        if (!FormulasEngine || !TargetsEngine || !NutritionScoreEngine) {
            throw new Error('Missing core engines. Provide { FormulasEngine, TargetsEngine, NutritionScoreEngine }.');
        }
        return { FormulasEngine, TargetsEngine, NutritionScoreEngine };
    };

    const createCore = ({ engines = null, config = null } = {}) => {
        const resolved = resolveEngines(engines || {});
        if (config && config.macroRatios && resolved.FormulasEngine.setDefaultMacroRatios) {
            resolved.FormulasEngine.setDefaultMacroRatios(config.macroRatios);
        }
        return resolved;
    };

    return { createCore };
})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreNodeAdapter;
}

if (typeof globalThis !== 'undefined') {
    globalThis.CoreNodeAdapter = CoreNodeAdapter;
}
