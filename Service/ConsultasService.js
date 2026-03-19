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

        document.getElementById('view-title').textContent = 'Buzón de Consultas Públicas';

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
    document.getElementById('consulta-detail-name').textContent = `${consulta.nombre} ${consulta.apellido}`;
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
    btnMailto.href = `mailto:${consulta.correo}?subject=Respuesta a tu consulta en el Portal DCTI&body=Hola ${consulta.nombre},%0D%0A%0D%0AEn respuesta a tu consulta:%0D%0A"${consulta.consulta}"%0D%0A%0D%0A`;

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

        // Re-render
        if (typeof renderModule === 'function') {
            renderModule('consultas');
        }
    }
};

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
