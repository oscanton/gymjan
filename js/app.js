/* =========================================
   app.js - BOOTSTRAP (Inicializacin)
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

    const pageRegistry = [
        { rootId: 'menu-body', render: window.renderMenuPage },
        { rootId: 'lista-container', render: window.renderShoppingListPage },
        { rootId: 'actividad-container', render: window.renderActivityPage },
        { rootId: 'control-container', render: window.renderControlPage },
        { rootId: 'calculadora-container', render: window.renderCalculatorPage }
    ];

    pageRegistry.forEach(({ rootId, render }) => {
        if (!document.getElementById(rootId)) return;
        if (typeof render === 'function') render();
    });
});
