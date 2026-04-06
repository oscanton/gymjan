/* =========================================
   core/config.js - GLOBAL CONFIGURATION
   ========================================= */

// Prefix for LocalStorage keys to avoid collisions.
const APP_PREFIX = "myfitpwa_";

// Global constants (single source of truth).
const WEEK_DAYS = ["Lunes", "Martes", "Mi\u00E9rcoles", "Jueves", "Viernes", "S\u00E1bado", "Domingo"];
const MEAL_KEYS = ['breakfast', 'lunch', 'dinner'];

// Available menu data files.
const AVAILABLE_MENUS = [
    { label: 'default', file: 'menus/week_menu_default.js' },
    { label: 'weightloss', file: 'menus/week_menu_weightloss.js' },
];

// Available activity plan files (weekly).
const AVAILABLE_ACTIVITY_PLAN_FILES = [
    { label: 'default', file: 'activity/week_activity_default.js' }
];

const DEFAULT_ACTIVITY_PLAN_FILE = 'activity/week_activity_default.js';

// App-level defaults (business rules and baseline targets).
const APP_DEFAULTS = {
    restBmrFactor: 1.2,
    macroRatios: { p: 0.30, c: 0.40, f: 0.30 },
    steps: {
        target: 8000,
        perMinute: 100,
        met: 3.5
    },
    hydration: {
        minMlPerKg: 30,
        maxMlPerKg: 35,
        activityMlPerMin: 10
    },
    secondaryTargets: {
        saltMaxG: 5,
        fiberPer1000Kcal: 14,
        sugarMaxPctKcal: 0.10,
        satFatMaxPctKcal: 0.10,
        processingMaxScore: 3.5
    }
};

// Derived constants to avoid repeating fallback logic across modules.
const DAYS_COUNT = (Array.isArray(WEEK_DAYS) && WEEK_DAYS.length) ? WEEK_DAYS.length : 7;
const APP_REST_BMR_FACTOR = Number.isFinite(APP_DEFAULTS.restBmrFactor) ? APP_DEFAULTS.restBmrFactor : 1.2;
const APP_MACRO_RATIOS = (APP_DEFAULTS.macroRatios && Number.isFinite(APP_DEFAULTS.macroRatios.p) && Number.isFinite(APP_DEFAULTS.macroRatios.c) && Number.isFinite(APP_DEFAULTS.macroRatios.f))
    ? APP_DEFAULTS.macroRatios
    : { p: 0.30, c: 0.40, f: 0.30 };
const APP_STEPS_DEFAULTS = (APP_DEFAULTS.steps && Number.isFinite(APP_DEFAULTS.steps.target) && Number.isFinite(APP_DEFAULTS.steps.perMinute) && Number.isFinite(APP_DEFAULTS.steps.met))
    ? APP_DEFAULTS.steps
    : { target: 8000, perMinute: 100, met: 3.5 };
const APP_HYDRATION_DEFAULTS = (APP_DEFAULTS.hydration
    && Number.isFinite(APP_DEFAULTS.hydration.minMlPerKg)
    && Number.isFinite(APP_DEFAULTS.hydration.maxMlPerKg)
    && Number.isFinite(APP_DEFAULTS.hydration.activityMlPerMin))
    ? APP_DEFAULTS.hydration
    : { minMlPerKg: 30, maxMlPerKg: 35, activityMlPerMin: 10 };
const APP_SECONDARY_DEFAULTS = (APP_DEFAULTS.secondaryTargets
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.saltMaxG)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.fiberPer1000Kcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.sugarMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.satFatMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.processingMaxScore))
    ? APP_DEFAULTS.secondaryTargets
    : { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };


