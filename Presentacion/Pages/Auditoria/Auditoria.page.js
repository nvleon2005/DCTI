/**
 * Presentacion/Pages/Auditoria/Auditoria.page.js
 * Vista del módulo de Auditoría centralizado del Dashboard DCTI.
 * Diseño premium con clases CSS dedicadas.
 */

// --- Estado de filtros de auditoría ---
window.auditFilters = window.auditFilters || {
    module: 'Todos',
    action: 'Todas',
    user: 'Todos',
    dateFrom: '',
    dateTo: ''
};

window.auditCurrentPage = window.auditCurrentPage || 1;

const AuditoriaView = {
    render: (viewData) => {
        const stats = typeof AuditService !== 'undefined' ? AuditService.getStats() : { total: 0, today: 0, uniqueUsers: 0, topModule: 'N/A' };
        const uniqueUsers = typeof AuditService !== 'undefined' ? AuditService.getUniqueUsers() : [];
        const allLogs = typeof AuditService !== 'undefined' ? AuditService.getAll(window.auditFilters) : [];

        // Paginación
        const page = window.auditCurrentPage || 1;
        const perPage = 12;
        const totalPages = Math.ceil(allLogs.length / perPage) || 1;
        const startIdx = (page - 1) * perPage;
        const pageLogs = allLogs.slice(startIdx, startIdx + perPage);

        // --- Helpers de badges ---
        const actionMap = {
            'Creación':          { css: 'create',   icon: 'fa-plus-circle' },
            'Modificación':      { css: 'edit',     icon: 'fa-pen' },
            'Eliminación':       { css: 'delete',   icon: 'fa-trash-alt' },
            'Cambio de Estado':  { css: 'status',   icon: 'fa-exchange-alt' },
            'Inicio de Sesión':  { css: 'login',    icon: 'fa-sign-in-alt' },
            'Cierre de Sesión':  { css: 'logout',   icon: 'fa-sign-out-alt' },
            'Recuperación':      { css: 'recovery', icon: 'fa-key' }
        };

        const actionBadge = (action) => {
            const m = actionMap[action] || { css: 'edit', icon: 'fa-info-circle' };
            return `<span class="audit-action-badge audit-action-badge--${m.css}"><i class="fas ${m.icon}"></i>${action}</span>`;
        };

        const moduleColors = {
            'Usuarios':            { bg: 'rgba(124, 58, 237, 0.08)', text: '#7c3aed', border: 'rgba(124, 58, 237, 0.2)' },
            'Noticias':            { bg: 'rgba(34, 197, 94, 0.08)',  text: '#16a34a', border: 'rgba(34, 197, 94, 0.2)' },
            'Proyectos':           { bg: 'rgba(59, 130, 246, 0.08)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.2)' },
            'Cursos':              { bg: 'rgba(245, 158, 11, 0.08)', text: '#d97706', border: 'rgba(245, 158, 11, 0.2)' },
            'Áreas Estratégicas':  { bg: 'rgba(236, 72, 153, 0.08)', text: '#db2777', border: 'rgba(236, 72, 153, 0.2)' },
            'DCTI':                { bg: 'rgba(99, 102, 241, 0.08)', text: '#4f46e5', border: 'rgba(99, 102, 241, 0.2)' },
            'Autenticación':       { bg: 'rgba(100, 116, 139, 0.08)', text: '#475569', border: 'rgba(100, 116, 139, 0.2)' }
        };

        const moduleBadge = (mod) => {
            const c = moduleColors[mod] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
            return `<span class="audit-module-badge" style="background: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border};">${mod}</span>`;
        };

        const getUserInitials = (name) => {
            if (!name) return '?';
            const parts = name.split(' ');
            return parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : name.substring(0, 2).toUpperCase();
        };

        // --- Filas de la tabla ---
        const tableRows = pageLogs.length > 0
            ? pageLogs.map(log => `
                <tr>
                    <td>
                        <div class="audit-datetime">
                            <div class="audit-datetime-date">${new Date(log.timestamp).toLocaleDateString('es-VE')}</div>
                            <div class="audit-datetime-time">${new Date(log.timestamp).toLocaleTimeString('es-VE')}</div>
                        </div>
                    </td>
                    <td>${actionBadge(log.action)}</td>
                    <td>${moduleBadge(log.module)}</td>
                    <td class="audit-entity-cell" title="${log.entityLabel || ''}">${log.entityLabel || '—'}</td>
                    <td>
                        <span class="audit-user-cell">
                            <span class="audit-user-avatar">${getUserInitials(log.user)}</span>
                            ${log.user}
                        </span>
                    </td>
                    <td class="audit-details-cell" title="${log.details || ''}">${log.details || '—'}</td>
                </tr>
            `).join('')
            : `<tr><td colspan="6">
                    <div class="audit-empty-state">
                        <i class="fas fa-clipboard-check"></i>
                        <p>No se encontraron registros de auditoría${window.auditFilters.module !== 'Todos' || window.auditFilters.action !== 'Todas' ? ' con los filtros aplicados' : ''}.</p>
                    </div>
               </td></tr>`;

        // --- Paginación ---
        let paginationHtml = '';
        if (totalPages > 1) {
            paginationHtml = `<div class="audit-pagination">`;
            paginationHtml += `<button onclick="changeAuditPage(${page - 1})" ${page <= 1 ? 'disabled' : ''} class="audit-page-btn"><i class="fas fa-chevron-left"></i></button>`;

            const maxButtons = 5;
            let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
            let endPage = Math.min(totalPages, startPage + maxButtons - 1);
            if (endPage - startPage < maxButtons - 1) startPage = Math.max(1, endPage - maxButtons + 1);

            for (let i = startPage; i <= endPage; i++) {
                paginationHtml += `<button onclick="changeAuditPage(${i})" class="audit-page-btn ${i === page ? 'audit-page-btn--active' : ''}">${i}</button>`;
            }

            paginationHtml += `<button onclick="changeAuditPage(${page + 1})" ${page >= totalPages ? 'disabled' : ''} class="audit-page-btn"><i class="fas fa-chevron-right"></i></button>`;
            paginationHtml += `</div>`;
        }

        // --- Stat Cards (reutilizando el sistema global) ---
        const createStatCard = (icon, number, label, textColor, bgColor) => `
            <div class="dcti-stat-card">
                <div class="dcti-stat-card-header">
                    <div class="dcti-stat-card-icon" style="background: ${bgColor}; color: ${textColor};">
                        <i class="${icon}"></i>
                    </div>
                    <span class="dcti-stat-card-number">${number}</span>
                </div>
                <hr class="dcti-stat-card-divider">
                <p class="dcti-stat-card-label">${label}</p>
            </div>
        `;

        // --- Opciones de filtros ---
        const moduleOptions = ['Todos', 'Usuarios', 'Noticias', 'Proyectos', 'Cursos', 'Áreas Estratégicas', 'DCTI', 'Autenticación'];
        const actionOptions = ['Todas', 'Creación', 'Modificación', 'Eliminación', 'Cambio de Estado', 'Inicio de Sesión', 'Cierre de Sesión', 'Recuperación'];

        const renderOptions = (options, selected) => options.map(o =>
            `<option value="${o}" ${selected === o ? 'selected' : ''}>${o}</option>`
        ).join('');

        // --- Vista completa ---
        return `
            <div class="view-container">
                <!-- Header -->
                <div class="audit-header">
                    <h2>
                        <i class="fas fa-clipboard-list"></i>
                        Auditoría del Sistema
                    </h2>
                    <div class="audit-export-group">
                        <button onclick="exportAuditPDF()" class="audit-export-btn audit-export-btn--pdf" title="Exportar a PDF">
                            <i class="fas fa-file-pdf"></i> PDF
                        </button>
                        <button onclick="exportAuditExcel()" class="audit-export-btn audit-export-btn--excel" title="Exportar a Excel">
                            <i class="fas fa-file-excel"></i> Excel
                        </button>
                    </div>
                </div>

                <!-- Stat Cards -->
                <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
                    ${createStatCard('fas fa-clipboard-list', stats.total, 'Eventos Totales', 'var(--color-primary)', 'rgba(94, 27, 174, 0.1)')}
                    ${createStatCard('fas fa-clock', stats.today, 'Eventos Hoy', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                    ${createStatCard('fas fa-users', stats.uniqueUsers, 'Usuarios Activos', '#22c55e', 'rgba(34, 197, 94, 0.1)')}
                    ${createStatCard('fas fa-star', stats.topModule !== 'N/A' ? stats.topModuleCount : '—', stats.topModule !== 'N/A' ? 'Top: ' + stats.topModule : 'Sin datos', '#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                </div>

                <!-- Filtros -->
                <div class="audit-filters">
                    <div class="audit-filter-group">
                        <label class="audit-filter-label">Módulo</label>
                        <select class="audit-filter-select" onchange="applyAuditFilter('module', this.value)">
                            ${renderOptions(moduleOptions, window.auditFilters.module)}
                        </select>
                    </div>
                    <div class="audit-filter-group">
                        <label class="audit-filter-label">Acción</label>
                        <select class="audit-filter-select" onchange="applyAuditFilter('action', this.value)">
                            ${renderOptions(actionOptions, window.auditFilters.action)}
                        </select>
                    </div>
                    <div class="audit-filter-group">
                        <label class="audit-filter-label">Usuario</label>
                        <select class="audit-filter-select" onchange="applyAuditFilter('user', this.value)">
                            <option value="Todos">Todos</option>
                            ${uniqueUsers.map(u => `<option value="${u}" ${window.auditFilters.user === u ? 'selected' : ''}>${u}</option>`).join('')}
                        </select>
                    </div>
                    <div class="audit-filter-group" style="min-width: 130px;">
                        <label class="audit-filter-label">Desde</label>
                        <input type="date" class="audit-filter-date" value="${window.auditFilters.dateFrom}" onchange="applyAuditFilter('dateFrom', this.value)">
                    </div>
                    <div class="audit-filter-group" style="min-width: 130px;">
                        <label class="audit-filter-label">Hasta</label>
                        <input type="date" class="audit-filter-date" value="${window.auditFilters.dateTo}" onchange="applyAuditFilter('dateTo', this.value)">
                    </div>
                    <button onclick="clearAuditFilters()" class="audit-filter-clear" title="Limpiar filtros">
                        <i class="fas fa-times"></i> Limpiar
                    </button>
                </div>

                <!-- Tabla de Bitácora -->
                <div class="audit-table-container">
                    <div class="audit-table-header">
                        <h3>
                            <i class="fas fa-stream"></i>
                            Bitácora de Eventos
                        </h3>
                        <span class="audit-count-badge">${allLogs.length} registro(s)</span>
                    </div>
                    <div style="overflow-x: auto;">
                        <table class="audit-table">
                            <thead>
                                <tr>
                                    <th>Fecha / Hora</th>
                                    <th>Acción</th>
                                    <th>Módulo</th>
                                    <th>Entidad</th>
                                    <th>Usuario</th>
                                    <th>Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                    ${paginationHtml}
                </div>
            </div>
        `;
    }
};

// --- Funciones globales de control ---

window.applyAuditFilter = function (key, value) {
    window.auditFilters[key] = value;
    window.auditCurrentPage = 1;
    if (typeof renderModule === 'function') renderModule('auditoria', true);
};

window.clearAuditFilters = function () {
    window.auditFilters = { module: 'Todos', action: 'Todas', user: 'Todos', dateFrom: '', dateTo: '' };
    window.auditCurrentPage = 1;
    if (typeof renderModule === 'function') renderModule('auditoria');
};

window.changeAuditPage = function (page) {
    const allLogs = typeof AuditService !== 'undefined' ? AuditService.getAll(window.auditFilters) : [];
    const totalPages = Math.ceil(allLogs.length / 12) || 1;
    if (page < 1 || page > totalPages) return;
    window.auditCurrentPage = page;
    if (typeof renderModule === 'function') renderModule('auditoria', true);
};

// --- Exportación PDF ---
window.exportAuditPDF = function () {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF('landscape', 'mm', 'letter');
        const logs = typeof AuditService !== 'undefined' ? AuditService.getAll(window.auditFilters) : [];

        doc.setFontSize(16);
        doc.setTextColor(83, 14, 144);
        doc.text('Reporte de Auditoría — Portal DCTI', 14, 18);
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Generado: ${new Date().toLocaleString('es-VE')} | Registros: ${logs.length}`, 14, 24);

        const headers = [['Fecha', 'Hora', 'Acción', 'Módulo', 'Entidad', 'Usuario', 'Detalles']];
        const body = logs.map(l => [
            new Date(l.timestamp).toLocaleDateString('es-VE'),
            new Date(l.timestamp).toLocaleTimeString('es-VE'),
            l.action,
            l.module,
            (l.entityLabel || '—').substring(0, 30),
            l.user,
            (l.details || '—').substring(0, 40)
        ]);

        doc.autoTable({
            head: headers,
            body: body,
            startY: 30,
            styles: { fontSize: 7.5, cellPadding: 2.5, font: 'helvetica' },
            headStyles: { fillColor: [83, 14, 144], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            margin: { left: 14, right: 14 }
        });

        doc.save(`Auditoria_DCTI_${new Date().toISOString().slice(0, 10)}.pdf`);
        if (typeof AlertService !== 'undefined') AlertService.success('Reporte PDF generado y descargado exitosamente.', 'Exportación Exitosa');
    } catch (e) {
        console.error('Error exportando PDF de auditoría:', e);
        if (typeof AlertService !== 'undefined') AlertService.error('No se pudo generar el PDF. Verifique que las dependencias estén cargadas.', 'Error de Exportación');
    }
};

// --- Exportación Excel ---
window.exportAuditExcel = function () {
    try {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Auditoría DCTI');
        const logs = typeof AuditService !== 'undefined' ? AuditService.getAll(window.auditFilters) : [];

        sheet.columns = [
            { header: 'Fecha', key: 'fecha', width: 14 },
            { header: 'Hora', key: 'hora', width: 12 },
            { header: 'Acción', key: 'accion', width: 18 },
            { header: 'Módulo', key: 'modulo', width: 20 },
            { header: 'Entidad', key: 'entidad', width: 30 },
            { header: 'Usuario', key: 'usuario', width: 20 },
            { header: 'Detalles', key: 'detalles', width: 40 }
        ];

        sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF530E90' } };

        logs.forEach(l => {
            sheet.addRow({
                fecha: new Date(l.timestamp).toLocaleDateString('es-VE'),
                hora: new Date(l.timestamp).toLocaleTimeString('es-VE'),
                accion: l.action,
                modulo: l.module,
                entidad: l.entityLabel || '—',
                usuario: l.user,
                detalles: l.details || '—'
            });
        });

        workbook.xlsx.writeBuffer().then(buffer => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Auditoria_DCTI_${new Date().toISOString().slice(0, 10)}.xlsx`;
            a.click();
            URL.revokeObjectURL(url);
            if (typeof AlertService !== 'undefined') AlertService.success('Archivo Excel generado y descargado exitosamente.', 'Exportación Exitosa');
        });
    } catch (e) {
        console.error('Error exportando Excel de auditoría:', e);
        if (typeof AlertService !== 'undefined') AlertService.error('No se pudo generar el Excel. Verifique que ExcelJS esté cargado.', 'Error de Exportación');
    }
};
