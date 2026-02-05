/* =========================================
   core/date.js - UTILIDADES DE FECHAS
   ========================================= */

const DateUtils = {
    toISODate: (date = new Date()) => date.toISOString().split('T')[0],

    normalizeISODate: (dateStr = '') => {
        if (!dateStr) return '';
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    },

    // Lunes=0 ... Domingo=6
    getTodayIndex: (date = new Date()) => (date.getDay() + 6) % 7,

    toShortDate: (isoDate = '') => {
        if (!isoDate.includes('-')) return isoDate;
        const [y, m, d] = isoDate.split('-');
        return `${d}/${m}/${y.slice(2)}`;
    }
};

window.DateUtils = DateUtils;
