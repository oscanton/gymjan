export default {
  id: "activity_fuerza_b",
  labelKey: "routines.activity_fuerza_b.label",
  descriptionKey: "routines.activity_fuerza_b.description",
  sections: [
    {
      sectionKey: "walking",
      items: [
        {
          exerciseId: "walk",
          prescription: {
            metric: "steps",
            min: 8000,
            cadencePerMin: 100,
          },
          notes: null,
        },
      ],
    },
    {
      sectionKey: "gym",
      items: [
        {
          exerciseId: "stationary_bike",
          prescription: {
            metric: "duration",
            durationSec: 600,
            cadencePerMin: 85,
          },
          notes: null,
        },
        {
          exerciseId: "cable_pullover",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 30,
            rir: 2,
            secPerRep: 4,
            restSec: 75,
          },
          notes: null,
        },
        {
          exerciseId: "dumbbell_bench_press",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 30,
            rir: 2,
            secPerRep: 4,
            restSec: 120,
          },
          notes: null,
        },
        {
          exerciseId: "seated_low_row",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 30,
            rir: 2,
            secPerRep: 4,
            restSec: 90,
          },
          notes: null,
        },
        {
          exerciseId: "dumbbell_shoulder_press",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 15,
            rir: 2,
            secPerRep: 4,
            restSec: 90,
          },
          notes: null,
        },
        {
          exerciseId: "squat",
          prescription: {
            metric: "strength",
            sets: 3,
            reps: "10",
            loadKg: 25,
            rir: 2,
            secPerRep: 4,
            restSec: 150,
          },
          notes: null,
        },
        {
          exerciseId: "leg_extension",
          prescription: {
            metric: "strength",
            sets: 3,
            reps: "10",
            loadKg: 25,
            rir: 2,
            secPerRep: 4,
            restSec: 75,
          },
          notes: null,
        },
        {
          exerciseId: "leg_curl",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 20,
            rir: 2,
            secPerRep: 4,
            restSec: 75,
          },
          notes: null,
        },
        {
          exerciseId: "elliptical",
          prescription: {
            metric: "duration",
            durationSec: 600,
            cadencePerMin: 140,
          },
          notes: null,
        },
        {
          exerciseId: "crunch",
          prescription: {
            metric: "strength",
            sets: 3,
            reps: "20",
            loadKg: null,
            rir: 2,
            secPerRep: 4,
            restSec: 45,
          },
          notes: null,
        },
        {
          exerciseId: "stretching",
          prescription: {
            metric: "duration",
            durationSec: 300,
            cadencePerMin: 45,
          },
          notes: null,
        },
      ],
    },
    {
      sectionKey: "extra",
      items: [],
    },
  ],
};
