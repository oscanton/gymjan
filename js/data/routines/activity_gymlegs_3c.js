export default {
  id: "activity_gymlegs_3c",
  dayKeys: ["saturday"],
  labelKey: "routines.activity_gymlegs_3c.label",
  descriptionKey: "routines.activity_gymlegs_3c.description",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 9500,
    cadencePerMin: 100,
  },
  gym: {
    items: [
      {
        exerciseId: "squat",
        sets: 4,
        reps: "6-8",
        loadKg: 55,
        rir: 2,
        secPerRep: null,
        restSec: null,
      },
      {
        exerciseId: "romanian_deadlift",
        sets: 4,
        reps: "8-10",
        loadKg: 50,
        rir: 2,
        secPerRep: null,
        restSec: null,
      },
      {
        exerciseId: "lunges",
        sets: 3,
        reps: "10-12",
        loadKg: 18,
        rir: 1,
        secPerRep: null,
        restSec: null,
      },
    ],
  },
  extra: {
    items: [
      {
        exerciseId: "stretching",
        durationSec: 600,
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
