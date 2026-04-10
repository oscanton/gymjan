window.addEventListener('DOMContentLoaded', () => {
    const prefix = typeof APP_PREFIX === 'string' && APP_PREFIX ? APP_PREFIX : 'myfitpwa_';
    const lastPageKey = `${prefix}last_opened_page`;
    const navigablePages = new Set(['views/calculator.html', 'views/activity.html', 'views/menu.html', 'views/list.html']);
    const path = window.location.pathname.replace(/\\/g, '/');
    const viewMatch = path.match(/\/views\/([^/]+\.html)$/i);
    const isIndexPath = /\/$|\/index\.html$/i.test(path);
    const params = new URLSearchParams(window.location.search);
    const currentView = viewMatch ? `views/${viewMatch[1]}` : '';
    const currentPageKey = viewMatch ? currentView.toLowerCase() : (isIndexPath ? 'index.html' : '');
    const pageRegistry = [
        ['menu-body', window.renderMenuPage],
        ['lista-container', window.renderShoppingListPage],
        ['actividad-container', window.renderActivityPage],
        ['calculadora-container', window.renderCalculatorPage]
    ];
    const navItems = [
        ['index.html', 'index.html?home=1', 'Inicio'],
        ['views/calculator.html', 'views/calculator.html', 'Calculadora'],
        ['views/activity.html', 'views/activity.html', 'Actividad'],
        ['views/menu.html', 'views/menu.html', 'Men\u00FA'],
        ['views/list.html', 'views/list.html', 'Lista']
    ];
    const buildIndexContent = ({ basePrefix = '', title = '\u00CDndice' } = {}) => `
        <div class="index-modal__header"><div class="index-modal__title">${title}</div></div>
        <nav class="stack-vertical">
            ${navItems.map(([key, href, label]) => {
                const isActive = currentPageKey === key;
                return `<a class="btn btn--primary index-modal__link${isActive ? ' is-active' : ''}" href="${basePrefix}${href}"${isActive ? ' aria-current="page"' : ''}>${label}</a>`;
            }).join('')}
        </nav>
    `;
    const ensureTitleSpan = (headerTitle) => {
        let titleSpan = headerTitle.querySelector('.page-title-text');
        if (titleSpan) return titleSpan;
        const textNodes = Array.from(headerTitle.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== '');
        titleSpan = document.createElement('span');
        titleSpan.className = 'page-title-text';
        titleSpan.textContent = textNodes.map((node) => node.textContent.trim()).join(' ') || headerTitle.textContent.trim();
        textNodes.forEach((node) => node.remove());
        headerTitle.insertBefore(titleSpan, headerTitle.firstChild);
        return titleSpan;
    };
    const ensureIndexModal = () => {
        let modal = document.getElementById('global-index-modal');
        if (modal) return modal;
        modal = document.createElement('div');
        modal.id = 'global-index-modal';
        modal.className = 'index-modal-backdrop';
        modal.innerHTML = `<div class="index-modal" role="dialog" aria-modal="true" aria-label="Navegaci\u00F3n">${buildIndexContent({ basePrefix: viewMatch ? '../' : '', title: '\u00CDndice' })}</div>`;
        modal.addEventListener('click', (event) => { if (event.target === modal) modal.classList.remove('is-open'); });
        document.addEventListener('keydown', (event) => { if (event.key === 'Escape') modal.classList.remove('is-open'); });
        document.body.appendChild(modal);
        return modal;
    };

    localStorage.removeItem(`${prefix}weight_history`);
    if (viewMatch) {
        if (navigablePages.has(currentView)) localStorage.setItem(lastPageKey, currentView);
        else localStorage.removeItem(lastPageKey);
    } else if (isIndexPath && !params.has('home')) {
        const lastPage = localStorage.getItem(lastPageKey);
        if (navigablePages.has(lastPage || '')) {
            window.location.replace(lastPage);
            return;
        }
        localStorage.removeItem(lastPageKey);
    }

    pageRegistry.forEach(([rootId, render]) => {
        if (document.getElementById(rootId) && typeof render === 'function') render();
    });

    const indexCard = document.getElementById('index-card');
    if (indexCard) indexCard.innerHTML = buildIndexContent({ title: '\u00CDndice' });

    const header = document.querySelector('.page-header');
    const headerTitle = header ? header.querySelector('h1') : null;
    if (headerTitle) ensureTitleSpan(headerTitle);
    if (header && !header.querySelector('.page-menu-trigger')) {
        const trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'page-menu-trigger';
        trigger.setAttribute('aria-label', 'Abrir \u00EDndice');
        trigger.addEventListener('click', () => ensureIndexModal().classList.add('is-open'));
        header.classList.add('page-header--with-menu');
        header.insertBefore(trigger, header.firstChild);
    }
});
