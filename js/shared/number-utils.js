export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

export function round(value, decimals = 0) {
  const factor = 10 ** decimals;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

export function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toNullableNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function safeDivide(numerator, denominator, fallback = 0) {
  if (!denominator) {
    return fallback;
  }

  return numerator / denominator;
}

export function weightedAverage(entries, fallback = 0) {
  const totalWeight = entries.reduce(
    (sum, entry) => sum + toNumber(entry.weight, 0),
    0,
  );

  if (!totalWeight) {
    return fallback;
  }

  const weightedSum = entries.reduce(
    (sum, entry) => sum + toNumber(entry.value, 0) * toNumber(entry.weight, 0),
    0,
  );

  return weightedSum / totalWeight;
}

export function percentageDeviation(actual, target) {
  if (!target) {
    return 0;
  }

  return ((actual - target) / target) * 100;
}
