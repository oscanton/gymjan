import test from "node:test";
import assert from "node:assert/strict";

import { createConnector } from "../js/application/connector.js";
import {
  normalizeDayActivityInput,
  normalizeDayNutritionInput,
  normalizeUserContext,
} from "../js/domain/domain-contracts.js";

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
    sections: [
      {
        sectionKey: "walking",
        items: [
          {
            exerciseId: "walk",
            prescription: {
              metric: "steps",
              min: "8000",
              cadencePerMin: "100",
            },
          },
        ],
      },
      {
        sectionKey: "gym",
        items: [
          {
            exerciseId: "bench_press",
            prescription: { metric: "strength", sets: "4", reps: "8" },
          },
        ],
      },
      { sectionKey: "extra", items: [] },
    ],
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

  assert.equal(activity.sections[0].items[0].prescription.min, 8000);
  assert.equal(activity.sections[1].items[0].prescription.sets, 4);
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
  assert.equal(profile.weeklyPlan.monday.menuTemplateId, "menu_monday_weightloss");
  assert.equal(
    profile.weeklyPlan.monday.routineTemplateId,
    "activity_fuerza_a",
  );
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
  assert.equal(
    profile.weeklyPlan.sunday.routineTemplateId,
    "activity_descanso",
  );
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
    sections: [
      {
        sectionKey: "walking",
        items: [
          {
            exerciseId: "walk",
            prescription: {
              metric: "steps",
              min: 7000,
              cadencePerMin: 100,
            },
          },
        ],
      },
      { sectionKey: "gym", items: [] },
      { sectionKey: "extra", items: [] },
    ],
  });

  const reloaded = createConnector({ provider });
  const input = reloaded.getDayInput("monday");

  assert.equal(input.activity.sections[0].items[0].prescription.min, 7000);
  assert.equal(input.activity.sections[0].items[0].prescription.cadencePerMin, 100);
});

test("connector validates strength timing as routine-owned data", () => {
  const connector = createConnector();
  const response = connector.saveDayActivity("monday", {
    dayKey: "monday",
    sections: [
      { sectionKey: "walking", items: [] },
      {
        sectionKey: "gym",
        items: [
          {
            exerciseId: "bench_press",
            prescription: {
              metric: "strength",
              sets: 3,
              reps: "8",
              loadKg: 40,
              rir: 2,
              secPerRep: null,
              restSec: null,
            },
          },
        ],
      },
      { sectionKey: "extra", items: [] },
    ],
  });

  assert.equal(response.ok, false);
  assert.deepEqual(
    response.errors.map((error) => error.code),
    ["invalid_sec_per_rep", "invalid_rest_sec"],
  );
});

test("connector getAppState returns aggregated app read model", () => {
  const connector = createConnector();
  connector.saveUserContext({
    locale: "es",
    profileId: "weight_loss_female_1500",
    user: { weightKg: 60, heightCm: 165, ageYears: 30, sex: "female" },
  });

  const appState = connector.getAppState("monday");

  assert.equal(appState.locale, "es");
  assert.equal(appState.currentDayKey, "monday");
  assert.equal(appState.userContext.profileId, "weight_loss_female_1500");
  assert.equal(appState.day.dayKey, "monday");
  assert.equal(appState.week.days.monday.dayKey, "monday");
  assert.ok(Array.isArray(appState.shopping.items));
  assert.ok(Array.isArray(appState.reference.foods));
});
