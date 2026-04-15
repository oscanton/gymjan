import { DAY_KEYS } from "../app/config.js";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderPanel(title, body) {
  return `
    <section class="panel">
      <div class="panel-body stack">
        <h2 class="section-title">${escapeHtml(title)}</h2>
        ${body}
      </div>
    </section>
  `;
}

function renderSelectOptions(options, selectedValue, getValue, getLabel, placeholder) {
  const optionMarkup = options
    .map((option) => {
      const value = getValue(option);
      return `
        <option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>
          ${escapeHtml(getLabel(option))}
        </option>
      `;
    })
    .join("");

  return `${placeholder ? `<option value="">${escapeHtml(placeholder)}</option>` : ""}${optionMarkup}`;
}

function sortByLabel(items, getLabel) {
  return [...items].sort((left, right) =>
    getLabel(left).localeCompare(getLabel(right)),
  );
}

function renderEmptyState(label) {
  return `<div class="empty-state">${escapeHtml(label)}</div>`;
}

function renderField(label, controlMarkup, inputId = "") {
  const forAttribute = inputId ? ` for="${escapeHtml(inputId)}"` : "";
  return `
    <div class="field">
      <label${forAttribute}>${escapeHtml(label)}</label>
      ${controlMarkup}
    </div>
  `;
}

function renderInputControl({
  id = "",
  type = "text",
  value = "",
  min = null,
  step = null,
  dataset = {},
}) {
  const dataAttributes = Object.entries(dataset)
    .map(([key, attributeValue]) => ` data-${key}="${escapeHtml(attributeValue)}"`)
    .join("");
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : "";
  const minAttribute = min !== null ? ` min="${escapeHtml(min)}"` : "";
  const stepAttribute = step !== null ? ` step="${escapeHtml(step)}"` : "";

  return `<input${idAttribute} type="${escapeHtml(type)}"${minAttribute}${stepAttribute} value="${escapeHtml(
    value,
  )}"${dataAttributes}>`;
}

function renderInputField(options) {
  return renderField(
    options.label,
    renderInputControl(options),
    options.id,
  );
}

function renderSelectField({
  id = "",
  label,
  options,
  selectedValue,
  getValue,
  getLabel,
  placeholder,
  dataset = {},
}) {
  const dataAttributes = Object.entries(dataset)
    .map(([key, value]) => ` data-${key}="${escapeHtml(value)}"`)
    .join("");
  const idAttribute = id ? ` id="${escapeHtml(id)}"` : "";

  return renderField(
    label,
    `
      <select${idAttribute}${dataAttributes}>
        ${renderSelectOptions(options, selectedValue, getValue, getLabel, placeholder)}
      </select>
    `,
    id,
  );
}

function isTemplateAvailableForDay(template, dayKey) {
  if (Array.isArray(template.dayKeys) && template.dayKeys.length) {
    return template.dayKeys.includes(dayKey);
  }

  if (typeof template.dayKey === "string" && template.dayKey) {
    return template.dayKey === dayKey;
  }

  return true;
}

function getTemplateLabel(template, namespace, t) {
  return t(template.labelKey ?? `${namespace}.${template.id}.label`);
}

function renderMetricCard(label, value, meta = "") {
  return `
    <article class="metric-card">
      <p class="metric-label">${escapeHtml(label)}</p>
      <p class="metric-value">${escapeHtml(value)}</p>
      ${meta ? `<p class="metric-label">${escapeHtml(meta)}</p>` : ""}
    </article>
  `;
}

function renderStatusBadge(label, status, formatters) {
  return `<span class="badge ${formatters.statusClass(status)}">${escapeHtml(label)}</span>`;
}

function renderDayTabs(viewModel, t) {
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

function renderUserContextSection(viewModel, t) {
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

function renderProfileSection(viewModel, t) {
  const daySelection = viewModel.day.input.selection;
  const menuOptions = sortByLabel(
    viewModel.reference.menus.filter(
      (menu) =>
        menu.id === daySelection.menuTemplateId ||
        isTemplateAvailableForDay(menu, viewModel.currentDayKey),
    ),
    (menu) => getTemplateLabel(menu, "menus", t),
  );
  const activityOptions = sortByLabel(
    viewModel.reference.routines.filter(
      (activity) =>
        activity.id === daySelection.activityTemplateId ||
        isTemplateAvailableForDay(activity, viewModel.currentDayKey),
    ),
    (activity) => getTemplateLabel(activity, "routines", t),
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
            id: "activityTemplateId",
            label: t("labels.activityTemplate"),
            options: activityOptions,
            selectedValue: daySelection.activityTemplateId ?? "",
            getValue: (activity) => activity.id,
            getLabel: (activity) => getTemplateLabel(activity, "routines", t),
            dataset: { action: "day-template", "template-field": "activityTemplateId" },
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

function renderActivityRows(items, blockKey, exercises, t) {
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
              <div class="field">
                <label>${escapeHtml(t("labels.exercise"))}</label>
                <select data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="exerciseId">
                  ${renderSelectOptions(
                    exerciseOptions,
                    item.exerciseId ?? "",
                    (exercise) => exercise.id,
                    (exercise) => t(`exercises.${exercise.id}.description`),
                  )}
                </select>
              </div>
              <div class="field-grid">
                <div class="field">
                  <label>${escapeHtml(t("labels.sets"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(item.sets ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="sets">
                </div>
                <div class="field">
                  <label>${escapeHtml(t("labels.reps"))}</label>
                  <input type="text" value="${escapeHtml(item.reps ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="reps">
                </div>
                <div class="field">
                  <label>${escapeHtml(blockKey === "extra" ? t("labels.durationSec") : t("labels.loadKg"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(blockKey === "extra" ? item.durationSec ?? "" : item.loadKg ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="${blockKey === "extra" ? "durationSec" : "loadKg"}">
                </div>
                <div class="field">
                  <label>${escapeHtml(blockKey === "extra" ? t("labels.cadencePerMin") : t("labels.rir"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(blockKey === "extra" ? item.cadencePerMin ?? "" : item.rir ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="${blockKey === "extra" ? "cadencePerMin" : "rir"}">
                </div>
                <div class="field">
                  <label>${escapeHtml(t("labels.secPerRep"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(item.secPerRep ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="secPerRep">
                </div>
                <div class="field">
                  <label>${escapeHtml(t("labels.restSec"))}</label>
                  <input type="number" min="0" step="1" value="${escapeHtml(item.restSec ?? "")}" data-action="activity-item-field" data-block-key="${blockKey}" data-index="${index}" data-field="restSec">
                </div>
              </div>
              <button type="button" class="ghost-button" data-action="remove-activity-item" data-block-key="${blockKey}" data-index="${index}">${escapeHtml(
                t("actions.remove"),
              )}</button>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderActivitySection(viewModel, t) {
  const activity = viewModel.day.input.activity;

  return renderPanel(
    t("sections.activityEditor"),
    `
      <div class="stack">
        <article class="section-card">
          <h3 class="panel-title">${escapeHtml(t("metrics.steps"))}</h3>
          <div class="field-grid">
            <div class="field">
              <label>${escapeHtml(t("labels.minDailySteps"))}</label>
              <input type="number" min="0" step="1" value="${escapeHtml(activity.steps.minDailySteps)}" data-action="steps" data-field="minDailySteps">
            </div>
            <div class="field">
              <label>${escapeHtml(t("labels.plannedSteps"))}</label>
              <input type="number" min="0" step="1" value="${escapeHtml(activity.steps.plannedSteps)}" data-action="steps" data-field="plannedSteps">
            </div>
            <div class="field">
              <label>${escapeHtml(t("labels.cadencePerMin"))}</label>
              <input type="number" min="0" step="1" value="${escapeHtml(activity.steps.cadencePerMin)}" data-action="steps" data-field="cadencePerMin">
            </div>
          </div>
        </article>
        <article class="section-card">
          <div class="shopping-item-head">
            <h3 class="panel-title">${escapeHtml(t("ui.gym"))}</h3>
            <button type="button" class="button" data-action="add-activity-item" data-block-key="gym">${escapeHtml(
              t("actions.addGymItem"),
            )}</button>
          </div>
          ${renderActivityRows(activity.gym.items, "gym", viewModel.reference.exercises, t)}
        </article>
        <article class="section-card">
          <div class="shopping-item-head">
            <h3 class="panel-title">${escapeHtml(t("ui.extra"))}</h3>
            <button type="button" class="button" data-action="add-activity-item" data-block-key="extra">${escapeHtml(
              t("actions.addExtraItem"),
            )}</button>
          </div>
          ${renderActivityRows(activity.extra.items, "extra", viewModel.reference.exercises, t)}
        </article>
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

function renderNutritionSection(viewModel, t) {
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

function renderFeedbackList(items, defaultStatus, formatters, t) {
  if (!items.length) {
    return renderEmptyState(
      defaultStatus === "warning" ? t("ui.noWarnings") : t("ui.noErrors"),
    );
  }

  return `
    <div class="list">
      ${items
        .map(
          (item) => `
            <article class="assessment-row">
              <div class="shopping-item-head">
                <strong>${escapeHtml(t(item.messageKey, undefined, item.code))}</strong>
                ${renderStatusBadge(
                  formatters.labelForStatus(defaultStatus),
                  defaultStatus,
                  formatters,
                )}
              </div>
              <p class="muted mono">${escapeHtml(item.path)}</p>
            </article>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderTargetsSection(viewModel, t, formatters) {
  const targets = viewModel.day.derived.targets;

  return renderPanel(
    t("sections.dailyTargets"),
    `
      <div class="kpi-grid">
        ${renderMetricCard(
          t("metrics.kcal"),
          formatters.metric(targets.kcal, "kcal", 0),
          `${formatters.metric(targets.protein, "g", 0)} / ${formatters.metric(
            targets.carbs,
            "g",
            0,
          )} / ${formatters.metric(targets.fat, "g", 0)}`,
        )}
        ${renderMetricCard(
          t("metrics.hydration"),
          `${formatters.integer(targets.hydration.minMl)}-${formatters.integer(
            targets.hydration.maxMl,
          )} ml`,
          `${formatters.integer(targets.hydration.extraMl)} ml extra`,
        )}
        ${renderMetricCard(
          t("metrics.activityKcal"),
          formatters.metric(targets.activity.targetKcal, "kcal", 0),
          `MET ${formatters.number(targets.activity.metTarget, 1)} / INT ${formatters.number(
            targets.activity.intensityTarget,
            1,
          )}`,
        )}
      </div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(
          `${t("metrics.fiber")}: ${formatters.metric(
            targets.secondary.fiberMinG,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.sugar")}: ${formatters.metric(
            targets.secondary.sugarMaxG,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.saturatedFat")}: ${formatters.metric(
            targets.secondary.saturatedFatMaxG,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.saltG")}: ${formatters.metric(
            targets.secondary.saltMaxG,
            "g",
            2,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.processingScore")}: ${formatters.number(
            targets.secondary.processingMaxScore,
            1,
          )}`,
        )}</span>
      </div>
    `,
  );
}

function renderResultsSection(viewModel, t, formatters) {
  const user = viewModel.day.derived.user;
  const nutrition = viewModel.day.derived.nutrition;
  const activity = viewModel.day.derived.activity;

  return renderPanel(
    t("sections.dailyResults"),
    `
      <div class="kpi-grid">
        ${renderMetricCard(
          t("metrics.bmi"),
          formatters.number(user.bmi, 1),
          t(`bmi_categories.${user.bmiCategory}`),
        )}
        ${renderMetricCard(t("metrics.bmr"), formatters.metric(user.bmr, "kcal", 0))}
        ${renderMetricCard(
          t("metrics.hydrationTotalMl"),
          `${formatters.integer(nutrition.totals.hydrationTotalMl)} ml`,
        )}
        ${renderMetricCard(t("metrics.kcal"), formatters.metric(nutrition.totals.kcal, "kcal", 0))}
        ${renderMetricCard(
          t("metrics.protein"),
          `${formatters.metric(nutrition.totals.protein, "g", 1)} / ${formatters.metric(
            nutrition.totals.carbs,
            "g",
            1,
          )} / ${formatters.metric(nutrition.totals.fat, "g", 1)}`,
        )}
        ${renderMetricCard(
          t("metrics.activityKcal"),
          formatters.metric(activity.activity.activityKcal, "kcal", 0),
          `${formatters.number(activity.activity.metAvg, 2)} MET`,
        )}
      </div>
      <div class="chip-row">
        <span class="chip">${escapeHtml(
          `${t("metrics.fiber")}: ${formatters.metric(
            nutrition.totals.fiber,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.sugar")}: ${formatters.metric(
            nutrition.totals.sugar,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.saturatedFat")}: ${formatters.metric(
            nutrition.totals.saturatedFat,
            "g",
            1,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.saltG")}: ${formatters.metric(
            nutrition.totals.saltG,
            "g",
            2,
          )}`,
        )}</span>
        <span class="chip">${escapeHtml(
          `${t("metrics.processingScore")}: ${formatters.number(
            nutrition.totals.processingScore,
            1,
          )}`,
        )}</span>
      </div>
    `,
  );
}

function renderAssessmentGroup(title, entries, formatters, t) {
  return `
    <article class="subcard stack">
      <h3 class="panel-title">${escapeHtml(title)}</h3>
      <div class="list">
        ${entries
          .map(
            ([metricKey, check]) => `
              <article class="assessment-row">
                <div class="shopping-item-head">
                  <strong>${escapeHtml(t(`metrics.${metricKey}`, undefined, metricKey))}</strong>
                  ${renderStatusBadge(
                    formatters.labelForStatus(check.status),
                    check.status,
                    formatters,
                  )}
                </div>
                <p class="muted">${escapeHtml(t(check.messageKey))}</p>
              </article>
            `,
          )
          .join("")}
      </div>
    </article>
  `;
}

function renderScoreCard(title, scoreGroup, formatters) {
  return `
    <article class="subcard stack">
      <div class="shopping-item-head">
        <h3 class="panel-title">${escapeHtml(title)}</h3>
        ${renderStatusBadge(
          formatters.labelForStatus(scoreGroup.status),
          scoreGroup.status,
          formatters,
        )}
      </div>
      <p class="metric-value">${escapeHtml(formatters.score(scoreGroup.score))}</p>
      <div class="bar"><span style="width:${formatters.scoreWidth(scoreGroup.score)}%"></span></div>
      <p class="muted">${escapeHtml(formatters.labelForVerdict(scoreGroup.verdict))}</p>
    </article>
  `;
}

function renderAssessmentAndScores(viewModel, t, formatters) {
  const assessment = viewModel.day.derived.assessment;
  const scores = viewModel.day.derived.scores;

  return `
    ${renderPanel(
      t("sections.dailyAssessment"),
      `
        <div class="stack">
          ${renderAssessmentGroup(
            t("sections.dailyAssessment"),
            Object.entries(assessment.nutritionChecks),
            formatters,
            t,
          )}
          ${renderAssessmentGroup(t("ui.activity"), Object.entries(assessment.activityChecks), formatters, t)}
          ${renderFeedbackList(viewModel.day.ui.errors, "critical", formatters, t)}
          ${renderFeedbackList(viewModel.day.ui.warnings, "warning", formatters, t)}
        </div>
      `,
    )}
    ${renderPanel(
      t("sections.dailyScores"),
      `
        <div class="stack">
          ${renderScoreCard(t("metrics.nutritionScore"), scores.nutrition, formatters)}
          ${renderScoreCard(t("metrics.activityScore"), scores.activity, formatters)}
          ${renderScoreCard(t("metrics.totalScore"), scores.total, formatters)}
        </div>
      `,
    )}
  `;
}

function renderWeeklySummary(viewModel, t, formatters) {
  const summary = viewModel.week.weeklySummary;

  return renderPanel(
    t("sections.weeklySummary"),
    `
      <div class="kpi-grid">
        ${renderMetricCard(t("metrics.nutritionScore"), formatters.score(summary.nutritionScoreAvg))}
        ${renderMetricCard(t("metrics.activityScore"), formatters.score(summary.activityScoreAvg))}
        ${renderMetricCard(t("metrics.totalScore"), formatters.score(summary.totalScoreAvg))}
        ${renderMetricCard(t("metrics.kcal"), formatters.metric(summary.targetKcalTotal, "kcal", 0), t("ui.target"))}
        ${renderMetricCard(t("metrics.kcal"), formatters.metric(summary.intakeKcalTotal, "kcal", 0), t("ui.intake"))}
        ${renderMetricCard(t("metrics.activityKcal"), formatters.metric(summary.activityKcalTotal, "kcal", 0))}
      </div>
    `,
  );
}

function renderShoppingList(viewModel, t) {
  const items = viewModel.shopping.items;

  return renderPanel(
    t("sections.shoppingList"),
    items.length
      ? `
          <div class="list">
            ${items
              .map(
                (item) => `
                  <article class="shopping-item">
                    <div class="shopping-item-head">
                      <strong>${escapeHtml(item.label ?? t(item.labelKey, undefined, item.itemId))}</strong>
                      <span class="badge">${escapeHtml(t(`categories.${item.categoryId}.name`))}</span>
                    </div>
                    <label>
                      <input type="checkbox" data-action="shopping-check" data-item-id="${escapeHtml(
                        item.itemId,
                      )}" ${item.checked ? "checked" : ""}>
                      <span>${escapeHtml(`${item.amount} ${item.unit}`)}</span>
                    </label>
                  </article>
                `,
              )
              .join("")}
          </div>
        `
      : renderEmptyState(t("ui.emptyShopping")),
  );
}

function renderDebugPanel(viewModel, t) {
  return renderPanel(
    t("sections.debug"),
    `<pre class="debug-panel subcard">${escapeHtml(
      JSON.stringify(
        {
          day: viewModel.day,
          week: viewModel.week.weeklySummary,
          shopping: viewModel.shopping,
        },
        null,
        2,
      ),
    )}</pre>`,
  );
}

function renderApp(viewModel, helpers) {
  const { t, formatters, showDebugPanel = false } = helpers;

  return `
    <main class="app-shell">
      <header class="app-header">
        <h1 class="app-title">${escapeHtml(t("app.title"))}</h1>
        <p class="app-subtitle">${escapeHtml(t("app.subtitle"))}</p>
      </header>
      <div class="stack">
        ${renderDayTabs(viewModel, t)}
        <div class="layout-grid">
          <div class="stack">
            ${renderUserContextSection(viewModel, t)}
            ${renderProfileSection(viewModel, t)}
            ${renderActivitySection(viewModel, t)}
            ${renderNutritionSection(viewModel, t)}
          </div>
          <aside class="stack">
            ${renderTargetsSection(viewModel, t, formatters)}
            ${renderResultsSection(viewModel, t, formatters)}
            ${renderAssessmentAndScores(viewModel, t, formatters)}
            ${renderWeeklySummary(viewModel, t, formatters)}
            ${renderShoppingList(viewModel, t)}
          </aside>
        </div>
        ${showDebugPanel ? renderDebugPanel(viewModel, t) : ""}
      </div>
    </main>
  `;
}

export { renderApp };
