export function blankToNull(value) {
  return value === "" ? null : value;
}

export function copyInput(value) {
  return JSON.parse(JSON.stringify(value));
}

export function createDefaultPrescription(metric) {
  if (metric === "steps") {
    return {
      metric,
      min: 8000,
      durationSec: null,
      cadencePerMin: 100,
      sets: null,
      reps: null,
      loadKg: null,
      rir: null,
      secPerRep: null,
      restSec: null,
    };
  }

  if (metric === "duration") {
    return {
      metric,
      min: null,
      durationSec: 1200,
      cadencePerMin: 90,
      sets: null,
      reps: null,
      loadKg: null,
      rir: null,
      secPerRep: null,
      restSec: null,
    };
  }

  return {
    metric: "strength",
    min: null,
    durationSec: null,
    cadencePerMin: null,
    sets: 3,
    reps: "8",
    loadKg: null,
    rir: 2,
    secPerRep: null,
    restSec: null,
  };
}

export function getDefaultActivityItem(sectionKey) {
  if (sectionKey === "walking") {
    return {
      exerciseId: "walk",
      prescription: createDefaultPrescription("steps"),
      notes: null,
    };
  }

  if (sectionKey === "extra") {
    return {
      exerciseId: "spinning",
      prescription: createDefaultPrescription("duration"),
      notes: null,
    };
  }

  return {
    exerciseId: "bench_press",
    prescription: createDefaultPrescription("strength"),
    notes: null,
  };
}

export function getActivitySection(activity, sectionKey) {
  let section = (activity.sections ?? []).find((entry) => entry.sectionKey === sectionKey);

  if (!section) {
    section = { sectionKey, items: [] };
    activity.sections.push(section);
  }

  return section;
}

export function getDefaultMealBlock() {
  return {
    recipeId: null,
    labelKey: null,
    items: [{ foodId: "rice", amount: 100 }],
  };
}

export function getDefaultHydrationItem() {
  return { foodId: "water", amount: 500 };
}
