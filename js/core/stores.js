/* =========================================
   core/stores.js - DATOS COMPARTIDOS
   ========================================= */

const ActivityStore = {
    getWeeklyPlan: () => DB.get('user_activity_plan', Array(7).fill('descanso')),
    saveWeeklyPlan: (plan) => DB.save('user_activity_plan', plan)
};

const MenuStore = {
    getSelectedFile: () => DB.get('selected_menu_file', 'menus/menu.js'),
    setSelectedFile: (file) => DB.save('selected_menu_file', file),
    getSavedMenuData: (file) => DB.get(`menu_data_${file}`, null),
    saveMenuData: (file, data) => DB.save(`menu_data_${file}`, data),
    clearSavedMenuData: (file) => localStorage.removeItem(APP_PREFIX + `menu_data_${file}`)
};

window.ActivityStore = ActivityStore;
window.MenuStore = MenuStore;
