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
    if (!AVAILABLE_MENUS.some(menuOption => menuOption.file === currentFile)) {
        currentFile = AVAILABLE_MENUS[0].file;
        MenuStore.setSelectedFile(currentFile);
    }

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
        const controls = UI.renderEditResetControls({
            id: 'menu-controls-container',
            isEditMode,
            onToggle: () => {
                isEditMode = !isEditMode;
                const fresh = UI.renderEditResetControls({
                    id: 'menu-controls-container',
                    isEditMode,
                    onToggle: () => {
                        isEditMode = !isEditMode;
                        renderTableContent();
                    },
                    onReset: () => {
                        if (confirm("¿Restablecer el menú original? Se perderán los cambios.")) {
                            MenuStore.clearSavedMenuData(currentFile);
                            if (isEditMode) isEditMode = false;
                            loadMenuData(currentFile);
                        }
                    }
                });
                const current = document.getElementById('menu-controls-container');
                if (current) current.replaceWith(fresh);
                renderTableContent();
            },
            onReset: () => {
                if (confirm("¿Restablecer el menú original? Se perderán los cambios.")) {
                    MenuStore.clearSavedMenuData(currentFile);
                    if (isEditMode) isEditMode = false;
                    loadMenuData(currentFile);
                }
            }
        });
        container.after(controls);
    }

    const MEAL_KEYS = ['desayuno', 'comida', 'cena'];
    const SECONDARY_TARGET_KEYS = ['salt', 'fiber', 'sugar', 'saturatedFat', 'processing'];

    const formatNumber = (value, decimals = 1) => {
        const numeric = Number.isFinite(value) ? value : 0;
        return numeric.toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    };
    const renderMealMacroPills = (nut) => `
        <div class="stat-pill stat-pill--kcal stat-pill--xs">🔥 ${Math.round(nut.kcal)} kcal</div>
        <div class="stat-pill stat-pill--xs">🥩 ${Math.round(nut.protein)}g</div>
        <div class="stat-pill stat-pill--xs">🍚 ${Math.round(nut.carbs)}g</div>
        <div class="stat-pill stat-pill--xs">🥑 ${Math.round(nut.fat)}g</div>
    `;

    const createEmptyDayTotals = () => ({
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        saturatedFat: 0,
        fiber: 0,
        sugar: 0,
        salt: 0,
        processingSum: 0,
        processingCount: 0,
        processingAvg: 0
    });

    const calculateMealDetails = (items) => {
        const totals = createEmptyDayTotals();
        if (!Array.isArray(items) || typeof FOODS === 'undefined') return totals;

        items.forEach(item => {
            const food = FOODS[item.foodId];
            if (!food) return;

            let ratio = 0;
            let nutrition = null;
            if (food.nutritionPer100) {
                ratio = (parseFloat(item.amount) || 0) / 100;
                nutrition = food.nutritionPer100;
            } else if (food.nutritionPerUnit) {
                ratio = parseFloat(item.amount) || 0;
                nutrition = food.nutritionPerUnit;
            }
            if (!nutrition || ratio <= 0) return;

            totals.kcal += (nutrition.kcal || 0) * ratio;
            totals.protein += (nutrition.protein || 0) * ratio;
            totals.carbs += (nutrition.carbs || 0) * ratio;
            totals.fat += (nutrition.fat || 0) * ratio;
            totals.saturatedFat += (nutrition.saturated_fat || 0) * ratio;
            totals.fiber += (nutrition.fiber || 0) * ratio;
            totals.sugar += (nutrition.sugar || 0) * ratio;
            totals.salt += ((nutrition.sodium || 0) * ratio * 2.5) / 1000;

            if (Number.isFinite(food.processed)) {
                totals.processingSum += food.processed;
                totals.processingCount += 1;
            }
        });

        return totals;
    };

    const calculateDayTotals = (dayData) => {
        const dayTotals = createEmptyDayTotals();

        MEAL_KEYS.forEach(mealKey => {
            const items = dayData && dayData[mealKey] ? dayData[mealKey].items : [];
            const mealTotals = calculateMealDetails(items);
            dayTotals.kcal += mealTotals.kcal;
            dayTotals.protein += mealTotals.protein;
            dayTotals.carbs += mealTotals.carbs;
            dayTotals.fat += mealTotals.fat;
            dayTotals.saturatedFat += mealTotals.saturatedFat;
            dayTotals.fiber += mealTotals.fiber;
            dayTotals.sugar += mealTotals.sugar;
            dayTotals.salt += mealTotals.salt;
            dayTotals.processingSum += mealTotals.processingSum;
            dayTotals.processingCount += mealTotals.processingCount;
        });

        dayTotals.processingAvg = dayTotals.processingCount ? (dayTotals.processingSum / dayTotals.processingCount) : 0;
        return dayTotals;
    };

    const renderPrimaryNutrientsHtml = ({ kcal, protein, carbs, fat }, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm'
    } = {}) => {
        const targetKcal = targets ? targets.kcal : null;
        const targetProtein = targets ? targets.protein : null;
        const targetCarbs = targets ? targets.carbs : null;
        const targetFat = targets ? targets.fat : null;

        return `
            <div class="stat-pill stat-pill--kcal ${kcalSizeClass} stat-pill--block">
                🔥 <span class="${statusClasses.kcal || ''}">${Math.round(kcal)} kcal</span>
                ${Number.isFinite(targetKcal) ? `<span class="text-muted">/ ${targetKcal} kcal</span>` : ''}
            </div>
            <div class="nutrition-row">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🥩 Prot</div>
                    <div><span class="${statusClasses.protein || ''}">${Math.round(protein)}g</span>${Number.isFinite(targetProtein) ? ` <span class="text-muted">/ ${targetProtein}g</span>` : ''}</div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🍚 Carbs</div>
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
        salt, fiber, sugar, saturatedFat, processing, containerClass = '', targets = null, statusClasses = {}
    }) => {
        const classSuffix = containerClass ? ` ${containerClass}` : '';
        const processingValue = Number.isFinite(processing) ? `${formatNumber(processing, 1)}/10` : '-';
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
                        <span class="${statusClasses.salt || ''}">${formatNumber(salt, 2)}g</span>
                        ${Number.isFinite(targetSalt) ? ` <span class="text-muted">/ ${formatNumber(targetSalt, 2)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🌾 Fibra</div>
                    <div>
                        <span class="${statusClasses.fiber || ''}">${formatNumber(fiber, 1)}g</span>
                        ${Number.isFinite(targetFiber) ? ` <span class="text-muted">/ ${formatNumber(targetFiber, 1)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🍬 Azúcar</div>
                    <div>
                        <span class="${statusClasses.sugar || ''}">${formatNumber(sugar, 1)}g</span>
                        ${Number.isFinite(targetSugar) ? ` <span class="text-muted">/ ${formatNumber(targetSugar, 1)}g</span>` : ''}
                    </div>
                </div>
            </div>

            <div class="modal-grid-2 modal-grid-2--compact${classSuffix}">
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🧈 Grasa sat.</div>
                    <div>
                        <span class="${statusClasses.saturatedFat || ''}">${formatNumber(saturatedFat, 1)}g</span>
                        ${Number.isFinite(targetSaturatedFat) ? ` <span class="text-muted">/ ${formatNumber(targetSaturatedFat, 1)}g</span>` : ''}
                    </div>
                </div>
                <div class="stat-pill nutrition-pill">
                    <div class="nutrition-pill__label">🏭 Procesamiento</div>
                    <div>
                        <span class="${statusClasses.processing || ''}">${processingValue}</span>
                        ${Number.isFinite(targetProcessing) ? ` <span class="text-muted">/ ${formatNumber(targetProcessing, 1)}/10</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    };

    const renderCompleteNutritionHtml = (nutrients, {
        targets = null,
        statusClasses = {},
        kcalSizeClass = 'stat-pill--sm',
        secondaryContainerClass = ''
    } = {}) => `
        <div class="nutrition-stack">
            ${renderPrimaryNutrientsHtml(nutrients, { targets, statusClasses, kcalSizeClass })}
            ${renderSecondaryNutrientsHtml({
                salt: nutrients.salt,
                fiber: nutrients.fiber,
                sugar: nutrients.sugar,
                saturatedFat: nutrients.saturatedFat,
                processing: nutrients.processing,
                containerClass: secondaryContainerClass,
                targets,
                statusClasses
            })}
        </div>
    `;

    const generateTotalsHtml = (dayTotals, target) => {
        const tKcal = target ? target.kcal : 0;
        const tProt = target ? target.protein : 0;
        const tCarb = target ? target.carbs : 0;
        const tFat  = target ? target.fat : 0;

        const classKcal = UI.getStatusClass(dayTotals.kcal, tKcal);
        const classProt = UI.getStatusClass(dayTotals.protein, tProt);
        const classCarb = UI.getStatusClass(dayTotals.carbs, tCarb);
        const classFat  = UI.getStatusClass(dayTotals.fat, tFat);
        const classSalt = UI.getStatusClassByRule(dayTotals.salt, target && target.salt, { rule: 'max', tolerancePct: 10 });
        const classFiber = UI.getStatusClassByRule(dayTotals.fiber, target && target.fiber, { rule: 'min', tolerancePct: 10 });
        const classSugar = UI.getStatusClassByRule(dayTotals.sugar, target && target.sugar, { rule: 'max', tolerancePct: 10 });
        const classSaturatedFat = UI.getStatusClassByRule(dayTotals.saturatedFat, target && target.saturatedFat, { rule: 'max', tolerancePct: 10 });
        const classProcessing = UI.getStatusClassByRule(dayTotals.processingAvg, target && target.processing, { rule: 'max', tolerancePct: 10 });

        return renderCompleteNutritionHtml({
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
            targets: {
                kcal: tKcal,
                protein: tProt,
                carbs: tCarb,
                fat: tFat,
                salt: target ? target.salt : null,
                fiber: target ? target.fiber : null,
                sugar: target ? target.sugar : null,
                saturatedFat: target ? target.saturatedFat : null,
                processing: target ? target.processing : null
            },
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
            secondaryContainerClass: 'totals-secondary-grid'
        });
    };

    const renderTableContent = () => {
        if (typeof window.MENU_DATA === 'undefined') {
            console.error("Error: MENU_DATA no está definido.");
            tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger">Error: MENU_DATA no disponible.</td></tr>`;
            return;
        }

        let storedTargets = DB.get('daily_nutrition_targets', {});
        const hasTargets = storedTargets && Object.keys(storedTargets).length > 0;
        const hasMissingSecondaryTargets = hasTargets && Object.values(storedTargets).some(dayTarget =>
            !dayTarget || SECONDARY_TARGET_KEYS.some(key => !Number.isFinite(parseFloat(dayTarget[key])))
        );
        if ((!hasTargets || hasMissingSecondaryTargets) && typeof Targets !== 'undefined') {
            const recalculated = Targets.recalculateDailyTargets();
            if (recalculated) storedTargets = recalculated;
        }

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
                headerHtml += `<th class="${activeClass}">${day.dia}</th>`;
            });
            headerHtml += '</tr>';
            thead.innerHTML = headerHtml;
        }

        tableBody.innerHTML = "";
        const mealLabels = { desayuno: 'Desayuno', comida: 'Comida', cena: 'Cena' };

        const currentHour = new Date().getHours();
        let activeMeal = null;
        if (currentHour >= 6 && currentHour < 12) activeMeal = 'desayuno';
        else if (currentHour >= 12 && currentHour < 18) activeMeal = 'comida';
        else if (currentHour >= 18) activeMeal = 'cena';

        try {
            MEAL_KEYS.forEach(mealKey => {
                const row = document.createElement("tr");
                const isActive = mealKey === activeMeal;
                const activeClass = isActive ? 'text-status--ok' : '';
                let html = `<td class="menu-row-header ${activeClass}">${mealLabels[mealKey]}</td>`;

                currentData.forEach((day, dayIndex) => {
                    const mealData = day[mealKey];
                    const nut = Formulas.calculateMeal(mealData.items);

                    html += `
                        <td>
                            <ul class="meal-list">
                                ${mealData.items.map((item, itemIndex) => {
                                    const food = FOODS[item.foodId];
                                    let amountHtml;
                                    if (isEditMode) {
                                        amountHtml = `<input type="text" inputmode="decimal" value="${item.amount}" 
                                            class="input-base input-base--table-edit" 
                                            data-day="${dayIndex}" data-meal="${mealKey}" data-item="${itemIndex}">`;
                                    } else {
                                        amountHtml = `<span>${item.amount}</span>`;
                                    }
                                    return `<li class="meal-item">
                                        <span class="meal-item__name food-info-trigger modal-trigger" data-food-id="${item.foodId}">${food ? food.name : item.foodId}</span>
                                        <div class="meal-item__amount">
                                            ${amountHtml}
                                            <span class="meal-item__unit">${food ? food.unit : ''}</span>
                                        </div>
                                    </li>`;
                                }).join('')}
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

                const target = storedTargets[day.dia];
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
            const saturatedFat = vals.saturated_fat ?? 0;
            const fiber = vals.fiber ?? 0;
            const sugar = vals.sugar ?? 0;
            const sodiumMg = vals.sodium ?? 0;
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
        }
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
                const mealNut = Formulas.calculateMeal(mealItems);
                const mealMacroDiv = document.getElementById(`macros-${dayIndex}-${mealKey}`);
                if (mealMacroDiv) {
                    mealMacroDiv.innerHTML = renderMealMacroPills(mealNut);
                }

                const dayData = window.MENU_DATA[dayIndex];
                const dayTotals = calculateDayTotals(dayData);

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
        UI.loadDependencies([
            { when: () => typeof Formulas === 'undefined', path: 'js/core/formulas.js' },
            { when: () => typeof Targets === 'undefined', path: 'js/core/targets.js' },
            { when: () => typeof FOODS === 'undefined', path: 'js/data/foods.js' },
            { when: () => typeof Routines === 'undefined', path: 'js/core/routines.js' },
            { when: () => typeof EXERCISES === 'undefined', path: 'js/data/ejercicios.js' },
            { when: () => typeof STEP_ROUTINE === 'undefined', path: 'js/data/rutinas/rutina_pasos.js' }
        ])
            .then(() => (typeof Routines !== 'undefined' ? Routines.ensureLoaded().catch(() => null) : Promise.resolve()))
            .then(() => loadMenuData(currentFile))
            .catch(err => {
                console.error("Error loading dependencies:", err);
                tableBody.innerHTML = `<tr><td colspan="3" class="text-status--danger text-center">Error crítico: No se pudieron cargar las dependencias (foods/formulas).</td></tr>`;
            });
    };

    loadDependencies();
}
