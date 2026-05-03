# Catalog CSV Utility

Utilidad externa para sacar los catalogos actuales a CSV, validarlos y regenerar los modulos JS desde esos CSV.

## Ubicacion

- CLI: `tests/catalog-csv/cli.js`
- CSV por defecto: `tests/catalog-csv/data/`
- JS regenerado por defecto: `tests/catalog-csv/generated-app/`

## Comandos

```bash
node tests/catalog-csv/cli.js export
node tests/catalog-csv/cli.js validate
node tests/catalog-csv/cli.js import
```

Con `npm`:

```bash
npm run catalog:csv -- export
npm run catalog:csv -- validate
npm run catalog:csv -- import
```

## Modos de uso

- `export`: lee `js/catalog/...` y genera los CSV.
- `validate`: comprueba ids unicos, referencias entre catalogos y macros de perfiles.
- `import`: regenera `js/catalog/...` dentro de una carpeta de salida.

## Flujo con Excel

Si, el flujo pensado es:

1. Exportar los CSV con `node tests/catalog-csv/cli.js export`
2. Abrir en Excel el CSV que quieras editar
3. Guardarlo otra vez como CSV
4. Ejecutar `validate`
5. Ejecutar `import`

La utilidad ya acepta tambien el CSV tipico de Excel con `;` como separador y con BOM UTF-8, para que ese camino inverso sea mas tolerante.
Ademas, la exportacion sale ya en formato amigable para Excel: separador `;` y coma decimal en los numeros.

Consejos:

- No cambies los nombres de columna de la primera fila.
- No borres columnas aunque no las uses.
- Mantén los `id` estables.
- En menús, rutinas y perfiles, respeta las columnas de orden como `blockIndex`, `itemIndex` y `dayKey`.

## Sobrescribir el catalogo real

Por defecto la importacion escribe en `tests/catalog-csv/generated-app/` para trabajar con seguridad.

Si quieres regenerar el proyecto real:

```bash
node tests/catalog-csv/cli.js import --targetRoot=. --clean=true
```

Conviene ejecutar antes:

```bash
node tests/catalog-csv/cli.js export
node tests/catalog-csv/cli.js validate
```

## CSV incluidos

- `foods.csv`
- `exercises.csv`
- `menus.csv`
- `menu_items.csv`
- `routines.csv`
- `routine_items.csv`
- `profiles.csv`
- `profile_weekly_plan.csv`

## Nota sobre `routines.csv`

`routines.csv` contiene solo la cabecera de cada rutina.
Los items de actividad viven en `routine_items.csv`.

## Nota sobre perfiles

`profiles.csv` y `profile_weekly_plan.csv` incluyen las columnas secundarias
completas (`saltMaxG`, `fiberPer1000Kcal`, azucar, grasa saturada,
procesamiento, `hydrationMlPerKg` y `hydrationActivityMlPerMin`).
`secondaryPresetKey` se conserva como etiqueta de agrupacion, pero al importar
se usan los valores explicitos de esas columnas.

## Nota sobre `routine_items.csv`

- Cada fila representa un item de la rutina.
- `sectionKey` indica el bloque (`walking`, `gym`, `extra` o uno custom).
- `itemIndex`: orden del item dentro de su bloque
- `metric` indica como presentar la prescripcion: `steps`, `duration` o `strength`
- En `steps`, `min` es el unico numero de pasos; las kcal se calculan internamente como duracion usando `cadencePerMin`.

La idea es que el CSV refleje el modelo real de actividad sin asumir que una seccion concreta implique un tipo fijo de prescripcion.

## Nota sobre `sourceFile`

En `menus.csv`, `routines.csv` y `profiles.csv` hay una columna `sourceFile`.
Sirve para conservar el nombre del archivo JS que se generara para cada plantilla o preset.
