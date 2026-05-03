const STANDARD_SECONDARY = {
  saltMaxG: 5,
  fiberPer1000Kcal: 13,
  sugarMaxPctKcal: 0.1,
  saturatedFatMaxPctKcal: 0.1,
  processingMaxScore: 3.8,
  hydrationMlPerKg: 35,
  hydrationActivityMlPerMin: 10,
};

function targetTuning(kcalDeltaPct, macroRatios) {
  return {
    kcalDeltaPct,
    macroRatios,
    secondary: STANDARD_SECONDARY,
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
  id: "standard_male_2000",
  labelKey: "profiles.standard_male_2000.label",
  descriptionKey: "profiles.standard_male_2000.description",
  userPreset: {
    sex: "male",
    targetBaseKcal: 2000,
  },
  fallbackTargetTuning: targetTuning(0, {
    protein: 0.3,
    carbs: 0.4,
    fat: 0.3,
  }),
  weeklyPlan: {
    monday: dayPlan("menu_monday_weightloss", "activity_fuerza_a", 0.05, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
    tuesday: dayPlan("menu_tuesday_weightloss", "activity_recuperacion", -0.05, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
    wednesday: dayPlan("menu_wednesday_weightloss", "activity_fuerza_b", 0.05, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
    thursday: dayPlan("menu_thursday_weightloss", "activity_recuperacion", -0.05, {
      protein: 0.33,
      carbs: 0.33,
      fat: 0.34,
    }),
    friday: dayPlan("menu_friday_weightloss", "activity_fuerza_c", 0.05, {
      protein: 0.3,
      carbs: 0.35,
      fat: 0.35,
    }),
    saturday: dayPlan("menu_saturday_weightloss", "activity_spinning", 0.05, {
      protein: 0.3,
      carbs: 0.4,
      fat: 0.3,
    }),
    sunday: dayPlan("menu_sunday_weightloss", "activity_descanso", -0.05, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
  },
};
