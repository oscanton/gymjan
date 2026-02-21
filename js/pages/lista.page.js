/* =========================================
   pages/lista.page.js - LISTA DE LA COMPRA
   ========================================= */

function renderShoppingListPage() {
    const container = document.getElementById('lista-container');
    if (!container) return;

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
        { when: () => typeof FOODS === 'undefined', path: 'js/data/foods.js', id: 'static-foods-data' },
        { when: true, path: 'js/data/' + menuFile, id: 'dynamic-menu-list' }
    ])
        .then(() => {
            const savedData = MenuStore.getSavedMenuData(menuFile);
            if (savedData) {
                window.MENU_DATA = savedData;
            }
            calculateAndRenderList(container);
        })
        .catch((file) => UI.showError(container, `Error cargando ${file}`));
}

function calculateAndRenderList(container) {
    if (typeof MENU_DATA === 'undefined' || typeof FOODS === 'undefined') {
        container.innerHTML = `<div class="glass-card card"><p>Faltan datos (Menú o Alimentos).</p></div>`;
        return;
    }

    const totals = {};

    MENU_DATA.forEach(day => {
        ['desayuno', 'comida', 'cena'].forEach(meal => {
            if (day[meal] && day[meal].items) {
                day[meal].items.forEach(item => {
                    totals[item.foodId] = (totals[item.foodId] || 0) + item.amount;
                });
            }
        });
    });

    const listByCategory = {};

    const categoryOrder = [
        "🥔 Verduras y hortalizas",
        "🍎 Fruta",
        "🥩 Proteínas",
        "🥛 Lácteos",
        "🍚 Cereales, legumbres y tubérculos",
        "🥑 Grasas, frutos secos y semillas",
        "🧂 Condimentos y especias",
        "☕ Bebidas",
        "📦 Otros / Procesados",
        "💊 Suplementos"
    ];

    Object.keys(totals).forEach(foodId => {
        const amount = totals[foodId];
        if (amount <= 0) return;

        const food = FOODS[foodId];
        if (!food) return;

        const cat = food.category || "📦 Otros / Procesados";

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
        const idxA = categoryOrder.indexOf(a);
        const idxB = categoryOrder.indexOf(b);
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

            let displayAmount = item.amount;
            let displayUnit = item.unit || '';

            if (displayUnit === 'g' && displayAmount >= 1000) {
                displayAmount = (displayAmount / 1000).toFixed(1).replace('.0', '');
                displayUnit = 'kg';
            }
            if (displayUnit === 'ml' && displayAmount >= 1000) {
                displayAmount = (displayAmount / 1000).toFixed(1).replace('.0', '');
                displayUnit = 'L';
            }

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
        container.innerHTML = `<div class="glass-card card"><p>Lista vacía.</p></div>`;
    }
}
