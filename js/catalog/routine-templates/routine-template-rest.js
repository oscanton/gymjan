export default {
  id: "activity_descanso",
  labelKey: "routines.activity_descanso.label",
  descriptionKey: "routines.activity_descanso.description",
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
      items: [],
    },
    {
      sectionKey: "extra",
      items: [],
    },
  ],
};
