# BeltCalc

**BeltCalc** es una aplicación web progresiva (PWA) diseñada para facilitar cálculos y registros de calibraciones de cintas transportadoras y balanzas. Está construida con HTML, CSS y JavaScript puro para funcionar sin dependencias externas, y utiliza `localStorage` para guardar el historial de pruebas localmente en el dispositivo.

## Funciones principales

- **Calculadora de velocidad**: calcula la velocidad de una cinta transportadora a partir del diámetro del rolo y las RPM medidas. Permite comparar contra la velocidad indicada por el controlador y estima el error.
- **Calculadora de cadena de calibración**: calcula el peso por metro de una cadena de prueba, la carga sobre el tren de pesaje y el caudal esperado en toneladas por hora.
- **Calculadora de factor de corrección**: sugiere un nuevo factor de ganancia para el controlador en función del peso indicado y el peso real externo. Informa la diferencia y el error porcentual.
- **Historial de calibraciones**: almacena cada cálculo en el almacenamiento local del navegador y muestra una tabla con fecha, tipo y resultados. Permite borrar el historial.

## Uso

1. Abra `index.html` en cualquier navegador moderno. Puede instalar la PWA en dispositivos compatibles a través del navegador.
2. Navegue entre las secciones mediante los botones en la parte superior.
3. Introduzca los datos y pulse **Calcular** para obtener los resultados.
4. Pulse **Guardar en historial** para registrar la prueba. Esta información se guarda en el navegador y se mostrará en la sección de **Historial**.
5. Para borrar todos los registros, utilice el botón **Borrar historial** en la sección de historial.

## Instalación

No se requiere instalación de dependencias. Solo copie el contenido de la carpeta `beltcalc-app` a un servidor estático o ábralo localmente. Los archivos principales son:

- `index.html`: entrada principal de la aplicación.
- `style.css`: estilos básicos de la interfaz.
- `script.js`: lógica de la aplicación y calculadoras.
- `manifest.json`: manifiesto de la PWA.
- `sw.js`: service worker para funcionamiento offline.
- `icon-192.png`, `icon-512.png`: iconos usados por el manifiesto.

Si desea modificar el código o extender la aplicación, puede editar estos archivos directamente.