@echo off
echo ====================================================
echo  Generando instalador .ccx para FrostFlow UXP...
echo ====================================================

set OUTPUT_FILE=FrostFlow_Retoucher_v0.0.1.ccx
set TEMP_ZIP=temp_package.zip

if exist "%OUTPUT_FILE%" del "%OUTPUT_FILE%"
if exist "%TEMP_ZIP%" del "%TEMP_ZIP%"

powershell -Command "Compress-Archive -Path 'manifest.json','index.html','main.js','styles.css','logo_white.png','README.md' -DestinationPath '%TEMP_ZIP%' -Force"
if exist "%TEMP_ZIP%" (
    ren "%TEMP_ZIP%" "%OUTPUT_FILE%"
    echo.
    echo SUCCESS: Archivo .ccx creado exitosamente: %OUTPUT_FILE%
    echo Solo haz doble clic en %OUTPUT_FILE% para instalarlo en Photoshop.
) else (
    echo.
    echo ERROR: No se pudo comprimir el plugin.
)

pause
