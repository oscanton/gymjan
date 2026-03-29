# gymjan

Aplicación PWA simple en Vanilla Code con estilo Glassmorphism. Funciona en navegador con almacenamiento persistente (LocalStorage), enfocada en Mobile First pero usable en pantallas anchas.

## Qué incluye
- Calculadora: IMC y BMR, objetivos calóricos y de macros según plan semanal. Perfil y ajustes persistentes.
- Actividad: planificador semanal de rutinas con ejercicios, pesos y series editables. Persistencia por día.
- Menú: menú semanal con cálculo de macros por comida y totales diarios. Comparativa con objetivos.
- Lista: lista de la compra generada desde el menú, agrupada por categorías con checks persistentes.
- Control: registro de peso con historial, actividad del día y gráfica simple en canvas.

## Estructura del proyecto
- `index.html` y `views/`: estructura y páginas principales.
- `js/app.js`: bootstrap e inicialización de vistas.
- `js/core/`: lógica compartida (configuración, cálculos, almacenamiento, UI).
- `js/pages/`: lógica específica de cada vista.
- `js/data/`: datos estáticos (alimentos, menús, rutinas).
- `css/app.css` y `css/components.css`: estilos globales y componentes.
- `manifest.json` y `sw.js`: configuración PWA y Service Worker.

## Ejecución local
Puedes abrir `index.html` directamente o levantar un servidor estático simple.

Ejemplo con Python:
```bash
python -m http.server
```

## Directrices del proyecto
Lee `PROJECT_GUIDELINES.md` para criterios de estilo, estructura y convenciones.

## Notas de coherencia
- Código y nombres en inglés; textos de UI en español.
- Evitar mojibake y mantener consistencia tipográfica.
- Priorizar eficiencia, orden y claridad sin sobrecomentar.
