/* =========================================
   pages/menu.page.js - MENÚ SEMANAL
   ========================================= */

function renderMenuPage() {
    const tableBody = document.getElementById("menu-body");
    if (!tableBody) return;

    let formulas = null;
    let targets = null;
    let nutritionScore = null;

    let isEditMode = false;
    const errorColspan = (typeof DAYS_COUNT !== 'undefined' && Number.isFinite(DAYS_COUNT))
        ? (DAYS_COUNT + 1)
        : 3;

    let container = document.getElementById('menu-container');
    if (!container) {
        const table = tableBody.closest('table');
        if (table) container = table.parentElement;
    }

    let currentFile = MenuStore.getSelectedFile();
    if (!AVAILABLE_MENUS.some(menuOption => menuOption.file === currentFile)) {
        currentFile = AVAILABLE_MENUS[0].file;
        MenuStore.setSelectedFile(currentFile);
    }

    const loadMenuData = (fileName) => {
        window.MENU_DATA = undefined;

        CoreBrowserAdapter.loadMenuFile(fileName)
            .then(() => {
                const savedData = MenuStore.getSavedMenuData(fileName);
                if (savedData) window.MENU_DATA = savedData;
                setTimeout(renderTableContent, 50);
            })
            .catch(() => {
                tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error cargando ${fileName}</td></tr>`;
            });
    };

    const resetMenuData = () => {
        if (!confirm("¿Restablecer el menú original? Se perderán los cambios.")) return;
        MenuStore.clearSavedMenuData(currentFile);
        if (isEditMode) isEditMode = false;
        loadMenuData(currentFile);
    };

    const renderControls = () => UI.renderEditResetControls({
        id: 'menu-controls-container',
        isEditMode,
        onToggle: () => {
            isEditMode = !isEditMode;
            const fresh = renderControls();
            const current = document.getElementById('menu-controls-container');
            if (current) current.replaceWith(fresh);
            renderTableContent();
        },
        onReset: resetMenuData
    });

    if (container && !document.getElementById('menu-controls-container')) {
        const controls = renderControls();
        container.after(controls);
    }

    const mealKeys = (typeof MEAL_KEYS !== 'undefined' && Array.isArray(MEAL_KEYS) && MEAL_KEYS.length)
        ? MEAL_KEYS
        : ['breakfast', 'lunch', 'dinner'];
    const SECONDARY_TARGET_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];
    const DEFAULT_GRAMS_AMOUNT = 100;
    const DEFAULT_UNIT_AMOUNT = 1;
    const NUTRITION_METRIC_LABELS = {
        kcal: 'Kcal',
        protein: 'Proteína',
        carbs: 'Carbohidratos',
        fat: 'Grasas',
        fiber: 'Fibra',
        sugar: 'Azúcar',
        saturatedFat: 'Grasa sat.',
        salt: 'Sal',
        processing: 'Procesamiento'
    };

    const formatNumber = UI.formatNumber;
    const encodePayload = UI.encodePayload;
    const decodePayload = UI.decodePayload;
    const escapeHtml = UI.escapeHtml;
    const getDefaultAmountForFood = (food) => {
        if (!food) return 0;
        return food.nutritionPerUnit ? DEFAULT_UNIT_AMOUNT : DEFAULT_GRAMS_AMOUNT;
    };
    const getAllFoods = () => {
        if (typeof FOODS === 'undefined') return [];
        return Object.entries(FOODS).map(([id, food]) => ({ id, food }))
            .sort((a, b) => (a.food.name || a.id).localeCompare((b.food.name || b.id), 'es', { sensitivity: 'base' }));
    };
    const getSimilarFoods = (foodId) => {
        if (typeof FOODS === 'undefined') return [];

        const currentFood = FOODS[foodId];
        const currentCategory = currentFood ? currentFood.category : null;
        const allFoods = Object.entries(FOODS).map(([id, food]) => ({ id, food }));

        const filtered = currentCategory
            ? allFoods.filter(({ food }) => food && food.category === currentCategory)
            : allFoods;

        return filtered.sort((a, b) => (a.food.name || a.id).localeCompare((b.food.name || b.id), 'es', { sensitivity: 'base' }));
    };
    const renderFoodSelectOptions = (currentFoodId) => {
        const similarFoods = getSimilarFoods(currentFoodId);
        if (similarFoods.length === 0) return '';
        return similarFoods.map(({ id, food }) => {
            const selected = id === currentFoodId ? 'selected' : '';
            return `<option value="${escapeHtml(id)}" ${selected}>${escapeHtml(food.name || id)}</option>`;
        }).join('');
    };
    const renderAllFoodOptions = () => {
        const allFoods = getAllFoods();
        if (allFoods.length === 0) return '';
        return allFoods.map(({ id, food }) => (
            `<option value="${escapeHtml(id)}">${escapeHtml(food.name || id)}</option>`
        )).join('');
    };
    const renderMealMacroPills = (nut) => `
        <div class="stat-pill stat-pill--kcal stat-pill--xs">🔥 ${Math.round(nut.kcal)} kcal</div>
        <div class="stat-pill stat-pill--xs">🥩 ${Math.round(nut.protein)}g</div>
        <div class="stat-pill stat-pill--xs">🍞 ${Math.round(nut.carbs)}g</div>
        <div class="stat-pill stat-pill--xs">🥑 ${Math.round(nut.fat)}g</div>
    `;

    const mealLabels = { breakfast: 'Desayuno', lunch: 'Comida', dinner: 'Cena' };
    const computeDailyTargets = (weeklyPlan, profile, adjustments, exercisesMap) => (
        CoreBrowserDomain.computeDailyTargets(targets, formulas, weeklyPlan, profile, adjustments, exercisesMap)
    );

    const calculateDayTotals = (dayData) => formulas.calculateDayTotals(dayData, FOODS, mealKeys);
    const renderNutritionScorePill = (dayTotals, target) => {
        if (!nutritionScore) return '';
        const result = nutritionScore.calculate({
            kcal: dayTotals.kcal,
            protein: dayTotals.protein,
            carbs: dayTotals.carbs,
            fat: dayTotals.fat,
            fiber: dayTotals.fiber,
            sugar: dayTotals.sugar,
            saturatedFat: dayTotals.saturatedFat,
            salt: dayTotals.salt,
            processing: dayTotals.processingAvg
        }, target || {});
        const statusClass = nutritionScore.getStatusClass(result.score);
        const scoreText = Number.isFinite(result.score) ? formatNumber(result.score, 1) : '-';
        const debugPayload = encodePayload({
            score: result.score,
            penalties: result.penalties,
            deviationsPct: result.deviationsPct
        });
        return `
            <button type="button" class="stat-pill stat-pill--nutritional-score stat-pill--block pill-trigger nutritional-score-info-trigger" data-nutritional-score="${debugPayload}">
                Score nutricional: <span class="${statusClass}">${scoreText}</span>
            </button>
        `;
    };

    const renderPrimaryNutrientsHtml = ({ kcal, protein, carbs, fat }, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm',
        kcalDebugPayload = ''
    } = {}) => {
        const targetKcal = targets ? targets.kcal : null;
        const targetProtein = targets ? targets.protein : null;
        const targetCarbs = targets ? targets.carbs : null;
        const targetFat = targets ? targets.fat : null;

        const kcalPillHtml = kcalDebugPayload
            ? `
                <button type="button" class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block pill-trigger kcal-info-trigger" data-kcal-debug="${kcalDebugPayload}">🔥 <span class="${statusClasses.kcal || ''}">${Math.round(kcal)} kcal</span>
                    ${Number.isFinite(targetKcal) ? `<span class="text-muted">/ ${targetKcal} kcal</span>` : ''}
                </button>
            `
            : `
                <div class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block">🔥 <span class="${statusClasses.kcal || ''}">${Math.round(kcal)} kcal</span>
                    ${Number.isFinite(targetKcal) ? `<span class="text-muted">/ ${targetKcal} kcal</span>` : ''}
                </div>
            `;

        return `
            ${kcalPillHtml}
            <div class="nutrition-row">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🥩 Prot</div>
                    <div><span class="${statusClasses.protein || ''}">${Math.round(protein)}g</span>${Number.isFinite(targetProtein) ? ` <span class="text-muted">/ ${targetProtein}g</span>` : ''}</div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🍞 Carbohidratos</div>
                    <div><span class="${statusClasses.carbs || ''}">${Math.round(carbs)}g</span>${Number.isFinite(targetCarbs) ? ` <span class="text-muted">/ ${targetCarbs}g</span>` : ''}</div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🥑 Grasas</div>
                    <div><span class="${statusClasses.fat || ''}">${Math.round(fat)}g</span>${Number.isFinite(targetFat) ? ` <span class="text-muted">/ ${targetFat}g</span>` : ''}</div>
                </div>
            </div>
        `;
    };

    const renderSecondaryNutrientsHtml = ({
        salt, fiber, sugar, saturatedFat, processing, containerClass = '', targets = null, statusClasses = {},
        decimals = {}
    }) => {
        const saltDecimals = Number.isFinite(decimals.salt) ? decimals.salt : 2;
        const fiberDecimals = Number.isFinite(decimals.fiber) ? decimals.fiber : 1;
        const sugarDecimals = Number.isFinite(decimals.sugar) ? decimals.sugar : 1;
        const saturatedFatDecimals = Number.isFinite(decimals.saturatedFat) ? decimals.saturatedFat : 1;
        const processingDecimals = Number.isFinite(decimals.processing) ? decimals.processing : 1;
        const classSuffix = containerClass ? ` ${containerClass}` : '';
        const processingValue = Number.isFinite(processing) ? `${formatNumber(processing, processingDecimals)}/10` : '-';
        const targetSalt = targets ? targets.salt : null;
        const targetFiber = targets ? targets.fiber : null;
        const targetSugar = targets ? targets.sugar : null;
        const targetSaturatedFat = targets ? targets.saturatedFat : null;
        const targetProcessing = targets ? targets.processing : null;

        return `
            <div class="modal-grid-3 modal-grid-3--compact${classSuffix}">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🧂 Sal</div>
                    <div>
                        <span class="${statusClasses.salt || ''}">${formatNumber(salt, saltDecimals)}g</span>
                        ${Number.isFinite(targetSalt) ? ` <span class="text-muted">/ ${formatNumber(targetSalt, saltDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🍬 Azúcar</div>
                    <div>
                        <span class="${statusClasses.sugar || ''}">${formatNumber(sugar, sugarDecimals)}g</span>
                        ${Number.isFinite(targetSugar) ? ` <span class="text-muted">/ ${formatNumber(targetSugar, sugarDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🧈 Grasa sat.</div>
                    <div>
                        <span class="${statusClasses.saturatedFat || ''}">${formatNumber(saturatedFat, saturatedFatDecimals)}g</span>
                        ${Number.isFinite(targetSaturatedFat) ? ` <span class="text-muted">/ ${formatNumber(targetSaturatedFat, saturatedFatDecimals)}g</span>` : ''}
                    </div>
                </div>
            </div>

            <div class="modal-grid-2 modal-grid-2--compact${classSuffix}">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🌾 Fibra</div>
                    <div>
                        <span class="${statusClasses.fiber || ''}">${formatNumber(fiber, fiberDecimals)}g</span>
                        ${Number.isFinite(targetFiber) ? ` <span class="text-muted">/ ${formatNumber(targetFiber, fiberDecimals)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🏭 Procesamiento</div>
                    <div>
                        <span class="${statusClasses.processing || ''}">${processingValue}</span>
                        ${Number.isFinite(targetProcessing) ? ` <span class="text-muted">/ ${formatNumber(targetProcessing, processingDecimals)}/10</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const renderCompleteNutritionHtml = (nutrients, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm',
        secondaryContainerClass = '',
        secondaryDecimals = {},
        kcalDebugPayload = ''
    } = {}) => `
        <div class="nutrition-stack">
            ${renderPrimaryNutrientsHtml(nutrients, { targets, statusClasses, kcalSizeClass, kcalDebugPayload })}
            ${renderSecondaryNutrientsHtml({
                salt: nutrients.salt,
                fiber: nutrients.fiber,
                sugar: nutrients.sugar,
                saturatedFat: nutrients.saturatedFat,
                processing: nutrients.processing,
                containerClass: secondaryContainerClass,
                targets,
                statusClasses,
                decimals: secondaryDecimals
            })}
        </div>
    `;

    const generateTotalsHtml = (dayTotals, target) => {
        const safeTarget = target || {};
        const tKcal = safeTarget.kcal || 0;
        const tProt = safeTarget.protein || 0;
        const tCarb = safeTarget.carbs || 0;
        const tFat  = safeTarget.fat || 0;

        const classKcal = UI.getStatusClass(dayTotals.kcal, tKcal);
        const classProt = UI.getStatusClass(dayTotals.protein, tProt);
        const classCarb = UI.getStatusClass(dayTotals.carbs, tCarb);
        const classFat  = UI.getStatusClass(dayTotals.fat, tFat);
        const classSalt = UI.getStatusClassByRule(dayTotals.salt, safeTarget.salt, { rule: 'max', tolerancePct: 10 });
        const classFiber = UI.getStatusClassByRule(dayTotals.fiber, safeTarget.fiber, { rule: 'min', tolerancePct: 10 });
        const classSugar = UI.getStatusClassByRule(dayTotals.sugar, safeTarget.sugar, { rule: 'max', tolerancePct: 10 });
        const classSaturatedFat = UI.getStatusClassByRule(dayTotals.saturatedFat, safeTarget.saturatedFat, { rule: 'max', tolerancePct: 10 });
        const classProcessing = UI.getStatusClassByRule(dayTotals.processingAvg, safeTarget.processing, { rule: 'max', tolerancePct: 10 });

        const targets = {
            kcal: tKcal,
            protein: tProt,
            carbs: tCarb,
            fat: tFat,
            salt: safeTarget.salt ?? null,
            fiber: safeTarget.fiber ?? null,
            sugar: safeTarget.sugar ?? null,
            saturatedFat: safeTarget.saturatedFat ?? null,
            processing: safeTarget.processing ?? null
        };
        const kcalFromMacros = (parseFloat(dayTotals.protein) * 4)
            + (parseFloat(dayTotals.carbs) * 4)
            + (parseFloat(dayTotals.fat) * 9);
        const kcalDebugPayload = encodePayload({
            actuals: {
                kcal: dayTotals.kcal,
                protein: dayTotals.protein,
                carbs: dayTotals.carbs,
                fat: dayTotals.fat,
                fiber: dayTotals.fiber,
                sugar: dayTotals.sugar,
                saturatedFat: dayTotals.saturatedFat,
                salt: dayTotals.salt,
                processing: dayTotals.processingAvg
            },
            targets,
            kcalFromMacros
        });

        const totalsHtml = renderCompleteNutritionHtml({
            kcal: dayTotals.kcal,
            protein: dayTotals.protein,
            carbs: dayTotals.carbs,
            fat: dayTotals.fat,
            salt: dayTotals.salt,
            fiber: dayTotals.fiber,
            sugar: dayTotals.sugar,
            saturatedFat: dayTotals.saturatedFat,
            processing: dayTotals.processingAvg
        }, {
            targets,
            statusClasses: {
                kcal: classKcal,
                protein: classProt,
                carbs: classCarb,
                fat: classFat,
                salt: classSalt,
                fiber: classFiber,
                sugar: classSugar,
                saturatedFat: classSaturatedFat,
                processing: classProcessing
            },
            kcalSizeClass: 'stat-pill--sm',
            secondaryContainerClass: 'totals-secondary-grid',
            secondaryDecimals: {
                salt: 2,
                fiber: 0,
                sugar: 0,
                saturatedFat: 0,
                processing: 1
            },
            kcalDebugPayload
        });
        return `${totalsHtml}${renderNutritionScorePill(dayTotals, target)}`;
    };

    const ensureDailyTargets = () => (
        CoreBrowserDomain.ensureDailyTargets(targets, formulas, { needsSecondary: true })
    );

    const renderTableContent = () => {
        if (typeof window.MENU_DATA === 'undefined') {
            console.error("Error: MENU_DATA no está definido.");
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger">Error: MENU_DATA no disponible.</td></tr>`;
            return;
        }
        const storedTargets = ensureDailyTargets();

        const currentData = window.MENU_DATA;

        const todayIndex = UI.getTodayIndex();

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

                const options = AVAILABLE_MENUS.map(menuOption =>
                    `<option value="${menuOption.file}" ${menuOption.file === currentFile ? 'selected' : ''}>${menuOption.label}</option>`
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
                headerHtml += `<th class="${activeClass}">${day.day}</th>`;
            });
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;
        }

        tableBody.innerHTML = "";
        const currentHour = new Date().getHours();
        let activeMeal = null;
        if (currentHour >= 6 && currentHour < 12) activeMeal = 'breakfast';
        else if (currentHour >= 12 && currentHour < 18) activeMeal = 'lunch';
        else if (currentHour >= 18) activeMeal = 'dinner';

        try {
            mealKeys.forEach(mealKey => {
                const row = document.createElement("tr");
                const isActive = mealKey === activeMeal;
                const activeClass = isActive ? 'text-status--ok' : '';
                let html = `<td class="menu-row-header ${activeClass}">${mealLabels[mealKey]}</td>`;

                currentData.forEach((day, dayIndex) => {
                    const mealData = day[mealKey];
                    const nut = formulas.calculateMeal(mealData.items, FOODS);

                    html += `
                        <td>
                            <ul class="meal-list">
                                ${mealData.items.map((item, itemIndex) => {
                                    const food = FOODS[item.foodId];
                                    const similarOptions = renderFoodSelectOptions(item.foodId);
                                    let amountHtml;
                                    let nameHtml;
                                    let deleteHtml = '';
                                    if (isEditMode) {
                                        nameHtml = `
                                            <select class="input-base input-select input-select--sm meal-item__food-select"
                                                data-role="food-select" data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">
                                                ${similarOptions}
                                            </select>
                                        `;
                                        amountHtml = `<input type="text" inputmode="decimal" value="${item.amount}" 
                                            class="input-base input-base--table-edit" 
                                            data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">`;
                                        deleteHtml = `
                                            <button type="button" class="meal-item__delete" data-role="meal-delete"
                                                data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}" aria-label="Eliminar alimento">🗑️</button>
                                        `;
                                    } else {
                                        nameHtml = `<span class="meal-item__name food-info-trigger modal-trigger" data-food-id="${item.foodId}">${food ? food.name : item.foodId}</span>`;
                                        amountHtml = `<span>${item.amount}</span>`;
                                    }
                                    return `<li class="meal-item">
                                        ${nameHtml}
                                        <div class="meal-item__amount">
                                            ${amountHtml}
                                            <span class="meal-item__unit">${food ? food.unit : ''}</span>
                                            ${deleteHtml}
                                        </div>
                                    </li>`;
                                }).join('')}
                                ${isEditMode ? `
                                    <li class="meal-item meal-item--add">
                                        <select class="input-base input-select input-select--sm meal-item__food-select is-placeholder"
                                            data-role="meal-add-select" data-day="${dayIndex}" data-meal="${mealKey}">
                                            <option value="" selected>Añadir alimento</option>
                                            ${renderAllFoodOptions()}
                                        </select>
                                        <div class="meal-item__amount">
                                            <input type="text" inputmode="decimal" value=""
                                                class="input-base input-base--table-edit"
                                                data-role="meal-add-amount" data-day="${dayIndex}" data-meal="${mealKey}">
                                            <span class="meal-item__unit" data-role="meal-add-unit"></span>
                                            <button type="button" class="meal-item__add" data-role="meal-add"
                                                data-day="${dayIndex}" data-meal="${mealKey}" aria-label="Añadir alimento">➕</button>
                                        </div>
                                    </li>
                                ` : ''}
                            </ul>
                            <div class="meal-macros" id="macros-${dayIndex}-${mealKey}">
                                ${renderMealMacroPills(nut)}
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
                const dayTotals = calculateDayTotals(day);

                const target = storedTargets[day.day];
                totalsHtml += `
                    <td class="day-total" id="day-totals-${dayIndex}">
                        ${generateTotalsHtml(dayTotals, target)}
                    </td>`;
            });
            totalsRow.innerHTML = totalsHtml;
            tableBody.appendChild(totalsRow);

            setTimeout(() => UI.scrollToTodayColumn(table, todayIndex), 100);

        } catch (error) {
            console.error("Error renderizando el menú:", error);
            tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center p-lg">Error cargando los datos: ${error.message}</td></tr>`;
        }
    };

    tableBody.addEventListener('click', (e) => {
        const addTrigger = e.target.closest('[data-role="meal-add"]');
        if (addTrigger) {
            const dayIndex = parseInt(addTrigger.dataset.day, 10);
            const mealKey = addTrigger.dataset.meal;
            const row = addTrigger.closest('.meal-item');
            const select = row ? row.querySelector('[data-role="meal-add-select"]') : null;
            const amountInput = row ? row.querySelector('[data-role="meal-add-amount"]') : null;
            if (!select || !amountInput) return;
            const foodId = select.value;
            if (!foodId) return;
            if (!window.MENU_DATA || !window.MENU_DATA[dayIndex] || !window.MENU_DATA[dayIndex][mealKey]) return;
            const items = window.MENU_DATA[dayIndex][mealKey].items;
            if (!Array.isArray(items)) return;
            const food = (typeof FOODS !== 'undefined') ? FOODS[foodId] : null;
            const defaultAmount = getDefaultAmountForFood(food);
            const parsedAmount = parseFloat(amountInput.value);
            const amount = Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : defaultAmount;
            items.push({ foodId, amount });
            MenuStore.saveMenuData(currentFile, window.MENU_DATA);
            renderTableContent();
            return;
        }

        const deleteTrigger = e.target.closest('[data-role="meal-delete"]');
        if (deleteTrigger) {
            const dayIndex = parseInt(deleteTrigger.dataset.day, 10);
            const mealKey = deleteTrigger.dataset.meal;
            const itemIndex = parseInt(deleteTrigger.dataset.item, 10);
            if (!window.MENU_DATA || !window.MENU_DATA[dayIndex] || !window.MENU_DATA[dayIndex][mealKey]) return;
            const items = window.MENU_DATA[dayIndex][mealKey].items;
            if (!Array.isArray(items) || itemIndex < 0 || itemIndex >= items.length) return;
            items.splice(itemIndex, 1);
            MenuStore.saveMenuData(currentFile, window.MENU_DATA);
            renderTableContent();
            return;
        }

        const foodTrigger = e.target.closest('.food-info-trigger');
        if (foodTrigger) {
            const foodId = foodTrigger.dataset.foodId;

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
            const saturatedFat = vals.saturatedFat ?? 0;
            const fiber = vals.fiber ?? 0;
            const sugar = vals.sugar ?? 0;
            const sodiumMg = vals.sodiumMg ?? 0;
            const saltG = (sodiumMg * 2.5) / 1000;
            const processingScore = Number.isFinite(food.processed) ? food.processed : NaN;

            UI.showModal({
                id: 'food-popup',
                titleHtml: `<h3 class="text-primary modal-title">${food.name}</h3>`,
                bodyHtml: `
                    <div class="text-xs text-muted mb-sm">${label}</div>

                    ${renderCompleteNutritionHtml({
                        kcal: vals.kcal || 0,
                        protein: vals.protein || 0,
                        carbs: vals.carbs || 0,
                        fat: vals.fat || 0,
                        salt: saltG,
                        fiber,
                        sugar,
                        saturatedFat,
                        processing: processingScore
                    }, { kcalSizeClass: 'modal-stat-pill-lg' })}
                `
            });
            return;
        }

        const scoreTrigger = e.target.closest('.nutritional-score-info-trigger');
        if (scoreTrigger) {
            const payload = decodePayload(scoreTrigger.dataset.nutritionalScore);
            if (!payload) return;

            const rows = Object.keys(NUTRITION_METRIC_LABELS).map((key) => {
                const deviation = payload.deviationsPct ? payload.deviationsPct[key] : null;
                const penalty = payload.penalties ? payload.penalties[key] : null;
                const deviationText = Number.isFinite(deviation) ? `${formatNumber(deviation, 1)}%` : '-';
                const penaltyText = Number.isFinite(penalty) ? formatNumber(penalty, 2) : '-';
                return {
                    label: NUTRITION_METRIC_LABELS[key],
                    col2: deviationText,
                    col3: penaltyText
                };
            });

            const scoreText = Number.isFinite(payload.score) ? formatNumber(payload.score, 1) : '-';
            const statusClass = nutritionScore.getStatusClass(payload.score);

            UI.showModal({
                id: 'nutrition-score-modal',
                titleHtml: `<h3 class="text-primary modal-title">Score nutricional</h3>`,
                bodyHtml: `
                    <div class="table-scroller">
                        <table class="adjustments-table">
                            <thead>
                                <tr>
                                    <th>Métrica</th>
                                    <th class="text-right">Desviación</th>
                                    <th class="text-right">Penalización</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${rows.map(row => `
                                    <tr>
                                        <td>${escapeHtml(row.label)}</td>
                                        <td class="text-right">${escapeHtml(row.col2)}</td>
                                        <td class="text-right">${escapeHtml(row.col3)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="stats-pills stats-pills--center mt-lg">
                        <div class="stat-pill stat-pill--nutritional-score nutritional-score-modal-score-pill">
                            Puntuación: <span class="${statusClass}">${scoreText}</span>
                        </div>
                    </div>
                `
            });
            return;
        }

        const kcalTrigger = e.target.closest('.kcal-info-trigger');
        if (!kcalTrigger) return;

        const payload = decodePayload(kcalTrigger.dataset.kcalDebug);
        if (!payload) return;

        const actuals = payload.actuals || {};
        const targets = payload.targets || {};
        const kcalFromMacros = Number.isFinite(payload.kcalFromMacros) ? payload.kcalFromMacros : 0;

        const formatMacro = (value) => `${Math.round(Number.parseFloat(value) || 0)} g`;
        const formatMacroOneDecimal = (value) => `${formatNumber(Number.parseFloat(value) || 0, 1)} g`;
        const formatSalt = (value) => `${formatNumber(Number.parseFloat(value) || 0, 2)} g`;
        const formatProcessing = (value) => `${formatNumber(Number.parseFloat(value) || 0, 1)}/10`;
        const formatKcal = (value) => `${Math.round(Number.parseFloat(value) || 0)} kcal`;

        UI.showModal({
            id: 'kcal-debug-modal',
            titleHtml: `<h3 class="text-primary modal-title">Cálculo de kcal y macros</h3>`,
            bodyHtml: `
                <div class="table-scroller">
                    <table class="adjustments-table">
                        <thead>
                            <tr>
                                <th>Métrica</th>
                                <th class="text-right">Actual</th>
                                <th class="text-right">Objetivo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Kcal</td>
                                <td class="text-right">${formatKcal(actuals.kcal)}</td>
                                <td class="text-right">${formatKcal(targets.kcal)}</td>
                            </tr>
                            <tr>
                                <td>Proteína</td>
                                <td class="text-right">${formatMacro(actuals.protein)}</td>
                                <td class="text-right">${formatMacro(targets.protein)}</td>
                            </tr>
                            <tr>
                                <td>Carbohidratos</td>
                                <td class="text-right">${formatMacro(actuals.carbs)}</td>
                                <td class="text-right">${formatMacro(targets.carbs)}</td>
                            </tr>
                            <tr>
                                <td>Grasas</td>
                                <td class="text-right">${formatMacro(actuals.fat)}</td>
                                <td class="text-right">${formatMacro(targets.fat)}</td>
                            </tr>
                            <tr>
                                <td>Fibra</td>
                                <td class="text-right">${formatMacroOneDecimal(actuals.fiber)}</td>
                                <td class="text-right">${formatMacroOneDecimal(targets.fiber)}</td>
                            </tr>
                            <tr>
                                <td>Azúcar</td>
                                <td class="text-right">${formatMacroOneDecimal(actuals.sugar)}</td>
                                <td class="text-right">${formatMacroOneDecimal(targets.sugar)}</td>
                            </tr>
                            <tr>
                                <td>Grasa sat.</td>
                                <td class="text-right">${formatMacroOneDecimal(actuals.saturatedFat)}</td>
                                <td class="text-right">${formatMacroOneDecimal(targets.saturatedFat)}</td>
                            </tr>
                            <tr>
                                <td>Sal</td>
                                <td class="text-right">${formatSalt(actuals.salt)}</td>
                                <td class="text-right">${formatSalt(targets.salt)}</td>
                            </tr>
                            <tr>
                                <td>Procesamiento</td>
                                <td class="text-right">${formatProcessing(actuals.processing)}</td>
                                <td class="text-right">${formatProcessing(targets.processing)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="stats-pills stats-pills--center mt-lg">
                    <div class="stat-pill stat-pill--kcal">
                        ${formatKcal(kcalFromMacros)}
                    </div>
                </div>
            `
        });
    });

    tableBody.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.dataset.day) {
            const dayIndex = parseInt(e.target.dataset.day, 10);
            const mealKey = e.target.dataset.meal;
            const itemIndex = parseInt(e.target.dataset.item, 10);
            const newVal = parseFloat(e.target.value) || 0;

            if (window.MENU_DATA && window.MENU_DATA[dayIndex]) {
                window.MENU_DATA[dayIndex][mealKey].items[itemIndex].amount = newVal;

                MenuStore.saveMenuData(currentFile, window.MENU_DATA);

                const mealItems = window.MENU_DATA[dayIndex][mealKey].items;
                const mealNut = formulas.calculateMeal(mealItems, FOODS);
                const mealMacroDiv = document.getElementById(`macros-${dayIndex}-${mealKey}`);
                if (mealMacroDiv) {
                    mealMacroDiv.innerHTML = renderMealMacroPills(mealNut);
                }

                const dayData = window.MENU_DATA[dayIndex];
                const dayTotals = calculateDayTotals(dayData);

                const storedTargets = DB.get('daily_nutrition_targets', {});
                const target = storedTargets[dayData.day];
                const totalsCell = document.getElementById(`day-totals-${dayIndex}`);
                if (totalsCell) {
                    totalsCell.innerHTML = generateTotalsHtml(dayTotals, target);
                }
            }
        }
    });

    tableBody.addEventListener('change', (e) => {
        if (e.target.matches('select[data-role="meal-add-select"][data-day][data-meal]')) {
            const select = e.target;
            const row = select.closest('.meal-item');
            const unitSpan = row ? row.querySelector('[data-role="meal-add-unit"]') : null;
            const amountInput = row ? row.querySelector('[data-role="meal-add-amount"]') : null;
            const foodId = select.value;
            const food = (typeof FOODS !== 'undefined') ? FOODS[foodId] : null;
            if (unitSpan) unitSpan.textContent = food ? food.unit : '';
            if (amountInput && (!amountInput.value || parseFloat(amountInput.value) <= 0) && food) {
                amountInput.value = getDefaultAmountForFood(food);
            }
            select.classList.toggle('is-placeholder', !foodId);
            return;
        }

        if (!e.target.matches('select[data-role="food-select"][data-day][data-meal][data-item]')) return;

        const dayIndex = parseInt(e.target.dataset.day, 10);
        const mealKey = e.target.dataset.meal;
        const itemIndex = parseInt(e.target.dataset.item, 10);
        const nextFoodId = e.target.value;

        if (!window.MENU_DATA || !window.MENU_DATA[dayIndex] || !window.MENU_DATA[dayIndex][mealKey]) return;

        const item = window.MENU_DATA[dayIndex][mealKey].items[itemIndex];
        if (!item || !nextFoodId || item.foodId === nextFoodId) return;

        const prevFood = (typeof FOODS !== 'undefined') ? FOODS[item.foodId] : null;
        const nextFood = (typeof FOODS !== 'undefined') ? FOODS[nextFoodId] : null;

        item.foodId = nextFoodId;

        if (nextFood && prevFood && prevFood.unit !== nextFood.unit) {
            item.amount = getDefaultAmountForFood(nextFood);
        } else if (nextFood && !Number.isFinite(parseFloat(item.amount))) {
            item.amount = getDefaultAmountForFood(nextFood);
        }

        MenuStore.saveMenuData(currentFile, window.MENU_DATA);
        renderTableContent();
    });

    const loadDependencies = () => {
        UI.loadDependencies([
            { when: () => typeof CoreBrowserAdapter === 'undefined', path: 'js/core/adapters/browser.adapter.js' }
        ])
            .then(() => (CoreBrowserAdapter && CoreBrowserAdapter.ensureCoreDomain
                ? CoreBrowserAdapter.ensureCoreDomain()
                : Promise.reject('CoreBrowserAdapter unavailable')))
            .then(() => {
                formulas = window.FormulasEngine;
                targets = window.TargetsEngine;
                nutritionScore = window.NutritionScoreEngine;
                if (!formulas || !targets || !nutritionScore) {
                    return Promise.reject('Core engines unavailable');
                }
                if (typeof CoreBrowserDomain !== 'undefined') {
                    CoreBrowserDomain.applyMacroDefaults(formulas);
                }
                return true;
            })
            .then(() => CoreBrowserAdapter.loadFoods())
            .then(() => CoreBrowserAdapter.loadExercises())
            .then(() => loadMenuData(currentFile))
            .catch(err => {
                console.error("Error loading dependencies:", err);
                tableBody.innerHTML = `<tr><td colspan="${errorColspan}" class="text-status--danger text-center">Error crítico: No se pudieron cargar las dependencias (foods/formulas).</td></tr>`;
            });
    };

    loadDependencies();
}



