(function () {
  // Elementos de navegación
  const navVel = document.getElementById('nav-velocidad');
  const navCad = document.getElementById('nav-cadena');
  const navFac = document.getElementById('nav-factor');
  const navHist = document.getElementById('nav-historial');

  // Secciones
  const secVel = document.getElementById('section-velocidad');
  const secCad = document.getElementById('section-cadena');
  const secFac = document.getElementById('section-factor');
  const secHist = document.getElementById('section-historial');

  // Velocidad
  const velBtnCalcular = document.getElementById('vel-calcular');
  const velBtnGuardar = document.getElementById('vel-guardar');
  const velResultados = document.getElementById('vel-resultados');

  // Cadena
  const cadBtnCalcular = document.getElementById('cad-calcular');
  const cadBtnGuardar = document.getElementById('cad-guardar');
  const cadResultados = document.getElementById('cad-resultados');

  // Factor
  const facBtnCalcular = document.getElementById('fac-calcular');
  const facBtnGuardar = document.getElementById('fac-guardar');
  const facResultados = document.getElementById('fac-resultados');

  // Historial
  const histContenido = document.getElementById('historial-contenido');
  const histBtnBorrar = document.getElementById('historial-borrar');

  // Navegación
  navVel.addEventListener('click', () => showSection('velocidad'));
  navCad.addEventListener('click', () => showSection('cadena'));
  navFac.addEventListener('click', () => showSection('factor'));
  navHist.addEventListener('click', () => showSection('historial'));

  function showSection(name) {
    // Ocultar todas
    [secVel, secCad, secFac, secHist].forEach(sec => sec.hidden = true);
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
    }
  }

  // Calculadora de velocidad
  velBtnCalcular.addEventListener('click', () => {
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
      }
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
      }
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
      }
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
      html += `<tr><td>${fecha}</td><td>${rec.type}</td><td><pre>${datos}</pre></td></tr>`;
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