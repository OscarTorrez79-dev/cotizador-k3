document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos del Modal
    const btnContact = document.getElementById('btn-contact');
    const modal = document.getElementById('contact-modal');
    const btnClose = document.getElementById('close-modal');

    // Botones
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnEmail = document.getElementById('btn-email');
    const btnPdfModal = document.getElementById('btn-pdf-modal');
    const btnPdfMain = document.getElementById('btn-pdf-main');

    // === LÓGICA DEL MODAL ===
    if (btnContact && modal) {
        btnContact.addEventListener('click', () => modal.classList.add('active'));
    }

    if (btnClose && modal) {
        btnClose.addEventListener('click', () => modal.classList.remove('active'));
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('active');
        });
    }

    // === FUNCIONES DE CONTACTO ===
    const getDatosCliente = () => {
        const inputNombre = document.getElementById('user-name');
        const nombre = (inputNombre && inputNombre.value) ? inputNombre.value : 'Cliente';
        return encodeURIComponent(`Hola Abel, mi nombre es ${nombre}. Estoy interesado en la cotización del KIA K3 SEDAN (L TM).`);
    };

    if (btnWhatsapp) {
        btnWhatsapp.addEventListener('click', () => {
            const telefonoAsesor = '528448067192';
            const mensaje = getDatosCliente();
            window.open(`https://wa.me/${telefonoAsesor}?text=${mensaje}`, '_blank');
        });
    }

    if (btnEmail) {
        btnEmail.addEventListener('click', () => {
            const correoAsesor = 'abel.ortiz@kiamax.com';
            const asunto = encodeURIComponent('Interés en Cotización KIA K3');
            const cuerpo = getDatosCliente();
            window.location.href = `mailto:${correoAsesor}?subject=${asunto}&body=${cuerpo}`;
        });
    }

    // === IMPRESIÓN Y GENERACIÓN DE PDF INFALIBLE ===
    const ImprimirCotizacion = () => {
        // Actualizar la fecha
        const pdfDateEl = document.getElementById('pdf-date');
        if (pdfDateEl) {
            const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
            pdfDateEl.innerText = new Date().toLocaleDateString('es-MX', optionsDate);
        }

        // Cierra el modal si está abierto antes de imprimir
        if (modal) modal.classList.remove('active');

        // Dispara el diálogo del navegador
        window.print();
    };

    // Vincular botones
    if (btnPdfMain) btnPdfMain.addEventListener('click', ImprimirCotizacion);
    if (btnPdfModal) btnPdfModal.addEventListener('click', ImprimirCotizacion);
});