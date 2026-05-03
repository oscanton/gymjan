const GAIN_SECONDARY = {
  saltMaxG: 5.5,
  fiberPer1000Kcal: 15,
  sugarMaxPctKcal: 0.12,
  saturatedFatMaxPctKcal: 0.11,
  processingMaxScore: 4,
  hydrationMlPerKg: 38,
  hydrationActivityMlPerMin: 11,
};

function targetTuning(kcalDeltaPct, macroRatios) {
  return {
    kcalDeltaPct,
    macroRatios,
    secondary: GAIN_SECONDARY,
  };
}

function dayPlan(menuTemplateId, routineTemplateId, kcalDeltaPct, macroRatios) {
  return {
    menuTemplateId,
    routineTemplateId,
    targetTuning: targetTuning(kcalDeltaPct, macroRatios),
  };
}

export default {
  id: "muscle_gain_male_2300",
  labelKey: "profiles.muscle_gain_male_2300.label",
  descriptionKey: "profiles.muscle_gain_male_2300.description",
  userPreset: {
    sex: "male",
    targetBaseKcal: 2300,
  },
  fallbackTargetTuning: targetTuning(0.12, {
    protein: 0.3,
    carbs: 0.45,
    fat: 0.25,
  }),
  weeklyPlan: {
    monday: dayPlan("menu_gain_1a", "activity_fuerza_a", 0.14, {
      protein: 0.3,
      carbs: 0.46,
      fat: 0.24,
    }),
    tuesday: dayPlan("menu_gain_1a", "activity_recuperacion", 0.08, {
      protein: 0.3,
      carbs: 0.42,
      fat: 0.28,
    }),
    wednesday: dayPlan("menu_gain_1a", "activity_fuerza_b", 0.12, {
      protein: 0.28,
      carbs: 0.48,
      fat: 0.24,
    }),
    thursday: dayPlan("menu_gain_1a", "activity_fuerza_a", 0.14, {
      protein: 0.3,
      carbs: 0.46,
      fat: 0.24,
    }),
    friday: dayPlan("menu_gain_1a", "activity_recuperacion", 0.08, {
      protein: 0.3,
      carbs: 0.42,
      fat: 0.28,
    }),
    saturday: dayPlan("menu_gain_1a", "activity_fuerza_c", 0.16, {
      protein: 0.3,
      carbs: 0.47,
      fat: 0.23,
    }),
    sunday: dayPlan("menu_gain_1a", "activity_descanso", 0.1, {
      protein: 0.3,
      carbs: 0.42,
      fat: 0.28,
    }),
  },
};
