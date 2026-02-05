# gymjan 💪🥷🥩

**gymjan** es una prueba de concepto de una aplicación web progresiva (PWA) diseñada para la gestión personal de nutrición, entrenamiento y seguimiento físico. Construida con tecnologías web estándar (Vanilla JS, CSS3), ofrece una interfaz moderna con estilo "Glassmorphism" y funciona completamente en el navegador utilizando almacenamiento local.

## ✨ Características Principales

### 🍽️ Gestión de Menús
*   **Visualización Semanal:** Muestra desayunos, comidas y cenas para toda la semana.
*   **Cálculo de Macros:** Calcula automáticamente calorías, proteínas, carbohidratos y grasas por comida y totales diarios.
*   **Edición Dinámica:** Permite ajustar las cantidades de los alimentos directamente en la tabla y recalcula los valores nutricionales al instante.
*   **Múltiples Menús:** Soporte para cambiar entre diferentes archivos de datos de menús (ej. `menu.js`, `menu_1.js`).

### 🛒 Lista de la Compra Inteligente
*   **Generación Automática:** Crea una lista de la compra basada en el menú seleccionado.
*   **Agrupación por Categorías:** Organiza los ítems (Verduras, Proteínas, Lácteos, etc.) para facilitar la compra.
*   **Consolidación:** Suma las cantidades de ingredientes repetidos durante la semana.

### 🧮 Calculadora Nutricional y Ajustes
*   **Perfil de Usuario:** Configuración de edad, peso, altura y sexo.
*   **Cálculos Base:** Estimación de TMB (Tasa Metabólica Basal) e IMC.
*   **Objetivos Personalizados:** Permite aplicar ajustes porcentuales (superávit/déficit) a las calorías y macronutrientes base.
*   **Planificación Semanal:** Define objetivos calóricos específicos según el tipo de actividad de cada día.

### 🏃 Planificación de Actividad
*   **Rutinas Diarias:** Asignación de tipos de actividad (Descanso, Fuerza, Cardio, Híbrido) para cada día de la semana.
*   **Estimación de Gasto:** Calcula el gasto calórico extra basado en la actividad seleccionada.
*   **Catálogo de Rutinas:** Muestra descripciones y sugerencias de ejercicios para la actividad elegida.

### ⚖️ Control de Peso
*   **Registro Histórico:** Guarda el peso corporal con fecha.
*   **Visualización Gráfica:** Gráfico de línea para ver la evolución del peso a lo largo del tiempo.
*   **Sincronización:** Actualiza automáticamente el peso en el perfil de usuario para recalcular las necesidades calóricas.

## 🛠️ Tecnologías y Arquitectura

El proyecto no utiliza frameworks pesados, optando por un enfoque ligero y rápido:

*   **HTML5 & CSS3:** Uso extensivo de **CSS Variables** y **Flexbox/Grid**. Diseño visual basado en *Glassmorphism* (transparencias y desenfoques).
*   **JavaScript (ES6+):**
    *   **Carga Dinámica:** Los módulos de datos y lógica se cargan bajo demanda (`loadScript`).
    *   **Persistencia:** Uso de `localStorage` para guardar preferencias, historial de peso y ediciones del menú.
    *   **Sin dependencias externas:** No requiere npm ni bundlers para ejecutarse.

## 📂 Estructura del Proyecto

```text
gymjan/
├── assets/
│   ├── icon-192.png
│   └── icon-512.png
├── css/
│   ├── app.css            # Variables globales, reset y tipografía
│   └── components.css     # Estilos de UI (Tarjetas, Botones, Tablas, Inputs)
├── js/
│   ├── app.js             # Bootstrap de la app
│   ├── core/              # Utilidades y lógica base
│   │   ├── config.js
│   │   ├── date.js
│   │   ├── formulas.js
│   │   ├── menu.js
│   │   ├── pwa.js
│   │   ├── storage.js
│   │   ├── stores.js
│   │   ├── targets.js
│   │   └── ui.js
│   ├── data/              # Datos de dominio
│   │   ├── actividad.js
│   │   ├── calculadora.js
│   │   ├── foods.js
│   │   ├── menu.js
│   │   ├── menu_1.js
│   │   └── targets.js
│   └── pages/             # Controladores de vistas
│       ├── actividad.page.js
│       ├── calculadora.page.js
│       ├── control.page.js
│       ├── lista.page.js
│       └── menu.page.js
├── views/                 # Vistas HTML parciales
│   ├── actividad.html
│   ├── calculadora.html
│   ├── control.html
│   ├── lista.html
│   └── menu.html
├── index.html             # Punto de entrada
├── manifest.json          # Manifest PWA
├── sw.js                  # Service Worker
└── StartPythonServer.bat  # Servidor local rápido
```

## 🚀 Uso

Al ser una aplicación estática, no requiere instalación de dependencias de backend.

Abre la url provista por github pages: https://oscanton.github.io/gymjan/

Se puede utilizar directamente online, sin registros, utilizando localstorage. También puede ser instalada como PWA desde navegadores en Android

## ⚙️ Configuración

### Añadir un nuevo menú
1.  Crea un archivo nuevo en `js/data/` (ej. `menu_verano.js`).
2.  Define la estructura `window.MENU_DATA = [...]` siguiendo el formato de `menu.js`.
3.  Registra el archivo en `js/core/config.js`:
    ```javascript
    const AVAILABLE_MENUS = [
        { label: 'Menú Base', file: 'menu.js' },
        { label: 'Menú Verano', file: 'menu_verano.js' },
    ];
    ```

### Personalizar Alimentos
Para que la lista de la compra y los cálculos funcionen correctamente, asegúrate de que los `foodId` usados en los menús existan en `js/data/foods.js`.

## 🎨 Estilos

El sistema de diseño se controla mediante variables CSS en `css/app.css`. Puedes cambiar el tema de color modificando:

```css
:root {
    --color-primary-rgb: 255, 209, 102; /* Color principal */
    --color-bg-gradient: ...;           /* Fondo */
}
```

---
*Proyecto personal de salud y bienestar.*