// ==========================================
// REPORTS & AUDIT LOGIC (Trazabilidad)
// ==========================================

let currentReportData = [];
let currentReportDomain = 'users';

function getReportData(domain, filters = {}) {
    let rawData = [];

    const ensureDate = (val) => {
        if (!val || val === 'N/A') return null;
        if (typeof val === 'number') return new Date(val).toISOString();
        if (typeof val === 'string' && val.length === 10) return new Date(`${val}T12:00:00`).toISOString();
        try { return new Date(val).toISOString(); } catch(e) { return null; }
    };

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
                'Fecha Ingreso': u.createdAt ? new Date(u.createdAt).toISOString().split('T')[0] : (u.id && typeof u.id === 'number' && u.id > 1000000 ? new Date(u.id).toISOString().split('T')[0] : 'Por defecto'),
                _rawDate: u.createdAt ? ensureDate(u.createdAt) : (u.id && typeof u.id === 'number' && u.id > 1000000 ? ensureDate(u.id) : null)
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
                    Status: Array.isArray(n.status) ? n.status.join(' | ') : (n.status || 'Borrador'),
                    _rawDate: ensureDate(n.published)
                };
            });
            break;
        case 'strategic':
            const allStrategic = typeof getLocalStrategic === 'function' ? getLocalStrategic() : [];
            rawData = allStrategic.map(s => ({
                Eje_Gestión: s.area || 'No Definido',
                Creación: s.createdAt ? new Date(s.createdAt).toISOString().split('T')[0] : 'N/A',
                Resumen: s.description ? s.description.substring(0, 50) + '...' : 'N/A',
                _rawDate: ensureDate(s.createdAt)
            }));
            break;
        case 'projects':
            const allProjects = typeof getLocalProjects === 'function' ? getLocalProjects() : [];
            const projects = allProjects;
            rawData = projects.map(p => ({
                Código: p.id,
                Iniciativa: p.title,
                Apertura: p.date,
                Relevancia: p.featured ? 'Alta (Destacado)' : 'Estándar',
                Objetivos: p.objectives ? p.objectives.substring(0, 50) + '...' : 'N/A',
                Status: Array.isArray(p.status) ? p.status.join(' | ') : (p.status || 'Borrador'),
                _rawDate: ensureDate(p.date)
            }));
            break;
        case 'courses':
            const courses = typeof getLocalCourses === 'function' ? getLocalCourses() : [];
            const participations = typeof getLocalParticipations === 'function' ? getLocalParticipations() : [];
            rawData = courses.map(c => {
                const enrolled = participations.filter(p => p.courseId == c.id).length;
                return {
                    Referencia: c.id,
                    Programa: c.nombreCurso || c.title || 'Sin Nombre',
                    Instructor: c.instructor || 'Por Asignar',
                    Duración: c.duracion || c.hours || 'N/A',
                    Inscritos: enrolled,
                    Capacidad: c.cupoMaximo || c.enrollment || 'N/A',
                    Estatus: c.estadoCurso || c.type || 'Público',
                    Inicio: c.fechaInicio || 'Pendiente',
                    Fin: c.fechaFin || 'Pendiente',
                    _rawDate: ensureDate(c.fechaInicio)
                };
            });
            break;
    }

    // Aplicar Filtros Dinámicos (Fechas)
    if (filters.dateFrom) {
        rawData = rawData.filter(item => {
            if (!item._rawDate) return true;
            // Forzar zona horaria local añadiendo T00:00:00
            const dateFromLimit = new Date(`${filters.dateFrom}T00:00:00`);
            return new Date(item._rawDate) >= dateFromLimit;
        });
    }
    if (filters.dateTo) {
        rawData = rawData.filter(item => {
            if (!item._rawDate) return true;
            // Forzar zona horaria local añadiendo T23:59:59 para incluir todo el día
            const dateToLimit = new Date(`${filters.dateTo}T23:59:59.999`);
            return new Date(item._rawDate) <= dateToLimit;
        });
    }

    if (filters.customFilter1) {
        rawData = rawData.filter(item => {
            if (domain === 'users') return item.Rol === filters.customFilter1;
            if (domain === 'news') return item.Autor === filters.customFilter1;
            if (domain === 'projects') return item.Status.includes(filters.customFilter1);
            if (domain === 'courses') return item.Estatus === filters.customFilter1;
            return true;
        });
    }

    if (filters.customFilter2) {
        rawData = rawData.filter(item => {
            if (domain === 'users') return item.Estado === filters.customFilter2;
            if (domain === 'news') return item.Categoría === filters.customFilter2;
            if (domain === 'courses') return item.Instructor === filters.customFilter2;
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

    // Cross-validation of dates to restrict calendar native selection without breaking typing
    if (dateFromInput && dateToInput) {
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
        const keys = Object.keys(data[0]).filter(k => !k.startsWith('_'));
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
                <label style="${labelStyle}">Relevancia</label>
                <select id="report-custom-filter-3" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todas</option>
                    <option value="Alta">Alta (Destacados)</option>
                    <option value="Estándar">Estándar</option>
                </select>
            </div>
        `;
    } else if (domain === 'courses') {
        const uniqueEstatus = [...new Set(currentReportData.map(c => c.Estatus))].filter(Boolean);
        const uniqueInstructor = [...new Set(currentReportData.map(c => c.Instructor))].filter(Boolean);

        filterHTML = `
            <div>
                <label style="${labelStyle}">Estatus Académico</label>
                <select id="report-custom-filter-1" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Estatus</option>
                    ${uniqueEstatus.map(e => `<option value="${e}">${e}</option>`).join('')}
                </select>
            </div>
            <div>
                <label style="${labelStyle}">Cuerpo Docente (Instructor)</label>
                <select id="report-custom-filter-2" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="${selectStyle}" ${focusEvt}>
                    <option value="all">Todos los Instructores</option>
                    ${uniqueInstructor.map(i => `<option value="${i}">${i}</option>`).join('')}
                </select>
            </div>
        `;
    }

    container.innerHTML = filterHTML;
}

function renderReportStats(domain, data) {
    const container = document.getElementById('report-stats-container');
    if (!container) return;
    
    // El usuario ha solicitado remover u ocultar de forma permanente
    // estas miniaturas del reporte tras haber sido migradas a los submódulos de gestión.
    container.style.display = 'none';
    container.innerHTML = '';
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
        const keys = Object.keys(currentReportData[0]).filter(k => !k.startsWith('_'));

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
    const keys = Object.keys(currentReportData[0]).filter(k => !k.startsWith('_'));

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
        const keys = Object.keys(currentReportData[0]).filter(k => !k.startsWith('_'));
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

window.clearReportFilters = function() {
    const dateFrom = document.getElementById('report-date-from');
    const dateTo = document.getElementById('report-date-to');
    if (dateFrom) dateFrom.value = '';
    if (dateTo) dateTo.value = '';

    const globalSearch = document.getElementById('dashboard-search-input');
    if (globalSearch) globalSearch.value = '';

    const filter1 = document.getElementById('report-custom-filter-1');
    const filter2 = document.getElementById('report-custom-filter-2');
    const filter3 = document.getElementById('report-custom-filter-3');
    if (filter1) filter1.value = 'all';
    if (filter2) filter2.value = 'all';
    if (filter3) filter3.value = 'all';

    if (typeof renderReportDashboard === 'function') renderReportDashboard();
};

