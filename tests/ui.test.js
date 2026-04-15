import test from "node:test";
import assert from "node:assert/strict";

import { createConnector } from "../js/app/connector.js";
import { createI18n } from "../js/app/i18n.js";
import { createFormatters } from "../js/ui/formatters.js";
import { renderApp } from "../js/ui/render.js";

test("renderApp produces core MVP sections", () => {
  const connector = createConnector();
  connector.saveUserContext({
    locale: "es",
    profileId: "weight_loss_female_1500",
    user: { weightKg: 60, heightCm: 165, ageYears: 30, sex: "female" },
  });
  const i18n = createI18n("es");
  const viewModel = {
    locale: "es",
    currentDayKey: "monday",
    userContext: connector.getUserContext(),
    resolvedProfile: connector.getResolvedProfile(),
    day: connector.calculateDay("monday"),
    week: connector.calculateWeek(),
    shopping: connector.getShoppingList(),
    reference: connector.getReferenceData(),
  };
  const html = renderApp(viewModel, {
    t: i18n.t,
    formatters: createFormatters("es", i18n.t),
  });

  assert.match(html, /GymJan/);
  assert.match(html, /Contexto de usuario/);
  assert.match(html, /Lista de la compra/);
  assert.doesNotMatch(html, /Panel de depuracion/);
  assert.match(html, /Lunes perdida de grasa/);
  assert.doesNotMatch(html, /Martes perdida de grasa/);
  assert.match(html, /Gym cuerpo completo/);
  assert.doesNotMatch(html, /Dia cardio/);
});
