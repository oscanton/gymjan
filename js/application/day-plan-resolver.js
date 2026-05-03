import {
  buildDayActivityFromTemplate,
  buildDayNutritionFromTemplate,
  normalizeDayActivityInput,
  normalizeDayNutritionInput,
} from "../domain/domain-contracts.js";
import { MENU_TEMPLATE_BY_ID } from "../catalog/menu-templates/menu-template-catalog.js";
import {
  PROFILE_BY_ID,
  PROFILES_DB,
} from "../catalog/profile-presets/profile-preset-catalog.js";
import {
  LEGACY_ROUTINE_TEMPLATE_ID_MAP,
  ROUTINE_TEMPLATE_BY_ID,
} from "../catalog/routine-templates/routine-template-catalog.js";
import { DAY_KEYS, MEAL_KEYS } from "../shared/app-constants.js";
import { clone } from "../shared/object-utils.js";

function getPayloadDayEntries(payload = {}) {
  return payload.dayKey ? [[payload.dayKey, payload]] : Object.entries(payload);
}

export function forEachValidDayEntry(payload, callback) {
  for (const [dayKey, source] of getPayloadDayEntries(payload)) {
    if (!DAY_KEYS.includes(dayKey) || !source || typeof source !== "object") {
      continue;
    }

    callback(dayKey, source);
  }
}

function getNutritionBlocks(nutritionInput, mealKey) {
  return mealKey === "hydration"
    ? [{ items: nutritionInput.meals.hydration.items }]
    : nutritionInput.meals[mealKey];
}

export function forEachNutritionItem(nutritionInput, callback) {
  for (const mealKey of MEAL_KEYS) {
    const blocks = getNutritionBlocks(nutritionInput, mealKey);

    blocks.forEach((block, blockIndex) => {
      (block.items ?? []).forEach((item, itemIndex) => {
        callback(item, { mealKey, blockIndex, itemIndex });
      });
    });
  }
}

export function createSelectionUpdate(currentSelection, payload) {
  const nextSelection = clone(currentSelection);
  forEachValidDayEntry(payload, (dayKey, source) => {
    nextSelection[dayKey] = {
      menuTemplateId:
        Object.prototype.hasOwnProperty.call(source, "menuTemplateId")
          ? source.menuTemplateId
          : nextSelection[dayKey].menuTemplateId,
      routineTemplateId:
        Object.prototype.hasOwnProperty.call(source, "routineTemplateId")
          ? source.routineTemplateId
          : nextSelection[dayKey].routineTemplateId,
    };
  });

  return nextSelection;
}

export function createDayPlanResolver(state) {
  function resolveRoutineTemplateId(routineTemplateId) {
    if (!routineTemplateId) {
      return null;
    }

    return LEGACY_ROUTINE_TEMPLATE_ID_MAP[routineTemplateId] ?? routineTemplateId;
  }

  function getResolvedProfileRecord() {
    return PROFILE_BY_ID[state.userContext.profileId] ?? PROFILES_DB[0];
  }

  function getDayPlan(dayKey) {
    const profile = getResolvedProfileRecord();
    const basePlan = profile.weeklyPlan?.[dayKey] ?? {};
    const selection = state.dayTemplateSelection?.[dayKey] ?? {};
    const menuTemplateId = selection.menuTemplateId ?? basePlan.menuTemplateId ?? null;
    const routineTemplateId = resolveRoutineTemplateId(
      selection.routineTemplateId ?? basePlan.routineTemplateId ?? null,
    );

    return {
      dayKey,
      menuTemplateId,
      routineTemplateId,
      targetTuning: basePlan.targetTuning ?? profile.fallbackTargetTuning,
      menuTemplate: menuTemplateId ? MENU_TEMPLATE_BY_ID[menuTemplateId] : null,
      routineTemplate: routineTemplateId
        ? ROUTINE_TEMPLATE_BY_ID[routineTemplateId]
        : null,
      profile,
    };
  }

  function getBaseDayActivity(dayKey) {
    return buildDayActivityFromTemplate(dayKey, getDayPlan(dayKey).routineTemplate);
  }

  function getBaseDayNutrition(dayKey) {
    return buildDayNutritionFromTemplate(dayKey, getDayPlan(dayKey).menuTemplate);
  }

  function getEditableDayActivity(dayKey) {
    return state.dayActivity[dayKey]
      ? normalizeDayActivityInput(dayKey, state.dayActivity[dayKey])
      : getBaseDayActivity(dayKey);
  }

  function getEditableDayNutrition(dayKey) {
    return state.dayNutrition[dayKey]
      ? normalizeDayNutritionInput(dayKey, state.dayNutrition[dayKey])
      : getBaseDayNutrition(dayKey);
  }

  function createSelectionSnapshot(dayPlan) {
    return {
      menuTemplateId: dayPlan.menuTemplateId,
      routineTemplateId: dayPlan.routineTemplateId,
    };
  }

  function createDayInputSnapshot(dayKey, dayPlan, activity, nutrition) {
    return {
      dayKey,
      userContext: clone(state.userContext),
      targetAdjustments: clone(state.userTargetAdjustments),
      selection: createSelectionSnapshot(dayPlan),
      activity: clone(activity),
      nutrition: clone(nutrition),
    };
  }

  return {
    getResolvedProfileRecord,
    getDayPlan,
    getBaseDayActivity,
    getBaseDayNutrition,
    getEditableDayActivity,
    getEditableDayNutrition,
    createSelectionSnapshot,
    createDayInputSnapshot,
  };
}
