import { SCORE_TARGETS } from "../app/config.js";
import { mergeDefined, normalizeRatios, round, toNumber } from "./utils.js";

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
  const baseMacroRatios = resolvedProfileTuning.macroRatios ?? {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3,
  };
  const effectiveMacroInput = userAdjustments.macroRatios
    ? { ...baseMacroRatios, ...userAdjustments.macroRatios }
    : baseMacroRatios;
  const macroRatios = normalizeRatios(effectiveMacroInput, baseMacroRatios);
  const profileSecondary = resolvedProfileTuning.secondary ?? {};
  const secondary = mergeDefined(profileSecondary, userAdjustments.secondary ?? {});
  const protein = Math.round((targetKcal * macroRatios.protein) / 4);
  const carbs = Math.round((targetKcal * macroRatios.carbs) / 4);
  const fat = Math.round((targetKcal * macroRatios.fat) / 9);
  const hydrationBaseMinByWeight =
    toNumber(user.weightKg, 0) * toNumber(secondary.hydrationMinMlPerKg, 0);
  const hydrationBaseMaxByWeight =
    toNumber(user.weightKg, 0) * toNumber(secondary.hydrationMaxMlPerKg, 0);
  const hydrationBaseMin = Math.max(
    toNumber(secondary.hydrationBaseMl, 0),
    hydrationBaseMinByWeight,
  );
  const hydrationBaseMax = Math.max(hydrationBaseMin, hydrationBaseMaxByWeight);
  const hydrationExtraMl = Math.round(
    activityMinutes * toNumber(secondary.hydrationActivityMlPerMin, 0),
  );

  return {
    dayKey,
    kcal: targetKcal,
    macroRatios: {
      protein: round(macroRatios.protein, 2),
      carbs: round(macroRatios.carbs, 2),
      fat: round(macroRatios.fat, 2),
    },
    protein,
    carbs,
    fat,
    secondary: {
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
    },
    hydration: {
      minMl: Math.round(hydrationBaseMin + hydrationExtraMl),
      maxMl: Math.round(hydrationBaseMax + hydrationExtraMl),
      baseMinMl: Math.round(hydrationBaseMin),
      baseMaxMl: Math.round(hydrationBaseMax),
      extraMl: hydrationExtraMl,
    },
    activity: {
      targetKcal: round(toNumber(options.activityTargetKcal, 0)),
      metTarget: SCORE_TARGETS.met,
      intensityTarget: SCORE_TARGETS.intensity,
    },
  };
}
