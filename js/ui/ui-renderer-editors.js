import { DAY_KEYS } from "../shared/app-constants.js";
import {
  escapeHtml,
  getTemplateLabel,
  renderEmptyState,
  renderField,
  renderInputField,
  renderPanel,
  renderSelectField,
  renderSelectOptions,
  sortByLabel,
} from "./ui-renderer-shared.js";

export function renderDayTabs(viewModel, t) {
  return `
    <div class="scroll-x">
      <div class="day-tabs">
        ${DAY_KEYS.map(
          (dayKey) => `
            <button
              type="button"
              class="day-tab ${dayKey === viewModel.currentDayKey ? "is-active" : ""}"
              data-action="select-day"
              data-day-key="${dayKey}"
            >
              ${escapeHtml(t(`days.${dayKey}`))}
            </button>
          `,
        ).join("")}
      </div>
    </div>
  `;
}

export function renderUserContextSection(viewModel, t) {
  const userContext = viewModel.userContext;

  return renderPanel(
    t("sections.userContext"),
    `
      <div class="field-grid">
        ${renderSelectField({
          id: "locale",
          label: t("labels.locale"),
          options: viewModel.reference.locales,
          selectedValue: userContext.locale,
          getValue: (locale) => locale,
          getLabel: (locale) => locale.toUpperCase(),
          dataset: { action: "locale" },
        })}
        ${renderField(
          t("labels.sex"),
          `
            <select id="sex" data-action="user-context" data-field="sex">
              <option value="male" ${userContext.user.sex === "male" ? "selected" : ""}>${escapeHtml(
                t("sex.male"),
              )}</option>
              <option value="female" ${userContext.user.sex === "female" ? "selected" : ""}>${escapeHtml(
                t("sex.female"),
              )}</option>
            </select>
          `,
          "sex",
        )}
        ${renderInputField({
          id: "weightKg",
          label: t("labels.weightKg"),
          type: "number",
          min: 0,
          step: 0.1,
          value: userContext.user.weightKg,
          dataset: { action: "user-context", field: "weightKg" },
        })}
        ${renderInputField({
          id: "heightCm",
          label: t("labels.heightCm"),
          type: "number",
          min: 0,
          step: 1,
          value: userContext.user.heightCm,
          dataset: { action: "user-context", field: "heightCm" },
        })}
        ${renderInputField({
          id: "ageYears",
          label: t("labels.ageYears"),
          type: "number",
          min: 0,
          step: 1,
          value: userContext.user.ageYears,
          dataset: { action: "user-context", field: "ageYears" },
        })}
      </div>
    `,
  );
}

export function renderProfileSection(viewModel, t) {
  const daySelection = viewModel.day.input.selection;
  const menuOptions = sortByLabel(viewModel.reference.menus, (menu) =>
    getTemplateLabel(menu, "menus", t),
  );
  const routineOptions = sortByLabel(viewModel.reference.routines, (routine) =>
    getTemplateLabel(routine, "routines", t),
  );

  return renderPanel(
    t("sections.profile"),
    `
      <div class="stack">
        ${renderSelectField({
          id: "profileId",
          label: t("labels.profile"),
          options: sortByLabel(viewModel.reference.profiles, (profile) => t(profile.labelKey)),
          selectedValue: viewModel.userContext.profileId,
          getValue: (profile) => profile.id,
          getLabel: (profile) => t(profile.labelKey),
          placeholder: t("placeholders.selectProfile"),
          dataset: { action: "profile" },
        })}
        <div class="field-grid">
          ${renderSelectField({
            id: "menuTemplateId",
            label: t("labels.menuTemplate"),
            options: menuOptions,
            selectedValue: daySelection.menuTemplateId ?? "",
            getValue: (menu) => menu.id,
            getLabel: (menu) => getTemplateLabel(menu, "menus", t),
            dataset: { action: "day-template", "template-field": "menuTemplateId" },
          })}
          ${renderSelectField({
            id: "routineTemplateId",
            label: t("labels.routineTemplate"),
            options: routineOptions,
            selectedValue: daySelection.routineTemplateId ?? "",
            getValue: (routine) => routine.id,
            getLabel: (routine) => getTemplateLabel(routine, "routines", t),
            dataset: { action: "day-template", "template-field": "routineTemplateId" },
          })}
        </div>
        <div class="section-actions">
          <button type="button" class="ghost-button" data-action="reset-day">${escapeHtml(
            t("actions.resetDay"),
          )}</button>
          <button type="button" class="ghost-button" data-action="reset-week">${escapeHtml(
            t("actions.resetWeek"),
          )}</button>
        </div>
      </div>
    `,
  );
}

function getActivitySectionActionLabel(sectionKey, t) {
  if (sectionKey === "walking") {
    return t("actions.addWalkingItem");
  }

  if (sectionKey === "extra") {
    return t("actions.addExtraItem");
  }

  return t("actions.addGymItem");
}

function renderActivityMetricFields(item, sectionKey, index, t) {
  const metric = item.prescription?.metric ?? "strength";

  if (metric === "steps") {
    return `
      <div class="field-grid">
        <div class="field">
          <label>${escapeHtml(t("labels.minDailySteps"))}</label>
          <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.min ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="min">
        </div>
        <div class="field">
          <label>${escapeHtml(t("labels.cadencePerMin"))}</label>
          <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.cadencePerMin ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="cadencePerMin">
        </div>
      </div>
    `;
  }

  if (metric === "duration") {
    return `
      <div class="field-grid">
        <div class="field">
          <label>${escapeHtml(t("labels.durationSec"))}</label>
          <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.durationSec ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="durationSec">
        </div>
        <div class="field">
          <label>${escapeHtml(t("labels.cadencePerMin"))}</label>
          <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.cadencePerMin ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="cadencePerMin">
        </div>
      </div>
    `;
  }

  return `
    <div class="field-grid">
      <div class="field">
        <label>${escapeHtml(t("labels.sets"))}</label>
        <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.sets ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="sets">
      </div>
      <div class="field">
        <label>${escapeHtml(t("labels.reps"))}</label>
        <input type="text" value="${escapeHtml(item.prescription?.reps ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="reps">
      </div>
      <div class="field">
        <label>${escapeHtml(t("labels.loadKg"))}</label>
        <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.loadKg ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="loadKg">
      </div>
      <div class="field">
        <label>${escapeHtml(t("labels.rir"))}</label>
        <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.rir ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="rir">
      </div>
      <div class="field">
        <label>${escapeHtml(t("labels.secPerRep"))}</label>
        <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.secPerRep ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="secPerRep">
      </div>
      <div class="field">
        <label>${escapeHtml(t("labels.restSec"))}</label>
        <input type="number" min="0" step="1" value="${escapeHtml(item.prescription?.restSec ?? "")}" data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="restSec">
      </div>
    </div>
  `;
}

function renderActivityRows(items, sectionKey, exercises, t) {
  if (!items.length) {
    return renderEmptyState(t("placeholders.empty"));
  }

  const exerciseOptions = sortByLabel(exercises, (exercise) =>
    t(`exercises.${exercise.id}.description`),
  );

  return `
    <div class="list">
      ${items
        .map(
          (item, index) => `
            <article class="editor-row">
              <div class="field-grid">
                <div class="field">
                  <label>${escapeHtml(t("labels.exercise"))}</label>
                  <select data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="exerciseId">
                    ${renderSelectOptions(
                      exerciseOptions,
                      item.exerciseId ?? "",
                      (exercise) => exercise.id,
                      (exercise) => t(`exercises.${exercise.id}.description`),
                    )}
                  </select>
                </div>
                <div class="field">
                  <label>${escapeHtml(t("labels.metric"))}</label>
                  <select data-action="activity-item-field" data-section-key="${sectionKey}" data-index="${index}" data-field="metric">
                    ${renderSelectOptions(
                      [
                        { id: "steps", label: t("metrics.steps") },
                        { id: "duration", label: t("ui.duration") },
                        { id: "strength", label: t("ui.strength") },
                      ],
                      item.prescription?.metric ?? "strength",
                      (option) => option.id,
                      (option) => option.label,
                    )}
                  </select>
                </div>
              </div>
              ${renderActivityMetricFields(item, sectionKey, index, t)}
              <button type="button" class="ghost-button" data-action="remove-activity-item" data-section-key="${sectionKey}" data-index="${index}">${escapeHtml(
                t("actions.remove"),
              )}</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderActivitySection(viewModel, t) {
  const activity = viewModel.day.input.activity;
  const sections = activity.sections ?? [];

  return renderPanel(
    t("sections.activityEditor"),
    `
      <div class="stack">
        ${sections
          .map(
            (section) => `
              <article class="section-card">
                <div class="shopping-item-head">
                  <h3 class="panel-title">${escapeHtml(t(`ui.${section.sectionKey}`, undefined, section.sectionKey))}</h3>
                  <button type="button" class="button" data-action="add-activity-item" data-section-key="${section.sectionKey}">${escapeHtml(
                    getActivitySectionActionLabel(section.sectionKey, t),
                  )}</button>
                </div>
                ${renderActivityRows(
                  section.items ?? [],
                  section.sectionKey,
                  viewModel.reference.exercises,
                  t,
                )}
              </article>
            `,
          )
          .join("")}
      </div>
    `,
  );
}

function renderHydrationRows(items, foods, t) {
  if (!items.length) {
    return renderEmptyState(t("placeholders.empty"));
  }

  const foodOptions = sortByLabel(foods, (food) => t(`foods.${food.id}.name`));

  return `
    <div class="list">
      ${items
        .map(
          (item, index) => `
            <article class="editor-row">
              <div class="field-grid">
                <div class="field">
                  <label>${escapeHtml(t("labels.food"))}</label>
                  <select data-action="hydration-item-field" data-index="${index}" data-field="foodId">
                    ${renderSelectOptions(
                      foodOptions,
                      item.foodId ?? "",
                      (food) => food.id,
                      (food) => t(`foods.${food.id}.name`),
                    )}
                  </select>
                </div>
                <div class="field">
                  <label>${escapeHtml(t("labels.amount"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(item.amount ?? "")}" data-action="hydration-item-field" data-index="${index}" data-field="amount">
                </div>
              </div>
              <button type="button" class="ghost-button" data-action="remove-hydration-item" data-index="${index}">${escapeHtml(
                t("actions.remove"),
              )}</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderMealBlocks(mealKey, blocks, foods, t) {
  const foodOptions = sortByLabel(foods, (food) => t(`foods.${food.id}.name`));

  if (!blocks.length) {
    return renderEmptyState(t("placeholders.empty"));
  }

  return `
    <div class="list">
      ${blocks
        .map(
          (block, blockIndex) => `
            <article class="section-card">
              <div class="shopping-item-head">
                <strong>${escapeHtml(t("ui.block"))} ${blockIndex + 1}</strong>
                <button type="button" class="ghost-button" data-action="remove-meal-block" data-meal-key="${mealKey}" data-block-index="${blockIndex}">${escapeHtml(
                  t("actions.remove"),
                )}</button>
              </div>
              <div class="list">
                ${(block.items ?? [])
                  .map(
                    (item, itemIndex) => `
                      <article class="editor-row">
                        <div class="field-grid">
                          <div class="field">
                            <label>${escapeHtml(t("labels.food"))}</label>
                            <select data-action="meal-item-field" data-meal-key="${mealKey}" data-block-index="${blockIndex}" data-item-index="${itemIndex}" data-field="foodId">
                              ${renderSelectOptions(
                                foodOptions,
                                item.foodId ?? "",
                                (food) => food.id,
                                (food) => t(`foods.${food.id}.name`),
                              )}
                            </select>
                          </div>
                          <div class="field">
                            <label>${escapeHtml(t("labels.amount"))}</label>
                            <input type="number" min="0" step="1" value="${escapeHtml(item.amount ?? "")}" data-action="meal-item-field" data-meal-key="${mealKey}" data-block-index="${blockIndex}" data-item-index="${itemIndex}" data-field="amount">
                          </div>
                        </div>
                        <button type="button" class="ghost-button" data-action="remove-meal-item" data-meal-key="${mealKey}" data-block-index="${blockIndex}" data-item-index="${itemIndex}">${escapeHtml(
                          t("actions.remove"),
                        )}</button>
                      </article>
                    `,
                  )
                  .join("")}
                <button type="button" class="ghost-button" data-action="add-meal-item" data-meal-key="${mealKey}" data-block-index="${blockIndex}">${escapeHtml(
                  t("actions.addMealItem"),
                )}</button>
              </div>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

export function renderNutritionSection(viewModel, t) {
  const nutrition = viewModel.day.input.nutrition;
  const foods = viewModel.reference.foods;

  return renderPanel(
    t("sections.nutritionEditor"),
    `
      <div class="stack">
        <article class="section-card">
          <div class="shopping-item-head">
            <h3 class="panel-title">${escapeHtml(t("meals.hydration"))}</h3>
            <button type="button" class="button" data-action="add-hydration-item">${escapeHtml(
              t("actions.addHydrationItem"),
            )}</button>
          </div>
          ${renderHydrationRows(nutrition.meals.hydration.items, foods, t)}
        </article>
        ${["breakfast", "lunch", "dinner"]
          .map(
            (mealKey) => `
              <article class="section-card">
                <div class="shopping-item-head">
                  <h3 class="panel-title">${escapeHtml(t(`meals.${mealKey}`))}</h3>
                  <button type="button" class="button" data-action="add-meal-block" data-meal-key="${mealKey}">${escapeHtml(
                    t("actions.addMealBlock"),
                  )}</button>
                </div>
                ${renderMealBlocks(mealKey, nutrition.meals[mealKey], foods, t)}
              </article>
            `,
          )
          .join("")}
      </div>
    `,
  );
}
