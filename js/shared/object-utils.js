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
