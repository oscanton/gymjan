const CACHE_NAME = "app-cache-v9";

const FILES_TO_CACHE = [
  "index.html",
  "manifest.json",

  "views/actividad.html",
  "views/calculadora.html",
  "views/control.html",
  "views/lista.html",
  "views/menu.html",

  "css/app.css",
  "css/components.css",

  "js/app.js",

  "js/core/config.js",
  "js/core/date.js",
  "js/core/formulas.js",
  "js/core/pwa.js",
  "js/core/storage.js",
  "js/core/stores.js",
  "js/core/targets.js",
  "js/core/ui.js",
  "js/core/routines.js",

  "js/data/foods.js",
  "js/data/calculadora.js",
  "js/data/menus/menu.js",
  "js/data/menus/menu_1.js",
  "js/data/rutinas/rutina_descanso.js",
  "js/data/rutinas/rutina_fuerza_A.js",
  "js/data/targets.js",

  "js/pages/actividad.page.js",
  "js/pages/calculadora.page.js",
  "js/pages/control.page.js",
  "js/pages/lista.page.js",
  "js/pages/menu.page.js",

  "assets/icon-192.png",
  "assets/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
