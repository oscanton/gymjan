$ErrorActionPreference = "Stop"
$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$src = Join-Path $base 'js/core/config.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/core/config.js' -Force }
$src = Join-Path $base 'js/core/formulas.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/core/formulas.js' -Force }
$src = Join-Path $base 'js/core/stores.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/core/stores.js' -Force }
$src = Join-Path $base 'js/core/targets.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/core/targets.js' -Force }
$src = Join-Path $base 'js/pages/calculadora.page.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/pages/calculadora.page.js' -Force }
$src = Join-Path $base 'js/pages/actividad.page.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/pages/actividad.page.js' -Force }
$src = Join-Path $base 'js/pages/menu.page.js'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'js/pages/menu.page.js' -Force }
$src = Join-Path $base 'css/components.css'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'css/components.css' -Force }
$src = Join-Path $base 'views/calculadora.html'
if (Test-Path $src) { Copy-Item -Path $src -Destination 'views/calculadora.html' -Force }
Write-Host "Restore completado."
