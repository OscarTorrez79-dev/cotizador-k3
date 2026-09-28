const cotizacionesData = [
  {
    version: "L TM",
    precio: 304900,
    tasa: "12.99%",
    cat: "24.5% Sin IVA",
    comisionApertura: 7622.50, // 2.5% estimación
    seguroEstimado: 14500.00,  // Estimación anual
    observacion: "ELIGE TU ENGANCHE Y LISTOiiii",
    enganches: [
      {
        monto: 68491.66,
        plazos: [
          { meses: 72, mensualidad: 6499.19 },
          { meses: 60, mensualidad: 7143.06 },
          { meses: 48, mensualidad: 8127.40 },
          { meses: 36, mensualidad: 9793.90 }
        ]
      }
    ]
  }
];

const versionSelect = document.getElementById('version-select');
const engancheSelect = document.getElementById('enganche-select');
const precioMonto = document.getElementById('precio-monto');
const observacionBox = document.getElementById('observacion-box');
const tasaMonto = document.getElementById('tasa-monto');
const mensualidadesGrid = document.getElementById('mensualidades-grid');

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "$0.00";
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

function inicializarFormulario() {
  versionSelect.innerHTML = '';
  cotizacionesData.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.version;
    opt.textContent = item.version;
    versionSelect.appendChild(opt);
  });
  actualizarVersion();
}

function actualizarVersion() {
  const versionSel = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === versionSel);

  if (config) {
    precioMonto.textContent = formatCurrency(config.precio);
    observacionBox.textContent = `Observación: ${config.observacion}`;
    tasaMonto.textContent = config.tasa;

    engancheSelect.innerHTML = '';
    config.enganches.forEach((eng, index) => {
      const opt = document.createElement('option');
      opt.value = index;
      opt.textContent = formatCurrency(eng.monto);
      engancheSelect.appendChild(opt);
    });

    actualizarPlazos();
  }
}

function actualizarPlazos() {
  const versionSel = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === versionSel);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  mensualidadesGrid.innerHTML = '';
  engancheSel.plazos.forEach(p => {
    const card = document.createElement('div');
    card.className = `card-plazo ${p.meses === 48 ? 'destacado' : ''}`;
    card.innerHTML = `
      <div class="plazo-meses">${p.meses} Meses</div>
      <div class="plazo-monto">${formatCurrency(p.mensualidad)}</div>
    `;
    mensualidadesGrid.appendChild(card);
  });
}

versionSelect.addEventListener('change', actualizarVersion);
engancheSelect.addEventListener('change', actualizarPlazos);

// Abrir Modal de Contacto
function contactarWhatsApp() {
  const unidad = document.getElementById('unidad-select').value;
  const version = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === version);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  document.getElementById('m-unidad').textContent = unidad;
  document.getElementById('m-version').textContent = version;
  document.getElementById('m-precio').textContent = formatCurrency(config.precio);
  document.getElementById('m-enganche').textContent = formatCurrency(engancheSel.monto);
  document.getElementById('m-comision').textContent = formatCurrency(config.comisionApertura);
  document.getElementById('m-seguro').textContent = formatCurrency(config.seguroEstimado);
  document.getElementById('m-tasa-cat').textContent = `${config.tasa} / ${config.cat}`;

  document.getElementById('modal-contacto').classList.add('active');
}

function cerrarModal() {
  document.getElementById('modal-contacto').classList.remove('active');
}

function enviarWhatsAppModal() {
  const nombre = document.getElementById('cliente-nombre').value || "Cliente";
  const telefonoCliente = document.getElementById('cliente-telefono').value || "No especificado";
  const unidad = document.getElementById('m-unidad').textContent;
  const version = document.getElementById('m-version').textContent;
  const enganche = document.getElementById('m-enganche').textContent;

  const mensaje = `Hola Abel, mi nombre es *${nombre}* (Tel: ${telefonoCliente}).%0A` +
                  `Me interesa la cotización completa del *${unidad} ${version}* con un enganche de ${enganche}.`;

  window.open(`https://wa.me/528448067192?text=${mensaje}`, '_blank');
}

function enviarCorreoModal() {
  const nombre = document.getElementById('cliente-nombre').value || "Cliente";
  const unidad = document.getElementById('m-unidad').textContent;
  const version = document.getElementById('m-version').textContent;
  const enganche = document.getElementById('m-enganche').textContent;

  const asunto = encodeURIComponent(`Cotización Completa ${unidad} - ${nombre}`);
  const cuerpo = encodeURIComponent(`Hola Abel,\n\nSolicito información para la unidad ${unidad} ${version}.\nEnganche: ${enganche}\n\nNombre: ${nombre}`);
  
  window.location.href = `mailto:asesor@kiamaxsaltillo.com?subject=${asunto}&body=${cuerpo}`;
}

// Generación Completa del PDF
function generarPDF() {
  const unidad = document.getElementById('unidad-select').value;
  const version = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === version);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  // Datos del Cliente (si ingresó algo en el modal)
  const clienteNombre = document.getElementById('cliente-nombre').value || "Cliente Prospecto";
  const clienteTelefono = document.getElementById('cliente-telefono').value || "Sin registrar";

  document.getElementById('pdf-fecha').textContent = fechaTexto;
  document.getElementById('pdf-cliente-nombre').textContent = clienteNombre;
  document.getElementById('pdf-cliente-telefono').textContent = clienteTelefono;

  // Detalles financieros de la unidad
  document.getElementById('pdf-modelo').textContent = unidad;
  document.getElementById('pdf-version').textContent = version;
  document.getElementById('pdf-precio').textContent = formatCurrency(config.precio);
  document.getElementById('pdf-enganche').textContent = formatCurrency(engancheSel.monto);
  document.getElementById('pdf-comision').textContent = formatCurrency(config.comisionApertura);
  document.getElementById('pdf-seguro').textContent = formatCurrency(config.seguroEstimado);
  document.getElementById('pdf-tasa').textContent = config.tasa;
  document.getElementById('pdf-cat').textContent = config.cat;
  document.getElementById('pdf-observacion').textContent = config.observacion;

  // Tabla con TODOS los plazos sin omitir ninguno
  const tbody = document.getElementById('pdf-tabla-body');
  tbody.innerHTML = '';
  engancheSel.plazos.forEach(p => {
    const tr = document.createElement('tr');
    const esRecomendado = p.meses === 48 ? ' (Recomendado)' : '';
    tr.innerHTML = `
      <td><strong>${p.meses} Meses</strong>${esRecomendado}</td>
      <td style="text-align: right; font-weight: bold;">${formatCurrency(p.mensualidad)}</td>
    `;
    tbody.appendChild(tr);
  });

  // Exportar PDF
  const elemento = document.getElementById('pdf-printable-area');
  elemento.style.display = 'block';

  const opciones = {
    margin:       [10, 10, 10, 10],
    filename:     `Cotizacion_KIA_${unidad}_${version}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2, backgroundColor: '#ffffff', useCORS: true },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opciones).from(elemento).save().then(() => {
    elemento.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', inicializarFormulario);