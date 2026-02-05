// js/core/pwa.js
(() => {
  if (!("serviceWorker" in navigator)) return;

  // HTTPS requerido (salvo localhost)
  const isLocalhost =
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1" ||
    location.hostname === "[::1]";

  if (location.protocol !== "https:" && !isLocalhost) return;

  window.addEventListener("load", () => {
    try {
      // pwa.js está en: /js/core/pwa.js
      // ../../sw.js => /sw.js relativo a la "raíz del site publicado"
      const scriptUrl = document.currentScript?.src;
      const swUrl = scriptUrl
        ? new URL("../../sw.js", scriptUrl).toString()
        : new URL("sw.js", location.href).toString(); // fallback

      navigator.serviceWorker.register(swUrl).catch((err) => {
        console.error("SW register failed:", err);
      });
    } catch (err) {
      console.error("SW register exception:", err);
    }
  });
})();

