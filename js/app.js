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
    const currentPageKey = viewMatch
        ? `views/${viewMatch[1].toLowerCase()}`
        : (isIndexPath ? 'index.html' : '');
    const buildIndexContent = ({ basePrefix = '', title = 'Índice' } = {}) => {
        const items = [
            { key: 'index.html', href: `${basePrefix}index.html?home=1`, label: 'Inicio', emoji: '🏠' },
            { key: 'views/calculator.html', href: `${basePrefix}views/calculator.html`, label: 'Calculadora', emoji: '🧮' },
            { key: 'views/activity.html', href: `${basePrefix}views/activity.html`, label: 'Actividad', emoji: '💪' },
            { key: 'views/menu.html', href: `${basePrefix}views/menu.html`, label: 'Menú', emoji: '🍽️' },
            { key: 'views/list.html', href: `${basePrefix}views/list.html`, label: 'Lista', emoji: '🛒' },
            { key: 'views/tracking.html', href: `${basePrefix}views/tracking.html`, label: 'Control', emoji: '📈' }
        ];
        return `
            <div class="index-modal__header">
                <div class="index-modal__title">${title}</div>
            </div>
            <nav class="stack-vertical">
                ${items.map((item) => {
                    const isActive = currentPageKey === item.key;
                    const activeClass = isActive ? ' is-active' : '';
                    const activeAttr = isActive ? ' aria-current="page"' : '';
                    return `<a class="btn btn--primary index-modal__link${activeClass}" href="${item.href}"${activeAttr}>${item.emoji} ${item.label}</a>`;
                }).join('')}
            </nav>
        `;
    };

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






