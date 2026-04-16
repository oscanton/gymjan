import test from "node:test";
import assert from "node:assert/strict";

import { EXERCISE_BY_ID } from "../js/catalog/exercise-catalog.js";
import { FOOD_BY_ID } from "../js/catalog/food-catalog.js";
import { calculateActivity } from "../js/domain/activity-calculator.js";
import { calculateAssessment } from "../js/domain/assessment-evaluator.js";
import { calculateNutrition } from "../js/domain/nutrition-calculator.js";
import { calculateScores } from "../js/domain/score-calculator.js";
import { calculateTargets } from "../js/domain/target-calculator.js";
import { calculateUser } from "../js/domain/user-calculator.js";

test("user core calculates BMI and BMR", () => {
  const user = calculateUser({
    weightKg: 80,
    heightCm: 180,
    ageYears: 35,
    sex: "male",
  });

  assert.equal(user.bmi, 24.7);
  assert.equal(user.bmr, 1755);
});

test("activity core calculates steps kcal", () => {
  const user = calculateUser({
    weightKg: 80,
    heightCm: 180,
    ageYears: 35,
    sex: "male",
  });
  const activity = calculateActivity(
    {
      dayKey: "monday",
      steps: { minDailySteps: 8000, plannedSteps: 10000, cadencePerMin: 100 },
      gym: { items: [] },
      extra: { items: [] },
    },
    { user, exerciseById: EXERCISE_BY_ID },
  );

  assert.equal(activity.steps.minutes, 100);
  assert.equal(activity.steps.kcal, 467);
  assert.equal(activity.activity.activityKcal, 467);
});

test("activity core calculates strength kcal", () => {
  const user = calculateUser({
    weightKg: 80,
    heightCm: 180,
    ageYears: 35,
    sex: "male",
  });
  const activity = calculateActivity(
    {
      dayKey: "monday",
      steps: { minDailySteps: 0, plannedSteps: 0, cadencePerMin: 100 },
      gym: {
        items: [
          {
            exerciseId: "bench_press",
            sets: 4,
            reps: "6-10",
            loadKg: 40,
            rir: 2,
            secPerRep: null,
            restSec: null,
          },
        ],
      },
      extra: { items: [] },
    },
    { user, exerciseById: EXERCISE_BY_ID },
  );

  assert.equal(activity.gym.items[0].minutes, 8.1);
  assert.equal(activity.gym.items[0].kcal, 32);
});

test("activity core calculates cardio kcal", () => {
  const user = calculateUser({
    weightKg: 80,
    heightCm: 180,
    ageYears: 35,
    sex: "male",
  });
  const activity = calculateActivity(
    {
      dayKey: "monday",
      steps: { minDailySteps: 0, plannedSteps: 0, cadencePerMin: 100 },
      gym: { items: [] },
      extra: {
        items: [
          {
            exerciseId: "spinning",
            durationSec: 1800,
            cadencePerMin: 90,
            sets: null,
            reps: null,
            loadKg: null,
            rir: null,
            secPerRep: null,
            restSec: null,
          },
        ],
      },
    },
    { user, exerciseById: EXERCISE_BY_ID },
  );

  assert.equal(activity.extra.items[0].minutes, 30);
  assert.equal(activity.extra.items[0].kcal, 340);
});

test("nutrition core calculates totals and hydration", () => {
  const nutrition = calculateNutrition(
    {
      dayKey: "monday",
      meals: {
        hydration: { items: [{ foodId: "water", amount: 1000 }] },
        breakfast: [
          {
            recipeId: null,
            labelKey: null,
            items: [
              { foodId: "oats", amount: 50 },
              { foodId: "milk", amount: 200 },
            ],
          },
        ],
        lunch: [],
        dinner: [],
      },
    },
    { foodsById: FOOD_BY_ID },
  );

  assert.equal(nutrition.totals.kcal, 289);
  assert.equal(nutrition.totals.protein, 15.3);
  assert.equal(nutrition.totals.hydrationDirectMl, 1000);
  assert.equal(nutrition.totals.hydrationOtherDrinksMl, 178);
  assert.equal(nutrition.totals.hydrationFoodMl, 5);
  assert.equal(nutrition.totals.hydrationTotalMl, 1183);
});

test("targets core resolves macro and hydration targets", () => {
  const user = calculateUser({
    weightKg: 80,
    heightCm: 180,
    ageYears: 35,
    sex: "male",
  });
  const activity = calculateActivity(
    {
      dayKey: "monday",
      steps: { minDailySteps: 8000, plannedSteps: 10000, cadencePerMin: 100 },
      gym: { items: [] },
      extra: { items: [] },
    },
    { user, exerciseById: EXERCISE_BY_ID },
  );
  const targets = calculateTargets({
    dayKey: "monday",
    user,
    activity,
    profileFallback: {
      kcalDeltaPct: 0,
      macroRatios: { protein: 0.3, carbs: 0.4, fat: 0.3 },
      secondary: {
        saltMaxG: 5,
        fiberPer1000Kcal: 13,
        sugarMaxPctKcal: 0.1,
        saturatedFatMaxPctKcal: 0.1,
        processingMaxScore: 3.8,
        hydrationBaseMl: 2200,
        hydrationMinMlPerKg: 30,
        hydrationMaxMlPerKg: 36,
        hydrationActivityMlPerMin: 10,
      },
    },
    dayTargetTuning: {},
    userAdjustments: {},
    activityTargetKcal: activity.activity.activityKcal,
  });

  assert.equal(targets.kcal, 2573);
  assert.equal(targets.protein, 193);
  assert.equal(targets.carbs, 257);
  assert.equal(targets.fat, 86);
  assert.equal(targets.hydration.minMl, 3400);
  assert.equal(targets.hydration.maxMl, 3880);
});

test("assessment core assigns statuses", () => {
  const assessment = calculateAssessment({
    dayKey: "monday",
    nutrition: {
      totals: {
        kcal: 1800,
        protein: 160,
        carbs: 160,
        fat: 70,
        fiber: 15,
        sugar: 60,
        saturatedFat: 12,
        saltG: 4,
        processingScore: 2.5,
        hydrationTotalMl: 1900,
      },
    },
    targets: {
      kcal: 2000,
      protein: 160,
      carbs: 180,
      fat: 70,
      secondary: {
        fiberMinG: 20,
        sugarMaxG: 50,
        saturatedFatMaxG: 20,
        saltMaxG: 5,
        processingMaxScore: 3,
      },
      hydration: { minMl: 2000, maxMl: 2500 },
      activity: { targetKcal: 400, metTarget: 5, intensityTarget: 1 },
    },
    activity: {
      steps: { plannedSteps: 9000, minDailySteps: 8000 },
      activity: { activityKcal: 420, metAvg: 4.5, intensityAvg: 0.95 },
    },
  });

  assert.equal(assessment.nutritionChecks.kcal.status, "warning");
  assert.equal(assessment.nutritionChecks.fiber.status, "danger");
  assert.equal(assessment.nutritionChecks.sugar.status, "danger");
  assert.equal(assessment.nutritionChecks.hydration.status, "warning");
  assert.equal(assessment.activityChecks.steps.status, "warning");
});

test("scores core calculates nutrition, activity and total score", () => {
  const scores = calculateScores({
    assessment: {
      nutritionChecks: {
        kcal: { deviationPct: -10 },
        protein: { deviationPct: -20 },
        carbs: { deviationPct: 5 },
        fat: { deviationPct: 0 },
        fiber: { deviationPct: -30 },
        sugar: { deviationPct: 20 },
        saturatedFat: { deviationPct: 0 },
        saltG: { deviationPct: 0 },
        processingScore: { deviationPct: 10 },
      },
    },
    activity: {
      steps: { plannedSteps: 8000, minDailySteps: 8000 },
      activity: { activityKcal: 400, metAvg: 5, intensityAvg: 1 },
    },
    targets: {
      activity: { targetKcal: 400, metTarget: 5, intensityTarget: 1 },
    },
  });

  assert.equal(scores.nutrition.score, 3.5);
  assert.equal(scores.activity.score, 10);
  assert.equal(scores.total.score, 6.75);
});
