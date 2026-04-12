const STATUS_CLASSES = { ok: 'text-status--ok', warning: 'text-status--warning', danger: 'text-status--danger', critical: 'color-critical' };
const resolveMaybe = (fn) => (typeof fn === 'function' ? Promise.resolve().then(fn) : Promise.resolve());
const asContext = (value) => (value && typeof value === 'object' && !Array.isArray(value) ? value : {});
const translate = (key, params = {}, fallback = '') => window.I18n?.t?.(key, params, fallback) || fallback || String(key || '');

const UI = {
    isInViews: () => window.location.pathname.includes('/views/'),
    resolvePath: (path) => `${UI.isInViews() ? '../' : ''}${path}`,
    loadScript: (path, id = null) => new Promise((resolve, reject) => {
        if (id) document.getElementById(id)?.remove();
        const script = document.createElement('script');
        if (id) script.id = id;
        script.src = `${UI.resolvePath(path)}?v=${Date.now()}`;
        script.onload = () => resolve(path);
        script.onerror = () => reject(path);
        document.body.appendChild(script);
    }),
    loadDependencies: (deps, { settled = false } = {}) => {
        const loads = (deps || [])
            .filter((dep) => typeof dep.when === 'function' ? dep.when() : dep.when !== false)
            .map(({ path, id }) => UI.loadScript(path, id));
        return settled ? Promise.allSettled(loads) : Promise.all(loads);
    },
    ensureDependencies: (deps, options = {}) => UI.loadDependencies((deps || []).map(({ global, ...dep }) => ({
        ...dep,
        when: () => !global || typeof window[global] === 'undefined'
    })), options),
    bootstrapPage: ({
        rootId,
        requiredDeps = [],
        optionalDeps = [],
        afterRequired = null,
        afterOptional = null,
        run = null,
        onError = null
    } = {}) => {
        const root = document.getElementById(rootId);
        if (!root || typeof run !== 'function') return Promise.resolve(false);
        const context = {};
        return UI.ensureDependencies(requiredDeps)
            .then(() => resolveMaybe(afterRequired).then((value) => Object.assign(context, asContext(value))))
            .then(() => UI.ensureDependencies(optionalDeps, { settled: true }))
            .then(() => resolveMaybe(afterOptional).then((value) => Object.assign(context, asContext(value))))
            .then(() => Promise.resolve(run(root, context)).then(() => true))
            .catch((err) => {
                if (typeof onError === 'function') onError(root, err);
                else UI.showError(root, translate('errors.loading_dependencies', {}, 'Error cargando dependencias.'));
                return false;
            });
    },
    showError: (container, message) => {
        container.innerHTML = `<div class="glass-card card"><p class="text-status--danger">${message}</p></div>`;
    },
    getStatusClassFromCode: (status) => STATUS_CLASSES[status] || '',
    showModal: ({ id = null, titleHtml = '', bodyHtml = '' } = {}) => {
        (id ? document.getElementById(id) : document.querySelector('.modal-overlay'))?.remove();
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        if (id) overlay.id = id;
        overlay.innerHTML = `<div class="modal-content">${titleHtml}${bodyHtml}</div>`;
        const close = () => {
            document.removeEventListener('keydown', onKey);
            overlay.remove();
        };
        const onKey = (event) => event.key === 'Escape' && close();
        overlay.addEventListener('click', close);
        document.addEventListener('keydown', onKey);
        document.body.appendChild(overlay);
        return overlay;
    },
    getTodayIndex: () => DateUtils.getTodayIndex(),
    scrollToTodayColumn: (table, todayIndex) => {
        if (!table?.parentElement) return;
        const [stickyTh, targetTh] = [table.querySelector('thead th'), table.querySelectorAll('thead th')[todayIndex + 1]];
        if (!stickyTh || !targetTh) return;
        table.parentElement.scrollTo({ left: targetTh.offsetLeft - stickyTh.offsetWidth, behavior: 'smooth' });
    },
    formatLabel: (value) => value ? String(value).replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()) : '-',
    formatNumber: (value, decimals = 1) => (Number.isFinite(value) ? value : 0).toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1'),
    formatInt: (value) => `${Math.round(Number.parseFloat(value) || 0)}`,
    formatKcal: (value) => `${UI.formatInt(value)} kcal`,
    formatMl: (value) => `${UI.formatInt(value)} ml`,
    formatGrams: (value, decimals = 0) => `${UI.formatNumber(Number.parseFloat(value) || 0, decimals)} g`,
    formatScore: (value, decimals = 1, max = 10) => `${UI.formatNumber(Number.parseFloat(value) || 0, decimals)}/${max}`,
    escapeHtml: (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;'),
    encodePayload: (payload) => encodeURIComponent(JSON.stringify(payload || {})),
    decodePayload: (encodedPayload) => {
        try { return JSON.parse(decodeURIComponent(encodedPayload || '')); } catch { return null; }
    },
    formatMinutes: (minutes) => `${Math.round(minutes * 10) / 10}`,
    formatKm: (km) => {
        const value = parseFloat(km);
        if (!Number.isFinite(value) || value <= 0) return '-';
        const rounded = Math.round(value * 10) / 10;
        return rounded % 1 === 0 ? rounded.toFixed(0) : rounded.toFixed(1);
    },
    getLocaleOptionsHtml: (selectedLocale = window.I18n?.getLocale?.() || 'es') => (window.I18n?.getLocales?.() || [])
        .map(({ code, label }) => `<option value="${UI.escapeHtml(code)}"${code === selectedLocale ? ' selected' : ''}>${UI.escapeHtml(label)}</option>`)
        .join(''),
    bindLocaleSelect: (root = document) => {
        const nodes = root?.querySelectorAll
            ? [...(root.matches?.('select[data-role="locale-select"]') ? [root] : []), ...root.querySelectorAll('select[data-role="locale-select"]')]
            : [];
        nodes.forEach((select) => {
            if (select.dataset.localeBound === '1') return;
            select.dataset.localeBound = '1';
            select.innerHTML = UI.getLocaleOptionsHtml();
            select.value = window.I18n?.getLocale?.() || 'es';
            select.addEventListener('change', () => {
                if (window.I18n?.setLocale?.(select.value)) window.location.reload();
            });
        });
    },
    renderEditResetControls: ({ id, isEditMode, onToggle, onReset }) => {
        const controls = document.createElement('div');
        controls.id = id;
        controls.className = 'menu-controls';
        [
            { text: isEditMode ? translate('common.done', {}, 'Listo') : translate('common.edit', {}, 'Editar'), active: isEditMode, action: onToggle },
            { text: translate('common.reset', {}, 'Reset'), action: onReset }
        ].forEach(({ text, active = false, action }) => {
            const button = document.createElement('button');
            button.className = 'btn-back';
            button.textContent = text;
            button.classList.toggle('btn-back--active', active);
            button.onclick = action;
            controls.appendChild(button);
        });
        return controls;
    }
};

window.UI = UI;
