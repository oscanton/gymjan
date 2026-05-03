import test from "node:test";
import assert from "node:assert/strict";

import { createConnector } from "../js/application/connector.js";
import { createI18nRuntime } from "../js/application/i18n-runtime.js";
import { createUiFormatters } from "../js/ui/ui-formatters.js";
import { renderUi } from "../js/ui/ui-renderer.js";

test("renderApp produces core MVP sections", () => {
  const connector = createConnector();
  connector.saveUserContext({
    locale: "es",
    profileId: "weight_loss_female_1500",
    user: { weightKg: 60, heightCm: 165, ageYears: 30, sex: "female" },
  });
  const i18n = createI18nRuntime("es");
  const viewModel = connector.getAppState("monday");
  const html = renderUi(viewModel, {
    t: i18n.t,
    formatters: createUiFormatters("es", i18n.t),
  });

  assert.match(html, /GymJan/);
  assert.match(html, /Contexto de usuario/);
  assert.match(html, /Lista de la compra/);
  assert.doesNotMatch(html, /Panel de depuracion/);
  assert.match(html, /Lunes perdida de grasa/);
  assert.match(html, /Martes perdida de grasa/);
  assert.match(html, /Fuerza A/);
  assert.match(html, /Spinning/);
});
