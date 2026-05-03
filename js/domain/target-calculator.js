import { SCORE_TARGETS } from "../shared/app-constants.js";
import { round, toNumber } from "../shared/number-utils.js";
import { mergeDefined } from "../shared/object-utils.js";

const DEFAULT_MACRO_RATIOS = {
  protein: 0.3,
  carbs: 0.4,
  fat: 0.3,
};

function normalizeRatios(ratios, fallbackRatios) {
  const source = {
    protein: toNumber(ratios?.protein, fallbackRatios?.protein ?? 0),
    carbs: toNumber(ratios?.carbs, fallbackRatios?.carbs ?? 0),
    fat: toNumber(ratios?.fat, fallbackRatios?.fat ?? 0),
  };
  const total = source.protein + source.carbs + source.fat;

  if (!total) {
    return { protein: 0, carbs: 0, fat: 0 };
  }

  return {
    protein: source.protein / total,
    carbs: source.carbs / total,
    fat: source.fat / total,
  };
}

function calculateMacroTargets(targetKcal, macroRatios) {
  return {
    protein: Math.round((targetKcal * macroRatios.protein) / 4),
    carbs: Math.round((targetKcal * macroRatios.carbs) / 4),
    fat: Math.round((targetKcal * macroRatios.fat) / 9),
  };
}

export function isRatiosSumValid(ratios, tolerance = 0.001) {
  if (!ratios) {
    return true;
  }

  const total =
    toNumber(ratios.protein, 0) +
    toNumber(ratios.carbs, 0) +
    toNumber(ratios.fat, 0);

  return Math.abs(total - 1) <= tolerance;
}

function resolveProfileTuning(profileFallback = {}, dayTargetTuning = {}) {
  return {
    kcalDeltaPct:
      dayTargetTuning.kcalDeltaPct ?? profileFallback.kcalDeltaPct ?? 0,
    macroRatios: dayTargetTuning.macroRatios ?? profileFallback.macroRatios ?? null,
    secondary: mergeDefined(
      profileFallback.secondary ?? {},
      dayTargetTuning.secondary ?? {},
    ),
  };
}

function resolveMacroRatios(resolvedProfileTuning, userAdjustments) {
  const baseMacroRatios = resolvedProfileTuning.macroRatios ?? DEFAULT_MACRO_RATIOS;
  const effectiveMacroInput = userAdjustments.macroRatios
    ? { ...baseMacroRatios, ...userAdjustments.macroRatios }
    : baseMacroRatios;

  return normalizeRatios(effectiveMacroInput, baseMacroRatios);
}

function resolveSecondary(resolvedProfileTuning, userAdjustments) {
  return mergeDefined(
    resolvedProfileTuning.secondary ?? {},
    userAdjustments.secondary ?? {},
  );
}

function calculateHydrationTargets(user, secondary, activityMinutes) {
  const baseMl =
    toNumber(user.weightKg, 0) * toNumber(secondary.hydrationMlPerKg, 0);
  const extraMl = Math.round(
    activityMinutes * toNumber(secondary.hydrationActivityMlPerMin, 0),
  );

  return {
    ml: Math.round(baseMl + extraMl),
    baseMl: Math.round(baseMl),
    extraMl,
  };
}

function calculateSecondaryTargets(targetKcal, secondary) {
  return {
    saltMaxG: round(toNumber(secondary.saltMaxG, 0), 2),
    fiberMinG: round(
      (targetKcal / 1000) * toNumber(secondary.fiberPer1000Kcal, 0),
      1,
    ),
    sugarMaxG: round(
      (targetKcal * toNumber(secondary.sugarMaxPctKcal, 0)) / 4,
      1,
    ),
    saturatedFatMaxG: round(
      (targetKcal * toNumber(secondary.saturatedFatMaxPctKcal, 0)) / 9,
      1,
    ),
    processingMaxScore: round(toNumber(secondary.processingMaxScore, 0), 1),
  };
}

export function calculateTargets(options = {}) {
  const dayKey = options.dayKey ?? "monday";
  const user = options.user ?? {};
  const activity = options.activity ?? {};
  const userAdjustments = options.userAdjustments ?? {};
  const profileFallback = options.profileFallback ?? {};
  const dayTargetTuning = options.dayTargetTuning ?? {};
  const resolvedProfileTuning = resolveProfileTuning(profileFallback, dayTargetTuning);
  const profileKcalDeltaPct = toNumber(resolvedProfileTuning.kcalDeltaPct, 0);
  const userKcalDeltaPct = toNumber(userAdjustments.kcalDeltaPct, 0);
  const basalKcal = toNumber(activity.activity?.basalKcal, 0);
  const activityKcal = toNumber(activity.activity?.activityKcal, 0);
  const activityMinutes = toNumber(activity.activity?.activityMinutes, 0);
  const tdee = basalKcal + activityKcal;
  const targetKcal = Math.round(
    tdee * (1 + profileKcalDeltaPct) * (1 + userKcalDeltaPct),
  );
  const macroRatios = resolveMacroRatios(resolvedProfileTuning, userAdjustments);
  const secondary = resolveSecondary(resolvedProfileTuning, userAdjustments);
  const macroTargets = calculateMacroTargets(targetKcal, macroRatios);
  const hydrationTargets = calculateHydrationTargets(user, secondary, activityMinutes);
  const secondaryTargets = calculateSecondaryTargets(targetKcal, secondary);

  return {
    dayKey,
    kcal: targetKcal,
    macroRatios: {
      protein: round(macroRatios.protein, 2),
      carbs: round(macroRatios.carbs, 2),
      fat: round(macroRatios.fat, 2),
    },
    protein: macroTargets.protein,
    carbs: macroTargets.carbs,
    fat: macroTargets.fat,
    secondary: secondaryTargets,
    hydration: hydrationTargets,
    activity: {
      targetKcal: round(toNumber(options.activityTargetKcal, 0)),
      metTarget: SCORE_TARGETS.met,
      intensityTarget: SCORE_TARGETS.intensity,
    },
  };
}
