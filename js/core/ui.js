/* =========================================
   core/ui.js - UTILIDADES DE UI
   ========================================= */

const UI = {
    // Detectar si estamos en subdirectorio views/
    isInViews: () => window.location.pathname.includes('/views/'),

    // Resolver ruta relativa desde la raíz del proyecto
    resolvePath: (path) => {
        const prefix = UI.isInViews() ? '../' : '';
        return prefix + path;
    },

    // Cargar script dinámicamente (Promesa)
    loadScript: (path, id = null) => {
        return new Promise((resolve, reject) => {
            const resolvedPath = UI.resolvePath(path) + `?v=${Date.now()}`;
            if (id) {
                const old = document.getElementById(id);
                if (old) old.remove();
            }
            const script = document.createElement('script');
            if (id) script.id = id;
            script.src = resolvedPath;
            script.onload = resolve;
            script.onerror = () => reject(path);
            document.body.appendChild(script);
        });
    },

    // Renderizar mensaje de error en contenedor
    showError: (container, message) => {
        container.innerHTML = `<div class="glass-card card"><p class="text-status--danger">${message}</p></div>`;
    },

    // Clase de estado para totales (Visualización de cumplimiento de objetivos)
    getStatusClass: (current, target) => {
        if (!target || target === 0) return '';
        const pct = (current / target) * 100;
        if (pct > 110) return 'text-status--danger';
        if (pct < 90) return 'text-status--warning';
        return 'text-status--ok';
    },

    // Renderizar pills de macros (HTML string)
    renderMacroPills: (vals, center = false) => {
        const centerClass = center ? 'stats-pills--center' : '';
        const p = vals.p !== undefined ? vals.p : vals.protein;
        const c = vals.c !== undefined ? vals.c : vals.carbs;
        const f = vals.f !== undefined ? vals.f : vals.fat;

        return `
            <div class="stats-pills ${centerClass} w-100">
                <div class="stat-pill stat-pill--kcal">🔥 ${vals.kcal} kcal</div>
                <div class="stat-pill">🥩 ${p}g</div>
                <div class="stat-pill">🍚 ${c}g</div>
                <div class="stat-pill">🥑 ${f}g</div>
            </div>
        `;
    }
};

window.UI = UI;
