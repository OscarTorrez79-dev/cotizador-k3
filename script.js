const cotizacionesData = [
  {
    version: "L TM",
    precio: 304900,
    tasa: "12.99%",
    observacion: "ELIGE TU ENGANCHE Y LISTO¡¡¡¡",
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
  document.getElementById('m-tasa').textContent = config.tasa;

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
                  `Me interesa la cotización del *${unidad} ${version}* con enganche de ${enganche}.`;

  window.open(`https://wa.me/528448067192?text=${mensaje}`, '_blank');
}

function enviarCorreoModal() {
  const nombre = document.getElementById('cliente-nombre').value || "Cliente";
  const unidad = document.getElementById('m-unidad').textContent;
  const version = document.getElementById('m-version').textContent;
  const enganche = document.getElementById('m-enganche').textContent;

  const asunto = encodeURIComponent(`Cotización ${unidad} - ${nombre}`);
  const cuerpo = encodeURIComponent(`Hola Abel,\n\nSolicito información para la unidad ${unidad} ${version}.\nEnganche: ${enganche}\n\nNombre: ${nombre}`);
  
  window.location.href = `mailto:asesor@kiamaxsaltillo.com?subject=${asunto}&body=${cuerpo}`;
}

// Generar PDF - Ajustado a 1 sola hoja
function generarPDF() {
  const unidad = document.getElementById('unidad-select').value;
  const version = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === version);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  const hoy = new Date();
  const fechaTexto = hoy.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('pdf-fecha').textContent = fechaTexto;
  document.getElementById('pdf-modelo').textContent = unidad;
  document.getElementById('pdf-version').textContent = version;
  document.getElementById('pdf-precio').textContent = formatCurrency(config.precio);
  document.getElementById('pdf-enganche').textContent = formatCurrency(engancheSel.monto);
  document.getElementById('pdf-tasa').textContent = config.tasa;
  document.getElementById('pdf-observacion').textContent = config.observacion;

  const tbody = document.getElementById('pdf-tabla-body');
  tbody.innerHTML = '';
  engancheSel.plazos.forEach(p => {
    const tr = document.createElement('tr');
    if (p.meses === 48) tr.style.fontWeight = 'bold';
    const esRecomendado = p.meses === 48 ? ' (Recomendado)' : '';
    tr.innerHTML = `
      <td>${p.meses} Meses${esRecomendado}</td>
      <td style="text-align: right;">${formatCurrency(p.mensualidad)}</td>
    `;
    tbody.appendChild(tr);
  });

  const elemento = document.getElementById('pdf-printable-area');
  elemento.style.display = 'block';

  const opciones = {
    margin:       [8, 10, 8, 10],
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