/* =========================================
   core/config.js - CONFIGURACIÓN GLOBAL
   ========================================= */

// Prefijo para las claves de LocalStorage, para evitar colisiones.
const APP_PREFIX = "gymjan_";

// Constantes Globales (Fuente única de verdad)
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Configuración de archivos de menú disponibles
// NOTA: Para añadir más menús, crea el archivo en js/data/ y regístralo aquí.
// Importante: El archivo nuevo debe empezar con window.MENU_DATA = [...]
const AVAILABLE_MENUS = [
    { label: 'menu', file: 'menu.js' },
    { label: 'menu_1', file: 'menu_1.js' },
];
