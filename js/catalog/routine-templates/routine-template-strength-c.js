export default {
  id: "activity_fuerza_c",
  labelKey: "routines.activity_fuerza_c.label",
  descriptionKey: "routines.activity_fuerza_c.description",
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
          exerciseId: "step_machine",
          prescription: {
            metric: "duration",
            durationSec: 600,
            cadencePerMin: 90,
          },
          notes: null,
        },
        {
          exerciseId: "behind_neck_pulldown",
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
          exerciseId: "incline_press",
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
          exerciseId: "dumbbell_row",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 20,
            rir: 2,
            secPerRep: 4,
            restSec: 90,
          },
          notes: null,
        },
        {
          exerciseId: "front_raise",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 15,
            rir: 2,
            secPerRep: 4,
            restSec: 60,
          },
          notes: null,
        },
        {
          exerciseId: "bicep_curl",
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
          exerciseId: "rear_delt_pec_deck",
          prescription: {
            metric: "strength",
            sets: 4,
            reps: "10",
            loadKg: 10,
            rir: 2,
            secPerRep: 4,
            restSec: 60,
          },
          notes: null,
        },
        {
          exerciseId: "side_plank",
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
