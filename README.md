# gymjan

Prueba de concepto de una PWA con **LocalStorage** para persistir datos del usuario. Se puede usar e instalar directamente desde la URL de GitHub Pages:

`http://oscanton.github.io/gymjan`

**Qué incluye**
- **Calculadora**: calcula IMC y BMR, define objetivos calóricos y de macros por día según el plan semanal de actividad. Guarda perfil y ajustes en LocalStorage.
- **Actividad**: planificador semanal de rutinas con ejercicios, pesos y series editables. Muestra kcal y detalle de técnica. Guarda cambios por día en LocalStorage.
- **Menú**: menú semanal (desayuno/comida/cena) con cálculo de macros por comida y totales diarios. Permite editar cantidades y compara contra objetivos. Persiste en LocalStorage.
- **Lista**: genera la lista de la compra desde el menú seleccionado, agrupada por categorías y con checkboxes persistentes.
- **Control**: registro de peso con historial, actividad del día y gráfica simple en canvas. Todo queda guardado localmente.

**Cómo está organizado**
- `index.html` y `views/`: páginas principales de la app.
- `js/app.js`: bootstrap que inicializa cada página.
- `js/core/`: lógica compartida (configuración, cálculos, almacenamiento, UI, rutinas).
- `js/pages/`: lógica específica de cada vista.
- `js/data/`: datos estáticos de alimentos, menús y rutinas.

**PWA**
- `manifest.json`: configuración de instalación.
- `sw.js`: Service Worker que cachea los recursos para uso offline.

**Flujo de objetivos semanales (Mermaid)**
```mermaid
flowchart TD
  A["Input perfil: sexo, edad, altura, peso"] --> B["BMR = round 10*peso + 6.25*altura - 5*edad + sexo"]
  A --> C["IMC = peso / altura_m2, 1 decimal"]

  B --> D["restKcal = BMR * 1.2"]
  E["Input plan semanal: rutina por dia"] --> F["RoutineId -> activityKey"]
  F --> G["activityKcal = calcRoutineTotals con peso de perfil"]
  D --> H{"activityKcal disponible"}
  G --> H
  H -- "si" --> I["TDEE = restKcal + activityKcal"]
  H -- "no" --> J["TDEE = BMR * ACTIVITY_MULTIPLIER"]

  I --> K["targetKcal = TDEE * 1 + adjKcal"]
  J --> K

  K --> L["Macros base por ratio: P C G"]
  L --> M["Ajustes porcentuales: P C G finales"]
  M --> N["Kcal final = P*4 + C*4 + G*9"]
  N --> O["Guardar daily_nutrition_targets"]

  P["Input menu semanal"] --> Q["Calculo item alimento"]
  R["FOODS: nutritionPer100 o nutritionPerUnit"] --> Q
  Q --> S{"tipo nutricion"}
  S -- "per100" --> T["ratio = amount / 100"]
  S -- "perUnit" --> U["ratio = amount"]
  T --> V["sumar kcal protein carbs fat"]
  U --> V
  V --> W["Total dia ingesta"]

  O --> X["Comparativa objetivo vs ingesta"]
  W --> X
  X --> Y["Status: menor 90 warning, 90 a 110 ok, mayor 110 danger"]

```

