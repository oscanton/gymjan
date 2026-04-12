/* =========================================
   core/date.js - DATE UTILITIES
   ========================================= */

const DateUtils = (() => {
    const DAY_KEYS = Array.isArray(typeof WEEK_DAY_KEYS !== 'undefined' ? WEEK_DAY_KEYS : null)
        ? WEEK_DAY_KEYS.slice()
        : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const DAY_ALIASES = {
        monday: 'monday',
        lunes: 'monday',
        tuesday: 'tuesday',
        martes: 'tuesday',
        wednesday: 'wednesday',
        miercoles: 'wednesday',
        wendsday: 'wednesday',
        thursday: 'thursday',
        jueves: 'thursday',
        friday: 'friday',
        viernes: 'friday',
        saturday: 'saturday',
        sabado: 'saturday',
        sunday: 'sunday',
        domingo: 'sunday'
    };
    const fallbackLabels = {
        monday: 'Monday',
        tuesday: 'Tuesday',
        wednesday: 'Wednesday',
        thursday: 'Thursday',
        friday: 'Friday',
        saturday: 'Saturday',
        sunday: 'Sunday'
    };
    const normalizePlainKey = (value = '') => String(value || '')
        .trim()
        .toLowerCase()
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â©|ÃƒÆ’Ã‚Â£Ãƒâ€šÃ‚Â©|ÃƒÆ’Ã‚Â©|ÃƒÆ’Ã‚Â©|ÃƒÂ£Ã‚Â©|ÃƒÂ©/g, 'e')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¡|ÃƒÆ’Ã‚Â£Ãƒâ€šÃ‚Â¡|ÃƒÆ’Ã‚Â¡|ÃƒÆ’Ã‚Â¡|ÃƒÂ£Ã‚Â¡|ÃƒÂ¡/g, 'a')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â­|ÃƒÆ’Ã‚Â£Ãƒâ€šÃ‚Â­|ÃƒÆ’Ã‚Â­|ÃƒÆ’Ã‚Â­|ÃƒÂ£Ã‚Â­|ÃƒÂ­/g, 'i')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â³|ÃƒÆ’Ã‚Â£Ãƒâ€šÃ‚Â³|ÃƒÆ’Ã‚Â³|ÃƒÆ’Ã‚Â³|ÃƒÂ£Ã‚Â³|ÃƒÂ³/g, 'o')
        .replace(/ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Âº|ÃƒÆ’Ã‚Â£Ãƒâ€šÃ‚Âº|ÃƒÆ’Ã‚Âº|ÃƒÆ’Ã‚Âº|ÃƒÂ£Ã‚Âº|ÃƒÂº/g, 'u')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z]/g, '');
    const translate = (key, fallback = '') => window.I18n?.t?.(key, {}, fallback) || fallback;
    const toTitle = (value = '') => String(value || '')
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());

    return {
        toISODate: (date = new Date()) => date.toISOString().split('T')[0],
        normalizeISODate: (dateStr = '') => {
            if (!dateStr) return '';
            return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
        },
        // Monday=0 ... Sunday=6
        getTodayIndex: (date = new Date()) => (date.getDay() + 6) % 7,
        normalizeDayKey: (value = '') => {
            const raw = String(value || '').trim();
            if (!raw) return raw;
            const direct = DAY_KEYS.includes(raw) ? raw : null;
            if (direct) return direct;
            const normalized = normalizePlainKey(raw);
            return DAY_ALIASES[normalized] || raw;
        },
        normalizeDayName: (value = '') => {
            const raw = String(value || '').trim();
            if (!raw) return raw;
            return DateUtils.normalizeDayKey(raw);
        },
        getWeekDayKey: (index = -1) => DAY_KEYS[index] || '',
        getWeekDayLabel: (value = '', fallback = '') => {
            const key = DateUtils.normalizeDayKey(value);
            if (!key) return fallback || '';
            return translate(`weekDays.${key}`, fallbackLabels[key] || fallback || toTitle(key));
        },
        getWeekDayLabels: (values = DAY_KEYS) => (Array.isArray(values) ? values : DAY_KEYS).map((value) => DateUtils.getWeekDayLabel(value)),
        toShortDate: (isoDate = '') => {
            if (!isoDate.includes('-')) return isoDate;
            const [y, m, d] = isoDate.split('-');
            return `${d}/${m}/${y.slice(2)}`;
        }
    };
})();

window.DateUtils = DateUtils;
