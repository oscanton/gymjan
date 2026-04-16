import {
  createEmptyDayTemplateSelection,
  createEmptyUserTargetAdjustments,
  createEmptyUserContext,
  normalizeUserContext,
  normalizeUserTargetAdjustments,
} from "../domain/domain-contracts.js";
import { DAY_KEYS } from "../shared/app-constants.js";

export function getDefaultShoppingState() {
  return {
    checkedItemIds: [],
    customItems: [],
  };
}

export function loadSnapshot(storage, storageKeys) {
  return {
    userContext: normalizeUserContext(
      storage.load(storageKeys.userContext, createEmptyUserContext()),
    ),
    userTargetAdjustments: normalizeUserTargetAdjustments(
      storage.load(
        storageKeys.userTargetAdjustments,
        createEmptyUserTargetAdjustments(),
      ),
    ),
    dayTemplateSelection: storage.load(
      storageKeys.dayTemplateSelection,
      createEmptyDayTemplateSelection(),
    ),
    dayActivity: storage.loadDayMap("activity"),
    dayNutrition: storage.loadDayMap("nutrition"),
    customFoods: storage.load(storageKeys.customFoods, []),
    foodEquivalences: storage.load(storageKeys.foodEquivalences, []),
    shoppingState: storage.load(
      storageKeys.shoppingState,
      getDefaultShoppingState(),
    ),
  };
}

function persistOptionalState(storage, key, value) {
  if (value) {
    storage.save(key, value);
    return;
  }

  storage.remove(key);
}

export function persistState(storage, storageKeys, state) {
  storage.save(storageKeys.userContext, state.userContext);
  storage.save(storageKeys.userTargetAdjustments, state.userTargetAdjustments);
  storage.save(storageKeys.dayTemplateSelection, state.dayTemplateSelection);
  storage.save(storageKeys.customFoods, state.customFoods);
  storage.save(storageKeys.foodEquivalences, state.foodEquivalences);
  storage.save(storageKeys.shoppingState, state.shoppingState);

  for (const dayKey of DAY_KEYS) {
    persistOptionalState(storage, storageKeys.dayActivity(dayKey), state.dayActivity[dayKey]);
    persistOptionalState(storage, storageKeys.dayNutrition(dayKey), state.dayNutrition[dayKey]);
  }
}
