/* =========================================
   pages/calculadora.page.js - CALCULADORA
   ========================================= */

function renderCalculatorPage() {
    const container = document.getElementById('calculadora-container');
    if (!container) return;

    if (typeof Formulas === 'undefined') {
        UI.loadScript('js/core/formulas.js')
            .then(() => initCalculator(container))
            .catch(() => UI.showError(container, 'Error cargando formulas.js'));
    } else {
        initCalculator(container);
    }
}

function initCalculator(container) {
    const formatActivity = (key) => {
        if (typeof ACTIVITY_CATALOG !== 'undefined' && ACTIVITY_CATALOG[key]) {
            return ACTIVITY_CATALOG[key].label;
        }
        return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };

    // 1. Cargar datos (o defaults)
    const userProfile = DB.get('user_profile', {
        sex: 'hombre', age: 30, height: 175, weight: 75
    });

    const weeklyPlan = ActivityStore.getWeeklyPlan();

    let adjustments = DB.get('user_adjustments', { kcal: 0, p: 0, c: 0, f: 0 });

    const ADJ_FIELDS = [
        { id: 'adj-kcal', label: '🔥 Kcal', key: 'kcal' },
        { id: 'adj-p',    label: '🥩 Proteína', key: 'p' },
        { id: 'adj-c',    label: '🍚 Carbo H', key: 'c' },
        { id: 'adj-f',    label: '🥑 Grasas', key: 'f' }
    ];

    // --- SECCIÓN 1: DATOS PERSONALES ---
    const profileCard = document.createElement('div');
    profileCard.className = 'glass-card card';
    profileCard.innerHTML = `
        <h2>Datos Personales</h2>
        <div class="section-group__grid">
            <div class="row-item">
                <span class="row-item__title">Sexo</span>
                <select id="calc-sex" class="input-base input-select w-auto">
                    <option value="hombre" ${userProfile.sex === 'hombre' ? 'selected' : ''}>Hombre</option>
                    <option value="mujer" ${userProfile.sex === 'mujer' ? 'selected' : ''}>Mujer</option>
                </select>
            </div>
            <div class="row-item">
                <span class="row-item__title">Edad</span>
                <input type="number" id="calc-age" class="row-item__input" value="${userProfile.age}">
            </div>
            <div class="row-item">
                <span class="row-item__title">Altura (cm)</span>
                <input type="number" id="calc-height" class="row-item__input" value="${userProfile.height}">
            </div>
            <div class="row-item">
                <span class="row-item__title">Peso (kg)</span>
                <input type="number" id="calc-weight" class="row-item__input" value="${userProfile.weight}">
            </div>
        </div>
    `;
    container.appendChild(profileCard);

    // --- SECCIÓN 2: RESULTADOS BASE ---
    const baseResultsCard = document.createElement('div');
    baseResultsCard.className = 'glass-card card mt-lg';
    container.appendChild(baseResultsCard);

    // --- SECCIÓN 4: AJUSTES GENERALES ---
    const adjustmentsCard = document.createElement('div');
    adjustmentsCard.className = 'glass-card card mt-lg';
    const generateOpts = (val) => {
        const steps = [0.20, 0.15, 0.10, 0.05, 0, -0.05, -0.10, -0.15, -0.20];
        return steps.map(s => {
            const label = s === 0 ? "0%" : (s > 0 ? `+${Math.round(s * 100)}%` : `${Math.round(s * 100)}%`);
            return `<option value="${s}" ${Math.abs(val - s) < 0.001 ? 'selected' : ''}>${label}</option>`;
        }).join('');
    };

    adjustmentsCard.innerHTML = `
        <h2>Ajustes Generales</h2>
        <div class="adjustments-container">
            <div class="adj-labels-col">
                <div class="adj-col-header">&nbsp;</div>
                <div class="adj-row-label">Base</div>
                <div class="adj-row-label">Ajuste</div>
                <div class="adj-row-label">Objetivo</div>
            </div>

            ${ADJ_FIELDS.map(field => `
                <div class="adj-data-col">
                    <div class="adj-col-header">${field.label}</div>
                    <div class="adj-data-cell" id="adj-base-${field.key}">-</div>
                    <div class="adj-data-cell">
                        <select id="${field.id}" class="input-base input-select input-select--sm">${generateOpts(adjustments[field.key])}</select>
                    </div>
                    <div class="adj-data-cell adj-data-cell--highlight" id="adj-obj-${field.key}">-</div>
                </div>
            `).join('')}
        </div>
    `;
    container.appendChild(adjustmentsCard);

    // --- SECCIÓN 5: OBJETIVOS SEMANALES ---
    const weeklyGoalsCard = document.createElement('div');
    weeklyGoalsCard.className = 'glass-card card mt-lg';
    weeklyGoalsCard.innerHTML = `
        <h2>Objetivos Semanales</h2>
        <div id="daily-results-grid" class="stack-vertical"></div>
    `;
    container.appendChild(weeklyGoalsCard);

    const readAndSaveInputs = () => {
        const profile = {
            sex: document.getElementById('calc-sex').value,
            age: parseInt(document.getElementById('calc-age').value) || 0,
            height: parseInt(document.getElementById('calc-height').value) || 0,
            weight: parseFloat(document.getElementById('calc-weight').value) || 0,
        };
        DB.save('user_profile', profile);

        ADJ_FIELDS.forEach(field => {
            adjustments[field.key] = parseFloat(document.getElementById(field.id).value);
        });
        DB.save('user_adjustments', adjustments);

        return { profile, adjustments };
    };

    const renderBaseResults = (profile) => {
        const imc = Formulas.calcIMC(profile.weight, profile.height);
        const imcData = Formulas.getIMCCategory(imc);
        const bmr = Formulas.calcBMR(profile.weight, profile.height, profile.age, profile.sex);

        baseResultsCard.innerHTML = `
            <h2>Resultados Base</h2>
            <div class="calc-grid-2">
                <div class="card-panel">
                    <div class="text-label">IMC</div>
                    <div class="text-value ${imcData.className}">${imc}</div>
                    <div class="text-sm text-muted ${imcData.className} mt-auto">${imcData.label}</div>
                </div>
                <div class="card-panel">
                    <div class="text-label">BMR</div>
                    <div class="stats-pills stats-pills--center my-sm">
                        <div class="stat-pill stat-pill--kcal">🔥 ${bmr} kcal</div>
                    </div>
                    <div class="text-sm text-muted mt-auto">Basal</div>
                </div>
            </div>
        `;
        return bmr;
    };

    const renderAdjustmentsTable = (bmr, adjustments) => {
        const restKcal = Math.round(bmr * 1.2);
        const zeroAdj = { kcal: 0, p: 0, c: 0, f: 0 };

        const baseVals = Targets.getAdjustedValues(restKcal, 'descanso', zeroAdj);
        const objectiveVals = Targets.getAdjustedValues(restKcal, 'descanso', adjustments);

        const updateCell = (prefix, vals) => {
            document.getElementById(`${prefix}-kcal`).textContent = vals.kcal;
            document.getElementById(`${prefix}-p`).textContent = `${vals.p}g`;
            document.getElementById(`${prefix}-c`).textContent = `${vals.c}g`;
            document.getElementById(`${prefix}-f`).textContent = `${vals.f}g`;
        };

        updateCell('adj-base', baseVals);
        updateCell('adj-obj', objectiveVals);
    };

    const renderWeeklyGoals = (bmr, adjustments) => {
        const dailyGrid = document.getElementById('daily-results-grid');
        dailyGrid.innerHTML = '';
        const dailyTargets = {};

        DIAS_SEMANA.forEach((day, index) => {
            const activityKey = weeklyPlan[index];
            const factor = Formulas.ACTIVITY_MULTIPLIERS[activityKey] || 1.2;
            const tdee = bmr * factor;
            const dayVals = Targets.getAdjustedValues(tdee, activityKey, adjustments);

            dailyTargets[day] = {
                kcal: dayVals.kcal,
                protein: dayVals.p,
                carbs: dayVals.c,
                fat: dayVals.f,
            };

            const dayCard = document.createElement('div');
            dayCard.className = 'row-item daily-result-card';
            dayCard.innerHTML = `
                <div class="row-item__header">
                    <div class="row-item__title">${day}</div>
                    <div class="row-item__subtitle mt-0">${formatActivity(activityKey)}</div>
                </div>
                ${UI.renderMacroPills(dayVals, true)}
            `;
            dailyGrid.appendChild(dayCard);
        });

        DB.save('daily_nutrition_targets', dailyTargets);
    };

    const updateAndCalculate = () => {
        const { profile, adjustments } = readAndSaveInputs();
        const bmr = renderBaseResults(profile);
        if (bmr > 0) {
            renderAdjustmentsTable(bmr, adjustments);
            renderWeeklyGoals(bmr, adjustments);
        }
    };

    profileCard.querySelectorAll('input, select').forEach(el => el.addEventListener('change', updateAndCalculate));
    adjustmentsCard.querySelectorAll('select').forEach(el => el.addEventListener('change', updateAndCalculate));

    updateAndCalculate();
}
