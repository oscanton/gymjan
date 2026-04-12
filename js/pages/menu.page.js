function renderMenuPage() {
    const tableBody = document.getElementById('menu-body');
    if (!tableBody) return;

    const menuT = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');
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
    const MENU_SELECT_ID = 'menu-select-wrapper';
    const mealLabels = () => ({
        hydration: menuT('menu.meals.hydration', {}, 'Hidratacion'),
        breakfast: menuT('menu.meals.breakfast', {}, 'Desayuno'),
        lunch: menuT('menu.meals.lunch', {}, 'Comida'),
        dinner: menuT('menu.meals.dinner', {}, 'Cena')
    });
    const presenterHelpers = {
        formatNumber: UI.formatNumber,
        formatKcal: UI.formatKcal,
        formatGrams: UI.formatGrams,
        formatMl: UI.formatMl,
        formatScore: UI.formatScore
    };
    const encodePayload = UI.encodePayload;
    const decodePayload = UI.decodePayload;
    const escapeHtml = UI.escapeHtml;
    const formatNumber = UI.formatNumber;
    const formatMl = UI.formatMl;
    const getWeekDayLabel = (value, fallback = '') => (
        typeof DateUtils !== 'undefined' && typeof DateUtils.getWeekDayLabel === 'function'
            ? DateUtils.getWeekDayLabel(value, fallback)
            : (fallback || String(value || ''))
    );
    const getFoodName = (foodId, fallback = '') => window.ContentI18n?.foodName?.(foodId, fallback || foodId) || fallback || foodId;
    const getAvailableMenus = () => Array.isArray(AVAILABLE_MENUS) ? AVAILABLE_MENUS : [];
    let currentFile = getAvailableMenus().length ? getAvailableMenus()[0].file : null;

    const showTableError = (message, status = 'danger') => {
        tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--${status} text-center">${message}</td></tr>`;
    };
    const getFood = (foodId) => foodsCatalog && foodId ? foodsCatalog[foodId] : null;
    const getSortedFoods = (filter = null) => (
        !foodsCatalog ? [] : Object.entries(foodsCatalog)
            .filter(([, food]) => !filter || filter(food))
            .map(([id, food]) => ({ id, food }))
            .sort((a, b) => getFoodName(a.id, a.food.name || a.id).localeCompare(getFoodName(b.id, b.food.name || b.id), window.I18n?.getLocale?.() || 'es', { sensitivity: 'base' }))
    );
    const getFoodCategoryId = (foodId) => {
        const food = getFood(foodId);
        return food?.categoryId || food?.category || null;
    };
    const getSimilarFoods = (foodId) => {
        const categoryId = getFoodCategoryId(foodId);
        return getSortedFoods((food) => !categoryId || (food.categoryId || food.category) === categoryId);
    };
    const renderFoodOptions = (items, selected = '') => items.map(({ id, food }) => (
        `<option value="${escapeHtml(id)}"${id === selected ? ' selected' : ''}>${escapeHtml(getFoodName(id, food.name || id))}</option>`
    )).join('');
    const renderFoodSelectOptions = (foodId) => renderFoodOptions(getSimilarFoods(foodId), foodId);
    const renderAllFoodOptions = () => renderFoodOptions(getSortedFoods());
    const getMealInfoPayload = (mealKey, mealData) => encodePayload({
        title: mealLabels()[mealKey] || menuT('menu.meals.default_title', {}, 'Comida'),
        description: mealData?.description || '',
        recipe: mealData?.recipe || ''
    });
    const getMenuPageModel = (menuData) => menuService.getMenuPageModel({
        menuData,
        currentFile,
        foods: foodsCatalog,
        mealKeys,
        formulas,
        targets,
        nutritionScore,
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
    const getNormalizedDailyTargets = () => (
        typeof TargetsApplicationService !== 'undefined' && typeof TargetsApplicationService.ensureDailyTargets === 'function'
            ? TargetsApplicationService.ensureDailyTargets({
                targets,
                formulas,
                weeklyPlan: currentActivityPlan,
                exercisesMap: exercisesCatalog,
                needsSecondary: true,
                needsHydration: true,
                persist: false
            })
            : (window.PersistenceAdapter?.getDailyNutritionTargets({}) || {})
    );
    const applyMenuMutation = (method, payload = {}, { rerender = true } = {}) => {
        currentMenuData = menuService[method]({ currentFile, menuData: currentMenuData, persist: true, ...payload });
        if (rerender) renderTableContent();
        return currentMenuData;
    };
    const refreshDayView = (dayIndex, mealKey = null) => {
        const dayData = currentMenuData && currentMenuData[dayIndex];
        if (!dayData) return;
        if (mealKey) {
            const mealNutrition = menuService.getMealNutrition({ mealKey, mealData: dayData[mealKey], foods: foodsCatalog, formulas });
            const mealMacroDiv = document.getElementById(`macros-${dayIndex}-${mealKey}`);
            if (mealMacroDiv) mealMacroDiv.innerHTML = renderMealMacroPills(mealNutrition);
        }
        const totalsCell = document.getElementById(`day-totals-${dayIndex}`);
        if (totalsCell) totalsCell.innerHTML = generateTotalsHtml(getDayView(dayData, getNormalizedDailyTargets()));
    };
    const getFoodModalModel = (foodId, food) => {
        const values = food?.nutritionPer100 || food?.nutritionPerUnit || { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        const scale = food?.nutritionPer100 ? 1 : (food?.unit === 'ml' ? 100 : 1);
        const sodiumMg = values.sodiumMg || 0;
        const waterMl = food?.nutritionPer100
            ? (food.waterMlPer100 || 0) * scale
            : (food?.nutritionPerUnit ? (food.waterMlPerUnit || 0) * scale : 0);
        return {
            title: getFoodName(foodId, food?.name || foodId || ''),
            unitLabel: food?.nutritionPer100
                ? menuT('menu.states.values_per_100g', {}, 'Valores por 100 g')
                : (food?.unit === 'ml'
                    ? menuT('menu.states.values_per_100ml', {}, 'Valores por 100 ml')
                    : menuT('menu.states.values_per_unit', {}, 'Valores por unidad')),
            waterMl,
            nutrients: {
                kcal: (values.kcal || 0) * scale,
                protein: (values.protein || 0) * scale,
                carbs: (values.carbs || 0) * scale,
                fat: (values.fat || 0) * scale,
                salt: (sodiumMg * scale * 2.5) / 1000,
                fiber: (values.fiber || 0) * scale,
                sugar: (values.sugar || 0) * scale,
                saturatedFat: (values.saturatedFat || 0) * scale,
                processing: Number.isFinite(food?.processed) ? food.processed : NaN
            }
        };
    };
    const showFoodModal = (foodId, food) => {
        const model = getFoodModalModel(foodId, food);
        UI.showModal({
            id: 'food-popup',
            titleHtml: `<h3 class="text-primary modal-title">${model.title}</h3>`,
            bodyHtml: `
                <div class="text-xs text-muted mb-sm">${model.unitLabel}</div>
                <div class="stats-pills stats-pills--center mb-sm"><div class="stat-pill stat-pill--hydration stat-pill--block modal-stat-pill-lg">${menuT('menu.nutrition.water', {}, 'Agua')} ${formatMl(model.waterMl)}</div></div>
                ${renderCompleteNutritionHtml(model.nutrients, { kcalSizeClass: 'modal-stat-pill-lg' })}
            `
        });
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
                showTableError(menuT('menu.states.load_failed', { file: fileName }, `Error cargando ${fileName}`));
                return null;
            });
    };
    const resetMenuData = () => {
        if (!confirm(menuT('menu.states.reset_confirm', {}, 'Restablecer el menu original? Se perderan los cambios.'))) return;
        menuService.clearSavedMenuData({ currentFile });
        if (isEditMode) isEditMode = false;
        loadMenuData(currentFile);
    };
    const renderControls = () => UI.renderEditResetControls({
        id: 'menu-controls-container',
        isEditMode,
        onToggle: () => {
            isEditMode = !isEditMode;
            document.getElementById('menu-controls-container')?.replaceWith(renderControls());
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
        wrapper.innerHTML = `<select id="menu-select" class="input-base input-select input-select--header">${getAvailableMenus().map((option) => (
            `<option value="${option.file}" ${option.file === currentFile ? 'selected' : ''}>${escapeHtml(menuT(`menu.plans.${option.label}`, {}, option.label))}</option>`
        )).join('')}</select>`;
        document.getElementById('menu-select')?.addEventListener('change', (event) => {
            currentFile = menuService.setSelectedMenuFile({ file: event.target.value, availableMenus: getAvailableMenus() });
            loadMenuData(currentFile);
        });
    };

    const renderMealItem = (item, dayIndex, mealKey, itemIndex) => {
        const food = getFood(item.foodId);
        const unit = food ? food.unit : '';
        return isEditMode
            ? `<li class="meal-item">
                <select class="input-base input-select input-select--sm meal-item__food-select" data-role="food-select" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">
                    ${renderFoodSelectOptions(item.foodId)}
                </select>
                <div class="meal-item__amount">
                    <input type="text" inputmode="decimal" value="${item.amount}" class="input-base input-base--table-edit" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">
                    <span class="meal-item__unit">${unit}</span>
                    <button type="button" class="meal-item__delete" data-role="meal-delete" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}" aria-label="${escapeHtml(menuT('menu.actions.remove_food', {}, 'Eliminar alimento'))}">&times;</button>
                </div>
            </li>`
            : `<li class="meal-item">
                <span class="meal-item__name food-info-trigger modal-trigger" data-food-id="${item.foodId}">${getFoodName(item.foodId, food ? food.name : item.foodId)}</span>
                <div class="meal-item__amount"><span>${item.amount}</span><span class="meal-item__unit">${unit}</span></div>
            </li>`;
    };
    const renderAddFoodRow = (dayIndex, mealKey, allFoodOptions) => isEditMode ? `
        <li class="meal-item meal-item--add">
            <select class="input-base input-select input-select--sm meal-item__food-select is-placeholder" data-role="meal-add-select" data-day="${dayIndex}" data-meal="${mealKey}">
                <option value="" selected>${menuT('menu.placeholders.add_food', {}, 'Añadir alimento')}</option>
                ${allFoodOptions}
            </select>
            <div class="meal-item__amount">
                <input type="text" inputmode="decimal" value="" class="input-base input-base--table-edit" data-role="meal-add-amount" data-day="${dayIndex}" data-meal="${mealKey}">
                <span class="meal-item__unit" data-role="meal-add-unit"></span>
                <button type="button" class="meal-item__add" data-role="meal-add" data-day="${dayIndex}" data-meal="${mealKey}" aria-label="${escapeHtml(menuT('menu.actions.add_food', {}, 'Añadir alimento'))}">+</button>
            </div>
        </li>
    ` : '';
    const renderMealCell = (day, dayIndex, mealKey, allFoodOptions) => {
        const mealData = day[mealKey] || { items: [], description: '' };
        const nutrition = menuService.getMealNutrition({ mealKey, mealData, foods: foodsCatalog, formulas });
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
            showTableError(menuT('menu.states.missing_menu_data', {}, 'Error: menuData no disponible.'));
            return;
        }

        const pageModel = getMenuPageModel(currentMenuData);
        const currentData = pageModel.menuData;
        const dayViews = pageModel.days;
        const dailyTargets = pageModel.dailyTargets;
        currentMenuData = currentData;

        ensureMenuSelector();
        const todayIndex = UI.getTodayIndex();
        if (table?.querySelector('thead')) {
            table.querySelector('thead').innerHTML = `<tr><th class="menu-row-header menu-header-empty"></th>${currentData.map((day, index) => (
                `<th class="${index === todayIndex ? 'text-status--ok' : ''}">${getWeekDayLabel(day.day, day.day || '')}</th>`
            )).join('')}</tr>`;
        }

        const activeMeal = getActiveMeal();
        const currentMealLabels = mealLabels();
        const allFoodOptions = isEditMode ? renderAllFoodOptions() : '';
        try {
            tableBody.innerHTML = displayMealKeys.map((mealKey) => `
                <tr>
                    <td class="menu-row-header ${mealKey === activeMeal ? 'text-status--ok' : ''}">${currentMealLabels[mealKey]}</td>
                    ${currentData.map((day, dayIndex) => renderMealCell(day, dayIndex, mealKey, allFoodOptions)).join('')}
                </tr>
            `).join('') + `
                <tr>
                    <td class="menu-row-header">${menuT('menu.meals.totals', {}, 'Totales')}</td>
                    ${currentData.map((day, dayIndex) => `<td class="day-total" id="day-totals-${dayIndex}">${generateTotalsHtml(dayViews[dayIndex] || getDayView(day, dailyTargets))}</td>`).join('')}
                </tr>
            `;
            if (table) setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);
        } catch (error) {
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center p-lg">${menuT('menu.states.data_load_error', { message: error.message }, `Error cargando los datos: ${error.message}`)}</td></tr>`;
        }
    };

    tableBody.addEventListener('click', (event) => {
        const addTrigger = event.target.closest('[data-role="meal-add"]');
        if (addTrigger) {
            const row = addTrigger.closest('.meal-item');
            const select = row?.querySelector('[data-role="meal-add-select"]');
            const amountInput = row?.querySelector('[data-role="meal-add-amount"]');
            if (!select?.value || !amountInput) return;
            applyMenuMutation('addMealItem', {
                dayIndex: parseInt(addTrigger.dataset.day, 10),
                mealKey: addTrigger.dataset.meal,
                foodId: select.value,
                amount: amountInput.value,
                foods: foodsCatalog
            });
            return;
        }

        const deleteTrigger = event.target.closest('[data-role="meal-delete"]');
        if (deleteTrigger) {
            applyMenuMutation('removeMealItem', {
                dayIndex: parseInt(deleteTrigger.dataset.day, 10),
                mealKey: deleteTrigger.dataset.meal,
                itemIndex: parseInt(deleteTrigger.dataset.item, 10)
            });
            return;
        }

        const foodTrigger = event.target.closest('.food-info-trigger');
        if (foodTrigger) {
            const food = getFood(foodTrigger.dataset.foodId);
            if (food) showFoodModal(foodTrigger.dataset.foodId, food);
            return;
        }

        const mealInfoTrigger = event.target.closest('.meal-description-trigger');
        if (mealInfoTrigger) {
            const payload = decodePayload(mealInfoTrigger.dataset.mealInfo);
            if (!payload) return;
            UI.showModal(menuPresenter.buildMealInfoModal({
                title: payload.title || menuT('menu.meals.default_title', {}, 'Comida'),
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
        if (payload) UI.showModal(menuPresenter.buildKcalDebugModal({ payload, helpers: presenterHelpers }));
    });

    tableBody.addEventListener('input', (event) => {
        const input = event.target;
        if (!input.matches('input[data-day][data-meal][data-item]')) return;
        const dayIndex = parseInt(input.dataset.day, 10);
        const mealKey = input.dataset.meal;
        applyMenuMutation('updateMealItemAmount', {
            dayIndex,
            mealKey,
            itemIndex: parseInt(input.dataset.item, 10),
            amount: input.value
        }, { rerender: false });
        refreshDayView(dayIndex, mealKey);
    });

    tableBody.addEventListener('change', (event) => {
        const target = event.target;
        if (target.matches('select[data-role="meal-add-select"][data-day][data-meal]')) {
            const row = target.closest('.meal-item');
            const unit = row?.querySelector('[data-role="meal-add-unit"]');
            const amountInput = row?.querySelector('[data-role="meal-add-amount"]');
            const food = getFood(target.value);
            if (unit) unit.textContent = food ? food.unit : '';
            if (amountInput && (!amountInput.value || parseFloat(amountInput.value) <= 0) && food) amountInput.value = menuService.getDefaultAmountForFood(food);
            target.classList.toggle('is-placeholder', !target.value);
            return;
        }

        if (!target.matches('select[data-role="food-select"][data-day][data-meal][data-item]')) return;
        applyMenuMutation('replaceMealItemFood', {
            dayIndex: parseInt(target.dataset.day, 10),
            mealKey: target.dataset.meal,
            itemIndex: parseInt(target.dataset.item, 10),
            foodId: target.value,
            foods: foodsCatalog
        });
    });

    UI.bootstrapPage({
        rootId: 'menu-body',
        requiredDeps: [{ global: 'CoreBrowserAdapter', path: 'js/core/adapters/browser.adapter.js' }],
        afterRequired: () => CoreBrowserAdapter.resolvePageContext({
            requiredDeps: [
                { when: () => typeof TargetsApplicationService === 'undefined', path: 'js/core/application/targets.service.js' },
                { when: () => typeof ActivityApplicationService === 'undefined', path: 'js/core/application/activity.service.js' },
                { when: () => typeof AssessmentApplicationService === 'undefined', path: 'js/core/application/assessment.service.js' },
                { when: () => typeof MenuApplicationService === 'undefined', path: 'js/core/application/menu.service.js' },
                { when: () => typeof MenuPresenter === 'undefined', path: 'js/core/presentation/menu.presenter.js' }
            ],
            globals: ['MenuApplicationService', 'MenuPresenter'],
            includeNutritionScore: true,
            foods: true,
            exercises: true,
            selectedActivityPlanData: true
        }).then((context) => {
            formulas = context.formulas;
            targets = context.targets;
            nutritionScore = context.nutritionScore;
            menuService = context.MenuApplicationService;
            menuPresenter = context.MenuPresenter;
            currentFile = menuService.getSelectedMenuFile({ availableMenus: getAvailableMenus(), selectedFile: currentFile });
            foodsCatalog = context.foodsData?.foods || null;
            exercisesCatalog = context.exercisesData || null;
            currentActivityPlan = context.activityPlanData || null;
            return true;
        }),
        run: () => {
            currentFile = menuService.getSelectedMenuFile({ availableMenus: getAvailableMenus(), selectedFile: currentFile });
            return loadMenuData(currentFile);
        },
        onError: () => {
            showTableError(menuT('menu.states.dependencies_critical', {}, 'Error critico: No se pudieron cargar las dependencias (foods/formulas).'));
        }
    });
}
