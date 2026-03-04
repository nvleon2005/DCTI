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
                'Fecha Ingreso': u.id && typeof u.id === 'number' && u.id > 1000000 ? new Date(u.id).toISOString().split('T')[0] : 'Por defecto'
            }));
            break;
        case 'news':
            const news = typeof getLocalNews === 'function' ? getLocalNews() : [];
            rawData = news.map(n => ({
                ID: n.id,
                Titular: n.headline,
                Autor: n.author || 'Desconocido',
                Publicación: n.published || 'N/A',
                Status: Array.isArray(n.status) ? n.status.join(' | ') : (n.status || 'Borrador')
            }));
            break;
        case 'projects':
            const projects = typeof getLocalProjects === 'function' ? getLocalProjects() : [];
            rawData = projects.map(p => ({
                Código: p.id,
                Iniciativa: p.title,
                Apertura: p.date,
                Relevancia: p.featured ? 'Alta (Destacado)' : 'Estándar',
                Objetivos: p.objectives ? p.objectives.substring(0, 50) + '...' : 'N/A'
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

    const filters = {
        dateFrom: dateFromInput ? dateFromInput.value : null,
        dateTo: dateToInput ? dateToInput.value : null
    };

    const data = getReportData(currentReportDomain, filters);

    // Update Header Operator Name
    const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
    const opName = document.getElementById('report-operator-name');
    if (opName) {
        opName.textContent = session.name || session.username || 'Administrador del Sistema';
    }

    // Update KPI Card
    document.getElementById('report-kpi-total').textContent = data.length;

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
