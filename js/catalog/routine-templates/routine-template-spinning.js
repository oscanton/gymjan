export default {
  id: "activity_spinning",
  labelKey: "routines.activity_spinning.label",
  descriptionKey: "routines.activity_spinning.description",
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
          exerciseId: "spinning",
          prescription: {
            metric: "duration",
            durationSec: 2700,
            cadencePerMin: 90,
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
