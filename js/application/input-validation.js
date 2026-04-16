import { EXERCISE_BY_ID } from "../catalog/exercise-catalog.js";
import {
  PROFILE_BY_ID,
} from "../catalog/profile-presets/profile-preset-catalog.js";
import { isRatiosSumValid } from "../domain/target-calculator.js";
import { forEachNutritionItem } from "./day-plan-resolver.js";

const ACTIVITY_ITEM_BLOCK_KEYS = ["gym", "extra"];

export function createMessage(code, path, messageKey) {
  return { code, path, messageKey };
}

export function createInputValidation(options) {
  const { state, getEditableDayActivity, getEditableDayNutrition, getFoodsById } =
    options;

  function validateUserContext(userContext) {
    const errors = [];

    if (userContext.user.weightKg <= 0) {
      errors.push(
        createMessage("invalid_weight", "user.weightKg", "errors.invalid_weight"),
      );
    }

    if (userContext.user.heightCm <= 0) {
      errors.push(
        createMessage("invalid_height", "user.heightCm", "errors.invalid_height"),
      );
    }

    if (userContext.user.ageYears <= 0) {
      errors.push(createMessage("invalid_age", "user.ageYears", "errors.invalid_age"));
    }

    if (!PROFILE_BY_ID[userContext.profileId]) {
      errors.push(
        createMessage("invalid_profile", "profileId", "errors.invalid_profile"),
      );
    }

    return { errors, warnings: [] };
  }

  function validateTargetAdjustments(adjustments) {
    const errors = [];

    if (adjustments.macroRatios && !isRatiosSumValid(adjustments.macroRatios)) {
      errors.push(
        createMessage(
          "invalid_macro_ratios",
          "macroRatios",
          "errors.invalid_macro_ratios",
        ),
      );
    }

    return { errors, warnings: [] };
  }

  function validateActivityInput(activityInput) {
    const errors = [];
    const warnings = [];

    if (activityInput.steps.plannedSteps < activityInput.steps.minDailySteps) {
      errors.push(
        createMessage(
          "planned_steps_below_min",
          "steps.plannedSteps",
          "errors.planned_steps_below_min",
        ),
      );
    }

    for (const blockKey of ACTIVITY_ITEM_BLOCK_KEYS) {
      activityInput[blockKey].items.forEach((item, index) => {
        if (!EXERCISE_BY_ID[item.exerciseId]) {
          errors.push(
            createMessage(
              "invalid_exercise",
              `${blockKey}.items.${index}.exerciseId`,
              "errors.invalid_exercise",
            ),
          );
        }

        if (item.rir !== null && (item.rir < 0 || item.rir > 5)) {
          warnings.push(
            createMessage(
              "unexpected_rir",
              `${blockKey}.items.${index}.rir`,
              "warnings.unexpected_rir",
            ),
          );
        }
      });
    }

    return { errors, warnings };
  }

  function validateNutritionInput(nutritionInput) {
    const foodsById = getFoodsById();
    const errors = [];
    const warnings = [];

    forEachNutritionItem(nutritionInput, (item, { mealKey, blockIndex, itemIndex }) => {
      if (!foodsById[item.foodId]) {
        errors.push(
          createMessage(
            "invalid_food",
            `${mealKey}.${blockIndex}.items.${itemIndex}.foodId`,
            "errors.invalid_food",
          ),
        );
      }

      if (item.amount < 0) {
        errors.push(
          createMessage(
            "negative_amount",
            `${mealKey}.${blockIndex}.items.${itemIndex}.amount`,
            "errors.negative_amount",
          ),
        );
      }
    });

    return { errors, warnings };
  }

  function validateDerivedOutput(nutrition, targets) {
    const warnings = [];

    if (nutrition.totals.hydrationDirectMl === 0) {
      warnings.push(
        createMessage("low_hydration", "meals.hydration", "warnings.low_hydration"),
      );
    }

    if (
      nutrition.totals.processingScore >
      Math.max(targets.secondary.processingMaxScore * 1.25, 4.5)
    ) {
      warnings.push(
        createMessage(
          "high_processing_score",
          "totals.processingScore",
          "warnings.high_processing_score",
        ),
      );
    }

    for (const [mealKey, meal] of Object.entries(nutrition.meals)) {
      if (meal.kcal > 1500) {
        warnings.push(
          createMessage(
            "unrealistic_meal_totals",
            `meals.${mealKey}`,
            "warnings.unrealistic_meal_totals",
          ),
        );
      }
    }

    for (const equivalence of state.foodEquivalences) {
      if (equivalence.basis !== "kcal") {
        warnings.push(
          createMessage(
            "unresolved_equivalence_basis",
            "foodEquivalences",
            "warnings.unresolved_equivalence_basis",
          ),
        );
        break;
      }
    }

    return { errors: [], warnings };
  }

  function aggregateValidation(dayKey, nutrition, targets) {
    const userValidation = validateUserContext(state.userContext);
    const targetValidation = validateTargetAdjustments(state.userTargetAdjustments);
    const activityValidation = validateActivityInput(getEditableDayActivity(dayKey));
    const nutritionValidation = validateNutritionInput(getEditableDayNutrition(dayKey));
    const derivedValidation = validateDerivedOutput(nutrition, targets);

    return {
      errors: [
        ...userValidation.errors,
        ...targetValidation.errors,
        ...activityValidation.errors,
        ...nutritionValidation.errors,
      ],
      warnings: [
        ...userValidation.warnings,
        ...targetValidation.warnings,
        ...activityValidation.warnings,
        ...nutritionValidation.warnings,
        ...derivedValidation.warnings,
      ],
    };
  }

  return {
    validateUserContext,
    validateTargetAdjustments,
    validateActivityInput,
    validateNutritionInput,
    validateDerivedOutput,
    aggregateValidation,
  };
}
