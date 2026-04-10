const CACHE_NAME = "app-cache-v17";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",

  "views/activity.html",
  "views/calculator.html",
  "views/list.html",
  "views/menu.html",

  "css/app.css",
  "css/components.css",

  "js/app.js",

  "js/core/config.js",
  "js/core/date.js",
  "js/core/formulas.js",
  "js/core/nutrition-score.js",
  "js/core/pwa.js",
  "js/core/storage.js",
  "js/core/stores.js",
  "js/core/targets.js",
  "js/core/ui.js",
  "js/data/foods.js",
  "js/data/exercises.js",
  "js/data/menus/week_menu_default.js",
  "js/data/menus/week_menu_weightloss.js",
  "js/data/activity/week_activity_default.js",

  "js/pages/activity.page.js",
  "js/pages/calculator.page.js",
  "js/pages/list.page.js",
  "js/pages/menu.page.js",

  "assets/icon-192.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});



