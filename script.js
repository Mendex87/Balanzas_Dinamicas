(function () {
  // Elementos de navegación
  const navVel = document.getElementById('nav-velocidad');
  const navCad = document.getElementById('nav-cadena');
  const navFac = document.getElementById('nav-factor');
  const navHist = document.getElementById('nav-historial');
  const navBal = document.getElementById('nav-balanzas');

  // Secciones
  const secVel = document.getElementById('section-velocidad');
  const secCad = document.getElementById('section-cadena');
  const secFac = document.getElementById('section-factor');
  const secHist = document.getElementById('section-historial');
  const secBal = document.getElementById('section-balanzas');

  // Velocidad
  const velBtnCalcular = document.getElementById('vel-calcular');
  const velBtnGuardar = document.getElementById('vel-guardar');
  const velResultados = document.getElementById('vel-resultados');
  const velSelect = document.getElementById('vel-balanza');

  // Cadena
  const cadBtnCalcular = document.getElementById('cad-calcular');
  const cadBtnGuardar = document.getElementById('cad-guardar');
  const cadResultados = document.getElementById('cad-resultados');
  const cadSelect = document.getElementById('cad-balanza');

  // Factor
  const facBtnCalcular = document.getElementById('fac-calcular');
  const facBtnGuardar = document.getElementById('fac-guardar');
  const facResultados = document.getElementById('fac-resultados');
  const facSelect = document.getElementById('fac-balanza');

  // Balanzas: campos de alta y listado
  const balanzaNombreInput = document.getElementById('balanza-nombre');
  const balanzaDiamInput = document.getElementById('balanza-diametro');
  const balanzaLargoTrenInput = document.getElementById('balanza-largo-tren');
  const balanzaSeparacionInput = document.getElementById('balanza-separacion');
  const balanzaNumRolosInput = document.getElementById('balanza-num-rolos');
  const balanzaAgregarBtn = document.getElementById('balanza-agregar');
  const balanzaListado = document.getElementById('balanza-listado');

  // Variables para balanzas y la balanza actualmente seleccionada
  let balanzas = [];
  let currentBalanza = null;

  // Endpoint de Google Sheets (Apps Script)
  // Reemplace esta URL con la URL de su Web App de Google Apps Script (termina en /exec)
  const GOOGLE_SHEETS_WEBAPP_URL = '';
  
  /* Funciones para manejar las balanzas.
   * Las balanzas permiten identificar cada cinta o balanza dinámica en la planta.
   * Se guardan en localStorage bajo la clave 'beltcalcBalanzas' y se utilizan para
   * rellenar los selectores de cada calculadora.
   */
  function loadBalanzas() {
    // Recuperar balanzas de localStorage. Puede contener objetos o nombres de versiones anteriores.
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem('beltcalcBalanzas')) || [];
    } catch (e) {
      stored = [];
    }
    // Normalizar a objetos
    balanzas = stored.map(item => {
      if (typeof item === 'string') {
        return { nombre: item, diametro: null, largoTren: null, separacion: null, numRolos: null };
      }
      return item;
    });
    // Persistir la normalización
    localStorage.setItem('beltcalcBalanzas', JSON.stringify(balanzas));
    // Actualizar listado en la página de balanzas
    if (balanzaListado) {
      balanzaListado.innerHTML = '';
      balanzas.forEach((b, index) => {
        const li = document.createElement('li');
        li.textContent = b.nombre;
        li.dataset.index = index;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          selectBalanza(index);
          // Navegar a calculators al seleccionar
          showSection('velocidad');
        });
        balanzaListado.appendChild(li);
      });
    }
    // Actualizar selects en calculadoras
    const selects = [velSelect, cadSelect, facSelect];
    selects.forEach(sel => {
      // limpiar opciones
      while (sel.firstChild) {
        sel.removeChild(sel.firstChild);
      }
      // añadir opción vacía
      const optEmpty = document.createElement('option');
      optEmpty.value = '';
      optEmpty.textContent = '-- seleccionar --';
      sel.appendChild(optEmpty);
      // añadir cada balanza
      balanzas.forEach((b, idx) => {
        const opt = document.createElement('option');
        opt.value = idx;
        opt.textContent = b.nombre;
        sel.appendChild(opt);
      });
    });
    // Si ya hay una balanza seleccionada previamente, seleccionarla en los selects
    const currentIndex = parseInt(localStorage.getItem('beltcalcCurrentBalanza'), 10);
    if (!isNaN(currentIndex) && balanzas[currentIndex]) {
      selectBalanza(currentIndex, false);
    }
  }

  function saveBalanzas(bal) {
    localStorage.setItem('beltcalcBalanzas', JSON.stringify(bal));
  }

  function selectBalanza(index, updateForms = true) {
    currentBalanza = balanzas[index];
    localStorage.setItem('beltcalcCurrentBalanza', index);
    // Actualizar selects para reflejar selección
    [velSelect, cadSelect, facSelect].forEach(sel => {
      sel.value = index;
    });
    // Rellenar formularios con parámetros de balanza
    if (updateForms && currentBalanza) {
      fillFormsFromBalanza(currentBalanza);
    }
  }

  function fillFormsFromBalanza(b) {
    if (!b) return;
    // Velocidad: diámetro
    const diamInput = document.getElementById('vel-diametro');
    if (b.diametro) diamInput.value = b.diametro;
    // Cadena: largo tren
    const largoTrenInput = document.getElementById('cad-largo-tren');
    if (b.largoTren) largoTrenInput.value = b.largoTren;
    // Otros campos (podrían usarse en el futuro)
  }

  // Manejar el evento para añadir una nueva balanza
  if (balanzaAgregarBtn) {
    balanzaAgregarBtn.addEventListener('click', () => {
      const nombre = balanzaNombreInput.value.trim();
      if (!nombre) {
        alert('Ingrese un nombre para la balanza.');
        return;
      }
      // leer parámetros mecánicos
      const diametro = parseFloat(balanzaDiamInput.value);
      const largoTren = parseFloat(balanzaLargoTrenInput.value);
      const separacion = parseFloat(balanzaSeparacionInput.value);
      const numRolos = parseInt(balanzaNumRolosInput.value, 10);
      // validar mínimos
      if ([diametro, largoTren, separacion].some(x => isNaN(x) || x <= 0)) {
        alert('Ingrese valores válidos para diámetro, largo de tren y separación.');
        return;
      }
      // Recuperar balanzas existentes
      let stored = [];
      try {
        stored = JSON.parse(localStorage.getItem('beltcalcBalanzas')) || [];
      } catch (e) {
        stored = [];
      }
      // Normalizar a objetos
      const list = stored.map(item => {
        if (typeof item === 'string') return { nombre: item };
        return item;
      });
      // verificar si ya existe por nombre
      if (list.some(b => b.nombre === nombre)) {
        alert('Esta balanza ya existe.');
        return;
      }
      // crear objeto balanza
      const balanzaObj = {
        nombre,
        diametro,
        largoTren,
        separacion,
        numRolos: isNaN(numRolos) ? null : numRolos
      };
      list.push(balanzaObj);
      saveBalanzas(list);
      // limpiar inputs
      balanzaNombreInput.value = '';
      balanzaDiamInput.value = '';
      balanzaLargoTrenInput.value = '';
      balanzaSeparacionInput.value = '';
      balanzaNumRolosInput.value = '';
      loadBalanzas();
      alert('Balanza agregada.');
    });
  }

  // Historial
  const histContenido = document.getElementById('historial-contenido');
  const histBtnBorrar = document.getElementById('historial-borrar');

  // Navegación
  navVel.addEventListener('click', () => showSection('velocidad'));
  navCad.addEventListener('click', () => showSection('cadena'));
  navFac.addEventListener('click', () => showSection('factor'));
  navHist.addEventListener('click', () => showSection('historial'));
  navBal.addEventListener('click', () => showSection('balanzas'));

  function showSection(name) {
    // Ocultar todas
    [secVel, secCad, secFac, secHist].forEach(sec => sec.hidden = true);
    // Incluir la sección de balanzas
    secBal.hidden = true;
    // Mostrar la seleccionada
    switch (name) {
      case 'velocidad':
        secVel.hidden = false;
        break;
      case 'cadena':
        secCad.hidden = false;
        break;
      case 'factor':
        secFac.hidden = false;
        break;
      case 'historial':
        secHist.hidden = false;
        loadHistory();
        break;
      case 'balanzas':
        secBal.hidden = false;
        loadBalanzas();
        break;
    }
  }

  // Calculadora de velocidad
  velBtnCalcular.addEventListener('click', () => {
    // Verificar que se haya seleccionado una balanza
    if (!currentBalanza) {
      alert('Seleccione una balanza antes de calcular.');
      velBtnGuardar.style.display = 'none';
      return;
    }
    const diam = parseFloat(document.getElementById('vel-diametro').value);
    const rpm = parseFloat(document.getElementById('vel-rpm').value);
    const indic = parseFloat(document.getElementById('vel-indicada').value);
    if (isNaN(diam) || isNaN(rpm)) {
      velResultados.textContent = 'Complete los datos de diámetro y RPM.';
      velBtnGuardar.style.display = 'none';
      return;
    }
    const diamM = diam / 1000;
    const velocidadMs = (rpm * Math.PI * diamM) / 60;
    const velocidadMmin = velocidadMs * 60;
    const velocidadMh = velocidadMs * 3600;
    let texto = '';
    texto += `Velocidad: ${velocidadMs.toFixed(3)} m/s\n`;
    texto += `Velocidad: ${velocidadMmin.toFixed(1)} m/min\n`;
    texto += `Velocidad: ${velocidadMh.toFixed(1)} m/h\n`;
    if (!isNaN(indic)) {
      const diff = indic - velocidadMs;
      const error = (diff / velocidadMs) * 100;
      texto += `Diferencia con controlador: ${(diff).toFixed(3)} m/s\n`;
      texto += `Error: ${error.toFixed(2)} %\n`;
    }
    velResultados.textContent = texto;
    velBtnGuardar.style.display = 'inline-block';

    // Guardar datos temporales en dataset para usar al guardar
    velBtnGuardar.dataset.record = JSON.stringify({
      type: 'Velocidad',
      fecha: new Date().toISOString(),
      entrada: {
        diametro_mm: diam,
        rpm: rpm,
        velocidad_indicada: isNaN(indic) ? null : indic
      },
      resultado: {
        velocidad_ms: velocidadMs,
        velocidad_mmin: velocidadMmin,
        velocidad_mh: velocidadMh,
        diferencia_ms: !isNaN(indic) ? (indic - velocidadMs) : null,
        error_porcentaje: !isNaN(indic) ? ((indic - velocidadMs) / velocidadMs) * 100 : null
      },
      balanza: currentBalanza ? currentBalanza.nombre : (velSelect.value || null),
      balanza_params: currentBalanza ? {
        diametro: currentBalanza.diametro,
        largoTren: currentBalanza.largoTren,
        separacion: currentBalanza.separacion,
        numRolos: currentBalanza.numRolos
      } : null
    });
  });

  velBtnGuardar.addEventListener('click', () => {
    const record = JSON.parse(velBtnGuardar.dataset.record || '{}');
    if (record) {
      saveToHistory(record);
      velBtnGuardar.style.display = 'none';
      alert('Registro guardado.');
    }
  });

  // Calculadora de cadena
  cadBtnCalcular.addEventListener('click', () => {
    // Verificar balanza seleccionada
    if (!currentBalanza) {
      alert('Seleccione una balanza antes de calcular.');
      cadBtnGuardar.style.display = 'none';
      return;
    }
    const largoTotal = parseFloat(document.getElementById('cad-largo-total').value);
    const pesoTotal = parseFloat(document.getElementById('cad-peso-total').value);
    const largoTren = parseFloat(document.getElementById('cad-largo-tren').value);
    const velocidad = parseFloat(document.getElementById('cad-velocidad').value);
    if ([largoTotal, pesoTotal, largoTren, velocidad].some(x => isNaN(x))) {
      cadResultados.textContent = 'Complete todos los datos.';
      cadBtnGuardar.style.display = 'none';
      return;
    }
    const kgPorMetro = pesoTotal / largoTotal;
    const kgSobreTren = kgPorMetro * largoTren;
    const toneladasHora = kgSobreTren * velocidad * 3.6;
    let texto = '';
    texto += `Peso por metro: ${kgPorMetro.toFixed(3)} kg/m\n`;
    texto += `Carga sobre tren: ${kgSobreTren.toFixed(3)} kg\n`;
    texto += `Caudal esperado: ${toneladasHora.toFixed(2)} tn/h\n`;
    cadResultados.textContent = texto;
    cadBtnGuardar.style.display = 'inline-block';
    cadBtnGuardar.dataset.record = JSON.stringify({
      type: 'Cadena',
      fecha: new Date().toISOString(),
      entrada: {
        largo_total_m: largoTotal,
        peso_total_kg: pesoTotal,
        largo_tren_m: largoTren,
        velocidad_ms: velocidad
      },
      resultado: {
        kg_por_metro: kgPorMetro,
        kg_sobre_tren: kgSobreTren,
        toneladas_hora: toneladasHora
      },
      balanza: currentBalanza ? currentBalanza.nombre : (cadSelect.value || null),
      balanza_params: currentBalanza ? {
        diametro: currentBalanza.diametro,
        largoTren: currentBalanza.largoTren,
        separacion: currentBalanza.separacion,
        numRolos: currentBalanza.numRolos
      } : null
    });
  });

  cadBtnGuardar.addEventListener('click', () => {
    const record = JSON.parse(cadBtnGuardar.dataset.record || '{}');
    if (record) {
      saveToHistory(record);
      cadBtnGuardar.style.display = 'none';
      alert('Registro guardado.');
    }
  });

  // Calculadora de factor
  facBtnCalcular.addEventListener('click', () => {
    // Verificar balanza seleccionada
    if (!currentBalanza) {
      alert('Seleccione una balanza antes de calcular.');
      facBtnGuardar.style.display = 'none';
      return;
    }
    const factorActual = parseFloat(document.getElementById('fac-actual').value);
    const pesoControlador = parseFloat(document.getElementById('fac-controlador').value);
    const pesoReal = parseFloat(document.getElementById('fac-real').value);
    if ([factorActual, pesoControlador, pesoReal].some(x => isNaN(x))) {
      facResultados.textContent = 'Complete todos los datos.';
      facBtnGuardar.style.display = 'none';
      return;
    }
    const factorNuevo = factorActual * (pesoReal / pesoControlador);
    const errorTn = pesoReal - pesoControlador;
    const errorKg = errorTn * 1000;
    const errorPorcentaje = (errorTn / pesoReal) * 100;
    let recomendacion = '';
    if (Math.abs(errorPorcentaje) < 0.5) {
      recomendacion = 'Mantener factor';
    } else if (errorPorcentaje > 0) {
      recomendacion = 'Subir factor';
    } else {
      recomendacion = 'Bajar factor';
    }
    let texto = '';
    texto += `Factor nuevo: ${factorNuevo.toFixed(3)}\n`;
    texto += `Diferencia: ${(errorTn).toFixed(3)} tn (${(errorKg).toFixed(0)} kg)\n`;
    texto += `Error: ${errorPorcentaje.toFixed(2)} %\n`;
    texto += `Recomendación: ${recomendacion}\n`;
    facResultados.textContent = texto;
    facBtnGuardar.style.display = 'inline-block';
    facBtnGuardar.dataset.record = JSON.stringify({
      type: 'Factor',
      fecha: new Date().toISOString(),
      entrada: {
        factor_actual: factorActual,
        peso_controlador_tn: pesoControlador,
        peso_real_tn: pesoReal
      },
      resultado: {
        factor_nuevo: factorNuevo,
        error_tn: errorTn,
        error_kg: errorKg,
        error_porcentaje: errorPorcentaje,
        recomendacion: recomendacion
      },
      balanza: currentBalanza ? currentBalanza.nombre : (facSelect.value || null),
      balanza_params: currentBalanza ? {
        diametro: currentBalanza.diametro,
        largoTren: currentBalanza.largoTren,
        separacion: currentBalanza.separacion,
        numRolos: currentBalanza.numRolos
      } : null
    });
  });

  facBtnGuardar.addEventListener('click', () => {
    const record = JSON.parse(facBtnGuardar.dataset.record || '{}');
    if (record) {
      saveToHistory(record);
      facBtnGuardar.style.display = 'none';
      alert('Registro guardado.');
    }
  });

  // Guardar registro en localStorage
  function saveToHistory(record) {
    const key = 'beltcalcHistory';
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      history = [];
    }
    history.push(record);
    localStorage.setItem(key, JSON.stringify(history));
    // También enviar a Google Sheets si se configuró el endpoint
    sendToSheets(record);
  }

  // Enviar registro a Google Sheets a través de Apps Script
  function sendToSheets(record) {
    // Si no se configuró la URL, no enviar nada
    if (!GOOGLE_SHEETS_WEBAPP_URL) return;
    // Usar fetch con Content-Type text/plain para evitar preflight CORS
    try {
      fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(record)
      }).then(() => {
        // No se necesita procesar la respuesta
      }).catch(err => {
        console.error('Error al enviar a Google Sheets:', err);
      });
    } catch (err) {
      console.error('Error al intentar enviar a Google Sheets:', err);
    }
  }

  // Cargar historial y construir tabla
  function loadHistory() {
    const key = 'beltcalcHistory';
    let history = [];
    try {
      history = JSON.parse(localStorage.getItem(key)) || [];
    } catch (e) {
      history = [];
    }
    if (history.length === 0) {
      histContenido.innerHTML = '<p>No hay registros guardados.</p>';
      return;
    }
    let html = '<table class="historial"><thead><tr><th>Fecha</th><th>Tipo</th><th>Datos</th></tr></thead><tbody>';
    history.forEach(rec => {
      const fecha = new Date(rec.fecha).toLocaleString('es-AR');
      let datos = '';
      if (rec.type === 'Velocidad') {
        datos += `Diámetro: ${rec.entrada.diametro_mm} mm, RPM: ${rec.entrada.rpm}\n`;
        datos += `Velocidad: ${rec.resultado.velocidad_ms.toFixed(3)} m/s\n`;
        if (rec.resultado.error_porcentaje != null) {
          datos += `Error: ${rec.resultado.error_porcentaje.toFixed(2)} %`;
        }
      } else if (rec.type === 'Cadena') {
        datos += `Largo total: ${rec.entrada.largo_total_m} m, Peso total: ${rec.entrada.peso_total_kg} kg\n`;
        datos += `kg/m: ${rec.resultado.kg_por_metro.toFixed(3)}, tn/h: ${rec.resultado.toneladas_hora.toFixed(2)}`;
      } else if (rec.type === 'Factor') {
        datos += `Factor actual: ${rec.entrada.factor_actual}, Controlador: ${rec.entrada.peso_controlador_tn} tn, Real: ${rec.entrada.peso_real_tn} tn\n`;
        datos += `Factor nuevo: ${rec.resultado.factor_nuevo.toFixed(3)}, Error %: ${rec.resultado.error_porcentaje.toFixed(2)}`;
      }
      const balanza = rec.balanza ? rec.balanza : null;
      let balParamsText = '';
      if (rec.balanza_params) {
        const p = rec.balanza_params;
        const parts = [];
        if (p.diametro) parts.push(`D: ${p.diametro} mm`);
        if (p.largoTren) parts.push(`LTren: ${p.largoTren} m`);
        if (p.separacion) parts.push(`Sep: ${p.separacion} m`);
        if (p.numRolos) parts.push(`Rol: ${p.numRolos}`);
        if (parts.length) balParamsText = `\nParámetros: ${parts.join(', ')}`;
      }
      html += `<tr><td>${fecha}</td><td>${rec.type}</td><td><pre>${datos}${balanza ? '\nBalanza: ' + balanza : ''}${balParamsText}</pre></td></tr>`;
    });
    html += '</tbody></table>';
    histContenido.innerHTML = html;
  }

  // Borrar historial
  histBtnBorrar.addEventListener('click', () => {
    if (confirm('¿Está seguro de borrar todo el historial?')) {
      localStorage.removeItem('beltcalcHistory');
      loadHistory();
    }
  });

  // Inicializa mostrando la primera sección
  // Cargar balanzas disponibles y seleccionar sección inicial
  loadBalanzas();

  // Agregar eventos a selects de balanza para prellenar formularios
  [velSelect, cadSelect, facSelect].forEach((sel) => {
    sel.addEventListener('change', () => {
      const idx = parseInt(sel.value, 10);
      if (!isNaN(idx) && balanzas[idx]) {
        selectBalanza(idx);
      }
    });
  });

  // Mostrar sección inicial
  showSection('velocidad');

  // Registro de service worker para PWA
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').catch(function(err) {
        console.log('ServiceWorker registration failed: ', err);
      });
    });
  }
})();