/* =========================================
   app.js - BOOTSTRAP (Inicialización)
   ========================================= */

window.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('menu-body')) renderMenuPage();
    if (document.getElementById('lista-container')) renderShoppingListPage();
    if (document.getElementById('actividad-container')) renderActivityPage();
    if (document.getElementById('control-container')) renderControlPage();
    if (document.getElementById('calculadora-container')) renderCalculatorPage();
});
