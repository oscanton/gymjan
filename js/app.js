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

    const buildIndexModal = () => {
        if (document.getElementById('global-index-modal')) return;
        const basePrefix = viewMatch ? '../' : '';
        const modal = document.createElement('div');
        modal.id = 'global-index-modal';
        modal.className = 'index-modal-backdrop';
        modal.innerHTML = `
            <div class="index-modal" role="dialog" aria-modal="true" aria-label="Navegación">
                <div class="index-modal__header">
                    <div class="index-modal__title">Índice</div>
                </div>
                <nav class="stack-vertical">
                    <a class="btn btn--primary" href="${basePrefix}views/calculadora.html">🧮 Calculadora</a>
                    <a class="btn btn--primary" href="${basePrefix}views/actividad.html">💪 Actividad</a>
                    <a class="btn btn--primary" href="${basePrefix}views/menu.html">🍽️ Menú</a>
                    <a class="btn btn--primary" href="${basePrefix}views/lista.html">🛒 Lista</a>
                    <a class="btn btn--primary" href="${basePrefix}views/control.html">📈 Control</a>
                </nav>
            </div>
        `;
        document.body.appendChild(modal);
        const closeModal = () => modal.classList.remove('is-open');
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeModal();
        });
    };

    const headerTitle = document.querySelector('.page-header h1');
    if (headerTitle) {
        headerTitle.classList.add('page-title--clickable');
        headerTitle.addEventListener('click', () => {
            buildIndexModal();
            const modal = document.getElementById('global-index-modal');
            if (modal) modal.classList.add('is-open');
        });
    }
});
