// URL de lectura en formato CSV generado desde Google Sheets (gid=679410401)
const SHEET_ID = "17zuCJ7CvgW7VkZTbRKApn3lzXIIUH-HF";
const GID = "679410401";
const GOOGLE_SHEET_CSV_URL = `https://docs.google.com/spreadsheets/d/e/2PACX-1vQm8TjsEN4AnRugDL5CjL0-KLcRQiAyTvkSuzofhZz8hEuReFhZG_IAVNYOMojcrQ/pub?gid=679410401&single=true&output=csv`;

// Estructura de respaldo dinámico
let cotizacionesData = [
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
      },
      {
        monto: 91470.00,
        plazos: [
          { meses: 72, mensualidad: 5870.20 },
          { meses: 60, mensualidad: 6450.15 },
          { meses: 48, mensualidad: 7340.80 },
          { meses: 36, mensualidad: 8850.30 }
        ]
      }
    ]
  },
  {
    version: "L TA",
    precio: 324900,
    tasa: "12.99%",
    observacion: "DISPONIBILIDAD INMEDIATA",
    enganches: [
      {
        monto: 72980.00,
        plazos: [
          { meses: 72, mensualidad: 6920.50 },
          { meses: 60, mensualidad: 7610.10 },
          { meses: 48, mensualidad: 8660.00 },
          { meses: 36, mensualidad: 10430.20 }
        ]
      }
    ]
  },
  {
    version: "EX TM",
    precio: 344900,
    tasa: "12.99%",
    observacion: "EXCELENTE EQUIPAMIENTO Y CONFORT",
    enganches: [
      {
        monto: 77480.00,
        plazos: [
          { meses: 72, mensualidad: 7350.00 },
          { meses: 60, mensualidad: 8080.00 },
          { meses: 48, mensualidad: 9190.00 },
          { meses: 36, mensualidad: 11070.00 }
        ]
      }
    ]
  }
];

const versionSelect = document.getElementById('version-select');
const engancheSelect = document.getElementById('enganche-select');
const precioMonto = document.getElementById('precio-monto');
const observacionTexto = document.getElementById('observacion-texto');
const tasaMonto = document.getElementById('tasa-monto');
const mensualidadesGrid = document.getElementById('mensualidades-grid');

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "$0.00";
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
}

// Carga en tiempo real desde Google Sheets
async function cargarDatosGoogleSheets() {
  try {
    const res = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!res.ok) throw new Error("Red no disponible");
    const csvText = await res.text();
    
    const parsedData = parsearCSVGoogleSheets(csvText);
    if (parsedData && parsedData.length > 0) {
      cotizacionesData = parsedData;
    }
  } catch (err) {
    console.warn("Utilizando datos locales de respaldo debido a restricción de CORS o archivo no publicado:", err);
  } finally {
    inicializarFormulario();
  }
}

// Lógica de procesamiento de CSV
function parsearCSVGoogleSheets(csv) {
  const lineas = csv.split('\n').filter(l => l.trim() !== '');
  if (lineas.length < 2) return null;

  const versionesMap = {};

  for (let i = 1; i < lineas.length; i++) {
    const cols = lineas[i].split(',').map(c => c.replace(/"/g, '').trim());
    if (cols.length < 5) continue;

    const version = cols[0];
    const precio = parseFloat(cols[1].replace(/[^0-9.-]+/g,"")) || 0;
    const tasa = cols[2] || "12.99%";
    const observacion = cols[3] || "ELIGE TU ENGANCHE Y LISTO¡¡¡¡";
    const engancheMonto = parseFloat(cols[4].replace(/[^0-9.-]+/g,"")) || 0;
    
    // Extraer plazos y mensualidades dinámicas
    const plazos = [];
    if (cols[5] && cols[6]) plazos.push({ meses: parseInt(cols[5]), mensualidad: parseFloat(cols[6].replace(/[^0-9.-]+/g,"")) });
    if (cols[7] && cols[8]) plazos.push({ meses: parseInt(cols[7]), mensualidad: parseFloat(cols[8].replace(/[^0-9.-]+/g,"")) });
    if (cols[9] && cols[10]) plazos.push({ meses: parseInt(cols[9]), mensualidad: parseFloat(cols[10].replace(/[^0-9.-]+/g,"")) });
    if (cols[11] && cols[12]) plazos.push({ meses: parseInt(cols[11]), mensualidad: parseFloat(cols[12].replace(/[^0-9.-]+/g,"")) });

    if (!versionesMap[version]) {
      versionesMap[version] = {
        version,
        precio,
        tasa,
        observacion,
        enganches: []
      };
    }

    if (engancheMonto > 0) {
      versionesMap[version].enganches.push({
        monto: engancheMonto,
        plazos: plazos.length > 0 ? plazos : [
          { meses: 72, mensualidad: (precio - engancheMonto) * 0.022 },
          { meses: 60, mensualidad: (precio - engancheMonto) * 0.025 },
          { meses: 48, mensualidad: (precio - engancheMonto) * 0.028 },
          { meses: 36, mensualidad: (precio - engancheMonto) * 0.034 }
        ]
      });
    }
  }

  return Object.values(versionesMap);
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
    observacionTexto.textContent = config.observacion;
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
  if (engancheSel && engancheSel.plazos) {
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
}

versionSelect.addEventListener('change', actualizarVersion);
engancheSelect.addEventListener('change', actualizarPlazos);

// Modales y WhatsApp
function contactarWhatsApp() {
  const unidad = document.getElementById('modelo-select').value;
  const version = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === version);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  document.getElementById('m-unidad').textContent = unidad;
  document.getElementById('m-version').textContent = version;
  document.getElementById('m-precio').textContent = formatCurrency(config.precio);
  document.getElementById('m-enganche').textContent = formatCurrency(engancheSel ? engancheSel.monto : 0);
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

// Generación estricta de PDF en 1 solo folio A4
function generarPDF() {
  const unidad = document.getElementById('modelo-select').value;
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
  document.getElementById('pdf-enganche').textContent = formatCurrency(engancheSel ? engancheSel.monto : 0);
  document.getElementById('pdf-tasa').textContent = config.tasa;
  document.getElementById('pdf-observacion').textContent = config.observacion;

  const tbody = document.getElementById('pdf-tabla-body');
  tbody.innerHTML = '';
  if (engancheSel && engancheSel.plazos) {
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
  }

  const elemento = document.getElementById('pdf-printable-area');
  elemento.style.display = 'block';

  const opciones = {
    margin:       0,
    filename:     `Cotizacion_KIA_${unidad}_${version}.pdf`,
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { 
      scale: 2, 
      backgroundColor: '#ffffff', 
      useCORS: true,
      windowWidth: 794
    },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak:    { mode: 'avoid-all' }
  };

  html2pdf().set(opciones).from(elemento).save().then(() => {
    elemento.style.display = 'none';
  });
}

document.addEventListener('DOMContentLoaded', cargarDatosGoogleSheets);