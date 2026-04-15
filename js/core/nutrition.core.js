import { round, sumBy, toNumber } from "./utils.js";

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

function calculateMealSummary(contributions) {
  const mealTotals = contributions.reduce(
    (totals, contribution) => addTotals(totals, contribution.nutrients),
    createTotals(),
  );

  return finalizeTotals(mealTotals);
}

export function calculateNutrition(nutritionInput = {}, options = {}) {
  const foodsById = options.foodsById ?? {};
  const hydrationItems = nutritionInput.meals?.hydration?.items ?? [];
  const mealKeys = ["breakfast", "lunch", "dinner"];
  const hydrationContributions = hydrationItems.map((item) =>
    calculateFoodContribution(item, foodsById[item.foodId]),
  );
  const regularMealContributions = Object.fromEntries(
    mealKeys.map((mealKey) => [
      mealKey,
      (nutritionInput.meals?.[mealKey] ?? []).map((block) => ({
        ...block,
        contributions: (block.items ?? []).map((item) =>
          calculateFoodContribution(item, foodsById[item.foodId]),
        ),
      })),
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

  for (const mealKey of mealKeys) {
    const flatContributions = regularMealContributions[mealKey].flatMap(
      (block) => block.contributions,
    );
    mealSummaries[mealKey] = calculateMealSummary(flatContributions);
  }

  const allContributions = [
    ...hydrationContributions,
    ...mealKeys.flatMap((mealKey) =>
      regularMealContributions[mealKey].flatMap((block) => block.contributions),
    ),
  ];

  const rawTotals = allContributions.reduce(
    (totals, contribution) => addTotals(totals, contribution.nutrients),
    createTotals(),
  );
  const hydrationDirectMlRaw = sumBy(
    hydrationContributions,
    (contribution) =>
      contribution.hydrationSource === "water" ? contribution.waterMl : 0,
  );
  const hydrationOtherDrinksMlRaw = sumBy(
    allContributions,
    (contribution) =>
      contribution.hydrationSource === "drink" ? contribution.waterMl : 0,
  );
  const hydrationFoodMlRaw = sumBy(
    mealKeys.flatMap((mealKey) =>
      regularMealContributions[mealKey].flatMap((block) => block.contributions),
    ),
    (contribution) =>
      contribution.hydrationSource === "food" ? contribution.waterMl : 0,
  );
  const processingKcalBase = sumBy(allContributions, (item) => item.nutrients.kcal);
  const processingWeightedSum = sumBy(
    allContributions,
    (item) => item.processingScore * item.nutrients.kcal,
  );
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
      processingScore: round(
        processingKcalBase ? processingWeightedSum / processingKcalBase : 0,
        1,
      ),
    },
  };
}
