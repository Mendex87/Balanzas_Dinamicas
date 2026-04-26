# BeltCalc

**BeltCalc** es una aplicación web progresiva (PWA) diseñada para facilitar cálculos y registros de calibraciones de cintas transportadoras y balanzas. Está construida con HTML, CSS y JavaScript puro para funcionar sin dependencias externas, y utiliza `localStorage` para guardar el historial de pruebas localmente en el dispositivo.

## Funciones principales

- **Calculadora de velocidad**: calcula la velocidad de una cinta transportadora a partir del diámetro del rolo y las RPM medidas. Permite comparar contra la velocidad indicada por el controlador y estima el error.
- **Calculadora de cadena de calibración**: calcula el peso por metro de una cadena de prueba, la carga sobre el tren de pesaje y el caudal esperado en toneladas por hora.
- **Calculadora de factor de corrección**: sugiere un nuevo factor de ganancia para el controlador en función del peso indicado y el peso real externo. Informa la diferencia y el error porcentual.
- **Historial de calibraciones**: almacena cada cálculo en el almacenamiento local del navegador y muestra una tabla con fecha, tipo y resultados. Permite borrar el historial.

- **Gestión de balanzas (cintas)**: desde la sección **Balanzas** se puede dar de alta cada cinta o balanza dinámica. Las balanzas registradas aparecerán en los selectores de todas las calculadoras, lo que permite asociar cada medición con la cinta correspondiente.

- **Envío opcional a Google Sheets**: la aplicación incluye soporte para enviar cada registro a una hoja de cálculo de Google. Esto permite centralizar los registros de calibración y compartirlos entre dispositivos. Para habilitar esta función es necesario crear un script de Google Apps Script y configurar la URL en el código (ver más abajo).

## Uso

1. Abra `index.html` en cualquier navegador moderno. Puede instalar la PWA en dispositivos compatibles a través del navegador.
2. Navegue entre las secciones mediante los botones en la parte superior.
3. Introduzca los datos y pulse **Calcular** para obtener los resultados.
4. Pulse **Guardar en historial** para registrar la prueba. Esta información se guarda en el navegador y se mostrará en la sección de **Historial**.
5. Para borrar todos los registros, utilice el botón **Borrar historial** en la sección de historial.

### Gestión de balanzas

Abra la sección **Balanzas** para registrar las cintas disponibles en su planta. Introduzca el nombre (por ejemplo, `C23` o `C10`) y pulse **Agregar**. Las balanzas registradas aparecen listadas y se cargan automáticamente en los selectores de las calculadoras. Al guardar un registro, también se almacena el nombre de la balanza seleccionada.

### Envío de registros a Google Sheets

Si desea que cada registro se envíe automáticamente a una hoja de cálculo en la nube, siga estos pasos:

1. Cree una nueva hoja en Google Sheets. El nombre de las columnas (A, B, C…) puede ser genérico; el script añadirá los registros al final de la primera hoja.
2. Abra el editor de **Apps Script** desde la hoja (Extensiones ➜ Apps Script) y reemplace el contenido del archivo `Code.gs` por el siguiente código de ejemplo:

   ```javascript
   // ID de la hoja donde se guardarán los datos
   const SPREADSHEET_ID = SpreadsheetApp.getActive().getId();

   /**
    * Maneja solicitudes POST desde la PWA.
    * Recibe el cuerpo como texto plano (JSON) y lo escribe en la hoja.
    */
   function doPost(e) {
     const lock = LockService.getPublicLock();
     lock.waitLock(30000);
     try {
       const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];
       const raw = e.postData ? e.postData.contents : e.parameter;
       const record = JSON.parse(raw);
       // Construir fila a partir de los campos del registro
       const fecha = new Date(record.fecha);
       const fila = [
         fecha,
         record.type,
         record.balanza || '',
         JSON.stringify(record.entrada),
         JSON.stringify(record.resultado)
       ];
       sheet.appendRow(fila);
       return ContentService.createTextOutput('OK');
     } catch (err) {
       return ContentService.createTextOutput('ERROR: ' + err);
     } finally {
       lock.releaseLock();
     }
   }
   ```

3. Guarde el proyecto y, si desea, cree una función `setup()` para asignar la hoja de cálculo a una variable global o escribir encabezados.
4. Publique el script como **Aplicación web** (en el menú desplegable **Implementar** ➜ **Nueva implementación**). Seleccione **Ejecutar como: Yo** y otorgue acceso a **Cualquiera, incluso anónimo**. Al finalizar, obtendrá una URL que termina en `/exec`.
5. Copie la URL `/exec` y abra el archivo `script.js` de la aplicación. Busque la constante `GOOGLE_SHEETS_WEBAPP_URL` y pegue allí la URL entre comillas:

   ```js
   const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/AKfy.../exec';
   ```

6. Vuelva a cargar la aplicación. A partir de ese momento, cada vez que se guarde un registro, la app lo enviará en segundo plano a la hoja de cálculo. Si la URL está vacía, la app seguirá funcionando localmente sin enviar datos.

> **Nota:** El uso de `text/plain` como tipo de contenido evita solicitudes CORS de preflight, lo que permite que la PWA envíe datos sin necesidad de cabeceras especiales. Si el script genera errores de CORS, verifique que la implementación permita solicitudes desde orígenes anónimos.

## Instalación

No se requiere instalación de dependencias. Solo copie el contenido de la carpeta `beltcalc-app` a un servidor estático o ábralo localmente. Los archivos principales son:

- `index.html`: entrada principal de la aplicación.
- `style.css`: estilos básicos de la interfaz.
- `script.js`: lógica de la aplicación y calculadoras.
- `manifest.json`: manifiesto de la PWA.
- `sw.js`: service worker para funcionamiento offline.
- `icon-192.png`, `icon-512.png`: iconos usados por el manifiesto.

Si desea modificar el código o extender la aplicación, puede editar estos archivos directamente.