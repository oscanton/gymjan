const CACHE_NAME = "gymjan-mvp-v3";

const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon.svg",
  "./css/app.css",
  "./css/components.css",
  "./js/app-bootstrap.js",
  "./js/application/application-config.js",
  "./js/application/connector.js",
  "./js/application/day-plan-resolver.js",
  "./js/application/i18n-runtime.js",
  "./js/application/input-validation.js",
  "./js/application/local-storage-gateway.js",
  "./js/application/pwa-registration.js",
  "./js/application/read-models.js",
  "./js/application/state-repository.js",
  "./js/catalog/exercise-catalog.js",
  "./js/catalog/food-catalog.js",
  "./js/catalog/menu-templates/menu-template-catalog.js",
  "./js/catalog/menu-templates/menu-template-friday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-gain-1a.js",
  "./js/catalog/menu-templates/menu-template-monday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-saturday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-standard-1a.js",
  "./js/catalog/menu-templates/menu-template-sunday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-thursday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-tuesday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-wednesday-weightloss.js",
  "./js/catalog/menu-templates/menu-template-weightloss-2b.js",
  "./js/catalog/profile-presets/profile-preset-builders.js",
  "./js/catalog/profile-presets/profile-preset-catalog.js",
  "./js/catalog/profile-presets/profile-preset-muscle-gain-male-2300.js",
  "./js/catalog/profile-presets/profile-preset-standard-male-2000.js",
  "./js/catalog/profile-presets/profile-preset-weight-loss-female-1500.js",
  "./js/catalog/routine-templates/routine-template-catalog.js",
  "./js/catalog/routine-templates/routine-template-cardio-1a.js",
  "./js/catalog/routine-templates/routine-template-gym-full-body-4c.js",
  "./js/catalog/routine-templates/routine-template-gym-legs-3c.js",
  "./js/catalog/routine-templates/routine-template-rest-1a.js",
  "./js/domain/activity-calculator.js",
  "./js/domain/assessment-evaluator.js",
  "./js/domain/domain-contracts.js",
  "./js/domain/nutrition-calculator.js",
  "./js/domain/score-calculator.js",
  "./js/domain/target-calculator.js",
  "./js/domain/user-calculator.js",
  "./js/locales/content-text-en.js",
  "./js/locales/content-text-es.js",
  "./js/locales/ui-text-en.js",
  "./js/locales/ui-text-es.js",
  "./js/shared/app-constants.js",
  "./js/shared/collection-utils.js",
  "./js/shared/id-utils.js",
  "./js/shared/number-utils.js",
  "./js/shared/object-utils.js",
  "./js/ui/screen-state.js",
  "./js/ui/ui-bindings.js",
  "./js/ui/ui-formatters.js",
  "./js/ui/ui-renderer.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        const responseClone = networkResponse.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      });
    }),
  );
});
