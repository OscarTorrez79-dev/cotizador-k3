document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos del Modal
    const btnContact = document.getElementById('btn-contact');
    const modal = document.getElementById('contact-modal');
    const btnClose = document.getElementById('close-modal');

    // Botones de acción del Modal
    const btnWhatsapp = document.getElementById('btn-whatsapp');
    const btnEmail = document.getElementById('btn-email');
    const btnPdfModal = document.getElementById('btn-pdf-modal');
    
    // Botón PDF principal
    const btnPdfMain = document.getElementById('btn-pdf-main');

    // === LÓGICA DEL MODAL ===
    btnContact.addEventListener('click', () => {
        modal.classList.add('active');
    });

    btnClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    // Cerrar modal al hacer clic fuera del cuadro
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // === FUNCIONES DE CONTACTO ===
    const getDatosCliente = () => {
        const nombre = document.getElementById('user-name').value || 'Cliente';
        return encodeURIComponent(`Hola Abel, mi nombre es ${nombre}. Estoy interesado en la cotización del KIA K3 SEDAN (L TM).`);
    };

    btnWhatsapp.addEventListener('click', () => {
        const telefonoAsesor = '528448067192'; // Número con código de país
        const mensaje = getDatosCliente();
        window.open(`https://wa.me/${telefonoAsesor}?text=${mensaje}`, '_blank');
    });

    btnEmail.addEventListener('click', () => {
        const correoAsesor = 'abel.ortiz@kiamax.com'; // Coloca el correo real
        const asunto = encodeURIComponent('Interés en Cotización KIA K3');
        const cuerpo = getDatosCliente();
        window.location.href = `mailto:${correoAsesor}?subject=${asunto}&body=${cuerpo}`;
    });

    // === LÓGICA PARA GENERAR PDF ===
    const generarPDF = () => {
        // Obtenemos el contenedor oculto con la estructura blanca del PDF
        const pdfElement = document.getElementById('pdf-template-container');
        
        // Actualizamos la fecha del PDF al día actual
        const optionsDate = { year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('pdf-date').innerText = new Date().toLocaleDateString('es-MX', optionsDate);

        // Configuraciones de la librería html2pdf
        const opt = {
            margin:       10, // Margen del PDF
            filename:     'Cotizacion_KIA_K3.pdf',
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2, useCORS: true }, // scale: 2 mejora la resolución
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Cambiar el texto del botón mientras procesa
        const botonesPDF = [btnPdfMain, btnPdfModal];
        botonesPDF.forEach(btn => btn.style.opacity = '0.5');

        // Generamos el archivo PDF
        html2pdf().set(opt).from(pdfElement).save().then(() => {
            botonesPDF.forEach(btn => btn.style.opacity = '1');
            modal.classList.remove('active'); // Opcional: cierra el modal tras descargar
        });
    };

    // Vincular la función a ambos botones de PDF
    btnPdfMain.addEventListener('click', generarPDF);
    btnPdfModal.addEventListener('click', generarPDF);
});