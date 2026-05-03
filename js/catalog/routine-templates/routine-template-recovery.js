export default {
  id: "activity_recuperacion",
  labelKey: "routines.activity_recuperacion.label",
  descriptionKey: "routines.activity_recuperacion.description",
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
          exerciseId: "stretching",
          prescription: {
            metric: "duration",
            durationSec: 600,
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
