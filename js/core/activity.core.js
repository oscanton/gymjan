import {
  DEFAULT_STEPS_CADENCE,
  DEFAULT_STEPS_MET,
  DEFAULT_STRENGTH_REST_SEC,
  DEFAULT_STRENGTH_SEC_PER_REP,
} from "../app/config.js";
import {
  clamp,
  parseReps,
  round,
  sumBy,
  toNumber,
  weightedAverage,
} from "./utils.js";

function calculateSteps(stepsInput = {}, user = {}) {
  const plannedSteps = toNumber(stepsInput.plannedSteps, 0);
  const minDailySteps = toNumber(stepsInput.minDailySteps, 0);
  const cadencePerMin = toNumber(stepsInput.cadencePerMin, DEFAULT_STEPS_CADENCE);
  const weightKg = toNumber(user.weightKg, 0);
  const stepsMinutesRaw = cadencePerMin ? plannedSteps / cadencePerMin : 0;
  const intensityFactorRaw = clamp(
    cadencePerMin / DEFAULT_STEPS_CADENCE,
    0.85,
    1.25,
  );
  const metRaw = DEFAULT_STEPS_MET * intensityFactorRaw;
  const kcalRaw = (metRaw * weightKg * stepsMinutesRaw) / 60;

  return {
    minDailySteps,
    plannedSteps,
    cadencePerMin,
    minutes: round(stepsMinutesRaw, 1),
    kcal: round(kcalRaw),
    met: round(metRaw, 2),
    intensityFactor: round(intensityFactorRaw, 2),
    _raw: {
      minutes: stepsMinutesRaw,
      kcal: kcalRaw,
      met: metRaw,
      intensityFactor: intensityFactorRaw,
    },
  };
}

function calculateStrengthItem(item, exercise, weightKg) {
  const sets = toNumber(item.sets, 0);
  const avgReps = parseReps(item.reps);
  const secPerRepResolved =
    item.secPerRep ?? exercise.defaultSecPerRep ?? DEFAULT_STRENGTH_SEC_PER_REP;
  const restSecResolved =
    item.restSec ?? exercise.defaultRestSec ?? DEFAULT_STRENGTH_REST_SEC;
  const workMinutesRaw = (sets * avgReps * secPerRepResolved) / 60;
  const restMinutesRaw = (Math.max(0, sets - 1) * restSecResolved) / 60;

  let loadFactor = 1;
  if (exercise.relativeLoad && weightKg && item.loadKg) {
    const loadFactorRaw = (item.loadKg / weightKg) / exercise.relativeLoad;
    loadFactor = clamp(loadFactorRaw, 0.7, 1.6);
  }

  const rirFactor =
    item.rir === null || item.rir === undefined
      ? 1
      : clamp(1.2 - item.rir * 0.06, 0.75, 1.2);
  const workKcalRaw =
    ((exercise.met * weightKg * workMinutesRaw) / 60) * loadFactor * rirFactor;
  const restKcalRaw = (1.5 * weightKg * restMinutesRaw) / 60;
  const totalMinutesRaw = workMinutesRaw + restMinutesRaw;
  const totalKcalRaw = workKcalRaw + restKcalRaw;
  const intensityFactor = round(loadFactor * rirFactor, 2);

  return {
    exerciseId: item.exerciseId,
    resolvedType: "strength",
    kcal: round(totalKcalRaw),
    minutes: round(totalMinutesRaw, 1),
    met: round(exercise.met, 2),
    intensityFactor,
    loadKg: item.loadKg,
    sets: item.sets,
    reps: item.reps,
    rir: item.rir,
    secPerRepResolved,
    restSecResolved,
    _raw: {
      minutes: totalMinutesRaw,
      kcal: totalKcalRaw,
      adjustedMet: exercise.met * intensityFactor,
      intensityFactor: loadFactor * rirFactor,
    },
  };
}

function calculateNonStrengthItem(item, exercise, weightKg) {
  const sets = toNumber(item.sets, 0);
  const avgReps = parseReps(item.reps);
  const secPerRepResolved =
    item.secPerRep ?? exercise.defaultSecPerRep ?? DEFAULT_STRENGTH_SEC_PER_REP;
  const durationMinutesRaw = item.durationSec
    ? item.durationSec / 60
    : (sets * avgReps * secPerRepResolved) / 60;
  const cadenceFactorRaw =
    item.cadencePerMin && exercise.cadenceBase
      ? clamp(item.cadencePerMin / exercise.cadenceBase, 0.8, 1.3)
      : 1;
  const kcalRaw =
    ((exercise.met * weightKg * durationMinutesRaw) / 60) * cadenceFactorRaw;
  const intensityFactor = round(cadenceFactorRaw, 2);

  return {
    exerciseId: item.exerciseId,
    resolvedType: exercise.type ?? "other",
    kcal: round(kcalRaw),
    minutes: round(durationMinutesRaw, 1),
    met: round(exercise.met, 2),
    intensityFactor,
    durationSec: item.durationSec,
    cadencePerMin: item.cadencePerMin,
    sets: item.sets,
    reps: item.reps,
    _raw: {
      minutes: durationMinutesRaw,
      kcal: kcalRaw,
      adjustedMet: exercise.met * cadenceFactorRaw,
      intensityFactor: cadenceFactorRaw,
    },
  };
}

function calculateActivityItem(item, exerciseById, weightKg) {
  const exercise = exerciseById[item.exerciseId];

  if (!exercise) {
    return {
      exerciseId: item.exerciseId,
      resolvedType: "other",
      kcal: 0,
      minutes: 0,
      met: 0,
      intensityFactor: 0,
      _raw: {
        minutes: 0,
        kcal: 0,
        adjustedMet: 0,
        intensityFactor: 0,
      },
    };
  }

  if (exercise.type === "strength") {
    return calculateStrengthItem(item, exercise, weightKg);
  }

  return calculateNonStrengthItem(item, exercise, weightKg);
}

function calculateBlock(items, exerciseById, weightKg) {
  const derivedItems = items.map((item) =>
    calculateActivityItem(item, exerciseById, weightKg),
  );
  const totalKcalRaw = sumBy(derivedItems, (item) => item._raw.kcal);
  const totalMinutesRaw = sumBy(derivedItems, (item) => item._raw.minutes);

  return {
    items: derivedItems,
    totalKcal: round(totalKcalRaw),
    totalMinutes: round(totalMinutesRaw, 1),
    _raw: {
      totalKcal: totalKcalRaw,
      totalMinutes: totalMinutesRaw,
    },
  };
}

export function calculateActivity(activityInput = {}, options = {}) {
  const user = options.user ?? {};
  const exerciseById = options.exerciseById ?? {};
  const basalKcalRaw = toNumber(user.bmr, 0) * 1.2;
  const steps = calculateSteps(activityInput.steps, user);
  const gym = calculateBlock(activityInput.gym?.items ?? [], exerciseById, user.weightKg);
  const extra = calculateBlock(
    activityInput.extra?.items ?? [],
    exerciseById,
    user.weightKg,
  );

  const activityKcalRaw = steps._raw.kcal + gym._raw.totalKcal + extra._raw.totalKcal;
  const activityMinutesRaw =
    steps._raw.minutes + gym._raw.totalMinutes + extra._raw.totalMinutes;
  const totalKcalRaw = basalKcalRaw + activityKcalRaw;

  const metAvgRaw = weightedAverage(
    [
      {
        value: steps._raw.met,
        weight: steps._raw.minutes,
      },
      ...gym.items.map((item) => ({
        value: item._raw.adjustedMet,
        weight: item._raw.minutes,
      })),
      ...extra.items.map((item) => ({
        value: item._raw.adjustedMet,
        weight: item._raw.minutes,
      })),
    ],
    0,
  );

  const intensityAvgRaw = weightedAverage(
    [
      {
        value: steps._raw.intensityFactor,
        weight: steps._raw.minutes,
      },
      ...gym.items.map((item) => ({
        value: item._raw.intensityFactor,
        weight: item._raw.minutes,
      })),
      ...extra.items.map((item) => ({
        value: item._raw.intensityFactor,
        weight: item._raw.minutes,
      })),
    ],
    0,
  );

  return {
    dayKey: activityInput.dayKey ?? "monday",
    steps: {
      minDailySteps: steps.minDailySteps,
      plannedSteps: steps.plannedSteps,
      cadencePerMin: steps.cadencePerMin,
      minutes: steps.minutes,
      kcal: steps.kcal,
      met: steps.met,
      intensityFactor: steps.intensityFactor,
    },
    gym: {
      items: gym.items.map(({ _raw, ...item }) => item),
      totalKcal: gym.totalKcal,
      totalMinutes: gym.totalMinutes,
    },
    extra: {
      items: extra.items.map(({ _raw, ...item }) => item),
      totalKcal: extra.totalKcal,
      totalMinutes: extra.totalMinutes,
    },
    activity: {
      basalKcal: round(basalKcalRaw),
      stepsKcal: steps.kcal,
      gymKcal: gym.totalKcal,
      extraKcal: extra.totalKcal,
      activityKcal: round(activityKcalRaw),
      totalKcal: round(totalKcalRaw),
      activityMinutes: round(activityMinutesRaw, 1),
      metAvg: round(metAvgRaw, 2),
      intensityAvg: round(intensityAvgRaw, 2),
    },
  };
}
