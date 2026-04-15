import { DAY_KEYS } from "../../app/config.js";

export function createTargetTuning(kcalDeltaPct, macroRatios, secondary) {
  return {
    kcalDeltaPct,
    macroRatios,
    secondary,
  };
}

function createWeekMap(factory) {
  return Object.fromEntries(DAY_KEYS.map((dayKey) => [dayKey, factory(dayKey)]));
}

export function createWeeklyPlan(defaults) {
  return createWeekMap((dayKey) => defaults[dayKey]);
}

export const WEIGHT_LOSS_SECONDARY = {
  saltMaxG: 5,
  fiberPer1000Kcal: 14,
  sugarMaxPctKcal: 0.1,
  saturatedFatMaxPctKcal: 0.1,
  processingMaxScore: 3.5,
  hydrationBaseMl: 2000,
  hydrationMinMlPerKg: 30,
  hydrationMaxMlPerKg: 35,
  hydrationActivityMlPerMin: 10,
};

export const STANDARD_SECONDARY = {
  saltMaxG: 5,
  fiberPer1000Kcal: 13,
  sugarMaxPctKcal: 0.1,
  saturatedFatMaxPctKcal: 0.1,
  processingMaxScore: 3.8,
  hydrationBaseMl: 2200,
  hydrationMinMlPerKg: 30,
  hydrationMaxMlPerKg: 36,
  hydrationActivityMlPerMin: 10,
};

export const GAIN_SECONDARY = {
  saltMaxG: 5.5,
  fiberPer1000Kcal: 15,
  sugarMaxPctKcal: 0.12,
  saturatedFatMaxPctKcal: 0.11,
  processingMaxScore: 4,
  hydrationBaseMl: 2500,
  hydrationMinMlPerKg: 32,
  hydrationMaxMlPerKg: 38,
  hydrationActivityMlPerMin: 11,
};
