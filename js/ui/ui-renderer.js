import {
  renderActivitySection,
  renderDayTabs,
  renderNutritionSection,
  renderProfileSection,
  renderUserContextSection,
} from "./ui-renderer-editors.js";
import {
  renderAssessmentAndScores,
  renderDebugPanel,
  renderResultsSection,
  renderShoppingList,
  renderTargetsSection,
  renderWeeklySummary,
} from "./ui-renderer-dashboard.js";
import { escapeHtml } from "./ui-renderer-shared.js";

function renderUi(viewModel, helpers) {
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

export { renderUi };
