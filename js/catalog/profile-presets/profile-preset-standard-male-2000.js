import {
  createTargetTuning,
  createWeeklyPlan,
  STANDARD_SECONDARY,
} from "./profile-preset-builders.js";

export default {
  id: "standard_male_2000",
  labelKey: "profiles.standard_male_2000.label",
  descriptionKey: "profiles.standard_male_2000.description",
  userPreset: {
    sex: "male",
    targetBaseKcal: 2000,
  },
  fallbackTargetTuning: createTargetTuning(
    0,
    {
      protein: 0.3,
      carbs: 0.4,
      fat: 0.3,
    },
    STANDARD_SECONDARY,
  ),
  weeklyPlan: createWeeklyPlan({
    monday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        0,
        { protein: 0.3, carbs: 0.4, fat: 0.3 },
        STANDARD_SECONDARY,
      ),
    },
    tuesday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        -0.04,
        { protein: 0.32, carbs: 0.35, fat: 0.33 },
        STANDARD_SECONDARY,
      ),
    },
    wednesday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        0.02,
        { protein: 0.3, carbs: 0.42, fat: 0.28 },
        STANDARD_SECONDARY,
      ),
    },
    thursday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        0,
        { protein: 0.3, carbs: 0.4, fat: 0.3 },
        STANDARD_SECONDARY,
      ),
    },
    friday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        -0.04,
        { protein: 0.32, carbs: 0.35, fat: 0.33 },
        STANDARD_SECONDARY,
      ),
    },
    saturday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_gymlegs_3c",
      targetTuning: createTargetTuning(
        0.04,
        { protein: 0.3, carbs: 0.42, fat: 0.28 },
        STANDARD_SECONDARY,
      ),
    },
    sunday: {
      menuTemplateId: "menu_standard_1a",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        0.02,
        { protein: 0.3, carbs: 0.42, fat: 0.28 },
        STANDARD_SECONDARY,
      ),
    },
  }),
};
