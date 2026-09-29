document.addEventListener('DOMContentLoaded', () => {

    // =========================================================================
    // CONFIGURACIÓN DE GOOGLE SHEETS
    // =========================================================================
    const SPREADSHEET_ID = '17zuCJ7CvgW7VkZTbRKApn3lzXIIUH-HF';
    const GIDS = {
        TIPO_AUTO: '1686283719',
        UNIDADES: '1110558341',
        VERSIONES: '381280636',
        COTIZACIONES: '679410401'
    };

    // Elementos DOM
    const selectTipo = document.getElementById('select-tipo');
    const selectUnidad = document.getElementById('select-unidad');
    const selectVersion = document.getElementById('select-version');
    const precioListaEl = document.getElementById('precio-lista');
    const inputEnganche = document.getElementById('input-enganche');
    const mesRows = document.querySelectorAll('.mes-row strong');

    // Botones de PDF y Contacto
    const btnPdfMain = document.getElementById('btn-pdf-main');
    const btnPdfModal = document.getElementById('btn-pdf-modal');
    const btnContact = document.getElementById('btn-contact');
    const modal = document.getElementById('contact-modal');
    const btnClose = document.getElementById('close-modal');
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnEmail = document.getElementById('btn-email');

    // BASE DE DATOS COMPLETA DE RESPALDO (Incluye todas las unidades y versiones)
    let vehiculosData = {
        "AUTOMÓVIL": {
            "K3 SEDAN": {
                "L TM": { precio: 304900, engancheMin: 68491.66 },
                "LX TM": { precio: 358600, engancheMin: 82516.60 },
                "L TA": { precio: 335500, engancheMin: 75000.00 },
                "LX TA": { precio: 372600, engancheMin: 83000.00 },
                "EX TA": { precio: 400300, engancheMin: 90000.00 },
                "EXPACK TA": { precio: 435900, engancheMin: 98000.00 }
            },
            "K3 HATCHBACK": {
                "LX TM": { precio: 358600, engancheMin: 80000.00 },
                "EX TA": { precio: 400300, engancheMin: 90000.00 },
                "EXPACK TA": { precio: 435900, engancheMin: 98000.00 },
                "GTLINE TA": { precio: 475600, engancheMin: 105000.00 }
            },
            "K4 SEDAN": {
                "LX TM": { precio: 398400, engancheMin: 89000.00 },
                "LX TA": { precio: 415000, engancheMin: 93000.00 },
                "EX TA": { precio: 445000, engancheMin: 100000.00 },
                "GTLINE TA": { precio: 485000, engancheMin: 110000.00 }
            }
        },
        "SUV": {
            "SONET": {
                "LX TM": { precio: 398400, engancheMin: 86356.18 },
                "LX TA": { precio: 418400, engancheMin: 92000.00 },
                "EX TA": { precio: 448400, engancheMin: 99000.00 },
                "SX TA": { precio: 488400, engancheMin: 108000.00 }
            },
            "SELTOS": {
                "LX": { precio: 449900, engancheMin: 99000.00 },
                "EX": { precio: 489900, engancheMin: 108000.00 },
                "EXPACK": { precio: 529900, engancheMin: 116000.00 },
                "SX": { precio: 569900, engancheMin: 125000.00 }
            },
            "SPORTAGE": {
                "EX TA": { precio: 594900, engancheMin: 130000.00 },
                "EXPACK TA": { precio: 644900, engancheMin: 142000.00 },
                "SX TURBO": { precio: 694900, engancheMin: 153000.00 },
                "SXL": { precio: 734900, engancheMin: 162000.00 }
            },
            "SPORTAGE HEV": {
                "SXL HEV": { precio: 814900, engancheMin: 180000.00 }
            },
            "SORENTO": {
                "EX TA": { precio: 789900, engancheMin: 174000.00 },
                "EXPACK": { precio: 849900, engancheMin: 187000.00 },
                "SXL": { precio: 909900, engancheMin: 200000.00 }
            }
        },
        "HÍBRIDOS Y ELÉCTRICOS": {
            "NIRO": {
                "EX": { precio: 679900, engancheMin: 150000.00 }
            },
            "SELTOS HIBRIDA": {
                "EX HEV": { precio: 549900, engancheMin: 121000.00 }
            },
            "EV3": {
                "GT LINE": { precio: 799900, engancheMin: 175000.00 }
            }
        }
    };

    // --- CÁLCULOS FINANCIEROS Y FORMATO ---
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

    // --- CONTROLES DE LOS SELECTORES EN CASCADA ---
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

    // Registrar eventos de cambio
    if (selectTipo) selectTipo.addEventListener('change', cargarUnidades);
    if (selectUnidad) selectUnidad.addEventListener('change', cargarVersiones);
    if (selectVersion) selectVersion.addEventListener('change', actualizarCalculos);
    if (inputEnganche) inputEnganche.addEventListener('input', actualizarCalculos);

    // Inicializar selectores
    poblarSelectTipos();

    // --- IMPRESIÓN Y PDF ---
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

    // Lógica de envio por WhatsApp y Correo
    const getMensajeContacto = () => {
        const inputNombre = document.getElementById('user-name');
        const nombre = (inputNombre && inputNombre.value.trim() !== '') ? inputNombre.value.trim() : 'Cliente';
        const unidad = selectUnidad ? selectUnidad.value : 'KIA';
        const version = selectVersion ? selectVersion.value : '';

        return encodeURIComponent(`Hola Abel, mi nombre es ${nombre}. Estoy interesado en cotizar un KIA ${unidad} (${version}).`);
    };

    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            const telefonoAsesor = '528448067192';
            window.open(`https://wa.me/${telefonoAsesor}?text=${getMensajeContacto()}`, '_blank');
        });
    }

    if (btnEmail) {
        btnEmail.addEventListener('click', () => {
            const correoAsesor = 'abel.ortiz@kiamax.com';
            const asunto = encodeURIComponent('Cotización de vehículo KIA');
            window.location.href = `mailto:${correoAsesor}?subject=${asunto}&body=${getMensajeContacto()}`;
        });
    }
});