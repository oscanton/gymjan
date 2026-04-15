import {
  createTargetTuning,
  createWeeklyPlan,
  GAIN_SECONDARY,
} from "./shared.js";

export default {
  id: "muscle_gain_male_2300",
  labelKey: "profiles.muscle_gain_male_2300.label",
  descriptionKey: "profiles.muscle_gain_male_2300.description",
  userPreset: {
    sex: "male",
    targetBaseKcal: 2300,
  },
  fallbackTargetTuning: createTargetTuning(
    0.12,
    {
      protein: 0.3,
      carbs: 0.45,
      fat: 0.25,
    },
    GAIN_SECONDARY,
  ),
  weeklyPlan: createWeeklyPlan({
    monday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        0.14,
        { protein: 0.3, carbs: 0.46, fat: 0.24 },
        GAIN_SECONDARY,
      ),
    },
    tuesday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        0.08,
        { protein: 0.3, carbs: 0.42, fat: 0.28 },
        GAIN_SECONDARY,
      ),
    },
    wednesday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        0.12,
        { protein: 0.28, carbs: 0.48, fat: 0.24 },
        GAIN_SECONDARY,
      ),
    },
    thursday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_gymfullbody_4c",
      targetTuning: createTargetTuning(
        0.14,
        { protein: 0.3, carbs: 0.46, fat: 0.24 },
        GAIN_SECONDARY,
      ),
    },
    friday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_rest_1a",
      targetTuning: createTargetTuning(
        0.08,
        { protein: 0.3, carbs: 0.42, fat: 0.28 },
        GAIN_SECONDARY,
      ),
    },
    saturday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_gymlegs_3c",
      targetTuning: createTargetTuning(
        0.16,
        { protein: 0.3, carbs: 0.47, fat: 0.23 },
        GAIN_SECONDARY,
      ),
    },
    sunday: {
      menuTemplateId: "menu_gain_1a",
      activityTemplateId: "activity_cardio_1a",
      targetTuning: createTargetTuning(
        0.1,
        { protein: 0.28, carbs: 0.48, fat: 0.24 },
        GAIN_SECONDARY,
      ),
    },
  }),
};
