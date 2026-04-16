export const APP_ID = "gymjan";
export const APP_VERSION = "mvp.v1";
export const STORAGE_PREFIX = `${APP_ID}.${APP_VERSION}`;

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
export const ENABLE_DEBUG_PANEL = false;
