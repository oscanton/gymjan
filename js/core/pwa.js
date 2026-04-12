(() => {
  if (!('serviceWorker' in navigator)) return;
  const { hostname, protocol, href } = location;
  if (protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(hostname)) return;
  window.addEventListener('load', () => {
    try {
      const src = document.currentScript?.src;
      navigator.serviceWorker
        .register(src ? new URL('../../sw.js', src).toString() : new URL('sw.js', href).toString())
        .then((registration) => registration.update().catch(() => {}))
        .catch(() => {});
    } catch {}
  });
})();
