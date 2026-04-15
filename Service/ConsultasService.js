// js/consultas-logic.js

const ConsultasController = {
    // 1. OBTENER DATOS
    getConsultas() {
        try {
            return JSON.parse(localStorage.getItem('dcti_consultas')) || [];
        } catch (e) {
            console.error("Error al leer consultas", e);
            return [];
        }
    },

    saveConsultas(consultas) {
        localStorage.setItem('dcti_consultas', JSON.stringify(consultas));
    },

    // 2. LÓGICA DE RENDERIZADO AL DASHBOARD
    render(page = 1) {
        let consultas = this.getConsultas();

        // Ordenar por fecha descendente (más nuevas primero)
        consultas.sort((a, b) => b.id - a.id);

        // a) Filtrado por texto (nombre, apellido o correo)
        const searchQuery = (window.globalConsultaSearch || '').toLowerCase();
        if (searchQuery) {
            consultas = consultas.filter(c => {
                const searchStr = `${c.nombre || ''} ${c.apellido || ''} ${c.correo || ''}`.toLowerCase();
                return searchStr.includes(searchQuery);
            });
        }

        // b) Filtrado por estado
        const statusFilter = window.globalConsultaStatus || 'Todos';
        if (statusFilter !== 'Todos') {
            consultas = consultas.filter(c => c.estado === statusFilter);
        }

        // Paginación
        const limit = 10;
        const totalItems = consultas.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;
        if (page > totalPages) page = totalPages;
        if (page < 1) page = 1;

        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const pagedConsultas = consultas.slice(startIndex, endIndex);

        const dataEnvio = {
            consultas: pagedConsultas,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalItems,
                items: pagedConsultas
            }
        };

        const html = ConsultasView.render(dataEnvio);
        const container = document.getElementById('content-area');
        if (container) {
            container.innerHTML = html;
        }



        // Setear active en el nav
        if (typeof setActiveNav === 'function') setActiveNav('consultas');

        // Focus del search
        if (window.lastFocusedInput) {
            setTimeout(() => {
                const el = document.getElementById(window.lastFocusedInput);
                if (el) {
                    el.focus();
                    el.selectionStart = el.selectionEnd = el.value.length;
                }
            }, 10);
        }
    }
};

// 3. ACCIONES GLOBALES (Expuestas al HTML vía onclick)
window.verConsultaCompleta = function (id) {
    const consultas = ConsultasController.getConsultas();
    const consulta = consultas.find(c => c.id == id);
    if (!consulta) return;

    // Poblar modal
    // [SECURITY] Sanitizar el texto de la consulta al mostrarlo (Anti-XSS).
    // Usamos .textContent para el mensaje principal (ya es suficientemente seguro),
    // pero sanitizamos nombre y apellido que provienen de entrada de usuario.
    const sanitize = (s) => (window.sanitizeHTML ? window.sanitizeHTML(String(s || '')) : String(s || ''));
    document.getElementById('consulta-detail-name').textContent = `${sanitize(consulta.nombre)} ${sanitize(consulta.apellido)}`;
    document.getElementById('consulta-detail-email').textContent = consulta.correo;
    document.getElementById('consulta-detail-date').textContent = `${consulta.fecha} a las ${consulta.hora || '--:--'}`;

    const statusEl = document.getElementById('consulta-detail-status');
    const statusBadge = document.getElementById('consulta-detail-status-badge');
    statusEl.textContent = consulta.estado;

    if (consulta.estado === 'Respondida') {
        statusBadge.style.background = '#10b98115';
        statusBadge.style.color = '#10b981';
    } else {
        statusBadge.style.background = '#f59e0b15';
        statusBadge.style.color = '#f59e0b';
    }

    // textContent previene XSS nativo para el cuerpo del mensaje
    document.getElementById('consulta-detail-message').textContent = consulta.consulta;

    // Acciones del modal
    const btnRespondida = document.getElementById('btn-modal-respondida');
    if (consulta.estado === 'Respondida') {
        btnRespondida.innerHTML = '<i class="fas fa-undo" style="color: #f59e0b;"></i> <span style="color: #f59e0b;">Marcar Pendiente</span>';
        btnRespondida.style.borderColor = '#f59e0b50';
        btnRespondida.onclick = () => { window.toggleEstadoConsulta(id); document.getElementById('modal-ver-consulta').classList.add('hidden'); };
    } else {
        btnRespondida.innerHTML = '<i class="fas fa-check" style="color: #10b981;"></i> <span style="color: #475569;">Marcar Respondida</span>';
        btnRespondida.style.borderColor = '#e2e8f0';
        btnRespondida.onclick = () => { window.toggleEstadoConsulta(id); document.getElementById('modal-ver-consulta').classList.add('hidden'); };
    }

    const btnMailto = document.getElementById('btn-modal-mailto');
    btnMailto.removeAttribute('href'); // Quitar mailto nativo
    btnMailto.onclick = (e) => {
        e.preventDefault();
        const container = document.getElementById('quick-reply-container');
        container.classList.toggle('hidden');
        if (!container.classList.contains('hidden')) {
            document.getElementById('quick-reply-text').focus();
        }
    };

    const btnSendReply = document.getElementById('btn-send-reply');
    if (btnSendReply) {
        btnSendReply.onclick = () => { window.enviarRespuestaConsulta(id); };
    }

    // Ocultar drawer al abrir otra consulta
    document.getElementById('quick-reply-container').classList.add('hidden');
    document.getElementById('quick-reply-text').value = '';


    // Mostrar modal
    document.getElementById('modal-ver-consulta').classList.remove('hidden');
};

window.toggleEstadoConsulta = function (id) {
    let consultas = ConsultasController.getConsultas();
    let consultaIndex = consultas.findIndex(c => c.id == id);
    if (consultaIndex !== -1) {
        const nuevoEstado = consultas[consultaIndex].estado === 'Pendiente' ? 'Respondida' : 'Pendiente';
        consultas[consultaIndex].estado = nuevoEstado;
        ConsultasController.saveConsultas(consultas);

        if (typeof AlertService !== 'undefined') {
            AlertService.success(`Consulta marcada como ${nuevoEstado}`);
        }

        if (typeof renderModule === 'function') {
            renderModule('consultas');
        }
    }
};

// [SECURITY] Enviar respuesta con sanitización XSS y rate limiting (Anti-Spam)
const _enviarRespuestaCore = function (id) {
    const textarea = document.getElementById('quick-reply-text');
    // Sanitizar la respuesta escrita por el admin antes de guardarla
    const mensajeRaw = textarea.value.trim();
    const mensaje = window.sanitizeHTML ? window.sanitizeHTML(mensajeRaw) : mensajeRaw;

    if (!mensaje) {
        if (typeof AlertService !== 'undefined') AlertService.notify('Atención', 'Debes escribir una respuesta antes de enviar.', 'warning');
        return;
    }

    // 1. Simular envío por Email a través de Pasarela SMTP
    // (En un entorno real aquí se haría un fetch POST a la API de backend)

    // 2. Marcar consulta como "Respondida" localmente
    let consultas = ConsultasController.getConsultas();
    let consultaIndex = consultas.findIndex(c => c.id == id);
    if (consultaIndex !== -1) {
        consultas[consultaIndex].estado = 'Respondida';
        consultas[consultaIndex].respuestaEmitida = mensaje;
        consultas[consultaIndex].fechaRespuesta = new Date().toISOString();
        ConsultasController.saveConsultas(consultas);
    }

    // 3. Limpiar y cerrar modales
    textarea.value = '';
    document.getElementById('quick-reply-container').classList.add('hidden');
    document.getElementById('modal-ver-consulta').classList.add('hidden');

    if (typeof AlertService !== 'undefined') {
        AlertService.notify('Correo Enviado', 'La respuesta ha sido enviada exitosamente al solicitante.', 'success');
    }

    if (typeof renderModule === 'function') {
        renderModule('consultas');
    }
};

// Aplicar rate limiting: máximo 1 respuesta cada 3 segundos
window.enviarRespuestaConsulta = window.rateLimitAction
    ? window.rateLimitAction(_enviarRespuestaCore, 3000)
    : _enviarRespuestaCore;

window.eliminarConsulta = function (id) {
    if (typeof AlertService !== 'undefined') {
        AlertService.confirm(
            'Eliminar Consulta',
            '¿Estás seguro de que deseas evaluar y eliminar esta consulta enviada por el usuario? Esta acción no se puede deshacer.',
            (isConfirm) => {
                if (isConfirm) {
                    processDelete(id);
                }
            }
        );
    } else {
        if (confirm("¿Seguro que deseas eliminar esta consulta?")) {
            processDelete(id);
        }
    }

    function processDelete(id) {
        let consultas = ConsultasController.getConsultas();
        consultas = consultas.filter(c => c.id != id);
        ConsultasController.saveConsultas(consultas);
        if (typeof AlertService !== 'undefined') AlertService.success('Consulta eliminada.');
        if (typeof renderModule === 'function') renderModule('consultas');
    }
};

window.exportConsultasCSV = function () {
    let consultas = ConsultasController.getConsultas();
    if (consultas.length === 0) {
        if (typeof AlertService !== 'undefined') {
            AlertService.error("No hay consultas para exportar.");
        } else {
            alert("No hay consultas para exportar.");
        }
        return;
    }

    let csvContent = "data:text/csv;charset=utf-8,ID,Fecha,Hora,Nombre,Apellido,Correo,Estado,Consulta\n";

    consultas.forEach(function (row) {
        // Envolver en comillas dobles para evitar problemas con las comas en el texto
        const consultaClean = row.consulta ? row.consulta.replace(/"/g, '""').replace(/\n/g, ' ') : '';
        const rowArray = [
            row.id,
            row.fecha,
            row.hora,
            row.nombre,
            row.apellido,
            row.correo,
            row.estado,
            `"${consultaClean}"`
        ];
        csvContent += rowArray.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "buzon_consultas_dcti.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
window.getConsultas = ConsultasController.getConsultas.bind(ConsultasController);
window.ConsultasController = ConsultasController;
