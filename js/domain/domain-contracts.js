import {
  ACTIVITY_SECTION_KEYS,
  DAY_KEYS,
  DEFAULT_LOCALE,
  MEAL_KEYS,
} from "../shared/app-constants.js";
import { toNumber, toNullableNumber } from "../shared/number-utils.js";
import { clone } from "../shared/object-utils.js";

export function createCommandResponse(errors = [], warnings = [], saved = true) {
  return {
    ok: errors.length === 0,
    saved,
    errors,
    warnings,
  };
}

export function createEmptyUserContext() {
  return {
    locale: DEFAULT_LOCALE,
    profileId: null,
    user: {
      weightKg: 0,
      heightCm: 0,
      ageYears: 0,
      sex: "male",
    },
  };
}

export function createEmptyUserTargetAdjustments() {
  return {
    kcalDeltaPct: null,
    macroRatios: null,
    secondary: null,
  };
}

export function createEmptyDayTemplateSelection() {
  return Object.fromEntries(
    DAY_KEYS.map((dayKey) => [
      dayKey,
      {
        menuTemplateId: null,
        routineTemplateId: null,
      },
    ]),
  );
}

export function createEmptyDayActivityInput(dayKey = "monday") {
  return {
    dayKey,
    sections: ACTIVITY_SECTION_KEYS.map((sectionKey) => ({
      sectionKey,
      items: [],
    })),
  };
}

export function createEmptyDayNutritionInput(dayKey = "monday") {
  return {
    dayKey,
    meals: {
      hydration: { items: [] },
      breakfast: [],
      lunch: [],
      dinner: [],
    },
  };
}

function normalizeFoodItem(item = {}) {
  return {
    foodId: item.foodId ?? null,
    amount: toNumber(item.amount, 0),
  };
}

function normalizeMealBlock(block = {}) {
  return {
    recipeId: block.recipeId ?? null,
    labelKey: block.labelKey ?? null,
    items: Array.isArray(block.items) ? block.items.map(normalizeFoodItem) : [],
  };
}

function normalizeSecondary(secondary) {
  if (!secondary || typeof secondary !== "object") {
    return null;
  }

  return {
    saltMaxG: toNullableNumber(secondary.saltMaxG),
    fiberPer1000Kcal: toNullableNumber(secondary.fiberPer1000Kcal),
    sugarMaxPctKcal: toNullableNumber(secondary.sugarMaxPctKcal),
    saturatedFatMaxPctKcal: toNullableNumber(secondary.saturatedFatMaxPctKcal),
    processingMaxScore: toNullableNumber(secondary.processingMaxScore),
    hydrationMlPerKg: toNullableNumber(secondary.hydrationMlPerKg),
    hydrationActivityMlPerMin: toNullableNumber(
      secondary.hydrationActivityMlPerMin,
    ),
  };
}

function normalizeMacroRatios(ratios) {
  if (!ratios || typeof ratios !== "object") {
    return null;
  }

  return {
    protein: toNullableNumber(ratios.protein),
    carbs: toNullableNumber(ratios.carbs),
    fat: toNullableNumber(ratios.fat),
  };
}

function inferActivityMetric(source = {}) {
  if (typeof source.metric === "string" && source.metric) {
    return source.metric;
  }

  if (
    source.min !== undefined ||
    source.target !== undefined ||
    source.minDailySteps !== undefined ||
    source.plannedSteps !== undefined
  ) {
    return "steps";
  }

  if (source.durationSec !== undefined) {
    return "duration";
  }

  return "strength";
}

function createEmptyActivityPrescription(metric = null) {
  return {
    metric,
    min: null,
    durationSec: null,
    cadencePerMin: null,
    sets: null,
    reps: null,
    loadKg: null,
    rir: null,
    secPerRep: null,
    restSec: null,
  };
}

function normalizeActivityPrescription(source = {}) {
  const raw =
    source.prescription && typeof source.prescription === "object"
      ? source.prescription
      : source;
  const metric = inferActivityMetric({ ...source, ...raw });
  const prescription = createEmptyActivityPrescription(metric);

  if (metric === "steps") {
    prescription.min = toNullableNumber(
      raw.min ?? raw.minDailySteps ?? raw.target ?? raw.plannedSteps,
    );
    prescription.cadencePerMin = toNullableNumber(raw.cadencePerMin);
    return prescription;
  }

  if (metric === "duration") {
    prescription.durationSec = toNullableNumber(raw.durationSec);
    prescription.cadencePerMin = toNullableNumber(raw.cadencePerMin);
    return prescription;
  }

  prescription.sets = toNullableNumber(raw.sets);
  prescription.reps =
    typeof raw.reps === "string" ? raw.reps : toNullableNumber(raw.reps);
  prescription.loadKg = toNullableNumber(raw.loadKg);
  prescription.rir = toNullableNumber(raw.rir);
  prescription.secPerRep = toNullableNumber(raw.secPerRep);
  prescription.restSec = toNullableNumber(raw.restSec);

  return prescription;
}

function normalizeActivityItem(item = {}) {
  return {
    exerciseId: item.exerciseId ?? null,
    prescription: normalizeActivityPrescription(item),
    notes: item.notes ?? item.notesKey ?? null,
  };
}

function normalizeActivitySection(section = {}, fallbackSectionKey = "extra") {
  return {
    sectionKey: section.sectionKey ?? fallbackSectionKey,
    items: Array.isArray(section.items) ? section.items.map(normalizeActivityItem) : [],
  };
}

function mergeActivitySections(sections = []) {
  const baseSections = new Map(
    ACTIVITY_SECTION_KEYS.map((sectionKey) => [sectionKey, { sectionKey, items: [] }]),
  );
  const customSections = [];

  sections.forEach((section) => {
    const normalized = normalizeActivitySection(section);

    if (ACTIVITY_SECTION_KEYS.includes(normalized.sectionKey)) {
      baseSections.set(normalized.sectionKey, normalized);
      return;
    }

    customSections.push(normalized);
  });

  return [
    ...ACTIVITY_SECTION_KEYS.map((sectionKey) => baseSections.get(sectionKey)),
    ...customSections,
  ];
}

export function buildDayActivityFromTemplate(dayKey, template) {
  return normalizeDayActivityInput(dayKey, {
    dayKey,
    sections: template?.sections,
  });
}

export function buildDayNutritionFromTemplate(dayKey, template) {
  return normalizeDayNutritionInput(dayKey, {
    dayKey,
    meals: template?.meals,
  });
}

export function normalizeUserContext(payload = {}) {
  const base = createEmptyUserContext();

  return {
    locale: payload.locale ?? base.locale,
    profileId: payload.profileId ?? base.profileId,
    user: {
      weightKg: toNumber(payload.user?.weightKg, base.user.weightKg),
      heightCm: toNumber(payload.user?.heightCm, base.user.heightCm),
      ageYears: toNumber(payload.user?.ageYears, base.user.ageYears),
      sex: payload.user?.sex ?? base.user.sex,
    },
  };
}

export function normalizeUserTargetAdjustments(payload = {}) {
  return {
    kcalDeltaPct: toNullableNumber(payload.kcalDeltaPct),
    macroRatios: normalizeMacroRatios(payload.macroRatios),
    secondary: normalizeSecondary(payload.secondary),
  };
}

export function normalizeDayActivityInput(dayKey = "monday", payload = {}) {
  const resolvedDayKey = payload.dayKey ?? dayKey;
  const base = createEmptyDayActivityInput(dayKey);
  const sections = Array.isArray(payload.sections)
    ? mergeActivitySections(payload.sections)
    : clone(base.sections);

  return {
    dayKey: resolvedDayKey,
    sections,
  };
}

export function normalizeDayNutritionInput(dayKey = "monday", payload = {}) {
  const base = createEmptyDayNutritionInput(dayKey);
  const meals = payload.meals ?? {};

  return {
    dayKey: payload.dayKey ?? dayKey,
    meals: {
      hydration: {
        items: Array.isArray(meals.hydration?.items)
          ? meals.hydration.items.map(normalizeFoodItem)
          : clone(base.meals.hydration.items),
      },
      breakfast: Array.isArray(meals.breakfast)
        ? meals.breakfast.map(normalizeMealBlock)
        : clone(base.meals.breakfast),
      lunch: Array.isArray(meals.lunch)
        ? meals.lunch.map(normalizeMealBlock)
        : clone(base.meals.lunch),
      dinner: Array.isArray(meals.dinner)
        ? meals.dinner.map(normalizeMealBlock)
        : clone(base.meals.dinner),
    },
  };
}

export function normalizeCustomFood(payload = {}) {
  return {
    id: payload.id ?? null,
    source: "custom",
    categoryId: payload.categoryId ?? "sweets",
    unit: payload.unit ?? "g",
    nutritionMode: payload.nutritionMode ?? "per_100",
    nutrients: {
      kcal: toNumber(payload.nutrients?.kcal, 0),
      protein: toNumber(payload.nutrients?.protein, 0),
      carbs: toNumber(payload.nutrients?.carbs, 0),
      fat: toNumber(payload.nutrients?.fat, 0),
      saturatedFat: toNumber(payload.nutrients?.saturatedFat, 0),
      fiber: toNumber(payload.nutrients?.fiber, 0),
      sugar: toNumber(payload.nutrients?.sugar, 0),
      sodiumMg: toNumber(payload.nutrients?.sodiumMg, 0),
    },
    waterMl: toNumber(payload.waterMl, 0),
    processingScore: toNumber(payload.processingScore, 0),
    name: payload.name ?? "",
    description: payload.description ?? null,
  };
}

export function normalizeFoodEquivalence(payload = {}) {
  return {
    id: payload.id ?? null,
    sourceFoodId: payload.sourceFoodId ?? null,
    targetFoodId: payload.targetFoodId ?? null,
    ratio: toNumber(payload.ratio, 0),
    basis: payload.basis ?? "kcal",
  };
}

export { ACTIVITY_SECTION_KEYS, DAY_KEYS, MEAL_KEYS };
