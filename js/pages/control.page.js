/* =========================================
   pages/control.page.js - CONTROL DE PESO
   ========================================= */

function renderControlPage() {
    const container = document.getElementById('control-container');
    if (!container) return;


    ensureRoutines()
        .then(() => initControlPage(container))
        .catch(() => {
            console.warn('No se pudieron cargar rutinas');
            initControlPage(container);
        });
}

function ensureRoutines() {
    if (typeof Routines === 'undefined') {
        return UI.loadDependencies([{ when: true, path: 'js/core/routines.js' }])
            .then(() => Routines.ensureLoaded());
    }
    return Routines.ensureLoaded();
}

function initControlPage(container) {
    // 1. Obtener Datos
    let history = DB.get('weight_history', []);

    history = history
        .map((h) => {
            const date = DateUtils.normalizeISODate(h.date || '');
            const activity = (h.activity === 'descanso') ? 'recuperacion' : (h.activity || 'recuperacion');
            return { ...h, date, activity };
        })
        .filter((h) => h.date && h.weight);

    // Ordenar por fecha (más reciente primero) para la tabla
    history.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Fecha por defecto: Hoy
    const today = DateUtils.toISODate();

    // Peso por defecto: Último registrado
    const lastWeight = history.length > 0 ? history[0].weight : '';

    // Actividad por defecto: La del plan semanal para hoy
    const todayIndex = DateUtils.getTodayIndex();
    const weeklyPlan = ActivityStore.getWeeklyPlan();
    const fallbackId = (typeof Routines !== 'undefined') ? Routines.getDefaultId() : 'recuperacion';
    const defaultActivity = weeklyPlan[todayIndex] || fallbackId;

    const activityOptions = getActivityOptions(defaultActivity);

    // 2. Renderizar Estructura
    container.innerHTML = `
        <div class="glass-card card">
            <h2>Nuevo Registro</h2>
            <div class="control-form-row">
                <div class="control-field control-field--date">
                    <label class="text-label control-label--compact">Fecha</label>
                    <input type="date" id="new-date" class="input-base input-base--date" value="${today}">
                </div>
                <div class="control-field control-field--weight">
                    <label class="text-label control-label--compact">Peso</label>
                    <input type="number" id="new-weight" class="input-base input-base--compact input-base--center" step="0.1" placeholder="0.0" value="${lastWeight}">
                </div>
                <div class="control-field control-field--activity">
                    <label class="text-label control-label--compact">Actividad</label>
                    <select id="new-activity" class="input-base input-select input-base--compact input-base--compact-height w-100">
                        ${activityOptions}
                    </select>
                </div>
                <div class="control-field">
                    <button id="btn-add-weight" class="btn-back btn-icon" type="button">💾</button>
                </div>
            </div>
        </div>

        <div class="glass-card card mt-lg">
            <h2>Historial</h2>
            <div class="history-list">
                <div class="history-header opacity-70">
                    <div class="history-col--date">Fecha</div>
                    <div class="history-col--weight">Peso</div>
                    <div class="history-col--activity">Actividad</div>
                    <div class="history-col--actions"></div>
                </div>
                <div id="weight-history-list"></div>
            </div>
        </div>

        <div class="glass-card card mt-lg">
            <h2>Evolución</h2>
            <div class="glass-card chart-box">
                <canvas id="weightChart"></canvas>
            </div>
        </div>
        
        <div class="text-center mt-lg">
            <button class="btn-back" onclick="DB.clearAll()">🗑️ Borrar Todo</button>
        </div>
    `;

    // 3. Renderizar Componentes
    renderWeightChart(history);
    renderHistoryTable(history);

    // 4. Eventos
    document.getElementById('btn-add-weight').addEventListener('click', () => {
        const dateVal = document.getElementById('new-date').value;
        const weightVal = parseFloat(document.getElementById('new-weight').value);
        const activityVal = document.getElementById('new-activity').value;

        if (dateVal && weightVal > 0) {
            // Verificar si ya existe registro para esa fecha
            const existingIndex = history.findIndex(h => h.date === dateVal);

            const newEntry = { date: dateVal, weight: weightVal, activity: activityVal };

            if (existingIndex >= 0) {
                if (!confirm(`Ya existe un registro para el ${dateVal}. ¿Deseas sobrescribirlo?`)) return;
                history[existingIndex] = newEntry;
            } else {
                history.push(newEntry);
            }

            // Ordenar y guardar
            history.sort((a, b) => new Date(b.date) - new Date(a.date));
            DB.save('weight_history', history);

            // Sincronización con perfil si es la fecha más reciente
            if (history[0].date === dateVal) {
                const profile = DB.get('user_profile', {});
                profile.weight = weightVal;
                DB.save('user_profile', profile);
            }

            // Recargar página
            renderControlPage();
        } else {
            alert("Por favor, introduce una fecha y un peso válido.");
        }
    });
}

function getActivityOptions(defaultActivity) {
    const routines = (typeof Routines !== 'undefined') ? Routines.getAll() : [];
    if (!routines.length) {
        return `<option value="${defaultActivity}">${defaultActivity}</option>`;
    }
    return routines.map(opt =>
        `<option value="${opt.id}" ${opt.id === defaultActivity ? 'selected' : ''}>${opt.nombre}</option>`
    ).join('');
}

function getActivityLabel(activityKey) {
    const activity = (typeof Routines !== 'undefined' ? Routines.getAll() : [])
        .find(t => t.id === activityKey);
    return activity ? activity.nombre : (activityKey || '-');
}

function renderHistoryTable(history) {
    const listContainer = document.getElementById('weight-history-list');
    if (history.length === 0) {
        listContainer.innerHTML = '<div class="text-center text-muted history-empty">Sin registros aún</div>';
        return;
    }

    listContainer.innerHTML = history.map((entry, index) => {
        const shortDate = DateUtils.toShortDate(entry.date);
        const actLabel = getActivityLabel(entry.activity);

        return `
            <div class="history-row">
                <div class="history-col--date">${shortDate}</div>
                <div class="history-col--weight"><strong>${entry.weight}</strong></div>
                <div class="history-col--activity text-xs text-muted">${actLabel}</div>
                <div class="history-col--actions">
                    <button class="btn-delete-entry btn-ghost" data-index="${index}" type="button">❌</button>
                </div>
            </div>
        `;
    }).join('');

    // Listeners para borrar entradas individuales
    listContainer.querySelectorAll('.btn-delete-entry').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if(confirm('¿Borrar este registro?')) {
                const idx = parseInt(e.target.dataset.index);
                history.splice(idx, 1);
                DB.save('weight_history', history);
                renderControlPage();
            }
        });
    });
}

function renderWeightChart(history) {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;

    // Ajustar resolución del canvas
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Limpiar
    ctx.clearRect(0, 0, width, height);

    if (history.length < 2) {
        ctx.fillStyle = "rgba(255,255,255,0.3)";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Añade al menos 2 registros para ver la gráfica", width / 2, height / 2);
        return;
    }

    // Preparar datos (Orden cronológico para la gráfica: antiguo -> nuevo)
    const data = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    // Escalas
    const weights = data.map(d => d.weight);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;

    const padding = 40;
    const graphWidth = width - (padding * 2);
    const graphHeight = height - (padding * 2);

    // Dibujar línea
    ctx.beginPath();
    ctx.strokeStyle = "rgb(255, 209, 102)";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";

    data.forEach((d, i) => {
        const x = padding + (i / (data.length - 1)) * graphWidth;
        const y = height - padding - ((d.weight - minW) / range) * graphHeight;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        // Puntos
        ctx.fillStyle = "#fff";
        ctx.fillRect(x - 3, y - 3, 6, 6);

        // Etiquetas (solo primero y último para no saturar)
        if (i === 0 || i === data.length - 1) {
            ctx.fillStyle = "#fff";
            ctx.font = "12px sans-serif";
            ctx.fillText(`${d.weight}kg`, x - 10, y - 15);

            const [year, month, day] = d.date.split('-');
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            ctx.fillText(`${day}/${month}`, x - 15, height - 10);
        }
    });
    ctx.stroke();
}
