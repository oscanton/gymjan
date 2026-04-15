import en from "../i18n/en.js";
import es from "../i18n/es.js";
import contentEn from "../i18n/content.en.js";
import contentEs from "../i18n/content.es.js";

const BUNDLES = {
  es: { ...es, ...contentEs },
  en: { ...en, ...contentEn },
};

function getByPath(object, path) {
  return path.split(".").reduce((accumulator, key) => accumulator?.[key], object);
}

function interpolate(template, params = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] === undefined ? `{${key}}` : String(params[key]),
  );
}

function humanizeToken(token) {
  return token
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function createAssessmentFallback(key, t) {
  const [, metricKey, relationKey] = key.split(".");
  const metricLabel = t(`metrics.${metricKey}`, undefined, humanizeToken(metricKey));
  const relationLabel = t(
    `assessment_relations.${relationKey}`,
    undefined,
    humanizeToken(relationKey),
  );

  return `${metricLabel}: ${relationLabel}`;
}

function createContentFallback(key) {
  const parts = key.split(".");
  const raw = parts[parts.length - 2] ?? parts[parts.length - 1];
  return humanizeToken(raw);
}

export function createI18n(initialLocale = "es") {
  let locale = BUNDLES[initialLocale] ? initialLocale : "es";

  function t(key, params, fallback) {
    const bundle = BUNDLES[locale];
    const value = getByPath(bundle, key);

    if (typeof value === "string") {
      return interpolate(value, params);
    }

    if (key.startsWith("assessment.")) {
      return createAssessmentFallback(key, t);
    }

    if (
      key.startsWith("foods.") ||
      key.startsWith("exercises.") ||
      key.startsWith("profiles.") ||
      key.startsWith("menus.") ||
      key.startsWith("routines.") ||
      key.startsWith("categories.")
    ) {
      return fallback ?? createContentFallback(key);
    }

    return fallback ?? humanizeToken(key.split(".").pop() ?? key);
  }

  return {
    setLocale(nextLocale) {
      locale = BUNDLES[nextLocale] ? nextLocale : "es";
    },
    getLocale() {
      return locale;
    },
    t,
  };
}
