import { clone } from "../core/utils.js";

function blankToNull(value) {
  return value === "" ? null : value;
}

function getDefaultActivityItem(blockKey) {
  return blockKey === "extra"
    ? {
        exerciseId: "spinning",
        sets: null,
        reps: null,
        loadKg: null,
        rir: null,
        durationSec: 1200,
        cadencePerMin: 90,
        secPerRep: null,
        restSec: null,
        notes: null,
      }
    : {
        exerciseId: "bench_press",
        sets: 3,
        reps: "8",
        loadKg: null,
        rir: 2,
        durationSec: null,
        cadencePerMin: null,
        secPerRep: null,
        restSec: null,
        notes: null,
      };
}

function getDefaultMealBlock() {
  return {
    recipeId: null,
    labelKey: null,
    items: [{ foodId: "rice", amount: 100 }],
  };
}

function getDefaultHydrationItem() {
  return { foodId: "water", amount: 500 };
}

export function bindApp(root, options) {
  const { connector, screens, getViewModel, rerender } = options;

  function commit(action) {
    action();
    rerender();
  }

  function currentDayKey() {
    return screens.getCurrentDayKey();
  }

  function currentDayInput() {
    return clone(getViewModel().day.input);
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

  function handleAction(action, target) {
    switch (action) {
      case "locale":
        commit(() => connector.setLocale(target.value));
        return;
      case "user-context": {
        const field = target.dataset.field;
        commit(() =>
          connector.saveUserContext({
            user: {
              [field]: field === "sex" ? target.value : blankToNull(target.value),
            },
          }),
        );
        return;
      }
      case "profile":
        commit(() => connector.saveUserContext({ profileId: target.value || null }));
        return;
      case "day-template":
        commit(() =>
          connector.saveDayTemplateSelection({
            dayKey: currentDayKey(),
            [target.dataset.templateField]: target.value || null,
          }),
        );
        return;
      case "steps": {
        commit(() =>
          updateCurrentDayActivity((activity) => {
            activity.steps[target.dataset.field] = blankToNull(target.value);
          }),
        );
        return;
      }
      case "activity-item-field": {
        commit(() =>
          updateCurrentDayActivity((activity) => {
            const item =
              activity[target.dataset.blockKey].items[Number(target.dataset.index)];
            item[target.dataset.field] = blankToNull(target.value);
          }),
        );
        return;
      }
      case "hydration-item-field": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            const item = nutrition.meals.hydration.items[Number(target.dataset.index)];
            item[target.dataset.field] = blankToNull(target.value);
          }),
        );
        return;
      }
      case "meal-item-field": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            const item =
              nutrition.meals[target.dataset.mealKey][
                Number(target.dataset.blockIndex)
              ].items[Number(target.dataset.itemIndex)];
            item[target.dataset.field] = blankToNull(target.value);
          }),
        );
        return;
      }
      case "shopping-check":
        commit(() => connector.toggleShoppingItem(target.dataset.itemId, target.checked));
        return;
      default:
    }
  }

  root.addEventListener("input", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    if (action) {
      handleAction(action, target);
    }
  });

  root.addEventListener("change", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const action = target.dataset.action;
    if (action) {
      handleAction(action, target);
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

    switch (action) {
      case "select-day":
        commit(() => screens.setCurrentDayKey(actionTarget.dataset.dayKey));
        return;
      case "reset-day":
        commit(() => connector.resetDay(currentDayKey()));
        return;
      case "reset-week":
        commit(() => connector.resetWeekEditableState());
        return;
      case "add-activity-item": {
        commit(() =>
          updateCurrentDayActivity((activity) => {
            activity[actionTarget.dataset.blockKey].items.push(
              getDefaultActivityItem(actionTarget.dataset.blockKey),
            );
          }),
        );
        return;
      }
      case "remove-activity-item": {
        commit(() =>
          updateCurrentDayActivity((activity) => {
            activity[actionTarget.dataset.blockKey].items.splice(
              Number(actionTarget.dataset.index),
              1,
            );
          }),
        );
        return;
      }
      case "add-hydration-item": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals.hydration.items.push(getDefaultHydrationItem());
          }),
        );
        return;
      }
      case "remove-hydration-item": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals.hydration.items.splice(Number(actionTarget.dataset.index), 1);
          }),
        );
        return;
      }
      case "add-meal-block": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals[actionTarget.dataset.mealKey].push(getDefaultMealBlock());
          }),
        );
        return;
      }
      case "remove-meal-block": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals[actionTarget.dataset.mealKey].splice(
              Number(actionTarget.dataset.blockIndex),
              1,
            );
          }),
        );
        return;
      }
      case "add-meal-item": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals[actionTarget.dataset.mealKey][
              Number(actionTarget.dataset.blockIndex)
            ].items.push({ foodId: "rice", amount: 100 });
          }),
        );
        return;
      }
      case "remove-meal-item": {
        commit(() =>
          updateCurrentDayNutrition((nutrition) => {
            nutrition.meals[actionTarget.dataset.mealKey][
              Number(actionTarget.dataset.blockIndex)
            ].items.splice(Number(actionTarget.dataset.itemIndex), 1);
          }),
        );
        return;
      }
      default:
    }
  });
}
