/* =========================================
   pages/list.page.js - SHOPPING LIST
   ========================================= */

function renderShoppingListPage() {
    const container = document.getElementById('lista-container');
    if (!container) return;

    let formulas = null;

    window.MENU_DATA = undefined;
    const otherMenuScript = document.getElementById('dynamic-menu-data');
    if (otherMenuScript) otherMenuScript.remove();

    const menuFile = MenuStore.getSelectedFile();

    const h1 = document.querySelector('h1');
    if (h1) {
        const menuOption = (typeof AVAILABLE_MENUS !== 'undefined' ? AVAILABLE_MENUS : []).find(m => m.file === menuFile);
        const label = menuOption ? menuOption.label : menuFile.replace('.js', '');

        const existingLabel = h1.querySelector('.menu-label');
        if (existingLabel) existingLabel.remove();

        h1.innerHTML += ` <span class="menu-label">(${label})</span>`;
    }

    UI.loadDependencies([
        { when: () => typeof CoreBrowserAdapter === 'undefined', path: 'js/core/adapters/browser.adapter.js', id: 'core-browser-adapter' }
    ])
        .then(() => (CoreBrowserAdapter && CoreBrowserAdapter.ensureCoreDomain
            ? CoreBrowserAdapter.ensureCoreDomain()
            : Promise.reject('CoreBrowserAdapter unavailable')))
        .then(() => {
            formulas = window.FormulasEngine;
            if (!formulas) return Promise.reject('FormulasEngine unavailable');
            if (typeof APP_MACRO_RATIOS !== 'undefined' && typeof formulas.setDefaultMacroRatios === 'function') {
                formulas.setDefaultMacroRatios(APP_MACRO_RATIOS);
            }
            return true;
        })
        .then(() => CoreBrowserAdapter.loadFoods())
        .then(() => CoreBrowserAdapter.loadMenuFile(menuFile))
        .then(() => {
            const savedData = MenuStore.getSavedMenuData(menuFile);
            if (savedData) {
                window.MENU_DATA = savedData;
            }
            calculateAndRenderList(container, formulas);
        })
        .catch((file) => UI.showError(container, `Error cargando ${file}`));
}

const LIST_CATEGORY_ORDER = (typeof FOOD_CATEGORY_ORDER !== 'undefined'
    && Array.isArray(FOOD_CATEGORY_ORDER)
    && FOOD_CATEGORY_ORDER.length)
    ? FOOD_CATEGORY_ORDER
    : [
        "🥔 Vegetables",
        "🍎 Fruit",
        "🥩 Proteins",
        "🥛 Dairy",
        "🌾 Grains, legumes and tubers",
        "🥑 Fats, nuts and seeds",
        "🧂 Condiments and spices",
        "🍫 Sweets and chocolate",
        "☕ Drinks",
        "📦 Other / Processed",
        "💊 Supplements"
    ];

const LIST_FALLBACK_CATEGORY = (typeof FOOD_FALLBACK_CATEGORY !== 'undefined'
    && FOOD_FALLBACK_CATEGORY)
    ? FOOD_FALLBACK_CATEGORY
    : "📦 Other / Processed";

function normalizeShoppingAmount(amount, unit, formatNumber) {
    let displayAmount = amount;
    let displayUnit = unit || '';

    if (displayUnit === 'g' && displayAmount >= 1000) {
        displayAmount = formatNumber(displayAmount / 1000, 1);
        displayUnit = 'kg';
    } else if (displayUnit === 'ml' && displayAmount >= 1000) {
        displayAmount = formatNumber(displayAmount / 1000, 1);
        displayUnit = 'L';
    }

    return { displayAmount, displayUnit };
}

function calculateAndRenderList(container, formulas) {
    if (typeof MENU_DATA === 'undefined' || typeof FOODS === 'undefined' || !formulas) {
        container.innerHTML = `<div class="glass-card card"><p>Faltan datos (Menú o Alimentos).</p></div>`;
        return;
    }

    const formatNumber = UI.formatNumber;
    const mealKeys = (typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length)
        ? MEAL_KEYS
        : ['breakfast', 'lunch', 'dinner'];
    const totals = formulas.calculateShoppingTotals(MENU_DATA, mealKeys);

    const listByCategory = {};

    Object.keys(totals).forEach(foodId => {
        const amount = totals[foodId];
        if (amount <= 0) return;

        const food = FOODS[foodId];
        if (!food) return;

        const cat = food.category || LIST_FALLBACK_CATEGORY;

        if (!listByCategory[cat]) {
            listByCategory[cat] = [];
        }

        listByCategory[cat].push({
            id: foodId,
            titulo: food.name,
            amount: amount,
            unit: food.unit
        });
    });

    container.innerHTML = '';
    let hasItems = false;

    const sortedCategories = Object.keys(listByCategory).sort((a, b) => {
        const idxA = LIST_CATEGORY_ORDER.indexOf(a);
        const idxB = LIST_CATEGORY_ORDER.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    sortedCategories.forEach(catName => {
        const items = listByCategory[catName];
        if (items.length === 0) return;
        hasItems = true;

        const section = document.createElement('div');
        section.className = 'glass-card section-group';
        section.innerHTML = `<h2>${catName}</h2><div class="section-group__grid"></div>`;

        const grid = section.querySelector('.section-group__grid');

        grid.addEventListener('change', (e) => {
            if (e.target.matches('input[type="checkbox"]')) {
                DB.save(`shop_${e.target.id}`, e.target.checked);
            }
        });

        items.forEach(item => {
            const isChecked = DB.get(`shop_${item.id}`, false);

            const { displayAmount, displayUnit } = normalizeShoppingAmount(item.amount, item.unit, formatNumber);

            const label = document.createElement('label');
            label.className = 'row-item';

            label.innerHTML = `
                <div class="row-item__info">
                    <span class="row-item__title">${item.titulo}</span>
                </div>
                <div class="row-item__actions">
                    <span class="row-item__quantity">${displayAmount} ${displayUnit}</span>
                    <input type="checkbox" id="${item.id}" ${isChecked ? 'checked' : ''}>
                </div>
            `;

            grid.appendChild(label);
        });

        container.appendChild(section);
    });

    if (!hasItems) {
        const empty = document.createElement('div');
        empty.className = 'glass-card card';
        empty.innerHTML = '<p>Lista vacía.</p>';
        container.appendChild(empty);
    }

    appendCustomListSection(container);
    ensureListResetControls(container, formulas);
}

const CUSTOM_LIST_KEY = 'shop_custom_items';
const LIST_RESET_CONTROLS_ID = 'list-controls-container';

function getCustomListItems() {
    const items = DB.get(CUSTOM_LIST_KEY, []);
    if (!Array.isArray(items)) return [];
    return items.filter(item => item && typeof item.text === 'string' && item.text.trim().length > 0);
}

function saveCustomListItems(items) {
    DB.save(CUSTOM_LIST_KEY, items);
}

function buildCustomListRow(item) {
    const label = document.createElement('label');
    label.className = 'row-item';

    const info = document.createElement('div');
    info.className = 'row-item__info';

    const title = document.createElement('span');
    title.className = 'row-item__title';
    title.textContent = item.text;

    info.appendChild(title);

    const actions = document.createElement('div');
    actions.className = 'row-item__actions';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.customId = item.id;
    if (item.checked) checkbox.checked = true;

    actions.appendChild(checkbox);

    label.appendChild(info);
    label.appendChild(actions);

    return label;
}

function appendCustomListSection(container) {
    const section = document.createElement('div');
    section.className = 'glass-card section-group';
    section.innerHTML = '<h2>🧾 Varios</h2>';

    const itemsGrid = document.createElement('div');
    itemsGrid.className = 'section-group__grid list-custom__grid';

    const items = getCustomListItems();
    items.forEach(item => itemsGrid.appendChild(buildCustomListRow(item)));

    itemsGrid.addEventListener('change', (e) => {
        if (!e.target.matches('input[type="checkbox"][data-custom-id]')) return;
        const customId = e.target.dataset.customId;
        const updatedItems = getCustomListItems().map(item => (
            item.id === customId ? { ...item, checked: e.target.checked } : item
        ));
        saveCustomListItems(updatedItems);
    });

    const form = document.createElement('div');
    form.className = 'list-custom__form';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'input-base list-custom__input';
    input.placeholder = 'Añadir item a Varios...';
    input.setAttribute('aria-label', 'Nuevo item de varios');

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'list-custom__add';
    button.textContent = 'Añadir';

    const addItem = () => {
        const text = input.value.trim();
        if (!text) return;
        const newItem = {
            id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
            text,
            checked: false
        };
        const updated = [...getCustomListItems(), newItem];
        saveCustomListItems(updated);
        itemsGrid.appendChild(buildCustomListRow(newItem));
        input.value = '';
        input.focus();
    };

    button.addEventListener('click', addItem);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addItem();
    });

    form.appendChild(input);
    form.appendChild(button);

    section.appendChild(itemsGrid);
    section.appendChild(form);

    container.appendChild(section);
}

function ensureListResetControls(container, formulas) {
    if (!container || document.getElementById(LIST_RESET_CONTROLS_ID)) return;

    const controls = document.createElement('div');
    controls.id = LIST_RESET_CONTROLS_ID;
    controls.className = 'menu-controls';

    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'btn-back';
    resetBtn.textContent = 'Reset';
    resetBtn.addEventListener('click', () => {
        if (!confirm('¿Restablecer la lista? Se perderán checks y elementos añadidos.')) return;
        const prefix = (typeof APP_PREFIX !== 'undefined') ? APP_PREFIX : '';
        Object.keys(localStorage).forEach((key) => {
            if (key.startsWith(prefix + 'shop_')) {
                localStorage.removeItem(key);
            }
        });
        calculateAndRenderList(container, formulas);
    });

    controls.appendChild(resetBtn);
    container.after(controls);
}

