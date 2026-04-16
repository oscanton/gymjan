import { STORAGE_KEYS } from "./application-config.js";
import { DAY_KEYS } from "../shared/app-constants.js";

function createMemoryProvider() {
  const store = new Map();

  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, value);
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

function resolveProvider(customProvider) {
  if (customProvider) {
    return customProvider;
  }

  if (typeof localStorage !== "undefined") {
    return localStorage;
  }

  return createMemoryProvider();
}

function parseJson(value, fallback) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function createLocalStorageGateway(options = {}) {
  const provider = resolveProvider(options.provider);

  return {
    load(key, fallback = null) {
      return parseJson(provider.getItem(key), fallback);
    },
    save(key, value) {
      provider.setItem(key, JSON.stringify(value));
      return value;
    },
    remove(key) {
      provider.removeItem(key);
    },
    loadDayMap(type) {
      return Object.fromEntries(
        DAY_KEYS.map((dayKey) => [
          dayKey,
          this.load(
            type === "activity"
              ? STORAGE_KEYS.dayActivity(dayKey)
              : STORAGE_KEYS.dayNutrition(dayKey),
            null,
          ),
        ]),
      );
    },
  };
}
