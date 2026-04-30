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
    dateTo: '',
    search: ''
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
            'Creación':          { css: 'create',   icon: 'fa-plus-circle', severity: 'success' },
            'Modificación':      { css: 'edit',     icon: 'fa-pen', severity: 'info' },
            'Eliminación':       { css: 'delete',   icon: 'fa-trash-alt', severity: 'danger' },
            'Cambio de Estado':  { css: 'status',   icon: 'fa-exchange-alt', severity: 'warning' },
            'Inicio de Sesión':  { css: 'login',    icon: 'fa-sign-in-alt', severity: 'info' },
            'Cierre de Sesión':  { css: 'logout',   icon: 'fa-sign-out-alt', severity: 'default' },
            'Recuperación':      { css: 'recovery', icon: 'fa-key', severity: 'warning' }
        };

        const actionBadge = (action) => {
            const m = actionMap[action] || { css: 'edit', icon: 'fa-info-circle', severity: 'default' };
            let colorStr = '';
            if (m.severity === 'danger') colorStr = 'color: #ef4444; background: #fef2f2; border: 1px solid #fecaca;';
            else if (m.severity === 'warning') colorStr = 'color: #f59e0b; background: #fffbeb; border: 1px solid #fde68a;';
            else if (m.severity === 'success') colorStr = 'color: #10b981; background: #ecfdf5; border: 1px solid #a7f3d0;';
            else if (m.severity === 'info') colorStr = 'color: #3b82f6; background: #eff6ff; border: 1px solid #bfdbfe;';
            else colorStr = 'color: #64748b; background: #f1f5f9; border: 1px solid #e2e8f0;';
            return `<span class="audit-action-badge" style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 5px; ${colorStr}"><i class="fas ${m.icon}"></i>${action}</span>`;
        };

        const moduleColors = {
            'Usuarios':            { bg: 'rgba(124, 58, 237, 0.15)', text: '#7c3aed', border: 'rgba(124, 58, 237, 0.3)' },
            'Noticias':            { bg: 'rgba(34, 197, 94, 0.15)',  text: '#16a34a', border: 'rgba(34, 197, 94, 0.3)' },
            'Proyectos':           { bg: 'rgba(59, 130, 246, 0.15)', text: '#2563eb', border: 'rgba(59, 130, 246, 0.3)' },
            'Cursos':              { bg: 'rgba(245, 158, 11, 0.15)', text: '#d97706', border: 'rgba(245, 158, 11, 0.3)' },
            'Áreas Estratégicas':  { bg: 'rgba(236, 72, 153, 0.15)', text: '#db2777', border: 'rgba(236, 72, 153, 0.3)' },
            'DCTI':                { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5', border: 'rgba(99, 102, 241, 0.3)' },
            'Autenticación':       { bg: 'rgba(100, 116, 139, 0.15)', text: '#475569', border: 'rgba(100, 116, 139, 0.3)' }
        };

        const moduleBadge = (mod) => {
            const c = moduleColors[mod] || { bg: '#f1f5f9', text: '#64748b', border: '#e2e8f0' };
            return `<span class="audit-module-badge" style="background: ${c.bg}; color: ${c.text}; border: 1px solid ${c.border}; border-radius: 20px; padding: 4px 10px; font-weight: 600; font-size: 0.75rem; display: inline-block;">${mod}</span>`;
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
                    <td class="audit-details-cell" style="text-align: center;">
                        <button onclick="openAuditModal('${log.id}')" title="Ver Detalles Completos" style="background: none; border: 1px solid var(--color-border); padding: 6px 12px; border-radius: 6px; cursor: pointer; color: var(--color-text-main); font-size: 0.85rem; transition: all 0.2s; flex-shrink: 0;" onmouseover="this.style.background='var(--color-primary)'; this.style.color='white'; this.style.borderColor='var(--color-primary)';" onmouseout="this.style.background='none'; this.style.color='var(--color-text-main)'; this.style.borderColor='var(--color-border)';">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
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
                    <div class="export-btn-group">
                        <button onclick="exportAuditPDF()" class="btn-export btn-export--pdf" title="Exportar a PDF">
                            <i class="fas fa-file-pdf"></i>
                        </button>
                        <button onclick="exportAuditExcel()" class="btn-export btn-export--excel" title="Exportar a Excel">
                            <i class="fas fa-file-excel"></i>
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
                <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: var(--space-lg);">
                    <!-- Fila Superior -->
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02); flex: 1; min-width: 250px; max-width: 400px;">
                            <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" placeholder="Buscar detalle o entidad..." oninput="applyAuditFilter('search', this.value)" value="${window.auditFilters.search || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 100%; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>

                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                            <input type="date" value="${window.auditFilters.dateFrom}" onchange="applyAuditFilter('dateFrom', this.value)" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;">
                            <span style="color: var(--color-text-muted); font-size: 0.85rem;">a</span>
                            <input type="date" value="${window.auditFilters.dateTo}" onchange="applyAuditFilter('dateTo', this.value)" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;">
                        </div>
                    </div>

                    <!-- Fila Inferior -->
                    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <select onchange="applyAuditFilter('module', this.value)" style="flex: 1; min-width: 160px; padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <option value="Todos" ${window.auditFilters.module === 'Todos' ? 'selected' : ''}>Todos los Módulos</option>
                            ${renderOptions(moduleOptions.filter(o => o !== 'Todos'), window.auditFilters.module)}
                        </select>

                        <select onchange="applyAuditFilter('action', this.value)" style="flex: 1; min-width: 160px; padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <option value="Todas" ${window.auditFilters.action === 'Todas' ? 'selected' : ''}>Todas las Acciones</option>
                            ${renderOptions(actionOptions.filter(o => o !== 'Todas'), window.auditFilters.action)}
                        </select>

                        <select onchange="applyAuditFilter('user', this.value)" style="flex: 1; min-width: 160px; padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <option value="Todos">Todos los Usuarios</option>
                            ${uniqueUsers.map(u => `<option value="${u}" ${window.auditFilters.user === u ? 'selected' : ''}>${u}</option>`).join('')}
                        </select>

                        <button onclick="clearAuditFilters()" style="padding: 0 16px; height: 36px; border: none; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; background: #f1f5f9; color: #64748b; margin-left: auto; transition: 0.2s;" onmouseover="this.style.background='#e2e8f0';this.style.color='#475569';" onmouseout="this.style.background='#f1f5f9';this.style.color='#64748b';">
                            <i class="fas fa-times" style="margin-right: 5px;"></i> Limpiar
                        </button>
                    </div>
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
                                    <th style="text-align: center;">Detalles</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${tableRows}
                            </tbody>
                        </table>
                    </div>
                    ${paginationHtml}
                </div>

                <!-- Modal de Detalles Rediseñado -->
                <div id="audit-details-modal" class="modal-overlay hidden" onclick="if(event.target === this) closeAuditModal()">
                    <div class="modal-card" style="max-width: 650px; width: 95%; padding: 0; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.2);">
                        <div class="modal-header" style="background: var(--color-primary); padding: 1.5rem; color: white; position: relative;">
                            <h2 style="margin: 0; font-size: 1.25rem;"><i class="fas fa-search-plus" style="margin-right: 8px;"></i>Detalles del Registro</h2>
                            <div id="audit-modal-id-text" style="font-size: 0.85rem; opacity: 0.9; margin-top: 0.25rem;"></div>
                            <button class="close-modal" onclick="closeAuditModal()" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.2); border: none; color: white; border-radius: 50%; width: 30px; height: 30px; cursor: pointer;">&times;</button>
                        </div>
                        <div style="padding: 2rem; max-height: 70vh; overflow-y: auto;">
                            <div style="display: grid; grid-template-columns: 1fr 1.5fr; gap: 1.5rem; margin-bottom: 2rem;">
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase;">FECHA Y HORA</label>
                                    <div id="audit-modal-datetime" style="font-weight: 500; color: var(--color-text-main);"></div>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 0.75rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase;">MÓDULO</label>
                                    <div id="audit-modal-module-pill"></div>
                                </div>
                            </div>

                            <div style="background: #f8fafc; border-radius: 8px; padding: 1.25rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem;">
                                <label style="display: block; font-size: 0.75rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase; margin-bottom: 0.75rem;">INFORMACIÓN DEL USUARIO</label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                                    <div>
                                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">Usuario</div>
                                        <div id="audit-modal-username" style="font-weight: 600;"></div>
                                    </div>
                                    <div>
                                        <div style="font-size: 0.8rem; color: var(--color-text-muted);">Rol</div>
                                        <div id="audit-modal-role" style="font-weight: 600; text-transform: capitalize;"></div>
                                    </div>
                                </div>
                            </div>

                            <div style="margin-bottom: 1.5rem;">
                                <label style="display: block; font-size: 0.75rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase; margin-bottom: 0.5rem;">DESCRIPCIÓN DE LA ACCIÓN</label>
                                <div id="audit-modal-action-box" style="padding: 1rem; background: #fffbe6; border-left: 4px solid #fadb14; color: #856404; font-weight: 500;">
                                </div>
                            </div>

                            <div style="margin-bottom: 2rem;">
                                <label style="display: block; font-size: 0.75rem; color: var(--color-text-muted); font-weight: bold; text-transform: uppercase; margin-bottom: 0.75rem;">DATOS TÉCNICOS DETALLADOS</label>
                                <div id="audit-modal-details-grid" style="background: #f1f5f9; border-radius: 8px; padding: 1rem; border: 1px solid #cbd5e1;">
                                </div>
                            </div>

                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px;">
                                <div style="font-size: 1.5rem;">🛡️</div>
                                <div style="font-size: 0.85rem; color: #92400e; line-height: 1.4;">
                                    <strong>Registro Inmutable:</strong> Esta entrada en bitácora ha sido verificada y firmada digitalmente para garantizar su integridad y trazabilidad completa.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <style>
                    .audit-table { border-collapse: collapse; width: 100%; }
                    .audit-table th { background-color: #f8fafc; text-transform: uppercase; font-size: 0.75rem; font-weight: 700; color: #64748b; letter-spacing: 0.5px; padding: 12px 16px; border-bottom: 2px solid #e2e8f0; text-align: left; }
                    .audit-table td { padding: 14px 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
                    .audit-table tbody tr:hover { background-color: #f8fafc; }
                </style>
            </div>
        `;
    }
};

// --- Funciones globales de control ---

window.renderAuditJSONToGrid = function(detailsStr) {
    if (!detailsStr) return '<div style="color: var(--color-text-muted);">Sin detalles adicionales</div>';
    
    let entries = [];
    if (typeof detailsStr === 'string') {
        try {
            const parsed = JSON.parse(detailsStr);
            entries = Object.entries(parsed);
        } catch (e) {
            return `<div style="word-break: break-all; color: var(--color-text-main); font-weight: 500;">${detailsStr}</div>`;
        }
    } else if (typeof detailsStr === 'object') {
        entries = Object.entries(detailsStr);
    }
    
    if (entries.length === 0) return '<div style="color: var(--color-text-muted);">Sin detalles adicionales</div>';
    
    return `
      <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.5rem 1rem; align-items: baseline;">
        ${entries.map(([key, value]) => `
          <div style="font-weight: 600; color: #475569; font-size: 0.8rem; text-align: right;">${key}:</div>
          <div style="font-size: 0.85rem; color: #1e293b; word-break: break-all; font-family: monospace; background: #fff; padding: 2px 6px; border-radius: 4px; border: 1px solid #e2e8f0;">
            ${typeof value === 'object' ? JSON.stringify(value) : String(value)}
          </div>
        `).join('')}
      </div>
    `;
};

window.openAuditModal = function(logId) {
    const allLogs = typeof AuditService !== 'undefined' ? AuditService.getAll() : [];
    const log = allLogs.find(l => l.id === logId);
    if (!log) return;

    document.getElementById('audit-modal-id-text').textContent = `ID: ${log.id}`;
    document.getElementById('audit-modal-datetime').innerHTML = `${new Date(log.timestamp).toLocaleDateString('es-VE')} <span style="font-size:0.85em; color:var(--color-text-muted);">${new Date(log.timestamp).toLocaleTimeString('es-VE')}</span>`;
    
    document.getElementById('audit-modal-module-pill').innerHTML = `<span style="background: rgba(94, 27, 174, 0.1); color: var(--color-primary); border: 1px solid rgba(94, 27, 174, 0.2); padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">${log.module}</span>`;
    
    document.getElementById('audit-modal-username').textContent = log.user;
    
    const roleColors = { 'admin': 'background:#fee2e2;color:#ef4444', 'editor': 'background:#fef3c7;color:#f59e0b', 'visitante': 'background:#f1f5f9;color:#64748b' };
    const r = (log.userRole || 'Desconocido').toLowerCase();
    const rCol = roleColors[r] || 'background:#f1f5f9;color:#64748b';
    document.getElementById('audit-modal-role').innerHTML = `<span style="padding: 4px 10px; border-radius: 20px; font-weight: 600; font-size: 0.75rem; ${rCol}">${log.userRole || 'Desconocido'}</span>`;

    let entityHtml = log.entityLabel ? ` sobre <i style="color:var(--color-text-main); font-weight:700;">${log.entityLabel}</i>` : '';
    document.getElementById('audit-modal-action-box').innerHTML = `El usuario efectuó una acción de <b>${log.action}</b>${entityHtml}.`;
    
    document.getElementById('audit-modal-details-grid').innerHTML = window.renderAuditJSONToGrid(log.details);

    const modal = document.getElementById('audit-details-modal');
    if (modal) {
        modal.classList.remove('hidden');
        modal.style.display = 'flex';
    }
};

window.closeAuditModal = function() {
    const modal = document.getElementById('audit-details-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
};

window.applyAuditFilter = function (key, value) {
    window.auditFilters[key] = value;
    window.auditCurrentPage = 1;
    if (typeof renderModule === 'function') renderModule('auditoria', true);
};

window.clearAuditFilters = function () {
    window.auditFilters = { module: 'Todos', action: 'Todas', user: 'Todos', dateFrom: '', dateTo: '', search: '' };
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
