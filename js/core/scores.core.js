import { clamp, round, toNumber } from "./utils.js";

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
  const kcalPenalty = penaltyFromDeviation(
    nutritionChecks.kcal?.deviationPct ?? 0,
    0.7,
    2.5,
  );
  const proteinDeviation = toNumber(nutritionChecks.protein?.deviationPct, 0);
  const proteinPenalty =
    proteinDeviation < 0
      ? penaltyFromDeviation(proteinDeviation, 0.8, 2)
      : penaltyFromDeviation(proteinDeviation, 0.3, 1.2);
  const carbsPenalty = penaltyFromDeviation(
    nutritionChecks.carbs?.deviationPct ?? 0,
    0.4,
    1.5,
  );
  const fatPenalty = penaltyFromDeviation(
    nutritionChecks.fat?.deviationPct ?? 0,
    0.4,
    1.5,
  );
  const fiberPenalty =
    toNumber(nutritionChecks.fiber?.deviationPct, 0) < 0
      ? penaltyFromDeviation(nutritionChecks.fiber?.deviationPct ?? 0, 0.9, 2)
      : 0;
  const sugarPenalty =
    toNumber(nutritionChecks.sugar?.deviationPct, 0) > 0
      ? penaltyFromDeviation(nutritionChecks.sugar?.deviationPct ?? 0, 0.6, 1.5)
      : 0;
  const saturatedFatPenalty =
    toNumber(nutritionChecks.saturatedFat?.deviationPct, 0) > 0
      ? penaltyFromDeviation(
          nutritionChecks.saturatedFat?.deviationPct ?? 0,
          0.8,
          2,
        )
      : 0;
  const saltPenalty =
    toNumber(nutritionChecks.saltG?.deviationPct, 0) > 0
      ? penaltyFromDeviation(nutritionChecks.saltG?.deviationPct ?? 0, 0.6, 1.5)
      : 0;
  const processingPenalty =
    toNumber(nutritionChecks.processingScore?.deviationPct, 0) > 0
      ? penaltyFromDeviation(
          nutritionChecks.processingScore?.deviationPct ?? 0,
          0.8,
          1.5,
        )
      : 0;

  const nutritionPenaltyTotal =
    kcalPenalty +
    proteinPenalty +
    carbsPenalty +
    fatPenalty +
    fiberPenalty +
    sugarPenalty +
    saturatedFatPenalty +
    saltPenalty +
    processingPenalty;
  const nutritionScore = Math.max(0, 10 - nutritionPenaltyTotal);

  const stepsScore = componentScore(
    toNumber(activity.steps?.plannedSteps, 0),
    toNumber(activity.steps?.minDailySteps, 0),
  );
  const activityKcalScore = componentScore(
    toNumber(activity.activity?.activityKcal, 0),
    toNumber(targets.activity?.targetKcal, 0),
  );
  const metScore = componentScore(
    toNumber(activity.activity?.metAvg, 0),
    toNumber(targets.activity?.metTarget, 0),
  );
  const intensityScore = componentScore(
    toNumber(activity.activity?.intensityAvg, 0),
    toNumber(targets.activity?.intensityTarget, 0),
  );
  const activityScore =
    stepsScore * 0.3 +
    activityKcalScore * 0.3 +
    metScore * 0.2 +
    intensityScore * 0.2;
  const totalScore = nutritionScore * 0.5 + activityScore * 0.5;

  return {
    nutrition: {
      score: round(nutritionScore, 2),
      status: getScoreStatus(nutritionScore),
      verdict: getScoreVerdict(nutritionScore),
      breakdown: {
        kcal: round(kcalPenalty, 2),
        protein: round(proteinPenalty, 2),
        carbs: round(carbsPenalty, 2),
        fat: round(fatPenalty, 2),
        fiber: round(fiberPenalty, 2),
        sugar: round(sugarPenalty, 2),
        saturatedFat: round(saturatedFatPenalty, 2),
        saltG: round(saltPenalty, 2),
        processingScore: round(processingPenalty, 2),
      },
    },
    activity: {
      score: round(activityScore, 2),
      status: getScoreStatus(activityScore),
      verdict: getScoreVerdict(activityScore),
      breakdown: {
        steps: round(stepsScore, 2),
        activityKcal: round(activityKcalScore, 2),
        metAvg: round(metScore, 2),
        intensityAvg: round(intensityScore, 2),
      },
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
