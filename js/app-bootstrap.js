import { ENABLE_DEBUG_PANEL } from "./application/application-config.js";
import { createConnector } from "./application/connector.js";
import { createI18nRuntime } from "./application/i18n-runtime.js";
import { registerPwa } from "./application/pwa-registration.js";
import { bindUi } from "./ui/ui-bindings.js";
import { createUiFormatters } from "./ui/ui-formatters.js";
import { renderUi } from "./ui/ui-renderer.js";
import { createScreenStateStore } from "./ui/screen-state.js";

const root = document.querySelector("#app");

if (root) {
  const connector = createConnector();
  const screens = createScreenStateStore();
  const i18n = createI18nRuntime(connector.getUserContext().locale);
  let formatters = createUiFormatters(i18n.getLocale(), i18n.t);
  let viewModel = null;

  function buildViewModel() {
    const currentDayKey = screens.getCurrentDayKey();
    const appState = connector.getAppState(currentDayKey);

    i18n.setLocale(appState.locale);
    formatters = createUiFormatters(appState.locale, i18n.t);

    return appState;
  }

  function rerender() {
    viewModel = buildViewModel();
    document.documentElement.lang = viewModel.locale;
    document.title = i18n.t("app.title");
    root.innerHTML = renderUi(viewModel, {
      t: i18n.t,
      formatters,
      showDebugPanel: ENABLE_DEBUG_PANEL,
    });
  }

  bindUi(root, {
    connector,
    screens,
    getViewModel: () => viewModel,
    rerender,
  });

  rerender();
  registerPwa();
}
