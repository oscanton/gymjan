import {
  createTargetTuning,
  createWeeklyPlan,
  WEIGHT_LOSS_SECONDARY,
} from "./profile-preset-builders.js";

export default {
  id: "weight_loss_female_1500",
  labelKey: "profiles.weight_loss_female_1500.label",
  descriptionKey: "profiles.weight_loss_female_1500.description",
  userPreset: {
    sex: "female",
    targetBaseKcal: 1500,
  },
  fallbackTargetTuning: createTargetTuning(
    -0.18,
    {
      protein: 0.35,
      carbs: 0.35,
      fat: 0.3,
    },
    WEIGHT_LOSS_SECONDARY,
  ),
  weeklyPlan: createWeeklyPlan({
    monday: {
      menuTemplateId: "menu_monday_weightloss",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        -0.18,
        { protein: 0.35, carbs: 0.35, fat: 0.3 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    tuesday: {
      menuTemplateId: "menu_tuesday_weightloss",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        -0.22,
        { protein: 0.4, carbs: 0.28, fat: 0.32 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    wednesday: {
      menuTemplateId: "menu_wednesday_weightloss",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        -0.18,
        { protein: 0.35, carbs: 0.38, fat: 0.27 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    thursday: {
      menuTemplateId: "menu_thursday_weightloss",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        -0.18,
        { protein: 0.35, carbs: 0.35, fat: 0.3 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    friday: {
      menuTemplateId: "menu_friday_weightloss",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        -0.22,
        { protein: 0.4, carbs: 0.28, fat: 0.32 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    saturday: {
      menuTemplateId: "menu_saturday_weightloss",
      activityTemplateId: "activity_gymlegs_3c",
      targetTuning: createTargetTuning(
        -0.16,
        { protein: 0.34, carbs: 0.38, fat: 0.28 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
    sunday: {
      menuTemplateId: "menu_sunday_weightloss",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        -0.18,
        { protein: 0.35, carbs: 0.38, fat: 0.27 },
        WEIGHT_LOSS_SECONDARY,
      ),
    },
  }),
};
