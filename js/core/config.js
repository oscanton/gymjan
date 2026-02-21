/* =========================================
   core/config.js - GLOBAL CONFIGURATION
   ========================================= */

// Prefix for LocalStorage keys to avoid collisions.
const APP_PREFIX = "myfitpwa_";

// Global constants (single source of truth).
const WEEK_DAYS = ["Lunes", "Martes", "Mi\u00E9rcoles", "Jueves", "Viernes", "S\u00E1bado", "Domingo"];

// Available menu data files.
const AVAILABLE_MENUS = [
    { label: 'menu', file: 'menus/menu.js' },
    { label: 'menu_1', file: 'menus/menu_1.js' },
];

// Available routine data files.
const AVAILABLE_ROUTINE_FILES = [
    'rutinas/rutina_recuperacion.js',
    'rutinas/rutina_fuerza_A.js',
    'rutinas/rutina_fuerza_B.js',
    'rutinas/rutina_fuerza_C.js',
];

const DEFAULT_ROUTINE_ID = 'recuperacion';

// App-level defaults (business rules and baseline targets).
const APP_DEFAULTS = {
    restBmrFactor: 1.2,
    macroRatios: { p: 0.30, c: 0.40, f: 0.30 },
    steps: {
        target: 8000,
        perMinute: 100,
        met: 3.5
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
const APP_SECONDARY_DEFAULTS = (APP_DEFAULTS.secondaryTargets
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.saltMaxG)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.fiberPer1000Kcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.sugarMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.satFatMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.processingMaxScore))
    ? APP_DEFAULTS.secondaryTargets
    : { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };

