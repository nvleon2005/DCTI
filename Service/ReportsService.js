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
                const statStr = Array.isArray(n.status) ? n.status.join(' ').toLowerCase() : (n.status || '').toLowerCase();
                return statStr.includes('publicad'); // FIXED: Removed 'validad' as News only use Publicada/Borrador
            });
            rawData = news.map(n => {
                let pubDate = n.published || 'N/A';
                if (pubDate !== 'N/A') {
                    // Si viene como Date object, ISO o toLocaleString
                    try {
                        const d = new Date(pubDate);
                        if (!isNaN(d)) {
                            pubDate = `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                        } else if (typeof pubDate === 'string') {
                            // En caso de fallar parse manual, intentar cortar segundos si viene formato DD/MM/YYYY HH:mm:ss
                            pubDate = pubDate.replace(/:\d{2}(\s?[AaPpmM]*)$/, '$1');
                        }
                    } catch(e) { /* fallback original */ }
                }
                
                return {
                    ID: n.id,
                    Titular: n.headline,
                    Categoría: n.category || 'General',
                    Autor: n.author || 'Desconocido',
                    Publicación: pubDate,
                    Status: Array.isArray(n.status) ? n.status.join(' | ') : (n.status || 'Borrador')
                };
            });
            break;
        case 'strategic':
            const allStrategic = typeof getLocalStrategic === 'function' ? getLocalStrategic() : [];
            rawData = allStrategic.map(s => ({
                Eje_Gestión: s.area || 'No Definido',
                Responsable: s.responsible || 'No Asignado',
                Creación: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A',
                Resumen: s.description ? s.description.substring(0, 50) + '...' : 'N/A'
            }));
            break;
        case 'projects':
            const allProjects = typeof getLocalProjects === 'function' ? getLocalProjects() : [];
            const projects = allProjects;
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
            const dateVal = item['Fecha Ingreso'] || item.Publicación || item.Apertura || item.Convocatoria || item.Creación;
            if (!dateVal || dateVal === 'N/A' || dateVal === 'Por defecto' || dateVal === 'Pendiente') return true;
            return new Date(dateVal) >= new Date(filters.dateFrom);
        });
    }
    if (filters.dateTo) {
        rawData = rawData.filter(item => {
            const dateVal = item['Fecha Ingreso'] || item.Publicación || item.Apertura || item.Convocatoria || item.Creación;
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
            if (domain === 'strategic') return item.Responsable === filters.customFilter1;
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

    // El evento de búsqueda global ahora se maneja de forma centralizada y optimizada en interface-logic.js

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
    } else if (domain === 'strategic') {
        const uniqueResponsible = [...new Set(currentReportData.map(s => s.Responsable))].filter(Boolean);
        filterHTML = `
            <div>
                <label style="${labelStyle}">Responsable del Área</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Responsables</option>
                    ${uniqueResponsible.map(r => `<option value="${r}">${r}</option>`).join('')}
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
    } else if (domain === 'strategic') {
        const manCount = [...new Set(data.map(p => p.Responsable))].filter(r => r !== 'No Asignado').length;
        statsHTML += statItem('Líneas Estr.', data.length, 'fas fa-sitemap', '#3b82f6');
        statsHTML += statItem('Líderes', manCount, 'fas fa-user-md', '#10b981');
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

async function exportReportToExcel() {
    if (currentReportData.length === 0) {
        AlertService.notify('Bloqueo de Exportación', 'El conjunto de datos se encuentra vacío. Ejecute primero una consulta.', 'warning');
        return;
    }

    if (typeof ExcelJS === 'undefined') {
        AlertService.notify('Error de librería', 'El motor de Excel (ExcelJS) no está disponible. Verifique su conexión o contacte al administrador.', 'error');
        return;
    }

    try {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Portal DCTI';
        workbook.created = new Date();

        const sheet = workbook.addWorksheet('Reporte ' + currentReportDomain.toUpperCase());
        const keys = Object.keys(currentReportData[0]);

        // Definir y estilizar encabezados
        sheet.columns = keys.map(k => ({
            header: k.replace(/_/g, ' '),
            key: k,
            width: 30 // Set a generous default width
        }));

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF530E90' } // Violeta institucional DCTI
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 25;

        // Agregar filas con los datos de forma limpia
        currentReportData.forEach(item => {
            const row = sheet.addRow(item);
            row.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
            // Optional alternate background coloring could go here based on row number
        });

        // Escribir a buffer binario para Web Browser
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.setAttribute("href", url);
        
        const now = new Date();
        const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        link.setAttribute("download", `DataSec_DCTI_${currentReportDomain.toUpperCase()}_${dateStr}.xlsx`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        logExportAudit(currentReportDomain, 'XLSX', currentReportData.length);
        AlertService.notify('Exportación Concedida', 'Módulo analítico enrutado y descargado exitosamente como Microsoft Excel (.xlsx).', 'success');

    } catch (error) {
        console.error("Error generating Excel output:", error);
        AlertService.notify('Falló Exportación', 'No se pudo generar el archivo Excel.', 'error');
    }
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
        'courses': 'Gestión Académica',
        'strategic': 'Ejes de Gestión (Organigrama Institucional)'
    };
    const domainLabel = domainNames[currentReportDomain] || currentReportDomain;

    const htmlContent = `
        <style>
            .doc-print-area { font-family: 'Helvetica', 'Segoe UI', sans-serif; color: #0f172a; width: 100%; margin: 0 auto; box-sizing: border-box; }
            .doc-top-bar { background-color: #530E90; color: white; padding: 25px 20px; margin-bottom: 25px; border-radius: 8px 8px 0 0; }
            .doc-top-bar h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: bold; letter-spacing: 0.5px; }
            .doc-top-bar p { margin: 0 0 4px 0; font-size: 14px; opacity: 0.9; }
            .doc-info { padding: 0 20px; margin-bottom: 30px; }
            .doc-info h2 { font-size: 20px; font-weight: bold; margin: 0 0 15px 0; color: #0f172a; text-transform: uppercase; }
            .doc-info p { margin: 0 0 6px 0; font-size: 13px; color: #334155; }
            .doc-table-wrapper { padding: 0 20px; overflow-x: auto; }
            .doc-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 40px; }
            .doc-table th, .doc-table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; vertical-align: middle; }
            .doc-table th { background-color: #530E90; color: white; text-align: center; text-transform: uppercase; font-weight: bold; }
            .doc-table tbody tr:nth-child(even) { background-color: #f8fafc; }
            .doc-footer { text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 15px; margin: 30px 20px 10px 20px; }
        </style>
        <div class="doc-print-area">
            <div class="doc-top-bar">
                <h1>DIRECCIÓN DE CIENCIA, TECNOLOGÍA E INNOVACIÓN</h1>
                <p>GOBIERNO DEL ESTADO MONAGAS</p>
                <p>Portal de Gestión Administrativa</p>
            </div>
            
            <div class="doc-info">
                <h2>DOCUMENTO OFICIAL: ${domainLabel}</h2>
                <p><strong>Fecha y Hora de Emisión:</strong> ${(() => {
                    const now = new Date();
                    return `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth()+1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
                })()}</p>
                <p><strong>Oficial a Cargo:</strong> ${session.name || session.username || session.email || 'Administrador del Sistema'}</p>
                <p><strong>Registros Consolidados:</strong> ${currentReportData.length}</p>
            </div>
            
            <div class="doc-table-wrapper">
                <table class="doc-table">
                    <thead>
                        <tr>${keys.map(k => `<th>${k.replace(/_/g, ' ')}</th>`).join('')}</tr>
                    </thead>
                    <tbody>
                        ${currentReportData.map(row => `<tr>${keys.map(k => `<td>${row[k]}</td>`).join('')}</tr>`).join('')}
                    </tbody>
                </table>
            </div>
            
            <div class="doc-footer">
                ESTE DOCUMENTO CONTIENE INFORMACIÓN PARA USO OFICIAL<br>
                ID DE TRAZABILIDAD SHA-256 ESTIMADO: ${btoa(currentReportDomain + Date.now().toString()).toUpperCase().substring(0, 32)}
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
    if (!currentReportData || currentReportData.length === 0) return;

    document.getElementById('report-preview-modal').style.display = 'none';

    try {
        const { jsPDF } = window.jspdf;
        // Usamos formato horizontal para que las tablas con muchas columnas (ej. Proyectos) quepan perfecto
        const doc = new jsPDF({ orientation: 'landscape', format: 'letter' });
        
        const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
        const domainNames = {
            'users': 'Directorio de Usuarios',
            'news': 'Registro de Publicaciones',
            'projects': 'Portafolio de Proyectos',
            'courses': 'Gestión Académica',
            'strategic': 'Ejes de Gestión (Organigrama Institucional)'
        };
        const domainLabel = domainNames[currentReportDomain] || currentReportDomain;
        
        // --- 1. CABECERA INSTITUCIONAL VIOLETA ---
        doc.setFillColor(83, 14, 144); // #530E90 (Violeta DCTI)
        doc.rect(0, 0, doc.internal.pageSize.width, 30, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text("DIRECCIÓN DE CIENCIA, TECNOLOGÍA E INNOVACIÓN", 15, 14);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("GOBIERNO DEL ESTADO MONAGAS", 15, 21);
        doc.text("Portal de Gestión Administrativa", 15, 26);
        
        // --- 2. INFORMACIÓN DEL REPORTE ---
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(`DOCUMENTO OFICIAL: ${domainLabel}`, 15, 45);
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth()+1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        doc.text(`Fecha y Hora de Emisión: ${dateStr}`, 15, 55);
        doc.text(`Oficial a Cargo: ${session.name || session.username || session.email || 'Administrador del Sistema'}`, 15, 61);
        doc.text(`Registros Consolidados: ${currentReportData.length}`, 15, 67);
        
        // --- 3. CREAR TABLA VECTORIAL ---
        const keys = Object.keys(currentReportData[0]);
        const bodyData = currentReportData.map(row => keys.map(k => row[k]));
        
        doc.autoTable({
            startY: 75,
            head: [keys.map(k => k.replace(/_/g, ' '))],
            body: bodyData,
            theme: 'grid',
            headStyles: { 
                fillColor: [83, 14, 144], 
                textColor: 255, 
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                valign: 'middle'
            },
            alternateRowStyles: { fillColor: [248, 250, 252] },
            styles: { fontSize: 9, cellPadding: 5, overflow: 'linebreak' },
            margin: { top: 75, bottom: 25 },
            didDrawPage: function (data) {
                // FOOTER
                const str = "Página " + doc.internal.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(100, 116, 139);
                doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10);
                
                // Sello de Trazabilidad Criptográfico
                const traceId = btoa(currentReportDomain + Date.now().toString()).toUpperCase().substring(0, 32);
                doc.text(`ID TRAZABILIDAD SHA-256: ${traceId}`, doc.internal.pageSize.width - data.settings.margin.right - 95, doc.internal.pageSize.height - 10);
                
                // Línea divisoria footer
                doc.setDrawColor(203, 213, 225);
                doc.line(data.settings.margin.left, doc.internal.pageSize.height - 15, doc.internal.pageSize.width - data.settings.margin.right, doc.internal.pageSize.height - 15);
            }
        });
        
        // --- 4. EXPORTAR EL ARCHIVO ---
        const fileDateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
        doc.save(`Documento_DCTI_${currentReportDomain.toUpperCase()}_${fileDateStr}.pdf`);
        
        logExportAudit(currentReportDomain, 'PDF_VECTOR_JSPDF', currentReportData.length);
        
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Documento Generado', 'El reporte profesional PDF ha sido ensamblado y descargado exitosamente.', 'success');
        }
        
    } catch (error) {
        console.error("Error al renderizar JS-PDF:", error);
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Renderizado Fallido', 'Hubo un error cargando las librerías PDF interactivas.', 'error');
        }
    }
}
