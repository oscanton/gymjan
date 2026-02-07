/* =========================================
   core/config.js - CONFIGURACIÓN GLOBAL
   ========================================= */

// Prefijo para las claves de LocalStorage, para evitar colisiones.
const APP_PREFIX = "myfitpwa_";

// Constantes Globales (Fuente única de verdad)
const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Configuración de archivos de menú disponibles
// NOTA: Para añadir más menús, crea el archivo en js/data/ y regístralo aquí.
// Importante: El archivo nuevo debe empezar con window.MENU_DATA = [...]
const AVAILABLE_MENUS = [
    { label: 'menu', file: 'menus/menu.js' },
    { label: 'menu_1', file: 'menus/menu_1.js' },
];

// Archivos de rutinas disponibles (js/data/)
const AVAILABLE_RUTINAS = [
    'rutinas/rutina_descanso.js',
    'rutinas/rutina_fuerza_A.js',
];

const DEFAULT_RUTINA_ID = 'descanso';
