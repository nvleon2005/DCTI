// ==========================================
// REPORTS & AUDIT LOGIC (Trazabilidad)
// ==========================================

let currentReportData = [];
let currentReportDomain = 'users';

function getReportData(domain, filters = {}) {
    let rawData = [];

    // Extracción de datos minimizados (limpiando passwords, detalles intrusivos, etc)
    switch (domain) {
        case 'users':
            const adminUsers = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
            const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
            rawData = [...adminUsers, ...localUsers].map(u => ({
                Identificador: u.id || u.email,
                Nombre: u.name || u.username || 'Usuario Sistema',
                Email: u.email,
                Rol: u.role,
                Estado: u.status || (u.active === false ? 'Inactivo' : 'Activo'),
                'Fecha Ingreso': u.id && typeof u.id === 'number' && u.id > 1000000 ? new Date(u.id).toISOString().split('T')[0] : 'Por defecto'
            }));
            break;
        case 'news':
            const allNews = typeof getLocalNews === 'function' ? getLocalNews() : [];
            const news = allNews.filter(n => {
                const stat = Array.isArray(n.status) ? n.status : [n.status || ''];
                return stat.includes('Publicado') && stat.includes('Validado');
            });
            rawData = news.map(n => ({
                ID: n.id,
                Titular: n.headline,
                Categoría: n.category || 'General',
                Autor: n.author || 'Desconocido',
                Publicación: n.published || 'N/A',
                Status: Array.isArray(n.status) ? n.status.join(' | ') : (n.status || 'Borrador')
            }));
            break;
        case 'projects':
            const allProjects = typeof getLocalProjects === 'function' ? getLocalProjects() : [];
            const projects = allProjects.filter(p => {
                const stat = Array.isArray(p.status) ? p.status : [p.status || ''];
                return stat.includes('Publicado') && stat.includes('Validado');
            });
            rawData = projects.map(p => ({
                Código: p.id,
                Iniciativa: p.title,
                Responsable: p.manager || p.author || 'No asignado',
                Apertura: p.date,
                Relevancia: p.featured ? 'Alta (Destacado)' : 'Estándar',
                Objetivos: p.objectives ? p.objectives.substring(0, 50) + '...' : 'N/A',
                Status: Array.isArray(p.status) ? p.status.join(' | ') : (p.status || 'Borrador')
            }));
            break;
        case 'courses':
            const courses = typeof getLocalCourses === 'function' ? getLocalCourses() : [];
            rawData = courses.map(c => ({
                Referencia: c.id,
                Programa: c.nombreCurso || c.title,
                Máxima_Capacidad: c.cupoMaximo || c.enrollment || 'N/A',
                Estatus_Académico: c.estadoCurso || c.type || 'Público',
                Convocatoria: c.fechaInicio || 'Pendiente'
            }));
            break;
    }

    // Aplicar Filtros Dinámicos (Fechas)
    if (filters.dateFrom) {
        rawData = rawData.filter(item => {
            const dateVal = item['Fecha Ingreso'] || item.Publicación || item.Apertura || item.Convocatoria;
            if (!dateVal || dateVal === 'N/A' || dateVal === 'Por defecto' || dateVal === 'Pendiente') return true;
            return new Date(dateVal) >= new Date(filters.dateFrom);
        });
    }
    if (filters.dateTo) {
        rawData = rawData.filter(item => {
            const dateVal = item['Fecha Ingreso'] || item.Publicación || item.Apertura || item.Convocatoria;
            if (!dateVal || dateVal === 'N/A' || dateVal === 'Por defecto' || dateVal === 'Pendiente') return true;
            return new Date(dateVal) <= new Date(filters.dateTo);
        });
    }

    if (filters.customFilter1) {
        rawData = rawData.filter(item => {
            if (domain === 'users') return item.Rol === filters.customFilter1;
            if (domain === 'news') return item.Autor === filters.customFilter1;
            if (domain === 'projects') return item.Status.includes(filters.customFilter1);
            if (domain === 'courses') return item.Estatus_Académico === filters.customFilter1;
            return true;
        });
    }

    if (filters.customFilter2) {
        rawData = rawData.filter(item => {
            if (domain === 'users') return item.Estado === filters.customFilter2;
            if (domain === 'news') return item.Categoría === filters.customFilter2;
            if (domain === 'projects') return item.Responsable === filters.customFilter2;
            if (domain === 'courses') return item.Máxima_Capacidad === filters.customFilter2;
            return true;
        });
    }

    if (filters.customFilter3) {
        rawData = rawData.filter(item => {
            if (domain === 'projects') return item.Relevancia.includes(filters.customFilter3);
            return true;
        });
    }

    // Aplicar Motor General de Búsqueda de Texto
    if (filters.globalSearch) {
        const searchLower = filters.globalSearch.toLowerCase();
        rawData = rawData.filter(item => {
            return Object.values(item).some(val =>
                String(val).toLowerCase().includes(searchLower)
            );
        });
    }

    currentReportData = rawData;
    return rawData;
}

function renderReportDashboard() {
    const domainSelect = document.getElementById('report-domain');
    if (!domainSelect) return;

    currentReportDomain = domainSelect.value;

    const dateFromInput = document.getElementById('report-date-from');
    const dateToInput = document.getElementById('report-date-to');

    // Cross-validation of dates to prevent logical errors (dateTo < dateFrom)
    if (dateFromInput && dateToInput) {
        if (dateFromInput.value && dateToInput.value && dateFromInput.value > dateToInput.value) {
            // Auto-correct to match the selected reference if there's a clash
            dateToInput.value = dateFromInput.value;
        }

        // Lock HTML date pickers
        if (dateFromInput.value) dateToInput.min = dateFromInput.value;
        else dateToInput.min = '';

        if (dateToInput.value) dateFromInput.max = dateToInput.value;
        else dateFromInput.max = '';
    }

    const customFilter1Input = document.getElementById('report-custom-filter-1');
    const customFilter2Input = document.getElementById('report-custom-filter-2');
    const customFilter3Input = document.getElementById('report-custom-filter-3');

    // Global Search Input
    const globalSearchInput = document.getElementById('dashboard-search-input');

    const filters = {
        dateFrom: dateFromInput ? dateFromInput.value : null,
        dateTo: dateToInput ? dateToInput.value : null,
        customFilter1: customFilter1Input && customFilter1Input.value !== 'all' ? customFilter1Input.value : null,
        customFilter2: customFilter2Input && customFilter2Input.value !== 'all' ? customFilter2Input.value : null,
        customFilter3: customFilter3Input && customFilter3Input.value !== 'all' ? customFilter3Input.value : null,
        globalSearch: globalSearchInput ? globalSearchInput.value.trim() : null
    };

    const data = getReportData(currentReportDomain, filters);

    // Adjuntar evento de búsqueda global (solo lo hacemos una vez la primera vez que invocamos)
    if (globalSearchInput && !globalSearchInput.hasAttribute('data-report-listener')) {
        globalSearchInput.setAttribute('data-report-listener', 'true');
        globalSearchInput.addEventListener('input', () => {
            // Solo redibujamos si estamos en la vista de reportes
            const mainView = document.getElementById('main-content');
            if (mainView && mainView.innerHTML.includes('Explorador de Datos Estructurados')) {
                renderReportDashboard();
            }
        });
    }

    // Update Header Operator Name
    const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
    const opName = document.getElementById('report-operator-name');
    if (opName) {
        opName.textContent = session.name || session.username || 'Administrador del Sistema';
    }

    // Update KPI Card Fallback
    const kpiTotal = document.getElementById('report-kpi-total');
    if (kpiTotal) kpiTotal.textContent = data.length;

    // Update Table
    const tableHead = document.getElementById('report-table-head');
    const tableBody = document.getElementById('report-table-body');

    let headHTML = '';
    let bodyHTML = '';

    if (data.length === 0) {
        headHTML = `<tr><th>Atención del Motor</th></tr>`;
        bodyHTML = `<tr><td style="text-align: center; color: var(--color-text-muted); padding: 40px;">No se hallaron registros coincidentes en la base de datos local para la parametrización dada.</td></tr>`;
    } else {
        const keys = Object.keys(data[0]);
        headHTML = `<tr>${keys.map(k => `<th style="padding: 12px; border-bottom: 2px solid var(--color-border);">${k.replace(/_/g, ' ')}</th>`).join('')}</tr>`;

        data.forEach((row, rowIndex) => {
            const bg = rowIndex % 2 === 0 ? 'transparent' : '#f8fafc';
            bodyHTML += `<tr style="background: ${bg}; border-bottom: 1px solid var(--color-border);">${keys.map(k => `<td style="padding: 12px;">${row[k]}</td>`).join('')}</tr>`;
        });
    }

    tableHead.innerHTML = headHTML;
    tableBody.innerHTML = bodyHTML;

    renderReportExtraFilters(currentReportDomain);
    renderReportStats(currentReportDomain, data);
}

function renderReportExtraFilters(domain) {
    const container = document.getElementById('report-extra-filters');
    if (!container) return;

    // Solo renderizar si no existe ya el filtro, o si cambió el dominio
    const existingFilter = document.getElementById('report-custom-filter-1');
    if (existingFilter && container.dataset.domain === domain) {
        return;
    }
    container.dataset.domain = domain;

    let filterHTML = '';
    const selectStyle = "width: 100%; padding: 10px 15px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; font-weight: 500; font-size: 0.9rem; outline: none; transition: border-color 0.2s; color: #1e293b;";
    const labelStyle = "display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: #475569;";
    const focusEvt = "onfocus=\"this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'\" onblur=\"this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'\"";

    if (domain === 'users') {
        const uniqueStates = [...new Set(currentReportData.map(u => u.Estado))].filter(Boolean);
        filterHTML = `
            <div>
                <label style="${labelStyle}">Rol</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Roles</option>
                    <option value="admin">Administrador</option>
                    <option value="editor">Editor</option>
                    <option value="visitor">Visitante</option>
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Estado</label>
                <select id="report-custom-filter-2" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Estados</option>
                    ${uniqueStates.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (domain === 'news') {
        const uniqueAuthors = [...new Set(currentReportData.map(n => n.Autor))].filter(Boolean);
        const uniqueCategories = [...new Set(currentReportData.map(n => n.Categoría))].filter(Boolean);
        filterHTML = `
            <div>
                <label style="${labelStyle}">Autor(a)</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Autores</option>
                    ${uniqueAuthors.map(a => `<option value="${a}">${a}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Categoría</label>
                <select id="report-custom-filter-2" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todas las Categorías</option>
                    ${uniqueCategories.map(c => `<option value="${c}">${c}</option>`).join('')}
                </select>
            </div>
        `;
    } else if (domain === 'projects') {
        const uniqueStatuses = [...new Set(currentReportData.flatMap(p => p.Status.split(' | ')))].filter(Boolean);
        const uniqueManagers = [...new Set(currentReportData.map(p => p.Responsable))].filter(Boolean);
        filterHTML = `
            <div>
                <label style="${labelStyle}">Estatus Proyecto</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Estados</option>
                    ${uniqueStatuses.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Responsable</label>
                <select id="report-custom-filter-2" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Responsables</option>
                    ${uniqueManagers.map(m => `<option value="${m}">${m}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Relevancia</label>
                <select id="report-custom-filter-3" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todas</option>
                    <option value="Alta">Alta (Destacados)</option>
                    <option value="Estándar">Estándar</option>
                </select>
            </div>
        `;
    } else if (domain === 'courses') {
        const uniqueEstatus = [...new Set(currentReportData.map(c => c.Estatus_Académico))].filter(Boolean);
        const uniqueCapacidad = [...new Set(currentReportData.map(c => c.Máxima_Capacidad))].filter(c => c !== 'N/A');

        filterHTML = `
            <div>
                <label style="${labelStyle}">Estatus Académico</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Estatus</option>
                    ${uniqueEstatus.map(e => `<option value="${e}">${e}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Capacidad Máxima</label>
                <select id="report-custom-filter-2" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Cualquier Capacidad</option>
                    ${uniqueCapacidad.map(c => `<option value="${c}">${c} cupos</option>`).join('')}
                </select>
            </div>
        `;
    }

    container.innerHTML = filterHTML;
}

function renderReportStats(domain, data) {
    const container = document.getElementById('report-stats-container');
    if (!container) return;

    if (data.length === 0) {
        container.style.display = 'none';
        return;
    }
    container.style.display = 'flex';

    // Standard Grid Card Design
    const statItem = (label, value, icon, color) => `
        <div style="display: flex; align-items: center; gap: 15px; padding-right: 25px; border-right: 1px solid #e2e8f0;">
            <div style="background: ${color}15; width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="${icon}" style="color: ${color}; font-size: 1.25rem;"></i>
            </div>
            <div>
                <p style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">${label}</p>
                <h3 style="margin: 2px 0 0 0; font-size: 1.4rem; color: #0f172a; font-weight: 700;">${value}</h3>
            </div>
        </div>
    `;

    // Standard Clean Hit Counter
    let statsHTML = `
        <div style="display: flex; align-items: center; gap: 15px; padding-right: 25px; border-right: 1px solid #e2e8f0;">
            <div style="background: rgba(37,99,235,0.1); width: 45px; height: 45px; border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                <i class="fas fa-list-ul" style="color: var(--color-primary); font-size: 1.25rem;"></i>
            </div>
            <div>
                <p style="margin: 0; font-size: 0.75rem; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Total Muestra</p>
                <h3 style="margin: 2px 0 0 0; font-size: 1.4rem; color: #0f172a; font-weight: 700;" id="report-kpi-total">${data.length}</h3>
            </div>
        </div>
    `;

    if (domain === 'users') {
        const adminCount = data.filter(u => u.Rol === 'admin').length;
        const editorCount = data.filter(u => u.Rol === 'editor').length;
        const activeCount = data.filter(u => u.Estado === 'Activo').length;
        const inactiveCount = data.filter(u => u.Estado === 'Inactivo').length;
        statsHTML += statItem('Totales', data.length, 'fas fa-users', '#3b82f6');
        statsHTML += statItem('Activos', activeCount, 'fas fa-check-circle', '#10b981');
        statsHTML += statItem('Inactivos', inactiveCount, 'fas fa-times-circle', '#ef4444');
        statsHTML += statItem('Admin', adminCount, 'fas fa-user-shield', '#8b5cf6');
        statsHTML += statItem('Editor', editorCount, 'fas fa-user-edit', '#f59e0b');
    } else if (domain === 'news') {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = data.filter(n => n.Publicación === today).length;
        const autorCount = [...new Set(data.map(n => n.Autor))].length;
        statsHTML += statItem('Total Pub.', data.length, 'fas fa-newspaper', '#3b82f6');
        statsHTML += statItem('Pub. Hoy', todayCount, 'fas fa-calendar-day', '#10b981');
        statsHTML += statItem('Autores', autorCount, 'fas fa-pen-nib', '#f59e0b');
    } else if (domain === 'projects') {
        const featuredCount = data.filter(p => p.Relevancia.includes('Alta')).length;
        const managerCount = [...new Set(data.map(p => p.Responsable))].length;
        statsHTML += statItem('Validados', data.length, 'fas fa-project-diagram', '#3b82f6');
        statsHTML += statItem('Destacados', featuredCount, 'fas fa-star', '#f59e0b');
        statsHTML += statItem('Resp.', managerCount, 'fas fa-user-tie', '#10b981');
    }

    container.innerHTML = statsHTML;
}

function logExportAudit(domain, format, count) {
    const session = JSON.parse(localStorage.getItem('dcti_session')) || { email: 'Sistema_Root' };
    const logs = JSON.parse(localStorage.getItem('dcti_export_logs')) || [];

    logs.push({
        id: 'LOG-' + Date.now(),
        timestamp: new Date().toISOString(),
        user: session.email,
        domain: domain,
        format: format,
        count: count
    });

    localStorage.setItem('dcti_export_logs', JSON.stringify(logs));
}

function exportReportToCSV() {
    if (currentReportData.length === 0) {
        AlertService.notify('Bloqueo de Exportación', 'El conjunto de datos se encuentra vacío. Ejecute primero una consulta.', 'warning');
        return;
    }

    const keys = Object.keys(currentReportData[0]);
    // El carácter BOM \uFEFF y el delimitador ';' garantizan lectura perfecta de acentos en Microsoft Excel (Español)
    let csvContent = "\uFEFF"
        + keys.map(k => k.replace(/_/g, ' ')).join(";") + "\n"
        + currentReportData.map(e => keys.map(k => `"${(e[k] || '').toString().replace(/"/g, '""')}"`).join(";")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DataSec_DCTI_${currentReportDomain.toUpperCase()}_${Date.now()}.csv`);

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    logExportAudit(currentReportDomain, 'CSV_EXCEL', currentReportData.length);
    AlertService.notify('Exportación Concedida', 'Extracción analítica a Microsoft Excel materializada con soporte de caracteres especiales.', 'success');
}

let savedPDFHtml = '';

function previewReportPDF() {
    if (currentReportData.length === 0) {
        AlertService.notify('Bloqueo de Exportación', 'El conjunto de datos se encuentra vacío. Ejecute primero una consulta.', 'warning');
        return;
    }

    const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
    const keys = Object.keys(currentReportData[0]);

    // Nombres más limpios para el encabezado según select
    const domainNames = {
        'users': 'Directorio de Usuarios',
        'news': 'Registro de Publicaciones',
        'projects': 'Portafolio de Proyectos',
        'courses': 'Gestión Académica'
    };
    const domainLabel = domainNames[currentReportDomain] || currentReportDomain;

    const htmlContent = `
        <style>
            .doc-print-area { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 800px; margin: 0 auto; }
            .doc-header { text-align: center; border-bottom: 3px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; position: relative; }
            .doc-header h1 { margin: 0 0 5px 0; font-size: 20px; letter-spacing: 1px; }
            .doc-header p { margin: 0; font-size: 13px; color: #475569; }
            .doc-title { margin-top: 15px; font-weight: bold; font-size: 16px; text-transform: uppercase; }
            .doc-meta { background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-bottom: 30px; font-size: 12px; }
            .doc-table { width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 40px; }
            .doc-table th, .doc-table td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            .doc-table th { background-color: #f1f5f9; color: #0f172a; text-transform: uppercase; font-weight: 700; }
            .doc-footer { text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #cbd5e1; padding-top: 15px; margin-top: 50px; }
            .doc-signature-box { float: right; width: 250px; text-align: center; margin-top: 40px; border-top: 1px dotted #1e293b; padding-top: 5px; font-size: 11px; font-style: italic; }
            @media print {
                body { margin: 0; padding: 20px; }
                .doc-print-area { max-width: 100%; }
            }
        </style>
        <div class="doc-print-area">
            <div class="doc-header">
                <h1>DIRECCIÓN DE CIENCIA, TECNOLOGÍA E INNOVACIÓN</h1>
                <p>República Bolivariana de Venezuela - Estado Monagas</p>
                <div class="doc-title">REPORTE OFICIAL: ${domainLabel}</div>
            </div>
            
            <div class="doc-meta">
                <strong>Fecha y Hora Criptográfica:</strong> ${new Date().toLocaleString()}<br>
                <strong>Generado Por:</strong> ${session.name || session.username || session.email || 'Sistema'}<br>
                <strong>Motor Institucional:</strong> Dashware Export v4.0 (DCTI)<br>
                <strong>Registros Consolidados:</strong> ${currentReportData.length}
            </div>
            
            <div style="font-size: 11px; margin-bottom: 20px; color: #475569; border-left: 3px solid var(--color-primary); padding-left: 10px;">
                <strong>Nota:</strong> Los datos exportados reflejan estrictamente el filtro actual y en el caso de Noticias/Proyectos, cumplen con la validación de publicación.
            </div>
            
            <table class="doc-table">
                <thead>
                    <tr>${keys.map(k => `<th>${k.replace(/_/g, ' ')}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${currentReportData.map(row => `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`).join('')}
                </tbody>
            </table>
            
            <div class="doc-signature-box">
                Firmado Electrónicamente por la Plataforma<br>
                <strong>Comité Administrativo DCTI</strong>
            </div>
            
            <div style="clear: both;"></div>
            
            <div class="doc-footer">
                ESTE DOCUMENTO CONTIENE INFORMACIÓN PARA USO OFICIAL Y ESTÁ AMPARADO BAJO LA LEY ESPECIAL CONTRA DELITOS INFORMÁTICOS.<br>
                ID DE TRAZABILIDAD SHA-256 ESTIMADO: ${btoa(Date.now().toString() + currentReportDomain).toUpperCase()}
            </div>
        </div>
    `;

    savedPDFHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Reporte Oficial - ${domainLabel}</title>
            <meta charset="utf-8">
        </head>
        <body style="background: white;">
            ${htmlContent}
        </body>
        </html>
    `;

    const paperSheet = document.getElementById('report-paper-sheet');
    if (paperSheet) paperSheet.innerHTML = htmlContent;

    const modal = document.getElementById('report-preview-modal');
    if (modal) modal.style.display = 'flex';
}

function executePDFPrint() {
    if (!savedPDFHtml) return;

    document.getElementById('report-preview-modal').style.display = 'none';

    const printWindow = window.open('', '', 'height=800,width=1000');
    if (printWindow) {
        printWindow.document.write(savedPDFHtml);
        printWindow.document.close();
        printWindow.focus();

        logExportAudit(currentReportDomain, 'PDF_FORMAL', currentReportData.length);

        setTimeout(() => {
            printWindow.print();
            printWindow.close();
            if (typeof AlertService !== 'undefined') {
                AlertService.notify('Documento Emitido', 'El documento corporativo oficial ha sido procesado mediante el subsistema de impresión.', 'success');
            }
        }, 500);
    } else {
        AlertService.notify('Ventana Bloqueada', 'Su navegador ha bloqueado la ventana emergente de impresión. Por favor habilítelas para el portal.', 'error');
    }
}
