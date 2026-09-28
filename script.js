const cotizacionesData = [
  {
    modelo: "K3 SEDAN",
    version: "L TM",
    tasa: "12.99%",
    precio: 304900.00,
    mantenimiento: "No",
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
      },
      {
        monto: 82516.60,
        plazos: [
          { meses: 72, mensualidad: 5193.67 },
          { meses: 60, mensualidad: 5837.54 },
          { meses: 48, mensualidad: 6821.88 },
          { meses: 36, mensualidad: 8488.37 }
        ]
      },
      {
        monto: 111955.85,
        plazos: [
          { meses: 72, mensualidad: 4544.84 },
          { meses: 60, mensualidad: 5108.27 },
          { meses: 48, mensualidad: 5969.63 },
          { meses: 36, mensualidad: 7427.83 }
        ]
      }
    ]
  },
  {
    modelo: "K3 SEDAN",
    version: "LX TM",
    tasa: "12.99%",
    precio: 358600.00,
    mantenimiento: "No",
    observacion: "ELIGE TU ENGANCHE Y LISTOiiii",
    enganches: [
      {
        monto: 60457.12,
        plazos: [
          { meses: 72, mensualidad: 7410.50 },
          { meses: 60, mensualidad: 8167.83 },
          { meses: 48, mensualidad: 9325.63 }
        ]
      }
    ]
  }
];

const formatCurrency = (val) => {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
};

const versionSelect = document.getElementById('version-select');
const engancheSelect = document.getElementById('enganche-select');
const precioVal = document.getElementById('precio-val');
const tasaVal = document.getElementById('tasa-val');
const observacionTxt = document.getElementById('observacion-txt');
const listaMensualidades = document.getElementById('lista-mensualidades');

document.addEventListener('DOMContentLoaded', () => {
  actualizarVersiones();

  versionSelect.addEventListener('change', actualizarVersiones);
  engancheSelect.addEventListener('change', renderizarMensualidades);
});

function actualizarVersiones() {
  const versionSel = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === versionSel);

  if (!config) return;

  precioVal.textContent = formatCurrency(config.precio);
  tasaVal.textContent = config.tasa;
  observacionTxt.textContent = config.observacion;

  engancheSelect.innerHTML = '';
  config.enganches.forEach((eng, index) => {
    const opt = document.createElement('option');
    opt.value = index;
    opt.textContent = formatCurrency(eng.monto);
    engancheSelect.appendChild(opt);
  });

  renderizarMensualidades();
}

function renderizarMensualidades() {
  const versionSel = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === versionSel);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  listaMensualidades.innerHTML = '';

  if (!engancheSel) return;

  engancheSel.plazos.forEach(p => {
    const row = document.createElement('div');
    row.className = 'm-row';
    row.innerHTML = `
      <span class="m-meses">${p.meses} meses</span>
      <span class="m-monto">${formatCurrency(p.mensualidad)}</span>
    `;
    listaMensualidades.appendChild(row);
  });
}

function contactarWhatsApp() {
  const version = versionSelect.value;
  const config = cotizacionesData.find(item => item.version === version);
  const engIndex = engancheSelect.value || 0;
  const engancheSel = config.enganches[engIndex];

  if (typeof fbq !== 'undefined') {
    fbq('track', 'Lead', { content_name: `K3 SEDAN ${version}` });
  }

  const mensaje = `Hola, me interesa más información de la cotización del K3 SEDAN ${version}:%0A` +
                  `- Enganche: ${formatCurrency(engancheSel.monto)}%0A` +
                  `- Tasa: ${config.tasa}`;
  
  const telefono = "528448067192";
  window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
}