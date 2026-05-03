import {
  escapeHtml,
  renderEmptyState,
  renderMetricCard,
  renderPanel,
  renderStatusBadge,
} from "./ui-renderer-shared.js";

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

export function renderTargetsSection(viewModel, t, formatters) {
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
          `${formatters.integer(targets.hydration.ml)} ml`,
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

export function renderResultsSection(viewModel, t, formatters) {
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

export function renderAssessmentAndScores(viewModel, t, formatters) {
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

export function renderWeeklySummary(viewModel, t, formatters) {
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

export function renderShoppingList(viewModel, t) {
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

export function renderDebugPanel(viewModel, t) {
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
