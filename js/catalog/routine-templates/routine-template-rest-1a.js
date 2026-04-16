export default {
  id: "activity_rest_1a",
  dayKeys: ["tuesday", "friday"],
  labelKey: "routines.activity_rest_1a.label",
  descriptionKey: "routines.activity_rest_1a.description",
  steps: {
    minDailySteps: 7000,
    plannedSteps: 8000,
    cadencePerMin: 100,
  },
  gym: {
    items: [],
  },
  extra: {
    items: [
      {
        exerciseId: "stretching",
        durationSec: 1200,
        cadencePerMin: 45,
        sets: null,
        reps: null,
        loadKg: null,
        rir: null,
        secPerRep: null,
        restSec: null,
        notes: null,
      },
    ],
  },
};
