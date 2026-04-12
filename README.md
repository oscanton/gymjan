# gymjan

`gymjan` es una PWA mobile-first para planificar alimentacion, actividad semanal y objetivos diarios sin dependencias de build. El proyecto esta hecho con HTML, CSS y JavaScript vanilla, usa `localStorage` para persistencia y mantiene soporte de internacionalizacion en espanol e ingles.

## Estado del proyecto

Ahora mismo la app incluye:

- `Calculadora`: IMC, BMR, objetivos de kcal, macros, hidratacion y limites secundarios.
- `Actividad`: plan semanal editable con pasos, gimnasio y actividad extra.
- `Menu`: menu semanal editable con calculo nutricional y comparativa contra objetivos.
- `Lista`: lista de la compra generada desde el menu, agrupada por categorias y con checks persistentes.
- `I18n`: interfaz y contenido en `es` y `en`.
- `PWA`: `manifest.json`, `sw.js` y soporte offline en entorno compatible.

## Stack y enfoque

- HTML multipagina simple (`index.html` + `views/`)
- CSS propio en `css/`
- JavaScript vanilla en `js/`
- Persistencia local con `localStorage`
- Sin `npm`, sin bundler y sin framework

## Estructura principal

```text
.
|-- index.html
|-- views/                  # vistas principales
|-- css/                    # estilos globales y componentes
|-- js/
|   |-- app.js              # bootstrap y navegacion comun
|   |-- pages/              # logica de cada pagina
|   |-- core/
|   |   |-- engine/         # calculo y logica de dominio
|   |   |-- application/    # servicios de aplicacion
|   |   |-- adapters/       # acceso a browser, datos y persistencia
|   |   |-- presentation/   # presenters de UI
|   |   `-- i18n/           # registro y servicio de traducciones
|   |-- data/               # catalogos y planes semanales base
|   `-- i18n/content/       # nombres y descripciones traducibles
|-- assets/                 # iconos y recursos estaticos
|-- manifest.json
|-- sw.js
`-- .docs/                  # especificaciones, planes y guias internas
```

## Como ejecutar la app

La app puede abrirse en navegador, pero para PWA y `service worker` conviene usar un servidor local.

### Opcion recomendada

```bash
python -m http.server 8000
```

Despues abre:

- `http://localhost:8000`

### Opcion rapida en Windows

Tambien puedes usar:

- `StartPythonServer.bat`

Ese script arranca el servidor en el puerto `8000` y muestra la URL local y la de red.

## Navegacion principal

- `index.html`: indice y selector de idioma
- `views/calculator.html`: calculadora y objetivos
- `views/activity.html`: plan semanal de actividad
- `views/menu.html`: menu semanal
- `views/list.html`: lista de la compra

La app recuerda la ultima pagina abierta y guarda datos del usuario y ediciones en `localStorage`.

## Datos y persistencia

- Los catalogos base viven en `js/data/`
- Los textos localizados viven en `js/i18n/` y `js/i18n/content/`
- La persistencia del usuario se apoya en claves con prefijo `myfitpwa_`


## Notas importantes

- El codigo usa nombres tecnicos en ingles.
- La UI visible esta pensada para ser traducible.
- No hay pipeline de build ni suite de tests automatizados configurada en este repo.
- El proyecto esta en proceso de ordenacion del core; por eso conviven codigo actual y rebuild.
