# FrostFlow Retoucher — Photoshop UXP Plugin (v0.0.1)

Plugin de panel lateral UXP para Adobe Photoshop (2021+) desarrollado para **Photo Studio JM LLC**. Diseñado para consultar y marcar las tareas de retoque asignadas a las fotos activas en Photoshop en tiempo real.

---

## 📁 Estructura del Proyecto

```text
frostflow_plugins/
├── manifest.json      # Manifiesto UXP versión 5 para Photoshop (v0.0.1)
├── index.html         # Interfaz visual del panel (PIN pad, info de proyecto, checklist)
├── main.js            # Lógica UXP, listeners de documento activo y llamadas API
├── styles.css         # Estilos visuales temáticos (#FF007F / #00F0FF)
├── logo_white.png     # Logotipo oficial de marca
├── install.bat        # Script de instalación automática para Windows
└── README.md          # Documentación oficial
```

---

## ⚙️ Características Principales

1. **🔐 Autenticación por PIN (4 dígitos)**:
   - Login de editor con persistencia de sesión entre reinicios de Photoshop.
2. **🔍 Matching por Nombre de Archivo (Sin Extensión)**:
   - Detecta automáticamente la foto activa en Photoshop (`.psd`, `.arw`, `.nef`, `.jpg`, `.cr3`).
   - Compara únicamente contra los proyectos asignados al editor logueado.
   - En caso de coincidencia en múltiples proyectos, ofrece pantalla de selección.
3. **📋 Checklist Interactivo**:
   - Muestra las tareas asignadas a la foto activa.
   - Actualización en tiempo real al marcar/desmarcar tareas.
   - Botón *✔ Marcar Todo Como Done*.
4. **📧 Notificación Automática de Proyecto Completado**:
   - Cuando el editor finaliza todas las fotos del proyecto, la API envía un correo automático a Jaime notificando la finalización.
5. **🔄 Sincronización Silenciosa**:
   - Refresco de datos en segundo plano cada 60 segundos o manual mediante el botón `↻`.

---

## 📦 Cómo Instalar

### En Windows (Editor Bryan)
1. Descarga o clona la carpeta `frostflow_plugins`.
2. Haz **doble clic** en `install.bat`.
3. Cierra y vuelve a abrir **Adobe Photoshop**.
4. Encontrarás el panel en el menú superior: **Plugins ➔ FrostFlow Tareas**.

---

## ⚙️ Conexión API Backend

El plugin se conecta directamente a la API en producción:
- **Endpoint**: `https://jaimeestevaphotographer.com/frostflow/backend/api.php`
- **Autenticación**: `X-API-KEY: FrostflowJM_Secret_Key_2026`

---

*Desarrollado para Photo Studio JM LLC — 2026*
