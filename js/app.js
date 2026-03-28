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
    const buildIndexContent = ({ basePrefix = '', title = 'Índice' } = {}) => `
            <div class="index-modal__header">
                <div class="index-modal__title">${title}</div>
            </div>
            <nav class="stack-vertical">
                <a class="btn btn--primary" href="${basePrefix}views/calculator.html">🧮 Calculadora</a>
                <a class="btn btn--primary" href="${basePrefix}views/activity.html">💪 Actividad</a>
                <a class="btn btn--primary" href="${basePrefix}views/menu.html">🍽️ Menú</a>
                <a class="btn btn--primary" href="${basePrefix}views/list.html">🛒 Lista</a>
                <a class="btn btn--primary" href="${basePrefix}views/tracking.html">📈 Control</a>
            </nav>
        `;

    const renderIndexCard = () => {
        const card = document.getElementById('index-card');
        if (!card) return;
        card.innerHTML = buildIndexContent({ basePrefix: '', title: 'Índice' });
    };

    const buildIndexModal = () => {
        if (document.getElementById('global-index-modal')) return;
        const basePrefix = viewMatch ? '../' : '';
        const modal = document.createElement('div');
        modal.id = 'global-index-modal';
        modal.className = 'index-modal-backdrop';
        modal.innerHTML = `
            <div class="index-modal" role="dialog" aria-modal="true" aria-label="Navegación">
                ${buildIndexContent({ basePrefix, title: 'Índice' })}
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

    renderIndexCard();

    const headerTitle = document.querySelector('.page-header h1');
    if (headerTitle) {
        let titleSpan = headerTitle.querySelector('.page-title-text');
        if (!titleSpan) {
            const textNodes = Array.from(headerTitle.childNodes).filter(
                (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== ''
            );
            const titleText = textNodes.map(node => node.textContent.trim()).join(' ');
            textNodes.forEach(node => node.remove());
            titleSpan = document.createElement('span');
            titleSpan.className = 'page-title-text';
            titleSpan.textContent = titleText || headerTitle.textContent.trim();
            headerTitle.insertBefore(titleSpan, headerTitle.firstChild);
        }
        titleSpan.classList.add('page-title--clickable');
        titleSpan.addEventListener('click', () => {
            buildIndexModal();
            const modal = document.getElementById('global-index-modal');
            if (modal) modal.classList.add('is-open');
        });
    }
});






