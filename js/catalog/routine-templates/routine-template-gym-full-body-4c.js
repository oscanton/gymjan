export default {
  id: "activity_gymfullbody_4c",
  dayKeys: ["monday", "thursday"],
  labelKey: "routines.activity_gymfullbody_4c.label",
  descriptionKey: "routines.activity_gymfullbody_4c.description",
  steps: {
    minDailySteps: 8000,
    plannedSteps: 10000,
    cadencePerMin: 100,
  },
  gym: {
    items: [
      {
        exerciseId: "bench_press",
        sets: 4,
        reps: "6-10",
        loadKg: 30,
        rir: 2,
        secPerRep: null,
        restSec: null,
      },
      {
        exerciseId: "barbell_row",
        sets: 4,
        reps: "8-10",
        loadKg: 35,
        rir: 2,
        secPerRep: null,
        restSec: null,
      },
      {
        exerciseId: "squat",
        sets: 4,
        reps: "6-8",
        loadKg: 45,
        rir: 2,
        secPerRep: null,
        restSec: null,
      },
    ],
  },
  extra: {
    items: [
      {
        exerciseId: "joint_mobility",
        durationSec: 600,
        cadencePerMin: 50,
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
