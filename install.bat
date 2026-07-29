@echo off
:: Solicitud de permisos de Administrador si no se ejecuta como Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Solicitando permisos de Administrador...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

title Instalar FrostFlow Retoucher Plugin para Photoshop
echo ========================================================
echo   Instalando FrostFlow Retoucher Plugin (v0.0.1)
echo   Photo Studio JM LLC
echo ========================================================
echo.

set "SOURCE_DIR=%~dp0"
set "TARGET_DIR1=C:\Program Files\Common Files\Adobe\UXP\Plugins\External\FrostflowPlugin"
set "TARGET_DIR2=C:\Program Files\Common Files\Adobe\UXP\Plugins\External\PS\FrostflowPlugin"

if not exist "%TARGET_DIR1%" mkdir "%TARGET_DIR1%"
if not exist "%TARGET_DIR2%" mkdir "%TARGET_DIR2%"

echo Copiando archivos del plugin a directorios UXP...
copy /Y "%SOURCE_DIR%manifest.json" "%TARGET_DIR1%\" >nul
copy /Y "%SOURCE_DIR%index.html" "%TARGET_DIR1%\" >nul
copy /Y "%SOURCE_DIR%main.js" "%TARGET_DIR1%\" >nul
copy /Y "%SOURCE_DIR%styles.css" "%TARGET_DIR1%\" >nul
if exist "%SOURCE_DIR%logo_white.png" copy /Y "%SOURCE_DIR%logo_white.png" "%TARGET_DIR1%\" >nul
if exist "%SOURCE_DIR%README.md" copy /Y "%SOURCE_DIR%README.md" "%TARGET_DIR1%\" >nul

copy /Y "%SOURCE_DIR%manifest.json" "%TARGET_DIR2%\" >nul
copy /Y "%SOURCE_DIR%index.html" "%TARGET_DIR2%\" >nul
copy /Y "%SOURCE_DIR%main.js" "%TARGET_DIR2%\" >nul
copy /Y "%SOURCE_DIR%styles.css" "%TARGET_DIR2%\" >nul
if exist "%SOURCE_DIR%logo_white.png" copy /Y "%SOURCE_DIR%logo_white.png" "%TARGET_DIR2%\" >nul
if exist "%SOURCE_DIR%README.md" copy /Y "%SOURCE_DIR%README.md" "%TARGET_DIR2%\" >nul

echo.
echo ========================================================
echo   ¡Instalacion completada con exito!
echo.
echo   Pasos siguientes:
echo   1. Abre o reinicia Adobe Photoshop.
echo   2. Ve al menu superior: Plugins -> Plugins Panel
echo      (o Plugins -> FrostFlow Tareas)
echo ========================================================
echo.
pause
