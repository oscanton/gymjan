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

export function sumBy(items, iteratee) {
  return items.reduce((sum, item, index) => sum + iteratee(item, index), 0);
}

export function safeDivide(numerator, denominator, fallback = 0) {
  if (!denominator) {
    return fallback;
  }

  return numerator / denominator;
}

export function weightedAverage(entries, fallback = 0) {
  const totalWeight = sumBy(entries, (entry) => toNumber(entry.weight, 0));

  if (!totalWeight) {
    return fallback;
  }

  const weightedSum = sumBy(
    entries,
    (entry) => toNumber(entry.value, 0) * toNumber(entry.weight, 0),
  );

  return weightedSum / totalWeight;
}

export function parseReps(reps) {
  if (typeof reps === "number" && Number.isFinite(reps)) {
    return reps;
  }

  if (typeof reps !== "string") {
    return 0;
  }

  const normalized = reps.trim();

  if (!normalized) {
    return 0;
  }

  if (/^\d+(\.\d+)?$/.test(normalized)) {
    return Number(normalized);
  }

  const rangeMatch = normalized.match(/^(\d+(\.\d+)?)\s*-\s*(\d+(\.\d+)?)$/);

  if (!rangeMatch) {
    return 0;
  }

  const min = Number(rangeMatch[1]);
  const max = Number(rangeMatch[3]);

  return (min + max) / 2;
}

export function normalizeRatios(ratios, fallbackRatios) {
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

export function createLookup(items, key = "id") {
  return Object.fromEntries(items.map((item) => [item[key], item]));
}

export function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
}

export function mergeDefined(base, overrides) {
  if (!overrides) {
    return clone(base);
  }

  const result = Array.isArray(base) ? [...base] : { ...base };

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      result[key] &&
      typeof result[key] === "object" &&
      !Array.isArray(result[key])
    ) {
      result[key] = mergeDefined(result[key], value);
      continue;
    }

    result[key] = value;
  }

  return result;
}

export function percentageDeviation(actual, target) {
  if (!target) {
    return 0;
  }

  return ((actual - target) / target) * 100;
}

export function uniqueId(prefix = "id") {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}
