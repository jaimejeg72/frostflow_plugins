@echo off
title Instalar FrostFlow Retoucher Plugin para Photoshop
echo ========================================================
echo   Instalando FrostFlow Retoucher Plugin (v0.0.1)
echo   Photo Studio JM LLC
echo ========================================================
echo.

set TARGET_DIR=C:\Program Files\Common Files\Adobe\UXP\Plugins\External\FrostflowPlugin

if not exist "%TARGET_DIR%" (
    echo Creando directorio de destino:
    echo %TARGET_DIR%
    mkdir "%TARGET_DIR%"
)

echo Copiando archivos del plugin...
xcopy /E /Y /I "%~dp0manifest.json" "%TARGET_DIR%\"
xcopy /E /Y /I "%~dp0index.html" "%TARGET_DIR%\"
xcopy /E /Y /I "%~dp0main.js" "%TARGET_DIR%\"
xcopy /E /Y /I "%~dp0styles.css" "%TARGET_DIR%\"
if exist "%~dp0logo_white.png" xcopy /E /Y /I "%~dp0logo_white.png" "%TARGET_DIR%\"

echo.
echo ========================================================
echo   ¡Instalacion completada con exito!
echo.
echo   Pasos siguientes:
echo   1. Abre o reinicia Adobe Photoshop.
echo   2. Ve al menu superior: Plugins -> FrostFlow Tareas.
echo ========================================================
echo.
pause
