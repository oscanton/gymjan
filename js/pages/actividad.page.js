/* =========================================
   pages/actividad.page.js - ACTIVIDAD SEMANAL
   ========================================= */

function renderActivityPage() {
    const container = document.getElementById('actividad-container');
    if (!container) return;

    const loadDependencies = () => {
        const promises = [];
        if (typeof Formulas === 'undefined') promises.push(UI.loadScript('js/core/formulas.js'));
        if (typeof RUTINAS === 'undefined') promises.push(UI.loadScript('js/data/actividad.js'));

        Promise.all(promises)
            .then(() => initActivityPage(container))
            .catch(() => UI.showError(container, 'Error cargando dependencias (formulas/rutinas).'));
    };
    loadDependencies();
}

function initActivityPage(container) {
    container.innerHTML = '';

    // Lunes=0, ..., Domingo=6
    const todayIndex = DateUtils.getTodayIndex();

    const weeklyPlan = ActivityStore.getWeeklyPlan();
    const userProfile = DB.get('user_profile', {});

    DIAS_SEMANA.forEach((diaNombre, index) => {
        const card = document.createElement('div');
        const isActive = index === todayIndex;

        const savedType = weeklyPlan[index] || 'descanso';

        card.className = `glass-card activity-card ${isActive ? 'activity-card--active' : ''}`;

        const options = TIPOS_ACTIVIDAD.map(opt =>
            `<option value="${opt.value}" ${opt.value === savedType ? 'selected' : ''}>${opt.label}</option>`
        ).join('');

        card.innerHTML = `
            <div class="activity-header">${diaNombre} ${isActive ? ' (HOY)' : ''}</div>
            
            <div class="my-sm">
                <select class="input-base input-select w-100" data-day-index="${index}">
                    ${options}
                </select>
            </div>

            <div id="rutina-content-${index}">
                ${generateRoutineContent(savedType, userProfile)}
            </div>
        `;

        container.appendChild(card);
    });

    container.addEventListener('change', (e) => {
        if (e.target.matches('select[data-day-index]')) {
            const dayIndex = parseInt(e.target.dataset.dayIndex);
            const type = e.target.value;
            updateActivity(dayIndex, type);
        }
    });
}

// Genera el contenido HTML de la rutina y los stats
function generateRoutineContent(type, profileData = null) {
    const rutina = RUTINAS[type] || RUTINAS['descanso'];
    const userProfile = profileData || DB.get('user_profile', {});

    const userWeight = parseFloat(userProfile.weight) || 0;
    const userHeight = parseFloat(userProfile.height) || 0;
    const userAge = parseInt(userProfile.age) || 0;
    const userSex = userProfile.sex || 'hombre';

    let statsHtml = '';

    if (userWeight > 0 && userHeight > 0) {
        const bmr = Formulas.calcBMR(userWeight, userHeight, userAge, userSex);
        const multiplier = (Formulas.ACTIVITY_MULTIPLIERS && Formulas.ACTIVITY_MULTIPLIERS[type]) || 1.2;

        const activityKcal = Math.max(0, Math.round(bmr * (multiplier - 1.2)));
        const macros = Formulas.calcMacros(activityKcal, type);

        statsHtml = UI.renderMacroPills({ ...macros, kcal: activityKcal });
    } else {
        statsHtml = `<div class="text-muted text-center text-sm mt-lg opacity-70">Configura la calculadora para ver macros</div>`;
    }

    return `
        <div class="activity-main">${rutina.titulo}</div>
        <div class="activity-exercises">${rutina.ejercicios}</div>
        ${statsHtml}
        <div class="activity-desc">${rutina.explicacion}</div>
    `;
}

function updateActivity(dayIndex, type) {
    const weeklyPlan = ActivityStore.getWeeklyPlan();
    weeklyPlan[dayIndex] = type;
    ActivityStore.saveWeeklyPlan(weeklyPlan);

    // Recalcular objetivos globales para sincronización
    Targets.recalculateDailyTargets(weeklyPlan);

    const contentDiv = document.getElementById(`rutina-content-${dayIndex}`);

    if (contentDiv) {
        contentDiv.classList.add('opacity-pulse');
        setTimeout(() => contentDiv.classList.remove('opacity-pulse'), 200);

        contentDiv.innerHTML = generateRoutineContent(type);
    }
}
