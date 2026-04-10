/* =========================================
   core/adapters/data.registry.js - STATIC DATA REGISTRY
   ========================================= */

const CoreDataRegistry = (() => {
    const menuPlans = new Map();
    const activityPlans = new Map();
    const staticData = new Map();

    const clone = (data) => {
        if (data === null || typeof data === 'undefined') return data;
        if (typeof data !== 'object') return data;
        return JSON.parse(JSON.stringify(data));
    };

    const register = (store, key, data) => {
        if (!key || data === null || typeof data === 'undefined') return null;
        if (typeof data !== 'object') return null;
        const snapshot = clone(data);
        store.set(key, snapshot);
        return clone(snapshot);
    };

    const read = (store, key) => {
        if (!key || !store.has(key)) return null;
        return clone(store.get(key));
    };

    return {
        registerMenuPlan: (key, data) => register(menuPlans, key, data),
        getMenuPlan: (key) => read(menuPlans, key),
        registerActivityPlan: (key, data) => register(activityPlans, key, data),
        getActivityPlan: (key) => read(activityPlans, key),
        registerStaticData: (key, data) => register(staticData, key, data),
        getStaticData: (key) => read(staticData, key)
    };
})();

window.CoreDataRegistry = CoreDataRegistry;
