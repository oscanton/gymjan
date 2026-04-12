const LIST_RESET_CONTROLS_ID = 'list-controls-container';
const SHOPPING_MEAL_KEYS = typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length ? MEAL_KEYS : ['breakfast', 'lunch', 'dinner'];
const listT = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');
const getFoodName = (foodId, fallback = '') => window.ContentI18n?.foodName?.(foodId, fallback || foodId) || fallback || foodId;
const getFoodCategoryLabel = (categoryId, fallback = '') => window.ContentI18n?.foodCategory?.(categoryId, fallback || categoryId) || fallback || categoryId;

function renderShoppingListPage() {
    const availableMenus = typeof AVAILABLE_MENUS !== 'undefined' ? AVAILABLE_MENUS : [];

    UI.bootstrapPage({
        rootId: 'lista-container',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            requiredDeps: [
                { when: () => typeof MenuApplicationService === 'undefined', path: 'js/core/application/menu.service.js' },
                { when: () => typeof ShoppingApplicationService === 'undefined', path: 'js/core/application/shopping.service.js' }
            ],
            globals: ['ShoppingApplicationService'],
            foods: true,
            selectedMenuData: true
        }),
        run: (container, context) => initShoppingList(container, context, { availableMenus }),
        onError: (container, file) => UI.showError(container, listT('errors.loading_file', { file }, `Error cargando ${file}`))
    });
}

function initShoppingList(container, { formulas, foodsData = null, menuData = null, ShoppingApplicationService: shoppingService = null } = {}, { availableMenus = [] } = {}) {
    const service = shoppingService || window.ShoppingApplicationService;
    if (!service) {
        UI.showError(container, listT('errors.loading_list_service', {}, 'Error cargando servicio de lista.'));
        return;
    }

    window.TargetsApplicationService?.applyMacroDefaults?.(formulas);
    const pageModel = service.buildShoppingPageModel({
        availableMenus,
        menuData,
        foodsData,
        formulas,
        mealKeys: SHOPPING_MEAL_KEYS
    });

    updateShoppingTitle(pageModel.menuLabel);
    if (!pageModel.isReady) {
        UI.showError(container, listT('errors.missing_list_data', {}, 'Faltan datos (Menu o Alimentos).'));
        return;
    }

    container.innerHTML = renderShoppingSections(pageModel.sections);
    container.onchange = (event) => handleShoppingChange(event, service);
    appendCustomListSection(container, service, pageModel.customItems);
    ensureListResetControls(container, service);
}

function updateShoppingTitle(menuLabel) {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    h1.querySelector('.menu-label')?.remove();
    const localizedLabel = menuLabel ? listT(`menu.plans.${menuLabel}`, {}, menuLabel) : '';
    h1.insertAdjacentHTML('beforeend', ` <span class="menu-label">(${UI.escapeHtml(localizedLabel)})</span>`);
}

function normalizeShoppingAmount(amount, unit) {
    if (unit === 'g' && amount >= 1000) return [UI.formatNumber(amount / 1000, 1), 'kg'];
    if (unit === 'ml' && amount >= 1000) return [UI.formatNumber(amount / 1000, 1), 'L'];
    return [amount, unit || ''];
}

function renderShoppingSections(sections = []) {
    return sections.length
        ? sections.map((section) => `
            <div class="glass-card section-group">
                <h2>${UI.escapeHtml(getFoodCategoryLabel(section.id, section.label || section.id))}</h2>
                <div class="section-group__grid">${section.items.map(renderShoppingRow).join('')}</div>
            </div>
        `).join('')
        : `<div class="glass-card card"><p>${listT('common.empty', {}, 'Lista vacia.')}</p></div>`;
}

function renderShoppingRow({ id, name, amount, unit, checked = false }) {
    const [displayAmount, displayUnit] = normalizeShoppingAmount(amount, unit);
    return `
        <label class="row-item">
            <div class="row-item__info"><span class="row-item__title">${UI.escapeHtml(getFoodName(id, name || id))}</span></div>
            <div class="row-item__actions">
                <span class="row-item__quantity">${displayAmount} ${displayUnit}</span>
                <input type="checkbox" id="${UI.escapeHtml(id)}"${checked ? ' checked' : ''}>
            </div>
        </label>
    `;
}

function handleShoppingChange(event, shoppingService) {
    const target = event.target;
    if (!target?.matches('input[type="checkbox"]')) return;
    return target.dataset.customId
        ? shoppingService.setCustomItemChecked(target.dataset.customId, target.checked)
        : shoppingService.setItemChecked(target.id, target.checked);
}

function renderCustomListRow(item) {
    return `
        <label class="row-item">
            <div class="row-item__info"><span class="row-item__title">${UI.escapeHtml(item.text)}</span></div>
            <div class="row-item__actions"><input type="checkbox" data-custom-id="${UI.escapeHtml(item.id)}"${item.checked ? ' checked' : ''}></div>
        </label>
    `;
}

function appendCustomListSection(container, shoppingService, customItems = []) {
    container.insertAdjacentHTML('beforeend', `
        <div class="glass-card section-group">
            <h2>${listT('common.misc', {}, 'Varios')}</h2>
            <div class="section-group__grid list-custom__grid">${(Array.isArray(customItems) ? customItems : []).map(renderCustomListRow).join('')}</div>
            <div class="list-custom__form">
                <input type="text" class="input-base list-custom__input" placeholder="${UI.escapeHtml(listT('list.misc_input_placeholder', {}, 'Añadir item a Varios...'))}" aria-label="${UI.escapeHtml(listT('list.misc_input_aria', {}, 'Nuevo item de varios'))}">
                <button type="button" class="list-custom__add">${listT('common.add', {}, 'Anadir')}</button>
            </div>
        </div>
    `);
    const section = container.lastElementChild;
    const input = section.querySelector('input');
    const itemsGrid = section.querySelector('.list-custom__grid');
    const addItem = () => {
        const text = input.value.trim();
        if (!text) return;
        const item = shoppingService.addCustomItem(text).at(-1);
        if (!item) return;
        itemsGrid.insertAdjacentHTML('beforeend', renderCustomListRow(item));
        input.value = '';
        input.focus();
    };
    section.querySelector('button').addEventListener('click', addItem);
    input.addEventListener('keydown', (event) => event.key === 'Enter' && addItem());
}

function ensureListResetControls(container, shoppingService) {
    document.getElementById(LIST_RESET_CONTROLS_ID)?.remove();
    container.insertAdjacentHTML('afterend', `
        <div id="${LIST_RESET_CONTROLS_ID}" class="menu-controls">
            <button type="button" class="btn-back">${listT('common.reset', {}, 'Reset')}</button>
        </div>
    `);
    document.querySelector(`#${LIST_RESET_CONTROLS_ID} button`).addEventListener('click', () => {
        if (!confirm(listT('list.reset_confirm', {}, 'Restablecer la lista? Se perderan checks y elementos anadidos.'))) return;
        shoppingService.clearAll();
        renderShoppingListPage();
    });
}
