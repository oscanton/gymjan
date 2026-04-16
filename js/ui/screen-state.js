import { DAY_KEYS } from "../shared/app-constants.js";

export function createScreenStateStore(initialDayKey = DAY_KEYS[0]) {
  let currentDayKey = DAY_KEYS.includes(initialDayKey) ? initialDayKey : DAY_KEYS[0];

  return {
    getCurrentDayKey() {
      return currentDayKey;
    },
    setCurrentDayKey(dayKey) {
      if (DAY_KEYS.includes(dayKey)) {
        currentDayKey = dayKey;
      }

      return currentDayKey;
    },
  };
}
