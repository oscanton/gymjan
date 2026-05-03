const WEIGHT_LOSS_SECONDARY = {
  saltMaxG: 5,
  fiberPer1000Kcal: 14,
  sugarMaxPctKcal: 0.1,
  saturatedFatMaxPctKcal: 0.1,
  processingMaxScore: 3.5,
  hydrationMlPerKg: 35,
  hydrationActivityMlPerMin: 10,
};

function targetTuning(kcalDeltaPct, macroRatios) {
  return {
    kcalDeltaPct,
    macroRatios,
    secondary: WEIGHT_LOSS_SECONDARY,
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
  id: "weight_loss_female_1500",
  labelKey: "profiles.weight_loss_female_1500.label",
  descriptionKey: "profiles.weight_loss_female_1500.description",
  userPreset: {
    sex: "female",
    targetBaseKcal: 1500,
  },
  fallbackTargetTuning: targetTuning(-0.18, {
    protein: 0.35,
    carbs: 0.35,
    fat: 0.3,
  }),
  weeklyPlan: {
    monday: dayPlan("menu_monday_weightloss", "activity_fuerza_a", -0.18, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
    tuesday: dayPlan("menu_tuesday_weightloss", "activity_recuperacion", -0.22, {
      protein: 0.4,
      carbs: 0.28,
      fat: 0.32,
    }),
    wednesday: dayPlan("menu_wednesday_weightloss", "activity_spinning", -0.18, {
      protein: 0.35,
      carbs: 0.38,
      fat: 0.27,
    }),
    thursday: dayPlan("menu_thursday_weightloss", "activity_fuerza_b", -0.18, {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    }),
    friday: dayPlan("menu_friday_weightloss", "activity_recuperacion", -0.22, {
      protein: 0.4,
      carbs: 0.28,
      fat: 0.32,
    }),
    saturday: dayPlan("menu_saturday_weightloss", "activity_fuerza_c", -0.16, {
      protein: 0.34,
      carbs: 0.38,
      fat: 0.28,
    }),
    sunday: dayPlan("menu_sunday_weightloss", "activity_descanso", -0.22, {
      protein: 0.4,
      carbs: 0.28,
      fat: 0.32,
    }),
  },
};
