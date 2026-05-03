import { clamp, round, toNumber } from "../shared/number-utils.js";

const NUTRITION_PENALTY_RULES = {
  kcal: { direction: "any", multiplier: 0.7, maxPenalty: 2.5 },
  protein: {
    direction: "split",
    under: { multiplier: 0.8, maxPenalty: 2 },
    over: { multiplier: 0.3, maxPenalty: 1.2 },
  },
  carbs: { direction: "any", multiplier: 0.4, maxPenalty: 1.5 },
  fat: { direction: "any", multiplier: 0.4, maxPenalty: 1.5 },
  fiber: { direction: "under", multiplier: 0.9, maxPenalty: 2 },
  sugar: { direction: "over", multiplier: 0.6, maxPenalty: 1.5 },
  saturatedFat: { direction: "over", multiplier: 0.8, maxPenalty: 2 },
  saltG: { direction: "over", multiplier: 0.6, maxPenalty: 1.5 },
  processingScore: { direction: "over", multiplier: 0.8, maxPenalty: 1.5 },
};

const ACTIVITY_SCORE_RULES = [
  {
    metricKey: "activityKcal",
    weight: 0.5,
    actual: (activity) => toNumber(activity.activity?.activityKcal, 0),
    target: (_activity, targets) => toNumber(targets.activity?.targetKcal, 0),
  },
  {
    metricKey: "metAvg",
    weight: 0.25,
    actual: (activity) => toNumber(activity.activity?.metAvg, 0),
    target: (_activity, targets) => toNumber(targets.activity?.metTarget, 0),
  },
  {
    metricKey: "intensityAvg",
    weight: 0.25,
    actual: (activity) => toNumber(activity.activity?.intensityAvg, 0),
    target: (_activity, targets) => toNumber(targets.activity?.intensityTarget, 0),
  },
];

function getScoreVerdict(score) {
  if (score >= 9) {
    return "very_good";
  }

  if (score >= 7.5) {
    return "good";
  }

  if (score >= 6) {
    return "ok";
  }

  if (score >= 4) {
    return "to_improve";
  }

  return "bad";
}

function getScoreStatus(score) {
  if (score >= 7.5) {
    return "ok";
  }

  if (score >= 6) {
    return "warning";
  }

  if (score >= 4) {
    return "danger";
  }

  return "critical";
}

function penaltyFromDeviation(deviationPct, multiplier, maxPenalty) {
  return Math.min((Math.abs(deviationPct) / 10) * multiplier, maxPenalty);
}

function resolvePenaltyRule(rule, deviationPct) {
  if (rule.direction === "split") {
    return deviationPct < 0 ? rule.under : rule.over;
  }

  if (rule.direction === "under" && deviationPct >= 0) {
    return null;
  }

  if (rule.direction === "over" && deviationPct <= 0) {
    return null;
  }

  return rule;
}

function calculatePenalty(deviationPct, rule) {
  const resolvedRule = resolvePenaltyRule(rule, deviationPct);

  if (!resolvedRule) {
    return 0;
  }

  return penaltyFromDeviation(
    deviationPct,
    resolvedRule.multiplier,
    resolvedRule.maxPenalty,
  );
}

function componentScore(actual, target) {
  if (!target) {
    return 0;
  }

  return clamp((actual / target) * 10, 0, 10);
}

export function calculateScores(options = {}) {
  const assessment = options.assessment ?? {};
  const nutritionChecks = assessment.nutritionChecks ?? {};
  const activity = options.activity ?? {};
  const targets = options.targets ?? {};

  const nutritionBreakdown = Object.fromEntries(
    Object.entries(NUTRITION_PENALTY_RULES).map(([metricKey, rule]) => [
      metricKey,
      calculatePenalty(toNumber(nutritionChecks[metricKey]?.deviationPct, 0), rule),
    ]),
  );
  const nutritionPenaltyTotal = Object.values(nutritionBreakdown).reduce(
    (sum, value) => sum + value,
    0,
  );
  const nutritionScore = Math.max(0, 10 - nutritionPenaltyTotal);

  const activityBreakdown = Object.fromEntries(
    ACTIVITY_SCORE_RULES.map(({ metricKey, actual, target }) => [
      metricKey,
      componentScore(actual(activity), target(activity, targets)),
    ]),
  );
  const activityScore = ACTIVITY_SCORE_RULES.reduce(
    (sum, { metricKey, weight }) => sum + activityBreakdown[metricKey] * weight,
    0,
  );
  const totalScore = nutritionScore * 0.5 + activityScore * 0.5;

  return {
    nutrition: {
      score: round(nutritionScore, 2),
      status: getScoreStatus(nutritionScore),
      verdict: getScoreVerdict(nutritionScore),
      breakdown: Object.fromEntries(
        Object.entries(nutritionBreakdown).map(([metricKey, value]) => [
          metricKey,
          round(value, 2),
        ]),
      ),
    },
    activity: {
      score: round(activityScore, 2),
      status: getScoreStatus(activityScore),
      verdict: getScoreVerdict(activityScore),
      breakdown: Object.fromEntries(
        Object.entries(activityBreakdown).map(([metricKey, value]) => [
          metricKey,
          round(value, 2),
        ]),
      ),
    },
    total: {
      score: round(totalScore, 2),
      status: getScoreStatus(totalScore),
      verdict: getScoreVerdict(totalScore),
      weights: {
        nutrition: 0.5,
        activity: 0.5,
      },
    },
  };
}
