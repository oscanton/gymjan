const CoreBrowserDomain = (() => {
    const methods = [
        'getDefaultMacroRatios',
        'normalizeMacroRatios',
        'getUserMacroRatios',
        'getDailyMacroRatios',
        'getSecondaryDefaults',
        'getSecondaryAdjustments',
        'getHydrationDefaults',
        'getHydrationAdjustments',
        'calcSecondaryTargetsForKcal',
        'getMacroContext',
        'calcAdjustedValues',
        'computeDailyTargets',
        'ensureDailyTargets',
        'applyMacroDefaults'
    ];
    const getService = () => (typeof TargetsApplicationService !== 'undefined' ? TargetsApplicationService : null);
    return Object.fromEntries(methods.map((method) => [method, (...args) => getService()?.[method]?.(...args) ?? null]));
})();

window.CoreBrowserDomain = CoreBrowserDomain;
