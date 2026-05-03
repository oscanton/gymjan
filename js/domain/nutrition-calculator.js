import { sumBy } from "../shared/collection-utils.js";
import { round, toNumber } from "../shared/number-utils.js";

const NUTRIENT_KEYS = [
  "kcal",
  "protein",
  "carbs",
  "fat",
  "saturatedFat",
  "fiber",
  "sugar",
  "sodiumMg",
];

const REGULAR_MEAL_KEYS = ["breakfast", "lunch", "dinner"];

function createTotals() {
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    saturatedFat: 0,
    fiber: 0,
    sugar: 0,
    sodiumMg: 0,
  };
}

function addTotals(target, source) {
  for (const key of NUTRIENT_KEYS) {
    target[key] += toNumber(source[key], 0);
  }

  return target;
}

function resolveHydrationSource(food) {
  if (!food) {
    return "food";
  }

  if (food.id === "water") {
    return "water";
  }

  if (food.categoryId === "beverages" || food.unit === "ml") {
    return "drink";
  }

  return "food";
}

function calculateFoodContribution(item, food) {
  if (!food) {
    return {
      foodId: item.foodId,
      amount: toNumber(item.amount, 0),
      ratio: 0,
      nutrients: createTotals(),
      waterMl: 0,
      processingScore: 0,
      hydrationSource: "food",
    };
  }

  const amount = toNumber(item.amount, 0);
  const ratio = food.nutritionMode === "per_100" ? amount / 100 : amount;
  const nutrients = createTotals();

  for (const key of NUTRIENT_KEYS) {
    nutrients[key] = toNumber(food.nutrients?.[key], 0) * ratio;
  }

  return {
    foodId: item.foodId,
    amount,
    ratio,
    nutrients,
    waterMl: toNumber(food.waterMl, 0) * ratio,
    processingScore: toNumber(food.processingScore, 0),
    hydrationSource: resolveHydrationSource(food),
    unit: food.unit,
  };
}

function finalizeTotals(rawTotals) {
  return {
    kcal: round(rawTotals.kcal),
    protein: round(rawTotals.protein, 1),
    carbs: round(rawTotals.carbs, 1),
    fat: round(rawTotals.fat, 1),
    saturatedFat: round(rawTotals.saturatedFat, 1),
    fiber: round(rawTotals.fiber, 1),
    sugar: round(rawTotals.sugar, 1),
    sodiumMg: round(rawTotals.sodiumMg),
  };
}

function sumNutrientTotals(contributions) {
  return contributions.reduce(
    (totals, contribution) => addTotals(totals, contribution.nutrients),
    createTotals(),
  );
}

function flattenBlockContributions(blocks) {
  return blocks.flatMap((block) => block.contributions);
}

function calculateMealSummary(contributions) {
  return finalizeTotals(sumNutrientTotals(contributions));
}

function buildMealBlocks(blocks, foodsById) {
  return (blocks ?? []).map((block) => ({
    ...block,
    contributions: (block.items ?? []).map((item) =>
      calculateFoodContribution(item, foodsById[item.foodId]),
    ),
  }));
}

function sumHydrationBySource(contributions, hydrationSource) {
  return sumBy(
    contributions,
    (contribution) =>
      contribution.hydrationSource === hydrationSource ? contribution.waterMl : 0,
  );
}

function calculateProcessingScore(contributions) {
  const processingKcalBase = sumBy(contributions, (item) => item.nutrients.kcal);
  const processingWeightedSum = sumBy(
    contributions,
    (item) => item.processingScore * item.nutrients.kcal,
  );

  return round(
    processingKcalBase ? processingWeightedSum / processingKcalBase : 0,
    1,
  );
}

export function calculateNutrition(nutritionInput = {}, options = {}) {
  const foodsById = options.foodsById ?? {};
  const hydrationItems = nutritionInput.meals?.hydration?.items ?? [];
  const hydrationContributions = hydrationItems.map((item) =>
    calculateFoodContribution(item, foodsById[item.foodId]),
  );
  const regularMealContributions = Object.fromEntries(
    REGULAR_MEAL_KEYS.map((mealKey) => [
      mealKey,
      buildMealBlocks(nutritionInput.meals?.[mealKey], foodsById),
    ]),
  );

  const mealSummaries = {
    hydration: {
      ...calculateMealSummary(hydrationContributions),
      hydrationDirectMl: round(
        sumBy(
          hydrationContributions,
          (contribution) =>
            contribution.hydrationSource === "water" ? contribution.waterMl : 0,
        ),
      ),
    },
  };

  for (const mealKey of REGULAR_MEAL_KEYS) {
    const flatContributions = flattenBlockContributions(
      regularMealContributions[mealKey],
    );
    mealSummaries[mealKey] = calculateMealSummary(flatContributions);
  }

  const allContributions = [
    ...hydrationContributions,
    ...REGULAR_MEAL_KEYS.flatMap((mealKey) =>
      flattenBlockContributions(regularMealContributions[mealKey]),
    ),
  ];
  const regularContributions = REGULAR_MEAL_KEYS.flatMap((mealKey) =>
    flattenBlockContributions(regularMealContributions[mealKey]),
  );
  const rawTotals = sumNutrientTotals(allContributions);
  const hydrationDirectMlRaw = sumHydrationBySource(hydrationContributions, "water");
  const hydrationOtherDrinksMlRaw = sumHydrationBySource(allContributions, "drink");
  const hydrationFoodMlRaw = sumHydrationBySource(regularContributions, "food");
  const totals = finalizeTotals(rawTotals);
  const saltG = (rawTotals.sodiumMg * 2.5) / 1000;

  return {
    dayKey: nutritionInput.dayKey ?? "monday",
    meals: {
      hydration: mealSummaries.hydration,
      breakfast: mealSummaries.breakfast,
      lunch: mealSummaries.lunch,
      dinner: mealSummaries.dinner,
    },
    totals: {
      ...totals,
      saltG: round(saltG, 2),
      hydrationDirectMl: round(hydrationDirectMlRaw),
      hydrationFoodMl: round(hydrationFoodMlRaw),
      hydrationOtherDrinksMl: round(hydrationOtherDrinksMlRaw),
      hydrationTotalMl: round(
        hydrationDirectMlRaw + hydrationFoodMlRaw + hydrationOtherDrinksMlRaw,
      ),
      processingScore: calculateProcessingScore(allContributions),
    },
  };
}
