import { createConnector } from "./app/connector.js";
import { ENABLE_DEBUG_PANEL } from "./app/config.js";
import { createI18n } from "./app/i18n.js";
import { registerPwa } from "./app/pwa.js";
import { createScreensStore } from "./ui/screens.js";
import { createFormatters } from "./ui/formatters.js";
import { renderApp } from "./ui/render.js";
import { bindApp } from "./ui/bindings.js";

const root = document.querySelector("#app");

if (root) {
  const connector = createConnector();
  const screens = createScreensStore();
  const i18n = createI18n(connector.getUserContext().locale);
  let formatters = createFormatters(i18n.getLocale(), i18n.t);
  let viewModel = null;

  function buildViewModel() {
    const userContext = connector.getUserContext();
    const currentDayKey = screens.getCurrentDayKey();
    i18n.setLocale(userContext.locale);
    formatters = createFormatters(userContext.locale, i18n.t);
    const week = connector.calculateWeek();

    return {
      locale: userContext.locale,
      currentDayKey,
      userContext,
      resolvedProfile: connector.getResolvedProfile(),
      day: week.days[currentDayKey],
      week,
      shopping: connector.getShoppingList(),
      reference: connector.getReferenceData(),
    };
  }

  function rerender() {
    viewModel = buildViewModel();
    document.documentElement.lang = viewModel.locale;
    document.title = i18n.t("app.title");
    root.innerHTML = renderApp(viewModel, {
      t: i18n.t,
      formatters,
      showDebugPanel: ENABLE_DEBUG_PANEL,
    });
  }

  bindApp(root, {
    connector,
    screens,
    getViewModel: () => viewModel,
    rerender,
  });

  rerender();
  registerPwa();
}
