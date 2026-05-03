export default {
  id: "activity_fuerza_a",
  labelKey: "routines.activity_fuerza_a.label",
  descriptionKey: "routines.activity_fuerza_a.description",
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
          exerciseId: "elliptical",
          prescription: {
            metric: "duration",
            durationSec: 600,
            cadencePerMin: 140,
          },
          notes: null,
        },
        {
          exerciseId: "lat_pulldown",
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
          exerciseId: "barbell_bench_press",
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
          exerciseId: "machine_high_row",
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
          exerciseId: "machine_shoulder_press",
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
          exerciseId: "tricep_extension",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 12,
            rir: 2,
            secPerRep: 4,
            restSec: 60,
          },
          notes: null,
        },
        {
          exerciseId: "chest_fly",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 16,
            rir: 2,
            secPerRep: 4,
            restSec: 60,
          },
          notes: null,
        },
        {
          exerciseId: "running",
          prescription: {
            metric: "duration",
            durationSec: 600,
            cadencePerMin: 160,
          },
          notes: null,
        },
        {
          exerciseId: "plank",
          prescription: {
            metric: "duration",
            durationSec: 60,
            cadencePerMin: null,
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
