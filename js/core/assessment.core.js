import { percentageDeviation, round, toNumber } from "./utils.js";

function createCheck(metricKey, actual, target, status, relationKey) {
  return {
    actual: round(actual, 2),
    target: round(target, 2),
    deviationPct: round(percentageDeviation(actual, target), 2),
    status,
    messageKey: `assessment.${metricKey}.${relationKey}`,
  };
}

function assessTargetMetric(metricKey, actual, target) {
  if (!target) {
    return createCheck(metricKey, actual, target, "none", "none");
  }

  const deviationPct = Math.abs(percentageDeviation(actual, target));
  const relationKey =
    actual < target ? "below_target" : actual > target ? "above_target" : "on_target";

  if (deviationPct <= 5) {
    return createCheck(metricKey, actual, target, "ok", "on_target");
  }

  if (deviationPct <= 15) {
    return createCheck(metricKey, actual, target, "warning", relationKey);
  }

  if (deviationPct <= 30) {
    return createCheck(metricKey, actual, target, "danger", relationKey);
  }

  return createCheck(metricKey, actual, target, "critical", relationKey);
}

function assessMinMetric(metricKey, actual, target) {
  if (!target) {
    return createCheck(metricKey, actual, target, "none", "none");
  }

  if (actual >= target) {
    return createCheck(metricKey, actual, target, "ok", "on_target");
  }

  if (actual >= target * 0.9) {
    return createCheck(metricKey, actual, target, "warning", "below_min");
  }

  if (actual >= target * 0.75) {
    return createCheck(metricKey, actual, target, "danger", "below_min");
  }

  return createCheck(metricKey, actual, target, "critical", "below_min");
}

function assessMaxMetric(metricKey, actual, target) {
  if (!target) {
    return createCheck(metricKey, actual, target, "none", "none");
  }

  if (actual <= target) {
    return createCheck(metricKey, actual, target, "ok", "on_target");
  }

  if (actual <= target * 1.1) {
    return createCheck(metricKey, actual, target, "warning", "above_max");
  }

  if (actual <= target * 1.25) {
    return createCheck(metricKey, actual, target, "danger", "above_max");
  }

  return createCheck(metricKey, actual, target, "critical", "above_max");
}

function assessHydrationRange(actual, min, max) {
  if (!min || !max) {
    return {
      actual,
      target: { min, max },
      deviationPct: 0,
      status: "none",
      messageKey: "assessment.hydration.none",
    };
  }

  if (actual >= min && actual <= max) {
    return {
      actual,
      target: { min, max },
      deviationPct: 0,
      status: "ok",
      messageKey: "assessment.hydration.within_range",
    };
  }

  const nearestBound = actual < min ? min : max;
  const deviationPct = Math.abs(((actual - nearestBound) / nearestBound) * 100);
  const relationKey = actual < min ? "below_range" : "above_range";

  if (deviationPct <= 10) {
    return {
      actual,
      target: { min, max },
      deviationPct: round(deviationPct, 2),
      status: "warning",
      messageKey: `assessment.hydration.${relationKey}`,
    };
  }

  if (deviationPct <= 25) {
    return {
      actual,
      target: { min, max },
      deviationPct: round(deviationPct, 2),
      status: "danger",
      messageKey: `assessment.hydration.${relationKey}`,
    };
  }

  return {
    actual,
    target: { min, max },
    deviationPct: round(deviationPct, 2),
    status: "critical",
    messageKey: `assessment.hydration.${relationKey}`,
  };
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

export function calculateAssessment(options = {}) {
  const nutrition = options.nutrition ?? {};
  const targets = options.targets ?? {};
  const activity = options.activity ?? {};
  const nutritionChecks = {
    kcal: assessTargetMetric("kcal", toNumber(nutrition.totals?.kcal, 0), toNumber(targets.kcal, 0)),
    protein: assessTargetMetric(
      "protein",
      toNumber(nutrition.totals?.protein, 0),
      toNumber(targets.protein, 0),
    ),
    carbs: assessTargetMetric(
      "carbs",
      toNumber(nutrition.totals?.carbs, 0),
      toNumber(targets.carbs, 0),
    ),
    fat: assessTargetMetric(
      "fat",
      toNumber(nutrition.totals?.fat, 0),
      toNumber(targets.fat, 0),
    ),
    fiber: assessMinMetric(
      "fiber",
      toNumber(nutrition.totals?.fiber, 0),
      toNumber(targets.secondary?.fiberMinG, 0),
    ),
    sugar: assessMaxMetric(
      "sugar",
      toNumber(nutrition.totals?.sugar, 0),
      toNumber(targets.secondary?.sugarMaxG, 0),
    ),
    saturatedFat: assessMaxMetric(
      "saturatedFat",
      toNumber(nutrition.totals?.saturatedFat, 0),
      toNumber(targets.secondary?.saturatedFatMaxG, 0),
    ),
    saltG: assessMaxMetric(
      "saltG",
      toNumber(nutrition.totals?.saltG, 0),
      toNumber(targets.secondary?.saltMaxG, 0),
    ),
    processingScore: assessMaxMetric(
      "processingScore",
      toNumber(nutrition.totals?.processingScore, 0),
      toNumber(targets.secondary?.processingMaxScore, 0),
    ),
    hydration: assessHydrationRange(
      toNumber(nutrition.totals?.hydrationTotalMl, 0),
      toNumber(targets.hydration?.minMl, 0),
      toNumber(targets.hydration?.maxMl, 0),
    ),
  };

  const activityChecks = {
    steps: assessTargetMetric(
      "steps",
      toNumber(activity.steps?.plannedSteps, 0),
      toNumber(activity.steps?.minDailySteps, 0),
    ),
    activityKcal: assessTargetMetric(
      "activity",
      toNumber(activity.activity?.activityKcal, 0),
      toNumber(targets.activity?.targetKcal, 0),
    ),
    metAvg: assessTargetMetric(
      "metAvg",
      toNumber(activity.activity?.metAvg, 0),
      toNumber(targets.activity?.metTarget, 0),
    ),
    intensityAvg: assessTargetMetric(
      "intensityAvg",
      toNumber(activity.activity?.intensityAvg, 0),
      toNumber(targets.activity?.intensityTarget, 0),
    ),
  };

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
