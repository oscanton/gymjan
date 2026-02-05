/* =========================================
   core/menu.js - HELPERS DEL MENÚ
   ========================================= */

const MenuUtils = {
    getActiveMealByHour: (hour = new Date().getHours()) => {
        if (hour >= 6 && hour < 12) return 'desayuno';
        if (hour >= 12 && hour < 18) return 'comida';
        if (hour >= 18) return 'cena';
        return null;
    },

    calcMealMacros: (items) => Formulas.calculateMeal(items),

    calcDayTotals: (dayData) => {
        const totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        if (!dayData) return totals;
        ['desayuno', 'comida', 'cena'].forEach((mk) => {
            const n = Formulas.calculateMeal(dayData[mk]?.items || []);
            totals.kcal += n.kcal;
            totals.protein += n.protein;
            totals.carbs += n.carbs;
            totals.fat += n.fat;
        });
        return totals;
    },

    calcWeekTotals: (menuData) => {
        if (!Array.isArray(menuData)) return [];
        return menuData.map((day) => MenuUtils.calcDayTotals(day));
    },

    scrollToToday: (table, todayIndex) => {
        if (!table || !table.parentElement) return;
        const scroller = table.parentElement;
        const targetTh = table.querySelectorAll('thead th')[todayIndex + 1];
        const stickyTh = table.querySelector('thead th');

        if (targetTh && stickyTh) {
            const scrollLeft = targetTh.offsetLeft - stickyTh.offsetWidth;
            scroller.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }
};

window.MenuUtils = MenuUtils;
