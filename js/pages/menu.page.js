function renderMenuPage() {
    const tableBody = document.getElementById('menu-body');
    if (!tableBody) return;

    let formulas = null;
    let targets = null;
    let nutritionScore = null;
    let menuService = null;
    let menuPresenter = null;
    let currentMenuData = null;
    let currentActivityPlan = null;
    let foodsCatalog = null;
    let exercisesCatalog = null;
    let isEditMode = false;

    const table = tableBody.closest('table');
    let container = document.getElementById('menu-container');
    if (!container && table) container = table.parentElement;

    const errorColspan = Number.isFinite(DAYS_COUNT) ? DAYS_COUNT + 1 : 3;
    const mealKeys = Array.isArray(MEAL_KEYS) && MEAL_KEYS.length ? MEAL_KEYS : ['breakfast', 'lunch', 'dinner'];
    const displayMealKeys = ['hydration', ...mealKeys];
    const DEFAULT_GRAMS_AMOUNT = 100;
    const DEFAULT_UNIT_AMOUNT = 1;
    const MENU_SELECT_ID = 'menu-select-wrapper';
    const mealLabels = { hydration: 'Hidrataci\u00F3n', breakfast: 'Desayuno', lunch: 'Comida', dinner: 'Cena' };
    const presenterHelpers = {
        formatNumber: UI.formatNumber,
        formatKcal: UI.formatKcal,
        formatGrams: UI.formatGrams,
        formatMl: UI.formatMl,
        formatScore: UI.formatScore
    };

    let currentFile = MenuStore.getSelectedFile();
    if (!AVAILABLE_MENUS.some((option) => option.file === currentFile)) {
        currentFile = AVAILABLE_MENUS[0].file;
        MenuStore.setSelectedFile(currentFile);
    }

    const encodePayload = UI.encodePayload;
    const decodePayload = UI.decodePayload;
    const escapeHtml = UI.escapeHtml;
    const formatNumber = UI.formatNumber;
    const formatMl = UI.formatMl;

    const showTableError = (message, status = 'danger') => {
        tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--${status} text-center">${message}</td></tr>`;
    };
    const saveMenu = () => MenuStore.saveMenuData(currentFile, currentMenuData);
    const persistAndRender = () => {
        saveMenu();
        renderTableContent();
    };
    const getDefaultAmountForFood = (food) => (
        !food ? 0 : (food.nutritionPerUnit ? (food.unit === 'ml' ? 250 : DEFAULT_UNIT_AMOUNT) : DEFAULT_GRAMS_AMOUNT)
    );
    const getSortedFoods = (filter = null) => {
        if (!foodsCatalog) return [];
        return Object.entries(foodsCatalog)
            .filter(([, food]) => !filter || filter(food))
            .map(([id, food]) => ({ id, food }))
            .sort((a, b) => (a.food.name || a.id).localeCompare((b.food.name || b.id), 'es', { sensitivity: 'base' }));
    };
    const getSimilarFoods = (foodId) => {
        const category = foodsCatalog && foodsCatalog[foodId] ? foodsCatalog[foodId].category : null;
        return getSortedFoods((food) => !category || food.category === category);
    };
    const renderFoodOptions = (items, selected = '') => items.map(({ id, food }) => (
        `<option value="${escapeHtml(id)}"${id === selected ? ' selected' : ''}>${escapeHtml(food.name || id)}</option>`
    )).join('');
    const renderFoodSelectOptions = (foodId) => renderFoodOptions(getSimilarFoods(foodId), foodId);
    const renderAllFoodOptions = () => renderFoodOptions(getSortedFoods());
    const getMealInfoPayload = (mealKey, mealData) => encodePayload({
        title: mealLabels[mealKey] || 'Comida',
        description: mealData && mealData.description ? mealData.description : '',
        recipe: mealData && mealData.recipe ? mealData.recipe : ''
    });
    const getMenuPageModel = (menuData) => menuService.getMenuPageModel({
        menuData,
        currentFile,
        foods: foodsCatalog,
        mealKeys,
        formulas,
        targets,
        nutritionScore,
        browserDomain: CoreBrowserDomain,
        weeklyPlan: currentActivityPlan,
        exercisesMap: exercisesCatalog
    });
    const getDayView = (dayData, dailyTargets) => menuService.getDayView({
        dayData,
        dailyTargets,
        foods: foodsCatalog,
        mealKeys,
        formulas,
        nutritionScore
    });
    const renderMealMacroPills = (nutrition) => menuPresenter.renderMealMacroPills(nutrition);
    const renderCompleteNutritionHtml = (nutrients, options = {}) => menuPresenter.renderCompleteNutritionHtml(nutrients, { ...options, helpers: presenterHelpers });
    const generateTotalsHtml = (dayView) => menuPresenter.renderDayTotals(dayView, {
        helpers: presenterHelpers,
        encodePayload,
        getStatusClassFromCode: UI.getStatusClassFromCode
    });
    const getActiveMeal = () => {
        const hour = new Date().getHours();
        if (hour >= 6 && hour < 12) return 'breakfast';
        if (hour >= 12 && hour < 18) return 'lunch';
        return hour >= 18 ? 'dinner' : null;
    };

    const loadMenuData = (fileName) => {
        CoreBrowserAdapter.clearLoadedData({ menu: true });
        return CoreBrowserAdapter.resolveMenuData(fileName)
            .then((menuData) => {
                currentMenuData = Array.isArray(menuData) ? menuData : null;
                renderTableContent();
                return currentMenuData;
            })
            .catch(() => {
                showTableError(`Error cargando ${fileName}`);
                return null;
            });
    };
    const resetMenuData = () => {
        if (!confirm("\u00BFRestablecer el men\u00FA original? Se perder\u00E1n los cambios.")) return;
        MenuStore.clearSavedMenuData(currentFile);
        if (isEditMode) isEditMode = false;
        loadMenuData(currentFile);
    };
    const renderControls = () => UI.renderEditResetControls({
        id: 'menu-controls-container',
        isEditMode,
        onToggle: () => {
            isEditMode = !isEditMode;
            const current = document.getElementById('menu-controls-container');
            if (current) current.replaceWith(renderControls());
            renderTableContent();
        },
        onReset: resetMenuData
    });
    if (container && !document.getElementById('menu-controls-container')) container.after(renderControls());

    const ensureMenuSelector = () => {
        const title = document.querySelector('h1');
        if (!title) return;
        title.classList.add('header-with-controls');
        let wrapper = document.getElementById(MENU_SELECT_ID);
        if (!wrapper) {
            wrapper = document.createElement('span');
            wrapper.id = MENU_SELECT_ID;
            title.appendChild(wrapper);
        }
        wrapper.innerHTML = `<select id="menu-select" class="input-base input-select input-select--header">${AVAILABLE_MENUS.map((option) => (
            `<option value="${option.file}" ${option.file === currentFile ? 'selected' : ''}>${option.label}</option>`
        )).join('')}</select>`;
        const select = document.getElementById('menu-select');
        if (select) {
            select.addEventListener('change', (event) => {
                currentFile = event.target.value;
                MenuStore.setSelectedFile(currentFile);
                loadMenuData(currentFile);
            });
        }
    };

    const renderMealItem = (item, dayIndex, mealKey, itemIndex) => {
        const food = foodsCatalog[item.foodId];
        const unit = food ? food.unit : '';
        return isEditMode
            ? `<li class="meal-item">
                <select class="input-base input-select input-select--sm meal-item__food-select" data-role="food-select" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">
                    ${renderFoodSelectOptions(item.foodId)}
                </select>
                <div class="meal-item__amount">
                    <input type="text" inputmode="decimal" value="${item.amount}" class="input-base input-base--table-edit" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">
                    <span class="meal-item__unit">${unit}</span>
                    <button type="button" class="meal-item__delete" data-role="meal-delete" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}" aria-label="Eliminar alimento">&times;</button>
                </div>
            </li>`
            : `<li class="meal-item">
                <span class="meal-item__name food-info-trigger modal-trigger" data-food-id="${item.foodId}">${food ? food.name : item.foodId}</span>
                <div class="meal-item__amount"><span>${item.amount}</span><span class="meal-item__unit">${unit}</span></div>
            </li>`;
    };
    const renderAddFoodRow = (dayIndex, mealKey, allFoodOptions) => isEditMode ? `
        <li class="meal-item meal-item--add">
            <select class="input-base input-select input-select--sm meal-item__food-select is-placeholder" data-role="meal-add-select" data-day="${dayIndex}" data-meal="${mealKey}">
                <option value="" selected>A\u00F1adir alimento</option>
                ${allFoodOptions}
            </select>
            <div class="meal-item__amount">
                <input type="text" inputmode="decimal" value="" class="input-base input-base--table-edit" data-role="meal-add-amount" data-day="${dayIndex}" data-meal="${mealKey}">
                <span class="meal-item__unit" data-role="meal-add-unit"></span>
                <button type="button" class="meal-item__add" data-role="meal-add" data-day="${dayIndex}" data-meal="${mealKey}" aria-label="A\u00F1adir alimento">+</button>
            </div>
        </li>
    ` : '';
    const renderMealCell = (day, dayIndex, mealKey, allFoodOptions) => {
        const mealData = day[mealKey] || { items: [], description: '' };
        const nutrition = mealKey === 'hydration' ? { kcal: 0, protein: 0, carbs: 0, fat: 0 } : formulas.calculateMeal(mealData.items, foodsCatalog);
        return `
            <td>
                <ul class="meal-list">
                    ${mealData.items.map((item, itemIndex) => renderMealItem(item, dayIndex, mealKey, itemIndex)).join('')}
                    ${renderAddFoodRow(dayIndex, mealKey, allFoodOptions)}
                </ul>
                ${mealKey !== 'hydration' ? `<div class="meal-macros" id="macros-${dayIndex}-${mealKey}">${renderMealMacroPills(nutrition)}</div>` : ''}
                <div class="meal-description meal-description-trigger" role="button" tabindex="0" data-meal-info="${getMealInfoPayload(mealKey, mealData)}">${mealData.description || ''}</div>
            </td>
        `;
    };

    const renderTableContent = () => {
        if (!Array.isArray(currentMenuData) || !currentMenuData.length) {
            showTableError('Error: menuData no disponible.');
            return;
        }

        const pageModel = getMenuPageModel(currentMenuData);
        const currentData = pageModel.menuData;
        const dayViews = pageModel.days;
        const dailyTargets = pageModel.dailyTargets;
        currentMenuData = currentData;

        ensureMenuSelector();
        const todayIndex = UI.getTodayIndex();
        if (table) {
            const thead = table.querySelector('thead');
            if (thead) {
                thead.innerHTML = `<tr><th class="menu-row-header menu-header-empty"></th>${currentData.map((day, index) => (
                    `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${day.day}</th>`
                )).join('')}</tr>`;
            }
        }

        const activeMeal = getActiveMeal();
        const allFoodOptions = isEditMode ? renderAllFoodOptions() : '';
        try {
            tableBody.innerHTML = displayMealKeys.map((mealKey) => `
                <tr>
                    <td class="menu-row-header ${mealKey === activeMeal ? 'text-status--ok' : ''}">${mealLabels[mealKey]}</td>
                    ${currentData.map((day, dayIndex) => renderMealCell(day, dayIndex, mealKey, allFoodOptions)).join('')}
                </tr>
            `).join('') + `
                <tr>
                    <td class="menu-row-header">Totales</td>
                    ${currentData.map((day, dayIndex) => {
                        const dayView = dayViews[dayIndex] || getDayView(day, dailyTargets);
                        return `<td class="day-total" id="day-totals-${dayIndex}">${generateTotalsHtml(dayView)}</td>`;
                    }).join('')}
                </tr>
            `;
            if (table) setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center p-lg">Error cargando los datos: ${error.message}</td></tr>`;
        }
    };

    tableBody.addEventListener('click', (event) => {
        const addTrigger = event.target.closest('[data-role="meal-add"]');
        if (addTrigger) {
            const dayIndex = parseInt(addTrigger.dataset.day, 10);
            const mealKey = addTrigger.dataset.meal;
            const row = addTrigger.closest('.meal-item');
            const select = row && row.querySelector('[data-role="meal-add-select"]');
            const amountInput = row && row.querySelector('[data-role="meal-add-amount"]');
            const foodId = select ? select.value : '';
            if (!foodId || !amountInput || !currentMenuData || !currentMenuData[dayIndex] || !currentMenuData[dayIndex][mealKey]) return;
            const items = currentMenuData[dayIndex][mealKey].items;
            if (!Array.isArray(items)) return;
            const food = foodsCatalog ? foodsCatalog[foodId] : null;
            const parsedAmount = parseFloat(amountInput.value);
            items.push({ foodId, amount: Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : getDefaultAmountForFood(food) });
            persistAndRender();
            return;
        }

        const deleteTrigger = event.target.closest('[data-role="meal-delete"]');
        if (deleteTrigger) {
            const dayIndex = parseInt(deleteTrigger.dataset.day, 10);
            const mealKey = deleteTrigger.dataset.meal;
            const itemIndex = parseInt(deleteTrigger.dataset.item, 10);
            const items = currentMenuData && currentMenuData[dayIndex] && currentMenuData[dayIndex][mealKey] ? currentMenuData[dayIndex][mealKey].items : null;
            if (!Array.isArray(items) || itemIndex < 0 || itemIndex >= items.length) return;
            items.splice(itemIndex, 1);
            persistAndRender();
            return;
        }

        const foodTrigger = event.target.closest('.food-info-trigger');
        if (foodTrigger) {
            const food = foodsCatalog && foodsCatalog[foodTrigger.dataset.foodId];
            if (!food) return;
            const values = food.nutritionPer100 || food.nutritionPerUnit || { kcal: 0, protein: 0, carbs: 0, fat: 0 };
            const scale = food.nutritionPer100 ? 1 : (food.unit === 'ml' ? 100 : 1);
            const sodiumMg = values.sodiumMg || 0;
            const waterMl = food.nutritionPer100
                ? (food.waterMlPer100 || 0) * scale
                : (food.nutritionPerUnit ? (food.waterMlPerUnit || 0) * scale : 0);
            UI.showModal({
                id: 'food-popup',
                titleHtml: `<h3 class="text-primary modal-title">${food.name}</h3>`,
                bodyHtml: `
                    <div class="text-xs text-muted mb-sm">${food.nutritionPer100 ? 'Valores por 100g' : (food.unit === 'ml' ? 'Valores por 100 ml' : 'Valores por Unidad')}</div>
                    <div class="stats-pills stats-pills--center mb-sm"><div class="stat-pill stat-pill--hydration stat-pill--block modal-stat-pill-lg">Agua ${formatMl(waterMl)}</div></div>
                    ${renderCompleteNutritionHtml({
                        kcal: (values.kcal || 0) * scale,
                        protein: (values.protein || 0) * scale,
                        carbs: (values.carbs || 0) * scale,
                        fat: (values.fat || 0) * scale,
                        salt: (sodiumMg * scale * 2.5) / 1000,
                        fiber: (values.fiber || 0) * scale,
                        sugar: (values.sugar || 0) * scale,
                        saturatedFat: (values.saturatedFat || 0) * scale,
                        processing: Number.isFinite(food.processed) ? food.processed : NaN
                    }, { kcalSizeClass: 'modal-stat-pill-lg' })}
                `
            });
            return;
        }

        const mealInfoTrigger = event.target.closest('.meal-description-trigger');
        if (mealInfoTrigger) {
            const payload = decodePayload(mealInfoTrigger.dataset.mealInfo);
            if (!payload) return;
            UI.showModal(menuPresenter.buildMealInfoModal({
                title: payload.title || 'Comida',
                description: payload.description || '',
                recipe: payload.recipe || '',
                escapeHtml
            }));
            return;
        }

        const scoreTrigger = event.target.closest('.nutritional-score-info-trigger');
        if (scoreTrigger) {
            const payload = decodePayload(scoreTrigger.dataset.nutritionalScore);
            if (!payload) return;
            UI.showModal(menuPresenter.buildNutritionScoreModal({
                payload,
                formatNumber,
                getStatusClassFromCode: UI.getStatusClassFromCode,
                nutritionScore,
                escapeHtml
            }));
            return;
        }

        const kcalTrigger = event.target.closest('.kcal-info-trigger');
        if (!kcalTrigger) return;
        const payload = decodePayload(kcalTrigger.dataset.kcalDebug);
        if (!payload) return;
        UI.showModal(menuPresenter.buildKcalDebugModal({ payload, helpers: presenterHelpers }));
    });

    tableBody.addEventListener('input', (event) => {
        const input = event.target;
        if (!input.matches('input[data-day][data-meal][data-item]')) return;
        const dayIndex = parseInt(input.dataset.day, 10);
        const mealKey = input.dataset.meal;
        const itemIndex = parseInt(input.dataset.item, 10);
        const item = currentMenuData && currentMenuData[dayIndex] && currentMenuData[dayIndex][mealKey]
            ? currentMenuData[dayIndex][mealKey].items[itemIndex]
            : null;
        if (!item) return;

        item.amount = parseFloat(input.value) || 0;
        saveMenu();

        const mealNutrition = formulas.calculateMeal(currentMenuData[dayIndex][mealKey].items, foodsCatalog);
        const mealMacroDiv = document.getElementById(`macros-${dayIndex}-${mealKey}`);
        if (mealMacroDiv) mealMacroDiv.innerHTML = renderMealMacroPills(mealNutrition);

        const dayView = getDayView(currentMenuData[dayIndex], UserStore.getDailyNutritionTargets({}));
        const totalsCell = document.getElementById(`day-totals-${dayIndex}`);
        if (totalsCell) totalsCell.innerHTML = generateTotalsHtml(dayView);
    });

    tableBody.addEventListener('change', (event) => {
        const target = event.target;

        if (target.matches('select[data-role="meal-add-select"][data-day][data-meal]')) {
            const row = target.closest('.meal-item');
            const unit = row && row.querySelector('[data-role="meal-add-unit"]');
            const amountInput = row && row.querySelector('[data-role="meal-add-amount"]');
            const food = foodsCatalog ? foodsCatalog[target.value] : null;
            if (unit) unit.textContent = food ? food.unit : '';
            if (amountInput && (!amountInput.value || parseFloat(amountInput.value) <= 0) && food) amountInput.value = getDefaultAmountForFood(food);
            target.classList.toggle('is-placeholder', !target.value);
            return;
        }

        if (!target.matches('select[data-role="food-select"][data-day][data-meal][data-item]')) return;
        const dayIndex = parseInt(target.dataset.day, 10);
        const mealKey = target.dataset.meal;
        const itemIndex = parseInt(target.dataset.item, 10);
        const item = currentMenuData && currentMenuData[dayIndex] && currentMenuData[dayIndex][mealKey]
            ? currentMenuData[dayIndex][mealKey].items[itemIndex]
            : null;
        if (!item || !target.value || item.foodId === target.value) return;

        const prevFood = foodsCatalog ? foodsCatalog[item.foodId] : null;
        const nextFood = foodsCatalog ? foodsCatalog[target.value] : null;
        item.foodId = target.value;
        if (nextFood && ((!prevFood || prevFood.unit !== nextFood.unit) || !Number.isFinite(parseFloat(item.amount)))) {
            item.amount = getDefaultAmountForFood(nextFood);
        }
        persistAndRender();
    });

    UI.bootstrapPage({
        rootId: 'menu-body',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            requiredDeps: [
                { when: () => typeof TargetsApplicationService === 'undefined', path: 'js/core/application/targets.service.js' },
                { when: () => typeof MenuApplicationService === 'undefined', path: 'js/core/application/menu.service.js' },
                { when: () => typeof MenuPresenter === 'undefined', path: 'js/core/presentation/menu.presenter.js' }
            ],
            globals: ['MenuApplicationService', 'MenuPresenter'],
            includeNutritionScore: true,
            foods: true,
            exercises: true,
            activityPlanFile: ActivityStore.getSelectedFile()
        }).then((context) => {
            formulas = context.formulas;
            targets = context.targets;
            nutritionScore = context.nutritionScore;
            menuService = context.MenuApplicationService;
            menuPresenter = context.MenuPresenter;
            foodsCatalog = context.foodsData && context.foodsData.foods ? context.foodsData.foods : null;
            exercisesCatalog = context.exercisesData || null;
            currentActivityPlan = context.activityPlanData || null;
            return true;
        }),
        run: () => loadMenuData(currentFile),
        onError: () => {
            showTableError('Error cr\u00EDtico: No se pudieron cargar las dependencias (foods/formulas).');
        }
    });
}
