import { EXERCISE_BY_ID } from "../catalog/exercise-catalog.js";
import { calculateActivity } from "../domain/activity-calculator.js";
import { calculateAssessment } from "../domain/assessment-evaluator.js";
import { calculateNutrition } from "../domain/nutrition-calculator.js";
import { calculateScores } from "../domain/score-calculator.js";
import { calculateTargets } from "../domain/target-calculator.js";
import { calculateUser } from "../domain/user-calculator.js";
import { DAY_KEYS } from "../shared/app-constants.js";
import { round } from "../shared/number-utils.js";
import { clone } from "../shared/object-utils.js";
import { forEachNutritionItem } from "./day-plan-resolver.js";

export function createAppReadModels(options) {
  const {
    state,
    staticReferenceData,
    foodsDb,
    getFoodsById,
    getResolvedProfileRecord,
    getDayPlan,
    getBaseDayActivity,
    getEditableDayActivity,
    getEditableDayNutrition,
    createSelectionSnapshot,
    createDayInputSnapshot,
    aggregateValidation,
  } = options;
  let cachedReferenceData = null;
  let cachedCustomFoods = null;

  function getResolvedProfile() {
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
  }

  function getDayInput(dayKey) {
    const dayPlan = getDayPlan(dayKey);
    return createDayInputSnapshot(
      dayKey,
      dayPlan,
      getEditableDayActivity(dayKey),
      getEditableDayNutrition(dayKey),
    );
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

  function calculateWeek() {
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
  }

  function getShoppingList() {
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
  }

  function getReferenceData() {
    if (cachedReferenceData && cachedCustomFoods === state.customFoods) {
      return cachedReferenceData;
    }

    cachedCustomFoods = state.customFoods;
    cachedReferenceData = {
      ...staticReferenceData,
      foods: [...foodsDb, ...state.customFoods],
    };

    return cachedReferenceData;
  }

  function getAppState(currentDayKey) {
    const userContext = clone(state.userContext);
    const week = calculateWeek();

    return {
      locale: userContext.locale,
      currentDayKey,
      userContext,
      resolvedProfile: getResolvedProfile(),
      day: week.days[currentDayKey],
      week,
      shopping: getShoppingList(),
      reference: getReferenceData(),
    };
  }

  return {
    getAppState,
    getResolvedProfile,
    getDayInput,
    calculateDay,
    calculateWeek,
    getShoppingList,
    getReferenceData,
  };
}
