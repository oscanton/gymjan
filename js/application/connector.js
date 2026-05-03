import { STORAGE_KEYS } from "./application-config.js";
import { createLocalStorageGateway } from "./local-storage-gateway.js";
import {
  createCommandResponse,
  createEmptyDayTemplateSelection,
  normalizeCustomFood,
  normalizeDayActivityInput,
  normalizeDayNutritionInput,
  normalizeFoodEquivalence,
  normalizeUserContext,
  normalizeUserTargetAdjustments,
} from "../domain/domain-contracts.js";
import { EXERCISES_DB } from "../catalog/exercise-catalog.js";
import { FOOD_BY_ID, FOODS_DB } from "../catalog/food-catalog.js";
import { MENUS_DB } from "../catalog/menu-templates/menu-template-catalog.js";
import {
  PROFILE_BY_ID,
  PROFILES_DB,
} from "../catalog/profile-presets/profile-preset-catalog.js";
import { ROUTINES_DB } from "../catalog/routine-templates/routine-template-catalog.js";
import { DAY_KEYS, DEFAULT_LOCALE, LOCALES } from "../shared/app-constants.js";
import { createLookup } from "../shared/collection-utils.js";
import { uniqueId } from "../shared/id-utils.js";
import { clone } from "../shared/object-utils.js";
import {
  createDayPlanResolver,
  createSelectionUpdate,
  forEachValidDayEntry,
} from "./day-plan-resolver.js";
import { createAppReadModels } from "./read-models.js";
import {
  getDefaultShoppingState,
  loadSnapshot,
  persistState,
} from "./state-repository.js";
import { createInputValidation, createMessage } from "./input-validation.js";

function upsertById(items, nextItem, key = "id") {
  return [...items.filter((item) => item[key] !== nextItem[key]), nextItem];
}

export function createConnector(options = {}) {
  const storage = createLocalStorageGateway(options);
  const storageKeys = options.storageKeys ?? STORAGE_KEYS;

  let state = loadSnapshot(storage, storageKeys);
  const staticReferenceData = Object.freeze({
    locales: LOCALES,
    dayKeys: DAY_KEYS,
    exercises: EXERCISES_DB,
    profiles: PROFILES_DB,
    menus: MENUS_DB,
    routines: ROUTINES_DB,
  });
  const dayPlanResolver = createDayPlanResolver(state);

  function getFoodsById() {
    return {
      ...FOOD_BY_ID,
      ...createLookup(state.customFoods),
    };
  }

  const validators = createInputValidation({
    state,
    getEditableDayActivity: dayPlanResolver.getEditableDayActivity,
    getEditableDayNutrition: dayPlanResolver.getEditableDayNutrition,
    getFoodsById,
  });
  const readModels = createAppReadModels({
    state,
    staticReferenceData,
    foodsDb: FOODS_DB,
    getFoodsById,
    getResolvedProfileRecord: dayPlanResolver.getResolvedProfileRecord,
    getDayPlan: dayPlanResolver.getDayPlan,
    getBaseDayActivity: dayPlanResolver.getBaseDayActivity,
    getEditableDayActivity: dayPlanResolver.getEditableDayActivity,
    getEditableDayNutrition: dayPlanResolver.getEditableDayNutrition,
    createSelectionSnapshot: dayPlanResolver.createSelectionSnapshot,
    createDayInputSnapshot: dayPlanResolver.createDayInputSnapshot,
    aggregateValidation: validators.aggregateValidation,
  });

  function saveAndRespond(errors = [], warnings = []) {
    persistState(storage, storageKeys, state);
    return createCommandResponse(errors, warnings, true);
  }

  return {
    saveUserContext(payload) {
      const merged = normalizeUserContext({
        ...state.userContext,
        ...payload,
        user: {
          ...state.userContext.user,
          ...(payload.user ?? {}),
        },
      });

      if (payload.profileId && !payload.user?.sex && PROFILE_BY_ID[payload.profileId]) {
        merged.user.sex = PROFILE_BY_ID[payload.profileId].userPreset.sex;
      }

      state.userContext = merged;
      const validation = validators.validateUserContext(state.userContext);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveUserTargetAdjustments(payload) {
      state.userTargetAdjustments = normalizeUserTargetAdjustments({
        ...state.userTargetAdjustments,
        ...payload,
      });
      const validation = validators.validateTargetAdjustments(
        state.userTargetAdjustments,
      );
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveDayTemplateSelection(payload) {
      const previousSelection = clone(state.dayTemplateSelection);
      state.dayTemplateSelection = createSelectionUpdate(state.dayTemplateSelection, payload);
      forEachValidDayEntry(payload, (dayKey, source) => {
        if (Object.prototype.hasOwnProperty.call(source, "menuTemplateId")) {
          state.dayNutrition[dayKey] = dayPlanResolver.getBaseDayNutrition(dayKey);
        }

        if (Object.prototype.hasOwnProperty.call(source, "routineTemplateId")) {
          state.dayActivity[dayKey] = dayPlanResolver.getBaseDayActivity(dayKey);
        }
      });

      const changedDays = DAY_KEYS.filter(
        (dayKey) =>
          JSON.stringify(previousSelection[dayKey]) !==
          JSON.stringify(state.dayTemplateSelection[dayKey]),
      );

      return saveAndRespond(
        [],
        changedDays.length ? [] : [createMessage("no_selection_change", "dayTemplateSelection", "warnings.no_selection_change")],
      );
    },
    saveDayActivity(dayKey, payload) {
      state.dayActivity[dayKey] = normalizeDayActivityInput(dayKey, payload);
      const validation = validators.validateActivityInput(state.dayActivity[dayKey]);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveDayNutrition(dayKey, payload) {
      state.dayNutrition[dayKey] = normalizeDayNutritionInput(dayKey, payload);
      const validation = validators.validateNutritionInput(state.dayNutrition[dayKey]);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveCustomFood(payload) {
      const normalized = normalizeCustomFood({
        ...payload,
        id: payload.id ?? uniqueId("custom"),
      });
      state.customFoods = upsertById(state.customFoods, normalized);
      return saveAndRespond();
    },
    saveFoodEquivalence(payload) {
      const normalized = normalizeFoodEquivalence({
        ...payload,
        id: payload.id ?? uniqueId("eq"),
      });
      state.foodEquivalences = upsertById(state.foodEquivalences, normalized);
      const warnings =
        normalized.basis !== "kcal"
          ? [
              createMessage(
                "unresolved_equivalence_basis",
                "foodEquivalences",
                "warnings.unresolved_equivalence_basis",
              ),
            ]
          : [];
      return saveAndRespond([], warnings);
    },
    setLocale(locale) {
      state.userContext.locale = LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
      return saveAndRespond();
    },
    resetDay(dayKey) {
      state.dayActivity[dayKey] = null;
      state.dayNutrition[dayKey] = null;
      return saveAndRespond();
    },
    resetWeekEditableState() {
      state.dayTemplateSelection = createEmptyDayTemplateSelection();
      state.shoppingState = getDefaultShoppingState();

      for (const dayKey of DAY_KEYS) {
        state.dayActivity[dayKey] = null;
        state.dayNutrition[dayKey] = null;
      }

      return saveAndRespond();
    },
    toggleShoppingItem(itemId, checked) {
      const checkedItemIds = new Set(state.shoppingState.checkedItemIds);

      if (checked) {
        checkedItemIds.add(itemId);
      } else {
        checkedItemIds.delete(itemId);
      }

      state.shoppingState = {
        ...state.shoppingState,
        checkedItemIds: [...checkedItemIds],
      };
      return saveAndRespond();
    },
    saveShoppingCustomItem(payload) {
      const item = {
        itemId: payload.itemId ?? uniqueId("shopping"),
        label: payload.label ?? "",
        amount: Number(payload.amount ?? 1),
        unit: payload.unit ?? "unit",
        categoryId: payload.categoryId ?? "sweets",
        checked: Boolean(payload.checked),
      };
      state.shoppingState = {
        ...state.shoppingState,
        customItems: upsertById(state.shoppingState.customItems, item, "itemId"),
      };
      return saveAndRespond();
    },
    removeShoppingCustomItem(itemId) {
      state.shoppingState = {
        ...state.shoppingState,
        customItems: state.shoppingState.customItems.filter(
          (item) => item.itemId !== itemId,
        ),
      };
      return saveAndRespond();
    },
    getUserContext() {
      return clone(state.userContext);
    },
    ...readModels,
  };
}
