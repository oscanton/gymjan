/* =========================================
   app.js - BOOTSTRAP (Inicialización)
   ========================================= */

window.addEventListener('DOMContentLoaded', () => {
    const prefix = (typeof APP_PREFIX === 'string' && APP_PREFIX) ? APP_PREFIX : 'myfitpwa_';
    const lastPageKey = `${prefix}last_opened_page`;
    const path = window.location.pathname.replace(/\\/g, '/');
    const viewMatch = path.match(/\/views\/([^/]+\.html)$/i);
    const isIndexPath = /\/$|\/index\.html$/i.test(path);
    const params = new URLSearchParams(window.location.search);

    if (viewMatch) {
        localStorage.setItem(lastPageKey, `views/${viewMatch[1]}`);
    } else if (isIndexPath && !params.has('home')) {
        const lastPage = localStorage.getItem(lastPageKey);
        const isValidLastPage = /^views\/[a-z0-9_-]+\.html$/i.test(lastPage || '');
        if (isValidLastPage) {
            window.location.replace(lastPage);
            return;
        }
    }

    if (document.getElementById('menu-body')) renderMenuPage();
    if (document.getElementById('lista-container')) renderShoppingListPage();
    if (document.getElementById('actividad-container')) renderActivityPage();
    if (document.getElementById('control-container')) renderControlPage();
    if (document.getElementById('calculadora-container')) renderCalculatorPage();
});
