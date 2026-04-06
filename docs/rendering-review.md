# Revisión de renderizado de páginas

## Alcance
- `js/app.js`
- `js/pages/menu.page.js`
- `js/pages/activity.page.js`
- `js/pages/list.page.js`
- `js/pages/tracking.page.js`
- `js/pages/calculator.page.js`

## Hallazgos por similitud (candidatos a reutilización)

1. **Tarjetas de resumen con patrón `glass-card card` + `h2` + grid/pills**
   - Se repite en `tracking`, `calculator`, `menu` y `list`.
   - Recomendación: componente render helper en `UI` para crear tarjeta con `title`, `body` y variantes (`mt-lg`, `section-group`).

2. **Render de indicadores tipo “pill” (`stat-pill`)**
   - Misma semántica visual para kcal/macros/métricas en `menu`, `activity` y `calculator`.
   - Recomendación: factorizar funciones de composición HTML de pills en una utilidad compartida (`UI.renderPill`, `UI.renderPillRow`).

3. **Controles de reset/edición al pie de página**
   - Patrón común entre `menu`, `activity` y `list`.
   - Recomendación: estandarizar un “toolbar factory” (parte ya cubierta por `UI.renderEditResetControls`, ampliar para caso `list`).

4. **Carga defensiva de dependencias antes de renderizar**
   - Aparece en todas las páginas con pequeñas variaciones.
   - Recomendación: usar `UI.bootstrapPage` de forma consistente para reducir bloques `then/catch` repetidos.

## Elementos no utilizados o con bajo aprovechamiento

1. **Múltiples listeners por fila en historial de peso (tracking)**
   - Antes: un listener por botón borrado por cada render.
   - Ahora: delegación de eventos en contenedor (1 listener estable).

2. **Mapa de actividades duplicado (tracking)**
   - Antes: opciones de select y etiquetas estaban duplicadas.
   - Ahora: fuente única (`ACTIVITY_TYPE_OPTIONS` + `ACTIVITY_TYPE_LABELS`).

3. **Normalización de cantidades embebida en bucle (list)**
   - Antes: conversión g→kg / ml→L repetida inline.
   - Ahora: helper `normalizeShoppingAmount` centralizado.

4. **Orden/categorías de compra recreadas en cada render (list)**
   - Antes: constante local dentro de `calculateAndRenderList`.
   - Ahora: constantes de módulo para evitar recreación y mejorar legibilidad.

## Impacto esperado
- Menos trabajo del GC/JS engine por render.
- Menor complejidad ciclomática en funciones largas.
- Menos riesgo de inconsistencias visuales/funcionales al tocar labels u opciones repetidas.
- Mejor base para extraer componentes de render reutilizables.
