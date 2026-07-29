# 📖 Manual de Usuario e Instalación Oficial — FrostFlow Retoucher (v0.0.1)

Plugin oficial de panel lateral UXP para **Adobe Photoshop (v23.3+)** desarrollado para **Photo Studio JM LLC / Jaime Esteva Photography**. Diseñado para consultar, sincronizar y marcar en tiempo real las tareas de retoque asignadas a las imágenes abiertas en Photoshop.

---

## 🛠️ 1. Requisitos Previos (¿Qué se necesita descargar e instalar?)

Antes de instalar el plugin, asegúrate de contar con lo siguiente en la computadora del fotógrafo o retocador:

1. **Adobe Photoshop (2022 o superior)**: Versión **v23.3.0** o más reciente.
2. **Adobe Creative Cloud Desktop**: La aplicación oficial de Adobe debe estar instalada e iniciada con tu cuenta de Adobe.
3. *(Opcional para desarrolladores/pruebas)*: **Adobe UXP Developer Tools** (se descarga gratuitamente desde el menú de herramientas en la app Creative Cloud Desktop).

---

## 📦 2. Proceso de Instalación (2 Métodos)

### **Opción A: Instalación Automática mediante `.ccx` (Recomendada para Retocadores / Usuarios)**

1. Descarga el paquete instalador oficial: **`FrostFlow_Retoucher_v0.0.1.ccx`**.
2. Haz **doble clic** sobre el archivo `FrostFlow_Retoucher_v0.0.1.ccx`.
3. Se abrirá la ventana de **Adobe Creative Cloud Desktop** solicitando confirmación de instalación.
4. Haz clic en el botón **Instalar** (o *Install Locally*).
5. Abre **Adobe Photoshop**.
6. En la barra de menú superior de Photoshop, ve a: **Plugins ➔ FrostFlow Tareas**.

---

### **Opción B: Modo Desarrollo / Depuración (Recomendado para Administrador / Jaime)**

Si necesitas probar modificaciones en el código sin empaquetar:

1. Abre la aplicación **Adobe UXP Developer Tools**.
2. Haz clic en el botón azul **`Add Plugin`** (o arrastra el archivo `manifest.json`).
3. Selecciona el archivo `manifest.json` ubicado en la carpeta del proyecto (`c:\Antigravity_NAS\frostflow_plugins\manifest.json`).
4. Abre **Adobe Photoshop**.
5. En la ventana de **Adobe UXP Developer Tools**, busca la fila **FrostFlow Retoucher** y haz clic en **`Load`** (o recargar `↻`).
6. Dentro de Photoshop, abre el panel en **Plugins ➔ FrostFlow Tareas**.

---

## 🚀 3. Guía de Uso del Plugin

### **Paso 1: Inicio de Sesión (PIN Login)**
* Al abrir el panel por primera vez, ingresa tu **PIN personal de 4 dígitos** utilizando la pantalla táctil/ratón o directamente con las teclas de tu teclado físico (`0-9`, `Backspace` para borrar, `Escape` para limpiar).
* La sesión se guardará automáticamente en tu equipo de forma segura para que no tengas que escribir el PIN cada vez que inicies Photoshop.

### **Paso 2: Detección Automática de Archivos y Formatos**
* Abre cualquier foto de tu proyecto en Photoshop (`.psd`, `.tif`, `.nef`, `.cr3`, `.arw`, `.dng`, `.jpg`).
* El plugin detectará de forma automática la foto activa gracias a su **algoritmo de coincidencia inteligente**:
  * **Soporta guiones bajos iniciales**: detecta archivos de Camera RAW o Lightroom como `_Z724349.NEF` e identifica su par `Z724349.jpg` en el servidor.
  * **Normalización de nombres**: reconoce variaciones como `_edit`, `-copy`, `_v1`, etc.
  * **Fotografías completadas**: si una foto ya fue terminada, la detecta e indica su estado finalizado.

### **Paso 3: Marcar y Completar Tareas**
* Haz clic sobre cualquier tarea de la lista para cambiar su estado entre pendiente y realizada (`✔`).
* Si deseas marcar todas las tareas de la foto actual de un solo golpe, presiona el botón:
  **`✔ Mark All As Completed`**
* Cuando todas las tareas de la imagen estén finalizadas, se mostrará la tarjeta de celebración:
  **`🎉 PHOTO COMPLETED!`**

### **Paso 4: Botones Superiores de la Cabecera**
* **`↻` (Sync)**: Sincroniza manualmente los datos con el servidor backend en tiempo real.
* **`🚪` (Sign Out)**: Cierra la sesión del editor actual de forma segura.

---

## 📂 4. Estructura de Archivos del Proyecto

```text
frostflow_plugins/
├── manifest.json                # Manifiesto UXP versión 5 para Photoshop (v0.0.1)
├── index.html                   # Estructura e interfaz gráfica del panel (en Inglés)
├── main.js                      # Lógica principal, coincidencia de archivos y llamadas API
├── styles.css                   # Hoja de estilos Cyber Neon (Compatible con UXP Yoga)
├── logo_white.png               # Logotipo oficial de marca
├── FrostFlow_Retoucher_v0.0.1.ccx # Paquete instalador oficial autoejecutable
├── build_ccx.bat                # Script ejecutable para empaquetar .ccx automáticamente
├── install.bat                  # Script legacy de instalación rápida
└── README.md                    # Manual oficial de usuario e instalación (este archivo)
```

---

## ⚙️ 5. Conexión API Backend

El plugin se conecta al backend centralizado en producción:
- **Servidor**: `https://jaimeestevaphotographer.com/frostflow/backend/api.php`
- **Llave de Seguridad**: `X-API-KEY: FrostflowJM_Secret_Key_2026`

---

*Desarrollado para Photo Studio JM LLC / Jaime Esteva Photography — 2026*
