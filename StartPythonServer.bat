@echo off
cd /d "%~dp0"

:: Obtener línea IPv4 que contenga 192.168.1.
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr "IPv4" ^| findstr "192.168.1."') do set IP=%%a
set IP=%IP:~1%

cls
echo ============================================
echo        SERVIDOR HTTP PYTHON ACTIVO
echo ============================================
echo.
echo   Acceso local:
echo   http://localhost:8000
echo.
echo   Acceso en red:
echo   http://%IP%:8000/index.html
echo.
echo   Presiona Ctrl+C para detener
echo ============================================
echo.
python -m http.server 8000 --bind 0.0.0.0
pause