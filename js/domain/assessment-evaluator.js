import {
  percentageDeviation,
  round,
  toNumber,
} from "../shared/number-utils.js";

const TARGET_STATUS_STEPS = [
  { limit: 5, status: "ok", relationKey: "on_target" },
  { limit: 15, status: "warning" },
  { limit: 30, status: "danger" },
];

const MIN_STATUS_STEPS = [
  { threshold: 1, status: "ok", relationKey: "on_target" },
  { threshold: 0.9, status: "warning", relationKey: "below_min" },
  { threshold: 0.75, status: "danger", relationKey: "below_min" },
];

const MAX_STATUS_STEPS = [
  { threshold: 1, status: "ok", relationKey: "on_target" },
  { threshold: 1.1, status: "warning", relationKey: "above_max" },
  { threshold: 1.25, status: "danger", relationKey: "above_max" },
];

const NUTRITION_TARGET_CHECKS = [
  {
    metricKey: "kcal",
    actual: (value) => toNumber(value.totals?.kcal, 0),
    target: (value) => toNumber(value.kcal, 0),
  },
  {
    metricKey: "protein",
    actual: (value) => toNumber(value.totals?.protein, 0),
    target: (value) => toNumber(value.protein, 0),
  },
  {
    metricKey: "carbs",
    actual: (value) => toNumber(value.totals?.carbs, 0),
    target: (value) => toNumber(value.carbs, 0),
  },
  {
    metricKey: "fat",
    actual: (value) => toNumber(value.totals?.fat, 0),
    target: (value) => toNumber(value.fat, 0),
  },
  {
    metricKey: "hydration",
    actual: (value) => toNumber(value.totals?.hydrationTotalMl, 0),
    target: (value) => toNumber(value.hydration?.ml, 0),
  },
];

const NUTRITION_MIN_CHECKS = [
  {
    metricKey: "fiber",
    actual: (value) => toNumber(value.totals?.fiber, 0),
    target: (value) => toNumber(value.secondary?.fiberMinG, 0),
  },
];

const NUTRITION_MAX_CHECKS = [
  {
    metricKey: "sugar",
    actual: (value) => toNumber(value.totals?.sugar, 0),
    target: (value) => toNumber(value.secondary?.sugarMaxG, 0),
  },
  {
    metricKey: "saturatedFat",
    actual: (value) => toNumber(value.totals?.saturatedFat, 0),
    target: (value) => toNumber(value.secondary?.saturatedFatMaxG, 0),
  },
  {
    metricKey: "saltG",
    actual: (value) => toNumber(value.totals?.saltG, 0),
    target: (value) => toNumber(value.secondary?.saltMaxG, 0),
  },
  {
    metricKey: "processingScore",
    actual: (value) => toNumber(value.totals?.processingScore, 0),
    target: (value) => toNumber(value.secondary?.processingMaxScore, 0),
  },
];

const ACTIVITY_TARGET_CHECKS = [
  {
    metricKey: "activityKcal",
    actual: (value) => toNumber(value.activity?.activityKcal, 0),
    target: (value) => toNumber(value.activity?.targetKcal, 0),
  },
  {
    metricKey: "metAvg",
    actual: (value) => toNumber(value.activity?.metAvg, 0),
    target: (value) => toNumber(value.activity?.metTarget, 0),
  },
  {
    metricKey: "intensityAvg",
    actual: (value) => toNumber(value.activity?.intensityAvg, 0),
    target: (value) => toNumber(value.activity?.intensityTarget, 0),
  },
];

function createCheck(metricKey, actual, target, status, relationKey) {
  return {
    actual: round(actual, 2),
    target: round(target, 2),
    deviationPct: round(percentageDeviation(actual, target), 2),
    status,
    messageKey: `assessment.${metricKey}.${relationKey}`,
  };
}

function assessMetric(metricKey, actual, target, mode) {
  if (!target) {
    return createCheck(metricKey, actual, target, "none", "none");
  }

  if (mode === "target") {
    const deviationPct = Math.abs(percentageDeviation(actual, target));
    const relationKey =
      actual < target
        ? "below_target"
        : actual > target
          ? "above_target"
          : "on_target";
    const step = TARGET_STATUS_STEPS.find((entry) => deviationPct <= entry.limit);

    return createCheck(
      metricKey,
      actual,
      target,
      step?.status ?? "critical",
      step?.relationKey ?? relationKey,
    );
  }

  const ratio = actual / target;
  const steps = mode === "min" ? MIN_STATUS_STEPS : MAX_STATUS_STEPS;
  const step = steps.find((entry) =>
    mode === "min" ? ratio >= entry.threshold : ratio <= entry.threshold,
  );

  return createCheck(
    metricKey,
    actual,
    target,
    step?.status ?? "critical",
    step?.relationKey ?? (mode === "min" ? "below_min" : "above_max"),
  );
}

function buildFlag(metricKey, check) {
  if (!check || check.status === "ok" || check.status === "none") {
    return null;
  }

  if (check.messageKey.includes("below")) {
    return `low_${metricKey}`;
  }

  if (check.messageKey.includes("above")) {
    return `${metricKey}_high`;
  }

  return `${metricKey}_${check.status}`;
}

function buildChecks(definitions, source, targets, mode) {
  return Object.fromEntries(
    definitions.map(({ metricKey, actual, target }) => [
      metricKey,
      assessMetric(metricKey, actual(source), target(targets), mode),
    ]),
  );
}

export function calculateAssessment(options = {}) {
  const nutrition = options.nutrition ?? {};
  const targets = options.targets ?? {};
  const activity = options.activity ?? {};

  const nutritionChecks = {
    ...buildChecks(
      NUTRITION_TARGET_CHECKS,
      nutrition,
      targets,
      "target",
    ),
    ...buildChecks(
      NUTRITION_MIN_CHECKS,
      nutrition,
      targets,
      "min",
    ),
    ...buildChecks(
      NUTRITION_MAX_CHECKS,
      nutrition,
      targets,
      "max",
    ),
  };

  const activityChecks = buildChecks(
    ACTIVITY_TARGET_CHECKS,
    activity,
    {
      walking: activity.walking,
      activity: targets.activity,
    },
    "target",
  );

  const flags = [
    ...Object.entries(nutritionChecks).map(([metricKey, check]) =>
      buildFlag(metricKey, check),
    ),
    ...Object.entries(activityChecks).map(([metricKey, check]) =>
      buildFlag(metricKey, check),
    ),
  ].filter(Boolean);

  return {
    dayKey: options.dayKey ?? "monday",
    nutritionChecks,
    activityChecks,
    flags,
  };
}
