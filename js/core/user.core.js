import { round, toNumber } from "./utils.js";

export function calculateBmi(weightKg, heightCm) {
  const heightM = toNumber(heightCm, 0) / 100;

  if (!heightM || !weightKg) {
    return 0;
  }

  return weightKg / (heightM ** 2);
}

export function getBmiCategory(bmi) {
  if (bmi < 18.5) {
    return "underweight";
  }

  if (bmi < 25) {
    return "normal";
  }

  if (bmi < 30) {
    return "overweight";
  }

  if (bmi < 35) {
    return "obesity";
  }

  return "severe_obesity";
}

export function calculateBmr({ weightKg, heightCm, ageYears, sex }) {
  const safeWeight = toNumber(weightKg, 0);
  const safeHeight = toNumber(heightCm, 0);
  const safeAge = toNumber(ageYears, 0);

  if (safeWeight <= 0 || safeHeight <= 0 || safeAge <= 0) {
    return 0;
  }

  // MVP uses the Mifflin-St Jeor equation.
  const rawBmr =
    sex === "female"
      ? 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge - 161
      : 10 * safeWeight + 6.25 * safeHeight - 5 * safeAge + 5;

  return Math.round(rawBmr);
}

export function calculateUser(userInput = {}) {
  const weightKg = toNumber(userInput.weightKg, 0);
  const heightCm = toNumber(userInput.heightCm, 0);
  const ageYears = toNumber(userInput.ageYears, 0);
  const sex = userInput.sex ?? "male";
  const bmiRaw = calculateBmi(weightKg, heightCm);

  return {
    weightKg,
    heightCm,
    ageYears,
    sex,
    bmi: round(bmiRaw, 1),
    bmiCategory: bmiRaw > 0 ? getBmiCategory(bmiRaw) : "underweight",
    bmr: calculateBmr({ weightKg, heightCm, ageYears, sex }),
  };
}
