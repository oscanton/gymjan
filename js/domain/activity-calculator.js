import {
  DEFAULT_STEPS_CADENCE,
} from "../shared/app-constants.js";
import { sumBy } from "../shared/collection-utils.js";
import { clamp, round, toNumber, weightedAverage } from "../shared/number-utils.js";

function parseReps(reps) {
  if (typeof reps === "number" && Number.isFinite(reps)) {
    return reps;
  }

  if (typeof reps !== "string") {
    return 0;
  }

  const normalized = reps.trim();

  if (!normalized) {
    return 0;
  }

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  const rangeMatch = normalized.match(/^(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)$/);

  if (!rangeMatch) {
    return 0;
  }

  const min = Number(rangeMatch[1]);
  const max = Number(rangeMatch[3]);

  return (min + max) / 2;
}

function createPerformanceResult(minutesRaw, kcalRaw, metRaw, intensityFactorRaw) {
  return {
    performance: {
      minutes: round(minutesRaw, 1),
      kcal: round(kcalRaw),
      met: round(metRaw, 2),
      intensityFactor: round(intensityFactorRaw, 2),
    },
    _raw: {
      minutes: minutesRaw,
      kcal: kcalRaw,
      adjustedMet: metRaw,
      intensityFactor: intensityFactorRaw,
    },
  };
}

function calculateStepsItem(item, exercise, weightKg) {
  const minSteps = toNumber(item.prescription?.min, 0);
  const cadencePerMin = toNumber(
    item.prescription?.cadencePerMin,
    DEFAULT_STEPS_CADENCE,
  );
  // Steps are a user-facing input; performance uses the duration model.
  const durationSec = cadencePerMin ? (minSteps / cadencePerMin) * 60 : 0;

  return calculateDurationItem(
    {
      ...item,
      prescription: {
        ...item.prescription,
        durationSec,
        cadencePerMin,
      },
    },
    exercise,
    weightKg,
  );
}

function calculateStrengthItem(item, exercise, weightKg) {
  const sets = toNumber(item.prescription?.sets, 0);
  const avgReps = parseReps(item.prescription?.reps);
  const secPerRepResolved = item.prescription?.secPerRep ?? null;
  const restSecResolved = item.prescription?.restSec ?? null;
  const workMinutesRaw = (sets * avgReps * toNumber(secPerRepResolved, 0)) / 60;
  const restMinutesRaw =
    (Math.max(0, sets - 1) * toNumber(restSecResolved, 0)) / 60;

  let loadFactorRaw = 1;
  if (exercise.relativeLoad && weightKg && item.prescription?.loadKg) {
    loadFactorRaw = clamp(
      (item.prescription.loadKg / weightKg) / exercise.relativeLoad,
      0.7,
      1.6,
    );
  }

  const rirFactorRaw =
    item.prescription?.rir === null || item.prescription?.rir === undefined
      ? 1
      : clamp(1.2 - item.prescription.rir * 0.06, 0.75, 1.2);
  const intensityFactorRaw = loadFactorRaw * rirFactorRaw;
  const workKcalRaw =
    ((exercise.met * weightKg * workMinutesRaw) / 60) * intensityFactorRaw;
  const restKcalRaw = (1.5 * weightKg * restMinutesRaw) / 60;
  const minutesRaw = workMinutesRaw + restMinutesRaw;
  const kcalRaw = workKcalRaw + restKcalRaw;

  return {
    ...createPerformanceResult(minutesRaw, kcalRaw, exercise.met, intensityFactorRaw),
    prescriptionResolved: {
      secPerRep: secPerRepResolved,
      restSec: restSecResolved,
    },
  };
}

function calculateDurationItem(item, exercise, weightKg) {
  const sets = toNumber(item.prescription?.sets, 0);
  const avgReps = parseReps(item.prescription?.reps);
  const secPerRepResolved = item.prescription?.secPerRep ?? null;
  const minutesRaw = item.prescription?.durationSec
    ? item.prescription.durationSec / 60
    : (sets * avgReps * toNumber(secPerRepResolved, 0)) / 60;
  const intensityFactorRaw =
    item.prescription?.cadencePerMin && exercise.cadenceBase
      ? clamp(item.prescription.cadencePerMin / exercise.cadenceBase, 0.8, 1.3)
      : 1;
  const kcalRaw = ((exercise.met * weightKg * minutesRaw) / 60) * intensityFactorRaw;

  return createPerformanceResult(minutesRaw, kcalRaw, exercise.met, intensityFactorRaw);
}

function calculateActivityItem(sectionKey, item, exerciseById, weightKg) {
  const exercise = exerciseById[item.exerciseId];
  const metric = item.prescription?.metric ?? null;

  if (!exercise) {
    return {
      exerciseId: item.exerciseId,
      sectionKey,
      resolvedType: "other",
      resolvedFocus: "general",
      metric,
      prescription: item.prescription,
      notes: item.notes ?? null,
      performance: {
        minutes: 0,
        kcal: 0,
        met: 0,
        intensityFactor: 0,
      },
      _raw: {
        minutes: 0,
        kcal: 0,
        adjustedMet: 0,
        intensityFactor: 0,
      },
    };
  }

  let result;
  if (metric === "steps") {
    result = calculateStepsItem(item, exercise, weightKg);
  } else if (metric === "duration") {
    result = calculateDurationItem(item, exercise, weightKg);
  } else {
    result = calculateStrengthItem(item, exercise, weightKg);
  }

  return {
    exerciseId: item.exerciseId,
    sectionKey,
    resolvedType: exercise.type ?? "other",
    resolvedFocus: exercise.focus ?? "general",
    metric,
    prescription: item.prescription,
    notes: item.notes ?? null,
    ...result,
  };
}

function calculateSection(section, exerciseById, weightKg) {
  const items = (section.items ?? []).map((item) =>
    calculateActivityItem(section.sectionKey, item, exerciseById, weightKg),
  );
  const totalKcalRaw = sumBy(items, (item) => item._raw.kcal);
  const totalMinutesRaw = sumBy(items, (item) => item._raw.minutes);

  return {
    sectionKey: section.sectionKey,
    items,
    totalKcal: round(totalKcalRaw),
    totalMinutes: round(totalMinutesRaw, 1),
    _raw: {
      totalKcal: totalKcalRaw,
      totalMinutes: totalMinutesRaw,
    },
  };
}

function summarizeSteps(sections) {
  const stepItems = sections.flatMap((section) =>
    section.items.filter((item) => item.metric === "steps"),
  );
  const minDailySteps = sumBy(stepItems, (item) => toNumber(item.prescription?.min, 0));
  const totalMinutesRaw = sumBy(stepItems, (item) => item._raw.minutes);
  const totalKcalRaw = sumBy(stepItems, (item) => item._raw.kcal);
  const cadenceWeight = sumBy(stepItems, (item) => toNumber(item.prescription?.min, 0));
  const cadenceWeightedSum = sumBy(
    stepItems,
    (item) =>
      toNumber(item.prescription?.cadencePerMin, DEFAULT_STEPS_CADENCE) *
      toNumber(item.prescription?.min, 0),
  );
  const metAvgRaw = weightedAverage(
    stepItems.map((item) => ({
      value: item._raw.adjustedMet,
      weight: item._raw.minutes,
    })),
    0,
  );
  const intensityAvgRaw = weightedAverage(
    stepItems.map((item) => ({
      value: item._raw.intensityFactor,
      weight: item._raw.minutes,
    })),
    0,
  );

  return {
    minDailySteps: round(minDailySteps),
    cadencePerMin: round(
      cadenceWeight ? cadenceWeightedSum / cadenceWeight : DEFAULT_STEPS_CADENCE,
    ),
    minutes: round(totalMinutesRaw, 1),
    kcal: round(totalKcalRaw),
    met: round(metAvgRaw, 2),
    intensityFactor: round(intensityAvgRaw, 2),
  };
}

export function calculateActivity(activityInput = {}, options = {}) {
  const user = options.user ?? {};
  const exerciseById = options.exerciseById ?? {};
  const basalKcalRaw = toNumber(user.bmr, 0) * 1.2;
  const sections = (activityInput.sections ?? []).map((section) =>
    calculateSection(section, exerciseById, user.weightKg),
  );
  const allItems = sections.flatMap((section) => section.items);
  const activityKcalRaw = sumBy(sections, (section) => section._raw.totalKcal);
  const activityMinutesRaw = sumBy(sections, (section) => section._raw.totalMinutes);
  const totalKcalRaw = basalKcalRaw + activityKcalRaw;
  const metAvgRaw = weightedAverage(
    allItems.map((item) => ({
      value: item._raw.adjustedMet,
      weight: item._raw.minutes,
    })),
    0,
  );
  const intensityAvgRaw = weightedAverage(
    allItems.map((item) => ({
      value: item._raw.intensityFactor,
      weight: item._raw.minutes,
    })),
    0,
  );

  return {
    dayKey: activityInput.dayKey ?? "monday",
    sections: sections.map(({ _raw, items, ...section }) => ({
      ...section,
      items: items.map(({ _raw: itemRaw, ...item }) => item),
    })),
    walking: summarizeSteps(sections),
    activity: {
      basalKcal: round(basalKcalRaw),
      exerciseKcal: round(activityKcalRaw),
      activityKcal: round(activityKcalRaw),
      totalKcal: round(totalKcalRaw),
      activityMinutes: round(activityMinutesRaw, 1),
      metAvg: round(metAvgRaw, 2),
      intensityAvg: round(intensityAvgRaw, 2),
    },
  };
}
