import test from "node:test";
import assert from "node:assert/strict";

import { createConnector } from "../js/app/connector.js";
import {
  normalizeDayActivityInput,
  normalizeDayNutritionInput,
  normalizeUserContext,
} from "../js/core/contracts.js";

function createMemoryProvider() {
  const map = new Map();

  return {
    getItem(key) {
      return map.has(key) ? map.get(key) : null;
    },
    setItem(key, value) {
      map.set(key, value);
    },
    removeItem(key) {
      map.delete(key);
    },
  };
}

test("contracts normalize user context", () => {
  const userContext = normalizeUserContext({
    locale: "en",
    profileId: "standard_male_2000",
    user: {
      weightKg: "80",
      heightCm: "180",
      ageYears: "35",
      sex: "male",
    },
  });

  assert.equal(userContext.locale, "en");
  assert.equal(userContext.user.weightKg, 80);
  assert.equal(userContext.user.heightCm, 180);
});

test("contracts normalize day activity and nutrition", () => {
  const activity = normalizeDayActivityInput("monday", {
    steps: { minDailySteps: "8000", plannedSteps: "9000", cadencePerMin: "100" },
    gym: { items: [{ exerciseId: "bench_press", sets: "4", reps: "8" }] },
    extra: { items: [] },
  });
  const nutrition = normalizeDayNutritionInput("monday", {
    meals: {
      hydration: { items: [{ foodId: "water", amount: "1000" }] },
      breakfast: [
        {
          recipeId: null,
          labelKey: null,
          items: [{ foodId: "oats", amount: "50" }],
        },
      ],
      lunch: [],
      dinner: [],
    },
  });

  assert.equal(activity.steps.plannedSteps, 9000);
  assert.equal(activity.gym.items[0].sets, 4);
  assert.equal(nutrition.meals.hydration.items[0].amount, 1000);
  assert.equal(nutrition.meals.breakfast[0].items[0].foodId, "oats");
});

test("connector persists and reloads user context", () => {
  const provider = createMemoryProvider();
  const connectorA = createConnector({ provider });
  connectorA.saveUserContext({
    locale: "en",
    profileId: "standard_male_2000",
    user: { weightKg: 80, heightCm: 180, ageYears: 35, sex: "male" },
  });

  const connectorB = createConnector({ provider });
  const userContext = connectorB.getUserContext();

  assert.equal(userContext.locale, "en");
  assert.equal(userContext.profileId, "standard_male_2000");
  assert.equal(userContext.user.weightKg, 80);
});

test("connector resolves profile and calculateDay shape", () => {
  const connector = createConnector();
  connector.saveUserContext({
    profileId: "standard_male_2000",
    user: { weightKg: 80, heightCm: 180, ageYears: 35, sex: "male" },
  });
  const profile = connector.getResolvedProfile();
  const day = connector.calculateDay("monday");

  assert.equal(profile.id, "standard_male_2000");
  assert.equal(profile.weeklyPlan.monday.menuTemplateId, "menu_standard_1a");
  assert.equal(day.dayKey, "monday");
  assert.ok(day.input);
  assert.ok(day.derived.activity.activity);
  assert.ok(Array.isArray(day.ui.errors));
});

test("weight loss profile resolves day-specific menu templates", () => {
  const connector = createConnector();
  connector.saveUserContext({
    profileId: "weight_loss_female_1500",
    user: { weightKg: 60, heightCm: 165, ageYears: 30, sex: "female" },
  });

  const profile = connector.getResolvedProfile();

  assert.equal(profile.weeklyPlan.monday.menuTemplateId, "menu_monday_weightloss");
  assert.equal(profile.weeklyPlan.sunday.menuTemplateId, "menu_sunday_weightloss");
});

test("connector loads and saves editable day state", () => {
  const provider = createMemoryProvider();
  const connector = createConnector({ provider });
  connector.saveUserContext({
    profileId: "standard_male_2000",
    user: { weightKg: 80, heightCm: 180, ageYears: 35, sex: "male" },
  });
  connector.saveDayActivity("monday", {
    dayKey: "monday",
    steps: { minDailySteps: 7000, plannedSteps: 9000, cadencePerMin: 100 },
    gym: { items: [] },
    extra: { items: [] },
  });

  const reloaded = createConnector({ provider });
  const input = reloaded.getDayInput("monday");

  assert.equal(input.activity.steps.minDailySteps, 7000);
  assert.equal(input.activity.steps.plannedSteps, 9000);
});
