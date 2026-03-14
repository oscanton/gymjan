/* =========================================
   core/config.js - GLOBAL CONFIGURATION
   ========================================= */

// Prefix for LocalStorage keys to avoid collisions.
const APP_PREFIX = "myfitpwa_";

// Global constants (single source of truth).
const WEEK_DAYS = ["Lunes", "Martes", "Mi\u00E9rcoles", "Jueves", "Viernes", "S\u00E1bado", "Domingo"];
const MEAL_KEYS = ['desayuno', 'comida', 'cena'];

// Available menu data files.
const AVAILABLE_MENUS = [
    { label: 'menu', file: 'menus/menu.js' },
    { label: 'menu_1', file: 'menus/menu_1.js' },
];

// Available routine data files.
const AVAILABLE_ROUTINE_FILES = [
    'rutinas/rutina_recuperacion.js',
    'rutinas/rutina_descanso.js',
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
    routineTimes: {
        segPorRep: 4,
        descansoSeg: 90
    },
    nutritionKeys: {
        primary: ['kcal', 'protein', 'carbs', 'fat'],
        secondary: ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing']
    },
    secondaryTargets: {
        saltMaxG: 5,
        fiberPer1000Kcal: 14,
        sugarMaxPctKcal: 0.10,
        satFatMaxPctKcal: 0.10,
        processingMaxScore: 3.5
    },
    nutritionScore: {
        curve: { c: 5.3, k: 1.5 },
        metrics: {
            kcal: { mode: 'target_asymmetric', belowRatePer10: 0.2, aboveRatePer10: 1.2, cap: 3.0 },
            protein: { mode: 'target_asymmetric', belowRatePer10: 0.8, aboveRatePer10: 0.2, cap: 2.0 },
            carbs: { mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
            fat: { mode: 'target_symmetric', ratePer10: 0.35, cap: 1.0 },
            fiber: { mode: 'min_only', belowRatePer10: 0.8, cap: 2.0 },
            sugar: { mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 },
            saturatedFat: { mode: 'max_only', aboveRatePer10: 1.0, cap: 2.5 },
            salt: { mode: 'max_only', aboveRatePer10: 0.5, cap: 1.5 },
            processing: { mode: 'max_only', aboveRatePer10: 0.6, cap: 1.5 }
        }
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
const ROUTINE_TIME_DEFAULTS = (APP_DEFAULTS.routineTimes
    && Number.isFinite(APP_DEFAULTS.routineTimes.segPorRep)
    && Number.isFinite(APP_DEFAULTS.routineTimes.descansoSeg))
    ? APP_DEFAULTS.routineTimes
    : { segPorRep: 4, descansoSeg: 90 };
const APP_NUTRITION_KEYS = (APP_DEFAULTS.nutritionKeys
    && Array.isArray(APP_DEFAULTS.nutritionKeys.primary)
    && Array.isArray(APP_DEFAULTS.nutritionKeys.secondary))
    ? APP_DEFAULTS.nutritionKeys
    : { primary: ['kcal', 'protein', 'carbs', 'fat'], secondary: ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'] };
const APP_SECONDARY_DEFAULTS = (APP_DEFAULTS.secondaryTargets
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.saltMaxG)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.fiberPer1000Kcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.sugarMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.satFatMaxPctKcal)
    && Number.isFinite(APP_DEFAULTS.secondaryTargets.processingMaxScore))
    ? APP_DEFAULTS.secondaryTargets
    : { saltMaxG: 5, fiberPer1000Kcal: 14, sugarMaxPctKcal: 0.10, satFatMaxPctKcal: 0.10, processingMaxScore: 3.5 };

