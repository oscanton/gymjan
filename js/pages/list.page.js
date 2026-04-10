const LIST_RESET_CONTROLS_ID = 'list-controls-container';
const SHOPPING_FALLBACK_CATEGORY = 'Other / Processed';
const SHOPPING_MEAL_KEYS = typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length ? MEAL_KEYS : ['breakfast', 'lunch', 'dinner'];

function renderShoppingListPage() {
    const menuFile = MenuStore.getSelectedFile();
    CoreBrowserAdapter?.clearLoadedData?.({ menu: true });
    updateShoppingTitle(menuFile);

    UI.bootstrapPage({
        rootId: 'lista-container',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({ foods: true, menuFile }),
        run: (container, context) => initShoppingList(container, context),
        onError: (container, file) => UI.showError(container, `Error cargando ${file}`)
    });
}

function updateShoppingTitle(menuFile) {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    const menus = typeof AVAILABLE_MENUS !== 'undefined' ? AVAILABLE_MENUS : [];
    const label = menus.find((option) => option.file === menuFile)?.label || menuFile.replace('.js', '');
    h1.querySelector('.menu-label')?.remove();
    h1.insertAdjacentHTML('beforeend', ` <span class="menu-label">(${UI.escapeHtml(label)})</span>`);
}

function initShoppingList(container, { formulas, foodsData = null, menuData = null } = {}) {
    if (typeof APP_MACRO_RATIOS !== 'undefined' && typeof formulas?.setDefaultMacroRatios === 'function') {
        formulas.setDefaultMacroRatios(APP_MACRO_RATIOS);
    }
    const foodsCatalog = foodsData?.foods || null;
    if (!Array.isArray(menuData) || !foodsCatalog || !formulas) {
        UI.showError(container, 'Faltan datos (Men\u00FA o Alimentos).');
        return;
    }

    const { labels, order } = getCategoryMeta(foodsData?.categories);
    const byCategory = {};
    Object.entries(formulas.calculateShoppingTotals(menuData, SHOPPING_MEAL_KEYS)).forEach(([foodId, amount]) => {
        const food = foodsCatalog[foodId];
        if (!food || amount <= 0) return;
        const category = food.category || foodsData?.fallbackCategory || SHOPPING_FALLBACK_CATEGORY;
        (byCategory[category] ||= []).push({ id: foodId, name: food.name, amount, unit: food.unit });
    });

    const categories = Object.keys(byCategory).sort((a, b) => (order[a] ?? 999) - (order[b] ?? 999) || a.localeCompare(b));
    container.innerHTML = categories.length
        ? categories.map((category) => renderShoppingSection(labels[category] || category, byCategory[category])).join('')
        : '<div class="glass-card card"><p>Lista vac\u00EDa.</p></div>';
    container.onchange = handleShoppingChange;
    appendCustomListSection(container);
    ensureListResetControls(container);
}

function getCategoryMeta(categories = []) {
    const labels = {};
    const order = {};
    categories.forEach((category, index) => {
        if (!category?.id) return;
        labels[category.id] = category.label || category.id;
        order[category.id] = index;
    });
    return { labels, order };
}

function normalizeShoppingAmount(amount, unit) {
    if (unit === 'g' && amount >= 1000) return [UI.formatNumber(amount / 1000, 1), 'kg'];
    if (unit === 'ml' && amount >= 1000) return [UI.formatNumber(amount / 1000, 1), 'L'];
    return [amount, unit || ''];
}

function renderShoppingSection(label, items) {
    return `
        <div class="glass-card section-group">
            <h2>${UI.escapeHtml(label)}</h2>
            <div class="section-group__grid">
                ${items.map(renderShoppingRow).join('')}
            </div>
        </div>
    `;
}

function renderShoppingRow({ id, name, amount, unit }) {
    const [displayAmount, displayUnit] = normalizeShoppingAmount(amount, unit);
    return `
        <label class="row-item">
            <div class="row-item__info"><span class="row-item__title">${UI.escapeHtml(name)}</span></div>
            <div class="row-item__actions">
                <span class="row-item__quantity">${displayAmount} ${displayUnit}</span>
                <input type="checkbox" id="${UI.escapeHtml(id)}"${ShoppingStore.getItemChecked(id, false) ? ' checked' : ''}>
            </div>
        </label>
    `;
}

function handleShoppingChange(event) {
    const { target } = event;
    if (!target?.matches('input[type="checkbox"]')) return;
    if (target.dataset.customId) ShoppingStore.setCustomItemChecked(target.dataset.customId, target.checked);
    else ShoppingStore.setItemChecked(target.id, target.checked);
}

function renderCustomListRow(item) {
    return `
        <label class="row-item">
            <div class="row-item__info"><span class="row-item__title">${UI.escapeHtml(item.text)}</span></div>
            <div class="row-item__actions"><input type="checkbox" data-custom-id="${UI.escapeHtml(item.id)}"${item.checked ? ' checked' : ''}></div>
        </label>
    `;
}

function appendCustomListSection(container) {
    container.insertAdjacentHTML('beforeend', `
        <div class="glass-card section-group">
            <h2>Varios</h2>
            <div class="section-group__grid list-custom__grid">${ShoppingStore.getCustomItems().map(renderCustomListRow).join('')}</div>
            <div class="list-custom__form">
                <input type="text" class="input-base list-custom__input" placeholder="A\u00F1adir \u00EDtem a Varios..." aria-label="Nuevo \u00EDtem de varios">
                <button type="button" class="list-custom__add">A\u00F1adir</button>
            </div>
        </div>
    `);
    const section = container.lastElementChild;
    const input = section.querySelector('input');
    const itemsGrid = section.querySelector('.list-custom__grid');
    const addItem = () => {
        const text = input.value.trim();
        if (!text) return;
        const items = ShoppingStore.addCustomItem(text);
        const item = items[items.length - 1];
        if (!item) return;
        itemsGrid.insertAdjacentHTML('beforeend', renderCustomListRow(item));
        input.value = '';
        input.focus();
    };
    section.querySelector('button').addEventListener('click', addItem);
    input.addEventListener('keydown', (event) => event.key === 'Enter' && addItem());
}

function ensureListResetControls(container) {
    document.getElementById(LIST_RESET_CONTROLS_ID)?.remove();
    container.insertAdjacentHTML('afterend', `
        <div id="${LIST_RESET_CONTROLS_ID}" class="menu-controls">
            <button type="button" class="btn-back">Reset</button>
        </div>
    `);
    document.querySelector(`#${LIST_RESET_CONTROLS_ID} button`).addEventListener('click', () => {
        if (!confirm('\u00BFRestablecer la lista? Se perder\u00E1n checks y elementos a\u00F1adidos.')) return;
        ShoppingStore.clearAll();
        renderShoppingListPage();
    });
}
