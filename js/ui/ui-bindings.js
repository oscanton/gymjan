import {
  blankToNull,
  copyInput,
  createDefaultPrescription,
  getActivitySection,
  getDefaultActivityItem,
  getDefaultHydrationItem,
  getDefaultMealBlock,
} from "./ui-bindings-helpers.js";

export function bindUi(root, options) {
  const { connector, screens, getViewModel, rerender } = options;

  function commit(action) {
    action();
    rerender();
  }

  function currentDayKey() {
    return screens.getCurrentDayKey();
  }

  function currentDayInput() {
    return copyInput(getViewModel().day.input);
  }

  function updateCurrentDayActivity(mutator) {
    const dayInput = currentDayInput();
    mutator(dayInput.activity);
    connector.saveDayActivity(currentDayKey(), dayInput.activity);
  }

  function updateCurrentDayNutrition(mutator) {
    const dayInput = currentDayInput();
    mutator(dayInput.nutrition);
    connector.saveDayNutrition(currentDayKey(), dayInput.nutrition);
  }

  function updateActivityItemField(target) {
    updateCurrentDayActivity((activity) => {
      const section = getActivitySection(activity, target.dataset.sectionKey);
      const item = section.items[Number(target.dataset.index)];
      const field = target.dataset.field;

      if (field === "exerciseId") {
        item.exerciseId = blankToNull(target.value);
        return;
      }

      if (field === "metric") {
        item.prescription = createDefaultPrescription(blankToNull(target.value));
        return;
      }

      item.prescription[field] = blankToNull(target.value);
    });
  }

  function updateHydrationItemField(target) {
    updateCurrentDayNutrition((nutrition) => {
      const item = nutrition.meals.hydration.items[Number(target.dataset.index)];
      item[target.dataset.field] = blankToNull(target.value);
    });
  }

  function updateMealItemField(target) {
    updateCurrentDayNutrition((nutrition) => {
      const item =
        nutrition.meals[target.dataset.mealKey][
          Number(target.dataset.blockIndex)
        ].items[Number(target.dataset.itemIndex)];
      item[target.dataset.field] = blankToNull(target.value);
    });
  }

  const fieldActionHandlers = {
    locale(target) {
      connector.setLocale(target.value);
    },
    "user-context"(target) {
      const field = target.dataset.field;
      connector.saveUserContext({
        user: {
          [field]: field === "sex" ? target.value : blankToNull(target.value),
        },
      });
    },
    profile(target) {
      connector.saveUserContext({ profileId: target.value || null });
    },
    "day-template"(target) {
      connector.saveDayTemplateSelection({
        dayKey: currentDayKey(),
        [target.dataset.templateField]: target.value || null,
      });
    },
    "activity-item-field"(target) {
      updateActivityItemField(target);
    },
    "hydration-item-field"(target) {
      updateHydrationItemField(target);
    },
    "meal-item-field"(target) {
      updateMealItemField(target);
    },
    "shopping-check"(target) {
      connector.toggleShoppingItem(target.dataset.itemId, target.checked);
    },
  };

  const clickActionHandlers = {
    "select-day"(target) {
      screens.setCurrentDayKey(target.dataset.dayKey);
    },
    "reset-day"() {
      connector.resetDay(currentDayKey());
    },
    "reset-week"() {
      connector.resetWeekEditableState();
    },
    "add-activity-item"(target) {
      updateCurrentDayActivity((activity) => {
        const section = getActivitySection(activity, target.dataset.sectionKey);
        section.items.push(getDefaultActivityItem(target.dataset.sectionKey));
      });
    },
    "remove-activity-item"(target) {
      updateCurrentDayActivity((activity) => {
        const section = getActivitySection(activity, target.dataset.sectionKey);
        section.items.splice(Number(target.dataset.index), 1);
      });
    },
    "add-hydration-item"() {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals.hydration.items.push(getDefaultHydrationItem());
      });
    },
    "remove-hydration-item"(target) {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals.hydration.items.splice(Number(target.dataset.index), 1);
      });
    },
    "add-meal-block"(target) {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals[target.dataset.mealKey].push(getDefaultMealBlock());
      });
    },
    "remove-meal-block"(target) {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals[target.dataset.mealKey].splice(
          Number(target.dataset.blockIndex),
          1,
        );
      });
    },
    "add-meal-item"(target) {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals[target.dataset.mealKey][
          Number(target.dataset.blockIndex)
        ].items.push({ foodId: "rice", amount: 100 });
      });
    },
    "remove-meal-item"(target) {
      updateCurrentDayNutrition((nutrition) => {
        nutrition.meals[target.dataset.mealKey][
          Number(target.dataset.blockIndex)
        ].items.splice(Number(target.dataset.itemIndex), 1);
      });
    },
  };

  function handleFieldAction(target) {
    const action = target.dataset.action;
    const handler = action ? fieldActionHandlers[action] : null;

    if (handler) {
      commit(() => handler(target));
    }
  }

  root.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    if (action) {
      handleFieldAction(target);
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    if (action) {
      handleFieldAction(target);
    }
  });

  root.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const actionTarget = target.closest("[data-action]");
    if (!(actionTarget instanceof HTMLElement)) {
      return;
    }

    const action = actionTarget.dataset.action;
    if (!action) {
      return;
    }

    const handler = clickActionHandlers[action];

    if (handler) {
      commit(() => handler(actionTarget));
    }
  });
}
