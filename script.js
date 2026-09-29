document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // 1. URL DE TU GOOGLE SHEET PUBLICADO
    // Asegúrate de ir en Sheets a: Archivo > Compartir > Publicar en la web > CSV
    // =========================================================================
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm8TjsEN4AnRugDL5CjL0-KLcRQiAyTvkSuzofhZz8hEuReFhZG_IAVNYOMojcrQ/pub?gid=679410401&single=true&output=csv';

    // Elementos DOM
    const selectTipo = document.getElementById('select-tipo');
    const selectUnidad = document.getElementById('select-unidad');
    const selectVersion = document.getElementById('select-version');
    const precioListaEl = document.getElementById('precio-lista');
    const inputEnganche = document.getElementById('input-enganche');
    const mesRows = document.querySelectorAll('.mes-row strong');

    // Estructura de datos por defecto (evita congelamientos si falla la red)
    let vehiculosData = {
        "AUTOMÓVIL": {
            "K3 SEDAN": {
                "L TM": { precio: 304900, engancheMin: 68491.66 },
                "EX AT": { precio: 342900, engancheMin: 76900.00 }
            }
        }
    };

    // --- PARSER SEGURO DE CSV ---
    const parseCSV = (csvText) => {
        try {
            const lines = csvText.split(/\r\n|\n/);
            const data = {};

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;
                
                // Dividir respetando comillas
                const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(c => c.trim().replace(/^"|"$/g, ''));
                if (cols.length < 4) continue;

                const tipo = cols[0].toUpperCase();
                const unidad = cols[1].toUpperCase();
                const version = cols[2].toUpperCase();
                const precio = parseFloat(cols[3].replace(/[^0-9.-]+/g, '')) || 0;
                const engancheMin = cols[4] ? parseFloat(cols[4].replace(/[^0-9.-]+/g, '')) : (precio * 0.20);

                if (!tipo || !unidad || !version || precio === 0) continue;

                if (!data[tipo]) data[tipo] = {};
                if (!data[tipo][unidad]) data[tipo][unidad] = {};

                data[tipo][unidad][version] = { precio, engancheMin };
            }

            return Object.keys(data).length > 0 ? data : null;
        } catch (e) {
            console.error('Error parseando CSV:', e);
            return null;
        }
    };

    // --- CARGA ASÍNCRONA CON TIMEOUT DE SEGURIDAD ---
    const cargarDatos = async () => {
        if (!SHEET_CSV_URL || SHEET_CSV_URL === 'TU_URL_DE_GOOGLE_SHEETS_AQUI') {
            poblarSelectTipos();
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // Cancela si tarda más de 4s

        try {
            const response = await fetch(SHEET_CSV_URL, { signal: controller.signal });
            clearTimeout(timeoutId);
            const text = await response.text();
            
            const parsed = parseCSV(text);
            if (parsed) {
                vehiculosData = parsed;
            }
        } catch (err) {
            console.warn('No se pudo consultar Google Sheets o expiró el tiempo. Usando base local de respaldo.');
        }

        poblarSelectTipos();
    };

    // --- CÁLCULOS FINANCIEROS Y PDF ---
    const formatearMoneda = (monto) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(monto);

    const calcularMensualidad = (montoFinanciar, plazoMeses, tasaAnual = 0.1299) => {
        const tasaMensual = tasaAnual / 12;
        return (montoFinanciar * tasaMensual) / (1 - Math.pow(1 + tasaMensual, -plazoMeses));
    };

    const actualizarCalculos = () => {
        if (!selectTipo || !selectUnidad || !selectVersion) return;

        const tipo = selectTipo.value;
        const unidad = selectUnidad.value;
        const version = selectVersion.value;

        if (!vehiculosData[tipo] || !vehiculosData[tipo][unidad] || !vehiculosData[tipo][unidad][version]) return;

        const info = vehiculosData[tipo][unidad][version];
        const precio = info.precio;

        if (precioListaEl) precioListaEl.innerText = formatearMoneda(precio);

        let engancheVal = parseFloat(inputEnganche.value) || info.engancheMin;
        const montoFinanciar = precio - engancheVal;

        const plazos = [72, 60, 48, 36];
        plazos.forEach((plazo, index) => {
            if (mesRows[index]) {
                mesRows[index].innerText = formatearMoneda(calcularMensualidad(montoFinanciar, plazo));
            }
        });

        actualizarPlantillaPDF(unidad, version, precio, engancheVal, montoFinanciar);
    };

    const actualizarPlantillaPDF = (unidad, version, precio, enganche, montoFinanciar) => {
        const pdfTable = document.querySelector('#pdf-template-container .pdf-table');
        if (pdfTable) {
            const tds = pdfTable.querySelectorAll('td.fw-bold');
            if (tds.length >= 4) {
                tds[0].innerText = unidad;
                tds[1].innerText = version;
                tds[2].innerText = formatearMoneda(precio);
                tds[3].innerText = formatearMoneda(enganche);
            }
        }

        const pdfMesTds = document.querySelectorAll('#pdf-template-container .pdf-table-mensualidades td.fw-bold');
        const plazos = [72, 60, 48, 36];
        plazos.forEach((plazo, index) => {
            if (pdfMesTds[index]) {
                pdfMesTds[index].innerText = formatearMoneda(calcularMensualidad(montoFinanciar, plazo));
            }
        });
    };

    // --- CONTROLES Y CASCADA ---
    const poblarSelectTipos = () => {
        if (!selectTipo) return;
        selectTipo.innerHTML = '';
        Object.keys(vehiculosData).forEach(tipo => {
            const opt = document.createElement('option');
            opt.value = tipo;
            opt.textContent = tipo;
            selectTipo.appendChild(opt);
        });
        cargarUnidades();
    };

    const cargarUnidades = () => {
        if (!selectUnidad) return;
        const tipoSeleccionado = selectTipo.value;
        selectUnidad.innerHTML = '';
        if (vehiculosData[tipoSeleccionado]) {
            Object.keys(vehiculosData[tipoSeleccionado]).forEach(unidad => {
                const opt = document.createElement('option');
                opt.value = unidad;
                opt.textContent = unidad;
                selectUnidad.appendChild(opt);
            });
        }
        cargarVersiones();
    };

    const cargarVersiones = () => {
        if (!selectVersion) return;
        const tipoSeleccionado = selectTipo.value;
        const unidadSeleccionada = selectUnidad.value;
        selectVersion.innerHTML = '';

        if (vehiculosData[tipoSeleccionado] && vehiculosData[tipoSeleccionado][unidadSeleccionada]) {
            Object.keys(vehiculosData[tipoSeleccionado][unidadSeleccionada]).forEach(version => {
                const opt = document.createElement('option');
                opt.value = version;
                opt.textContent = version;
                selectVersion.appendChild(opt);
            });
        }

        const info = vehiculosData[tipoSeleccionado]?.[unidadSeleccionada]?.[selectVersion.value];
        if (info && inputEnganche) {
            inputEnganche.value = info.engancheMin;
        }

        actualizarCalculos();
    };

    // Eventos
    if (selectTipo) selectTipo.addEventListener('change', cargarUnidades);
    if (selectUnidad) selectUnidad.addEventListener('change', cargarVersiones);
    if (selectVersion) selectVersion.addEventListener('change', actualizarCalculos);
    if (inputEnganche) inputEnganche.addEventListener('input', actualizarCalculos);

    // Inicializar
    cargarDatos();

    // --- IMPRESIÓN Y MODAL ---
    const btnPdfMain = document.getElementById('btn-pdf-main');
    const btnPdfModal = document.getElementById('btn-pdf-modal');

    const ImprimirCotizacion = () => {
        const pdfDateEl = document.getElementById('pdf-date');
        if (pdfDateEl) {
            pdfDateEl.innerText = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        window.print();
    };

    if (btnPdfMain) btnPdfMain.addEventListener('click', ImprimirCotizacion);
    if (btnPdfModal) btnPdfModal.addEventListener('click', ImprimirCotizacion);

// === LÓGICA DEL MODAL DE CONTACTO ===
    const btnContact = document.getElementById('btn-contact');
    const modal = document.getElementById('contact-modal');
    const btnClose = document.getElementById('close-modal');

    if (btnContact && modal) {
        btnContact.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.add('active'); // Muestra el modal
        });
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('active'); // Cierra el modal
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active'); // Cierra al hacer clic afuera
            }
        });
    }
});