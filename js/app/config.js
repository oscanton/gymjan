export const APP_ID = "gymjan";
export const APP_VERSION = "mvp.v1";
export const STORAGE_PREFIX = `${APP_ID}.${APP_VERSION}`;

export const LOCALES = ["es", "en"];
export const DEFAULT_LOCALE = "es";

export const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];
export const MEAL_KEYS = ["hydration", "breakfast", "lunch", "dinner"];

export const STORAGE_KEYS = {
  userContext: `${STORAGE_PREFIX}.user_context`,
  userTargetAdjustments: `${STORAGE_PREFIX}.user_target_adjustments`,
  dayTemplateSelection: `${STORAGE_PREFIX}.day_template_selection`,
  customFoods: `${STORAGE_PREFIX}.custom_foods`,
  foodEquivalences: `${STORAGE_PREFIX}.food_equivalences`,
  shoppingState: `${STORAGE_PREFIX}.shopping_state`,
  dayActivity(dayKey) {
    return `${STORAGE_PREFIX}.day_activity.${dayKey}`;
  },
  dayNutrition(dayKey) {
    return `${STORAGE_PREFIX}.day_nutrition.${dayKey}`;
  },
};

export const DEFAULT_STEPS_MET = 3.5;
export const DEFAULT_STEPS_CADENCE = 100;
export const DEFAULT_STRENGTH_SEC_PER_REP = 4;
export const DEFAULT_STRENGTH_REST_SEC = 90;
export const ENABLE_DEBUG_PANEL = false;

export const SCORE_TARGETS = {
  met: 5,
  intensity: 1.0,
};
