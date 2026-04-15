const CACHE_NAME = "gymjan-mvp-v2";

const APP_ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./assets/icon.svg",
  "./css/app.css",
  "./css/components.css",
  "./js/app.js",
  "./js/app/config.js",
  "./js/app/connector.js",
  "./js/app/i18n.js",
  "./js/app/pwa.js",
  "./js/app/storage.js",
  "./js/core/activity.core.js",
  "./js/core/assessment.core.js",
  "./js/core/contracts.js",
  "./js/core/nutrition.core.js",
  "./js/core/scores.core.js",
  "./js/core/targets.core.js",
  "./js/core/user.core.js",
  "./js/core/utils.js",
  "./js/data/exercises.db.js",
  "./js/data/foods.db.js",
  "./js/data/menus/menu_index.js",
  "./js/data/menus/menu_friday_weightloss.js",
  "./js/data/menus/menu_gain_1a.js",
  "./js/data/menus/menu_monday_weightloss.js",
  "./js/data/menus/menu_saturday_weightloss.js",
  "./js/data/menus/menu_standard_1a.js",
  "./js/data/menus/menu_sunday_weightloss.js",
  "./js/data/menus/menu_thursday_weightloss.js",
  "./js/data/menus/menu_tuesday_weightloss.js",
  "./js/data/menus/menu_wednesday_weightloss.js",
  "./js/data/menus/menu_weightloss_2b.js",
  "./js/data/profiles/profile_index.js",
  "./js/data/profiles/profile_muscle_gain_male_2300.js",
  "./js/data/profiles/profile_standard_male_2000.js",
  "./js/data/profiles/profile_weight_loss_female_1500.js",
  "./js/data/profiles/shared.js",
  "./js/data/routines/routine_index.js",
  "./js/data/routines/activity_cardio_1a.js",
  "./js/data/routines/activity_gymfullbody_4c.js",
  "./js/data/routines/activity_gymlegs_3c.js",
  "./js/data/routines/activity_rest_1a.js",
  "./js/i18n/content.en.js",
  "./js/i18n/content.es.js",
  "./js/i18n/en.js",
  "./js/i18n/es.js",
  "./js/ui/bindings.js",
  "./js/ui/formatters.js",
  "./js/ui/render.js",
  "./js/ui/screens.js"
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
