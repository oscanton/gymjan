/* =========================================
   pages/menu.page.js - MENÚ SEMANAL
   ========================================= */

function renderMenuPage() {
    const tableBody = document.getElementById("menu-body");
    if (!tableBody) return;

    let isEditMode = false;

    let container = document.getElementById('menu-container');
    if (!container) {
        const table = tableBody.closest('table');
        if (table) container = table.parentElement;
    }

    let currentFile = MenuStore.getSelectedFile();

    const loadMenuData = (fileName) => {
        window.MENU_DATA = undefined;

        UI.loadScript(`js/data/${fileName}`, 'dynamic-menu-data')
            .then(() => {
                const savedData = MenuStore.getSavedMenuData(fileName);
                if (savedData) window.MENU_DATA = savedData;
                setTimeout(renderTableContent, 50);
            })
            .catch(() => {
                tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger text-center">Error cargando ${fileName}</td></tr>`;
            });
    };

    if (container && !document.getElementById('menu-controls-container')) {
        const btnContainer = document.createElement('div');
        btnContainer.id = 'menu-controls-container';
        btnContainer.className = 'menu-controls';

        const editBtn = document.createElement('button');
        editBtn.id = 'menu-edit-btn';
        editBtn.className = 'btn-back';
        editBtn.innerHTML = '✏️ Editar';
        editBtn.onclick = () => {
            isEditMode = !isEditMode;
            editBtn.innerHTML = isEditMode ? '✅ Listo' : '✏️ Editar';
            editBtn.classList.toggle('btn-back--active', isEditMode);
            renderTableContent();
        };

        const resetBtn = document.createElement('button');
        resetBtn.className = 'btn-back';
        resetBtn.innerHTML = '🔄 Reset';
        resetBtn.onclick = () => {
            if (confirm("¿Restablecer el menú original? Se perderán los cambios.")) {
                MenuStore.clearSavedMenuData(currentFile);
                if (isEditMode) {
                    isEditMode = false;
                    editBtn.innerHTML = '✏️ Editar';
                    editBtn.classList.remove('btn-back--active');
                }
                loadMenuData(currentFile);
            }
        };

        const wideBtn = document.createElement('button');
        wideBtn.className = 'btn-back';
        wideBtn.innerHTML = '↔️ Ancho';

        let isWideMode = false;
        wideBtn.onclick = () => {
            isWideMode = !isWideMode;
            wideBtn.classList.toggle('btn-back--active', isWideMode);
            if (isWideMode) {
                container.classList.remove('layout-container');
                wideBtn.innerHTML = '📱 Normal';
            } else {
                container.classList.add('layout-container');
                wideBtn.innerHTML = '↔️ Ancho';
            }
        };

        btnContainer.appendChild(editBtn);
        btnContainer.appendChild(resetBtn);
        btnContainer.appendChild(wideBtn);
        container.after(btnContainer);
    }

    const generateTotalsHtml = (dayTotals, target) => {
        const tKcal = target ? target.kcal : 0;
        const tProt = target ? target.protein : 0;
        const tCarb = target ? target.carbs : 0;
        const tFat  = target ? target.fat : 0;

        const classKcal = UI.getStatusClass(dayTotals.kcal, tKcal);
        const classProt = UI.getStatusClass(dayTotals.protein, tProt);
        const classCarb = UI.getStatusClass(dayTotals.carbs, tCarb);
        const classFat  = UI.getStatusClass(dayTotals.fat, tFat);

        return `
            <div class="totals-stack">
                <div class="stat-pill stat-pill--kcal stat-pill--sm stat-pill--block">
                    🔥 <span class="${classKcal}">${Math.round(dayTotals.kcal)}</span>
                    <span class="text-muted">/ ${tKcal} kcal</span>
                </div>
                <div class="totals-row">
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">🥩 Prot</div>
                        <div><span class="${classProt}">${Math.round(dayTotals.protein)}</span> <span class="text-muted">/ ${tProt}g</span></div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">🍚 Carbs</div>
                        <div><span class="${classCarb}">${Math.round(dayTotals.carbs)}</span> <span class="text-muted">/ ${tCarb}g</span></div>
                    </div>
                    <div class="stat-pill totals-pill stat-pill--sm">
                        <div class="totals-pill__label">🥑 Grasas</div>
                        <div><span class="${classFat}">${Math.round(dayTotals.fat)}</span> <span class="text-muted">/ ${tFat}g</span></div>
                    </div>
                </div>
            </div>`;
    };

    const renderTableContent = () => {
        if (typeof window.MENU_DATA === 'undefined') {
            console.error("Error: MENU_DATA no está definido.");
            tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger">Error: MENU_DATA no disponible.</td></tr>`;
            return;
        }

        const storedTargets = DB.get(
            'daily_nutrition_targets',
            (typeof DAILY_NUTRITION_TARGETS !== 'undefined' ? DAILY_NUTRITION_TARGETS : {})
        );

        const currentData = window.MENU_DATA;

        const todayIndex = DateUtils.getTodayIndex();

        const table = tableBody.closest('table');
        const thead = table.querySelector('thead');
        if (thead) {
            const h1 = document.querySelector('h1');
            if (h1) {
                h1.classList.add('header-with-controls');

                let selectWrapper = document.getElementById('menu-select-wrapper');
                if (!selectWrapper) {
                    selectWrapper = document.createElement('span');
                    selectWrapper.id = 'menu-select-wrapper';
                    h1.appendChild(selectWrapper);
                }

                const options = AVAILABLE_MENUS.map(m =>
                    `<option value="${m.file}" ${m.file === currentFile ? 'selected' : ''}>${m.label}</option>`
                ).join('');

                selectWrapper.innerHTML = `<select id="menu-select" class="input-base input-select input-select--header">${options}</select>`;

                const select = document.getElementById('menu-select');
                if (select) {
                    select.addEventListener('change', (e) => {
                        const newFile = e.target.value;
                        currentFile = newFile;
                        MenuStore.setSelectedFile(newFile);
                        loadMenuData(newFile);
                    });
                }
            }

            let headerHtml = `<tr><th class="menu-row-header menu-header-empty"></th>`;
            currentData.forEach((day, index) => {
                const isToday = index === todayIndex;
                const activeClass = isToday ? 'text-status--ok' : '';
                headerHtml += `<th class="${activeClass}">${day.dia}</th>`;
            });
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;
        }

        tableBody.innerHTML = "";
        const meals = ['desayuno', 'comida', 'cena'];
        const mealLabels = { 'desayuno': 'Desayuno', 'comida': 'Comida', 'cena': 'Cena' };

        const activeMeal = MenuUtils.getActiveMealByHour();

        try {
            meals.forEach(mealKey => {
                const row = document.createElement("tr");
                const isActive = mealKey === activeMeal;
                const activeClass = isActive ? 'text-status--ok' : '';
                let html = `<td class="menu-row-header ${activeClass}">${mealLabels[mealKey]}</td>`;

                currentData.forEach((day, dayIndex) => {
                    const mealData = day[mealKey];
                    const nut = MenuUtils.calcMealMacros(mealData.items);

                    html += `
                        <td>
                            <ul class="meal-list">
                                ${mealData.items.map((i, itemIndex) => {
                                    const f = FOODS[i.foodId];
                                    let amountHtml;
                                    if (isEditMode) {
                                        amountHtml = `<input type="text" inputmode="decimal" value="${i.amount}" 
                                            class="input-base input-base--table-edit" 
                                            data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">`;
                                    } else {
                                        amountHtml = `<span>${i.amount}</span>`;
                                    }
                                    return `<li class="meal-item">
                                        <span class="meal-item__name food-info-trigger" data-food-id="${i.foodId}">${f ? f.name : i.foodId}</span>
                                        <div class="meal-item__amount">
                                            ${amountHtml}
                                            <span class="meal-item__unit">${f ? f.unit : ''}</span>
                                        </div>
                                    </li>`;
                                }).join('')}
                            </ul>
                            <div class="meal-macros" id="macros-${dayIndex}-${mealKey}">
                                <div class="stat-pill stat-pill--kcal stat-pill--xs">🔥 ${Math.round(nut.kcal)} kcal</div>
                                <div class="stat-pill stat-pill--xs">🥩 ${Math.round(nut.protein)}g</div>
                                <div class="stat-pill stat-pill--xs">🍚 ${Math.round(nut.carbs)}g</div>
                                <div class="stat-pill stat-pill--xs">🥑 ${Math.round(nut.fat)}g</div>
                            </div>
                            <div class="meal-description">
                                ${mealData.description || ''}
                            </div>
                        </td>`;
                });
                row.innerHTML = html;
                tableBody.appendChild(row);
            });

            const totalsRow = document.createElement("tr");
            let totalsHtml = `<td class="menu-row-header">Totales</td>`;

            currentData.forEach((day, dayIndex) => {
                const dayTotals = MenuUtils.calcDayTotals(day);

                const target = storedTargets[day.dia];
                totalsHtml += `
                    <td class="day-total" id="day-totals-${dayIndex}">
                        ${generateTotalsHtml(dayTotals, target)}
                    </td>`;
            });
            totalsRow.innerHTML = totalsHtml;
            tableBody.appendChild(totalsRow);

            setTimeout(() => {
                MenuUtils.scrollToToday(table, todayIndex);
            }, 100);

        } catch (error) {
            console.error("Error renderizando el menú:", error);
            tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger text-center p-lg">Error cargando los datos: ${error.message}</td></tr>`;
        }
    };

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('food-info-trigger')) {
            const foodId = e.target.dataset.foodId;

            if (typeof FOODS === 'undefined') return;
            const food = FOODS[foodId];
            if (!food) return;

            const existing = document.getElementById('food-popup');
            if (existing) existing.remove();

            let vals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
            let label = '';
            if (food.nutritionPer100) {
                vals = food.nutritionPer100;
                label = 'Valores por 100g';
            } else if (food.nutritionPerUnit) {
                vals = food.nutritionPerUnit;
                label = 'Valores por Unidad';
            }

            const modal = document.createElement('div');
            modal.id = 'food-popup';
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3 class="text-primary modal-title">${food.name}</h3>
                    <div class="text-xs text-muted mb-sm">${label}</div>

                    <div class="stats-pills my-sm">
                        <div class="stat-pill stat-pill--kcal modal-stat-pill-lg w-100">🔥 ${vals.kcal} kcal</div>
                    </div>

                    <div class="modal-grid-3">
                        <div class="card-panel modal-panel-sm"><div class="text-xs text-muted">Prot</div><div class="text-lg">🥩 ${vals.protein}g</div></div>
                        <div class="card-panel modal-panel-sm"><div class="text-xs text-muted">Carb</div><div class="text-lg">🍚 ${vals.carbs}g</div></div>
                        <div class="card-panel modal-panel-sm"><div class="text-xs text-muted">Grasa</div><div class="text-lg">🥑 ${vals.fat}g</div></div>
                    </div>
                </div>
            `;

            modal.addEventListener('click', () => modal.remove());
            document.body.appendChild(modal);
        }
    });

    tableBody.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.dataset.day) {
            const dayIndex = parseInt(e.target.dataset.day);
            const mealKey = e.target.dataset.meal;
            const itemIndex = parseInt(e.target.dataset.item);
            const newVal = parseFloat(e.target.value) || 0;

            if (window.MENU_DATA && window.MENU_DATA[dayIndex]) {
                window.MENU_DATA[dayIndex][mealKey].items[itemIndex].amount = newVal;

                MenuStore.saveMenuData(currentFile, window.MENU_DATA);

                const mealItems = window.MENU_DATA[dayIndex][mealKey].items;
                const mealNut = MenuUtils.calcMealMacros(mealItems);
                const mealMacroDiv = document.getElementById(`macros-${dayIndex}-${mealKey}`);
                if (mealMacroDiv) {
                    mealMacroDiv.innerHTML = `
                        <div class="stat-pill stat-pill--kcal stat-pill--xs">🔥 ${Math.round(mealNut.kcal)} kcal</div>
                        <div class="stat-pill stat-pill--xs">🥩 ${Math.round(mealNut.protein)}g</div>
                        <div class="stat-pill stat-pill--xs">🍚 ${Math.round(mealNut.carbs)}g</div>
                        <div class="stat-pill stat-pill--xs">🥑 ${Math.round(mealNut.fat)}g</div>
                    `;
                }

                const dayData = window.MENU_DATA[dayIndex];
                const dayTotals = MenuUtils.calcDayTotals(dayData);

                const storedTargets = DB.get('daily_nutrition_targets', {});
                const target = storedTargets[dayData.dia];
                const totalsCell = document.getElementById(`day-totals-${dayIndex}`);
                if (totalsCell) {
                    totalsCell.innerHTML = generateTotalsHtml(dayTotals, target);
                }
            }
        }
    });

    const loadDependencies = () => {
        const promises = [];
        if (typeof Formulas === 'undefined') promises.push(UI.loadScript('js/core/formulas.js'));
        if (typeof MenuUtils === 'undefined') promises.push(UI.loadScript('js/core/menu.js'));
        if (typeof FOODS === 'undefined') promises.push(UI.loadScript('js/data/foods.js'));
        if (typeof DAILY_NUTRITION_TARGETS === 'undefined') promises.push(UI.loadScript('js/data/targets.js'));

        Promise.all(promises)
            .then(() => loadMenuData(currentFile))
            .catch(err => {
                console.error("Error loading dependencies:", err);
                tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger text-center">Error crítico: No se pudieron cargar las dependencias (foods/formulas).</td></tr>`;
            });
    };

    loadDependencies();
}
