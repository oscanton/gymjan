import { DAY_KEYS, LOCALES, MEAL_KEYS, STORAGE_KEYS } from "./config.js";
import { createStorage } from "./storage.js";
import { calculateActivity } from "../core/activity.core.js";
import { calculateAssessment } from "../core/assessment.core.js";
import {
  buildDayActivityFromTemplate,
  buildDayNutritionFromTemplate,
  createCommandResponse,
  createEmptyDayTemplateSelection,
  createEmptyUserTargetAdjustments,
  createEmptyUserContext,
  normalizeCustomFood,
  normalizeDayActivityInput,
  normalizeDayNutritionInput,
  normalizeFoodEquivalence,
  normalizeUserContext,
  normalizeUserTargetAdjustments,
} from "../core/contracts.js";
import { calculateNutrition } from "../core/nutrition.core.js";
import { calculateScores } from "../core/scores.core.js";
import { calculateTargets } from "../core/targets.core.js";
import { calculateUser } from "../core/user.core.js";
import { ROUTINE_TEMPLATE_BY_ID, ROUTINES_DB } from "../data/routines/routine_index.js";
import { EXERCISE_BY_ID, EXERCISES_DB } from "../data/exercises.db.js";
import { FOOD_BY_ID, FOODS_DB } from "../data/foods.db.js";
import { MENU_TEMPLATE_BY_ID, MENUS_DB } from "../data/menus/menu_index.js";
import { PROFILE_BY_ID, PROFILES_DB } from "../data/profiles/profile_index.js";
import { clone, createLookup, isRatiosSumValid, round, uniqueId } from "../core/utils.js";

const ACTIVITY_ITEM_BLOCK_KEYS = ["gym", "extra"];

function createMessage(code, path, messageKey) {
  return { code, path, messageKey };
}

function getDefaultShoppingState() {
  return {
    checkedItemIds: [],
    customItems: [],
  };
}

function loadSnapshot(storage, storageKeys) {
  return {
    userContext: normalizeUserContext(
      storage.load(storageKeys.userContext, createEmptyUserContext()),
    ),
    userTargetAdjustments: normalizeUserTargetAdjustments(
      storage.load(storageKeys.userTargetAdjustments, createEmptyUserTargetAdjustments()),
    ),
    dayTemplateSelection: storage.load(storageKeys.dayTemplateSelection, createEmptyDayTemplateSelection()),
    dayActivity: storage.loadDayMap("activity"),
    dayNutrition: storage.loadDayMap("nutrition"),
    customFoods: storage.load(storageKeys.customFoods, []),
    foodEquivalences: storage.load(storageKeys.foodEquivalences, []),
    shoppingState: storage.load(storageKeys.shoppingState, getDefaultShoppingState()),
  };
}

function getPayloadDayEntries(payload = {}) {
  return payload.dayKey ? [[payload.dayKey, payload]] : Object.entries(payload);
}

function forEachValidDayEntry(payload, callback) {
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

function forEachNutritionItem(nutritionInput, callback) {
  for (const mealKey of MEAL_KEYS) {
    const blocks = getNutritionBlocks(nutritionInput, mealKey);

    blocks.forEach((block, blockIndex) => {
      (block.items ?? []).forEach((item, itemIndex) => {
        callback(item, { mealKey, blockIndex, itemIndex });
      });
    });
  }
}

function upsertById(items, nextItem, key = "id") {
  return [...items.filter((item) => item[key] !== nextItem[key]), nextItem];
}

function createSelectionUpdate(currentSelection, payload) {
  const nextSelection = clone(currentSelection);
  forEachValidDayEntry(payload, (dayKey, source) => {
    nextSelection[dayKey] = {
      menuTemplateId:
        Object.prototype.hasOwnProperty.call(source, "menuTemplateId")
          ? source.menuTemplateId
          : nextSelection[dayKey].menuTemplateId,
      activityTemplateId:
        Object.prototype.hasOwnProperty.call(source, "activityTemplateId")
          ? source.activityTemplateId
          : nextSelection[dayKey].activityTemplateId,
    };
  });

  return nextSelection;
}

export function createConnector(options = {}) {
  const storage = createStorage(options);
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
  let cachedReferenceData = null;
  let cachedCustomFoods = null;

  function persistOptionalState(key, value) {
    if (value) {
      storage.save(key, value);
      return;
    }

    storage.remove(key);
  }

  function persist() {
    storage.save(storageKeys.userContext, state.userContext);
    storage.save(storageKeys.userTargetAdjustments, state.userTargetAdjustments);
    storage.save(storageKeys.dayTemplateSelection, state.dayTemplateSelection);
    storage.save(storageKeys.customFoods, state.customFoods);
    storage.save(storageKeys.foodEquivalences, state.foodEquivalences);
    storage.save(storageKeys.shoppingState, state.shoppingState);

    for (const dayKey of DAY_KEYS) {
      persistOptionalState(storageKeys.dayActivity(dayKey), state.dayActivity[dayKey]);
      persistOptionalState(storageKeys.dayNutrition(dayKey), state.dayNutrition[dayKey]);
    }
  }

  function getFoodsById() {
    return {
      ...FOOD_BY_ID,
      ...createLookup(state.customFoods),
    };
  }

  function getResolvedProfileRecord() {
    return PROFILE_BY_ID[state.userContext.profileId] ?? PROFILES_DB[0];
  }

  function getDayPlan(dayKey) {
    const profile = getResolvedProfileRecord();
    const basePlan = profile.weeklyPlan?.[dayKey] ?? {};
    const selection = state.dayTemplateSelection?.[dayKey] ?? {};
    const menuTemplateId = selection.menuTemplateId ?? basePlan.menuTemplateId ?? null;
    const activityTemplateId =
      selection.activityTemplateId ?? basePlan.activityTemplateId ?? null;

    return {
      dayKey,
      menuTemplateId,
      activityTemplateId,
      targetTuning: basePlan.targetTuning ?? profile.fallbackTargetTuning,
      menuTemplate: menuTemplateId ? MENU_TEMPLATE_BY_ID[menuTemplateId] : null,
      activityTemplate: activityTemplateId
        ? ROUTINE_TEMPLATE_BY_ID[activityTemplateId]
        : null,
      profile,
    };
  }

  function getBaseDayActivity(dayKey) {
    return buildDayActivityFromTemplate(dayKey, getDayPlan(dayKey).activityTemplate);
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
      activityTemplateId: dayPlan.activityTemplateId,
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

  function validateUserContext(userContext) {
    const errors = [];

    if (userContext.user.weightKg <= 0) {
      errors.push(
        createMessage("invalid_weight", "user.weightKg", "errors.invalid_weight"),
      );
    }

    if (userContext.user.heightCm <= 0) {
      errors.push(
        createMessage("invalid_height", "user.heightCm", "errors.invalid_height"),
      );
    }

    if (userContext.user.ageYears <= 0) {
      errors.push(createMessage("invalid_age", "user.ageYears", "errors.invalid_age"));
    }

    if (!PROFILE_BY_ID[userContext.profileId]) {
      errors.push(
        createMessage("invalid_profile", "profileId", "errors.invalid_profile"),
      );
    }

    return { errors, warnings: [] };
  }

  function validateTargetAdjustments(adjustments) {
    const errors = [];

    if (
      adjustments.macroRatios &&
      !isRatiosSumValid(adjustments.macroRatios)
    ) {
      errors.push(
        createMessage(
          "invalid_macro_ratios",
          "macroRatios",
          "errors.invalid_macro_ratios",
        ),
      );
    }

    return { errors, warnings: [] };
  }

  function validateActivityInput(activityInput) {
    const errors = [];
    const warnings = [];

    if (activityInput.steps.plannedSteps < activityInput.steps.minDailySteps) {
      errors.push(
        createMessage(
          "planned_steps_below_min",
          "steps.plannedSteps",
          "errors.planned_steps_below_min",
        ),
      );
    }

    for (const blockKey of ACTIVITY_ITEM_BLOCK_KEYS) {
      activityInput[blockKey].items.forEach((item, index) => {
        if (!EXERCISE_BY_ID[item.exerciseId]) {
          errors.push(
            createMessage(
              "invalid_exercise",
              `${blockKey}.items.${index}.exerciseId`,
              "errors.invalid_exercise",
            ),
          );
        }

        if (item.rir !== null && (item.rir < 0 || item.rir > 5)) {
          warnings.push(
            createMessage(
              "unexpected_rir",
              `${blockKey}.items.${index}.rir`,
              "warnings.unexpected_rir",
            ),
          );
        }
      });
    }

    return { errors, warnings };
  }

  function validateNutritionInput(nutritionInput) {
    const foodsById = getFoodsById();
    const errors = [];
    const warnings = [];

    forEachNutritionItem(nutritionInput, (item, { mealKey, blockIndex, itemIndex }) => {
      if (!foodsById[item.foodId]) {
        errors.push(
          createMessage(
            "invalid_food",
            `${mealKey}.${blockIndex}.items.${itemIndex}.foodId`,
            "errors.invalid_food",
          ),
        );
      }

      if (item.amount < 0) {
        errors.push(
          createMessage(
            "negative_amount",
            `${mealKey}.${blockIndex}.items.${itemIndex}.amount`,
            "errors.negative_amount",
          ),
        );
      }
    });

    return { errors, warnings };
  }

  function validateDerivedOutput(nutrition, targets) {
    const warnings = [];

    if (nutrition.totals.hydrationDirectMl === 0) {
      warnings.push(
        createMessage(
          "low_hydration",
          "meals.hydration",
          "warnings.low_hydration",
        ),
      );
    }

    if (
      nutrition.totals.processingScore >
      Math.max(targets.secondary.processingMaxScore * 1.25, 4.5)
    ) {
      warnings.push(
        createMessage(
          "high_processing_score",
          "totals.processingScore",
          "warnings.high_processing_score",
        ),
      );
    }

    for (const [mealKey, meal] of Object.entries(nutrition.meals)) {
      if (meal.kcal > 1500) {
        warnings.push(
          createMessage(
            "unrealistic_meal_totals",
            `meals.${mealKey}`,
            "warnings.unrealistic_meal_totals",
          ),
        );
      }
    }

    for (const equivalence of state.foodEquivalences) {
      if (equivalence.basis !== "kcal") {
        warnings.push(
          createMessage(
            "unresolved_equivalence_basis",
            "foodEquivalences",
            "warnings.unresolved_equivalence_basis",
          ),
        );
        break;
      }
    }

    return { errors: [], warnings };
  }

  function aggregateValidation(dayKey, nutrition, targets) {
    const userValidation = validateUserContext(state.userContext);
    const targetValidation = validateTargetAdjustments(state.userTargetAdjustments);
    const activityValidation = validateActivityInput(getEditableDayActivity(dayKey));
    const nutritionValidation = validateNutritionInput(getEditableDayNutrition(dayKey));
    const derivedValidation = validateDerivedOutput(nutrition, targets);

    return {
      errors: [
        ...userValidation.errors,
        ...targetValidation.errors,
        ...activityValidation.errors,
        ...nutritionValidation.errors,
      ],
      warnings: [
        ...userValidation.warnings,
        ...targetValidation.warnings,
        ...activityValidation.warnings,
        ...nutritionValidation.warnings,
        ...derivedValidation.warnings,
      ],
    };
  }

  function saveAndRespond(errors = [], warnings = []) {
    persist();
    return createCommandResponse(errors, warnings, true);
  }

  function calculateDay(dayKey) {
    const dayPlan = getDayPlan(dayKey);
    const foodsById = getFoodsById();
    const user = calculateUser(state.userContext.user);
    const activityInput = getEditableDayActivity(dayKey);
    const nutritionInput = getEditableDayNutrition(dayKey);
    const baseActivity = calculateActivity(getBaseDayActivity(dayKey), {
      user,
      exerciseById: EXERCISE_BY_ID,
    });
    const activity = calculateActivity(activityInput, {
      user,
      exerciseById: EXERCISE_BY_ID,
    });
    const nutrition = calculateNutrition(nutritionInput, { foodsById });
    const targets = calculateTargets({
      dayKey,
      user,
      activity,
      profileFallback: dayPlan.profile.fallbackTargetTuning,
      dayTargetTuning: dayPlan.targetTuning,
      userAdjustments: state.userTargetAdjustments,
      activityTargetKcal: baseActivity.activity.activityKcal,
    });
    const assessment = calculateAssessment({
      dayKey,
      nutrition,
      targets,
      activity,
    });
    const scores = calculateScores({
      assessment,
      activity,
      targets,
    });
    const validation = aggregateValidation(dayKey, nutrition, targets);

    return {
      dayKey,
      input: createDayInputSnapshot(dayKey, dayPlan, activityInput, nutritionInput),
      derived: {
        user,
        activity,
        nutrition,
        targets,
        assessment,
        scores,
      },
      ui: {
        warnings: validation.warnings,
        errors: validation.errors,
      },
    };
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
      const validation = validateUserContext(state.userContext);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveUserTargetAdjustments(payload) {
      state.userTargetAdjustments = normalizeUserTargetAdjustments({
        ...state.userTargetAdjustments,
        ...payload,
      });
      const validation = validateTargetAdjustments(state.userTargetAdjustments);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveDayTemplateSelection(payload) {
      const previousSelection = clone(state.dayTemplateSelection);
      state.dayTemplateSelection = createSelectionUpdate(state.dayTemplateSelection, payload);
      forEachValidDayEntry(payload, (dayKey, source) => {
        if (Object.prototype.hasOwnProperty.call(source, "menuTemplateId")) {
          state.dayNutrition[dayKey] = getBaseDayNutrition(dayKey);
        }

        if (Object.prototype.hasOwnProperty.call(source, "activityTemplateId")) {
          state.dayActivity[dayKey] = getBaseDayActivity(dayKey);
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
      const validation = validateActivityInput(state.dayActivity[dayKey]);
      return saveAndRespond(validation.errors, validation.warnings);
    },
    saveDayNutrition(dayKey, payload) {
      state.dayNutrition[dayKey] = normalizeDayNutritionInput(dayKey, payload);
      const validation = validateNutritionInput(state.dayNutrition[dayKey]);
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
      state.userContext.locale = LOCALES.includes(locale) ? locale : "es";
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
    getResolvedProfile() {
      const profile = getResolvedProfileRecord();
      return {
        ...clone(profile),
        weeklyPlan: Object.fromEntries(
          DAY_KEYS.map((dayKey) => {
            const plan = getDayPlan(dayKey);
            return [
              dayKey,
              {
                ...createSelectionSnapshot(plan),
                targetTuning: plan.targetTuning,
              },
            ];
          }),
        ),
      };
    },
    getDayInput(dayKey) {
      const dayPlan = getDayPlan(dayKey);
      return createDayInputSnapshot(
        dayKey,
        dayPlan,
        getEditableDayActivity(dayKey),
        getEditableDayNutrition(dayKey),
      );
    },
    calculateDay,
    calculateWeek() {
      const days = Object.fromEntries(
        DAY_KEYS.map((dayKey) => [dayKey, calculateDay(dayKey)]),
      );
      const weeklySummary = DAY_KEYS.reduce(
        (summary, dayKey) => {
          const day = days[dayKey];
          summary.nutritionScoreAvg += day.derived.scores.nutrition.score;
          summary.activityScoreAvg += day.derived.scores.activity.score;
          summary.totalScoreAvg += day.derived.scores.total.score;
          summary.targetKcalTotal += day.derived.targets.kcal;
          summary.intakeKcalTotal += day.derived.nutrition.totals.kcal;
          summary.activityKcalTotal += day.derived.activity.activity.activityKcal;
          return summary;
        },
        {
          nutritionScoreAvg: 0,
          activityScoreAvg: 0,
          totalScoreAvg: 0,
          targetKcalTotal: 0,
          intakeKcalTotal: 0,
          activityKcalTotal: 0,
        },
      );

      return {
        days,
        weeklySummary: {
          nutritionScoreAvg: round(weeklySummary.nutritionScoreAvg / DAY_KEYS.length, 2),
          activityScoreAvg: round(weeklySummary.activityScoreAvg / DAY_KEYS.length, 2),
          totalScoreAvg: round(weeklySummary.totalScoreAvg / DAY_KEYS.length, 2),
          targetKcalTotal: round(weeklySummary.targetKcalTotal),
          intakeKcalTotal: round(weeklySummary.intakeKcalTotal),
          activityKcalTotal: round(weeklySummary.activityKcalTotal),
        },
      };
    },
    getShoppingList() {
      const foodsById = getFoodsById();
      const itemMap = new Map();

      for (const dayKey of DAY_KEYS) {
        const nutrition = getEditableDayNutrition(dayKey);
        forEachNutritionItem(nutrition, addShoppingItem);
      }

      function addShoppingItem(foodItem) {
        const food = foodsById[foodItem.foodId];
        if (!food || foodItem.amount <= 0) {
          return;
        }

        const source = food.source === "custom" ? "custom" : "catalog";
        const key = food.id;
        const current = itemMap.get(key) ?? {
          itemId: key,
          source,
          foodId: source === "catalog" ? food.id : null,
          labelKey: source === "catalog" ? `foods.${food.id}.name` : null,
          label: source === "custom" ? food.name : null,
          amount: 0,
          unit: food.unit,
          categoryId: food.categoryId,
        };

        current.amount += foodItem.amount;
        itemMap.set(key, current);
      }

      const checked = new Set(state.shoppingState.checkedItemIds);
      const generatedItems = [...itemMap.values()]
        .map((item) => ({
          ...item,
          amount: round(item.amount, 1),
          checked: checked.has(item.itemId),
        }))
        .sort((left, right) =>
          `${left.categoryId}:${left.itemId}`.localeCompare(
            `${right.categoryId}:${right.itemId}`,
          ),
        );
      const customItems = (state.shoppingState.customItems ?? []).map((item) => ({
        ...item,
        source: "custom",
        foodId: null,
        checked: checked.has(item.itemId) || Boolean(item.checked),
      }));

      return {
        generatedAt: "week_plan",
        items: [...generatedItems, ...customItems],
      };
    },
    getReferenceData() {
      if (cachedReferenceData && cachedCustomFoods === state.customFoods) {
        return cachedReferenceData;
      }

      cachedCustomFoods = state.customFoods;
      cachedReferenceData = {
        ...staticReferenceData,
        foods: [...FOODS_DB, ...state.customFoods],
      };

      return cachedReferenceData;
    },
  };
}
