/**
 * Certifier.js — Módulo de Generación de Certificados Académicos
 * Portal DCTI | Dirección de Ciencia, Tecnología e Innovación
 * Dependencias: jsPDF (index.html), qrcode@1.5.3 via unpkg (index.html)
 *
 * QRCode.toDataURL(text, opts) — API async del paquete "qrcode" npm:
 *   1. Calcula internamente la matriz del QR (nivel de corrección de errores, modo)
 *   2. La renderiza en un canvas INTERNO (no en el DOM, sin timing issues)
 *   3. Retorna Promise<string> con el data URL PNG en base64
 */

// ==========================================
// CONFIGURACIÓN INSTITUCIONAL
// ==========================================
const CERT_CONFIG = {
    institucion:      'Dirección de Ciencia, Tecnología e Innovación',
    organismo:        'Gobierno del Estado Monagas',
    firmante1_nombre: 'Director(a) de DCTI',
    firmante1_cargo:  'Director(a) de DCTI',
    colorNavy:  [30, 27, 75],
    colorGold:  [201, 168, 76],
    colorGray:  [100, 116, 139],
    colorWhite: [255, 255, 255],
};

// ==========================================
// CÓDIGO ÚNICO DE CERTIFICADO
// ==========================================
function generateCertCode(courseId, activacionId, userId) {
    const year     = new Date().getFullYear();
    const userHash = String(userId).split('').reduce((a, c) => a + c.charCodeAt(0), 0) % 9999;
    const shortId  = String(courseId).slice(-3).padStart(3, '0');
    return `CERT-${year}-${shortId}-${activacionId}-${String(userHash).padStart(4, '0')}`;
}

// ==========================================
// QR → Data URL  (qrcode@1.5.3, Promise nativa)
// ==========================================
async function generateQRDataURL(text) {
    try {
        if (typeof QRCode === 'undefined') {
            console.warn('[Certifier] QRCode library not loaded');
            return null;
        }
        // QRCode.toDataURL es la API del paquete npm "qrcode", NO de qrcodejs.
        // Usa canvas interno, no necesita DOM.
        return await QRCode.toDataURL(text, {
            width: 160,
            margin: 1,
            color: { dark: '#1e1b4b', light: '#ffffff' },
            errorCorrectionLevel: 'M',
        });
    } catch (e) {
        console.warn('[Certifier] QR generation failed:', e);
        return null;
    }
}

// ==========================================
// HELPER: BLOQUE DE FIRMA
// ==========================================
function drawSignatureBlock(doc, cx, fy, nombre, cargo, nota, cN, cG) {
    doc.setDrawColor(...cN);
    doc.setLineWidth(0.5);
    doc.line(cx - 32, fy, cx + 32, fy);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...cN);
    doc.text(nombre, cx, fy + 5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...cG);
    doc.text(cargo, cx, fy + 10, { align: 'center' });
    if (nota) doc.text(nota, cx, fy + 14, { align: 'center' });
}

// ==========================================
// HELPER: ORNAMENTO DE ESQUINA
// ==========================================
function drawCornerOrnament(doc, x, y, size, color, corner) {
    doc.setDrawColor(...color);
    doc.setLineWidth(1.5);
    const s = size;
    if (corner === 'tl') { doc.line(x, y + s, x, y); doc.line(x, y, x + s, y); }
    else if (corner === 'tr') { doc.line(x, y + s, x, y); doc.line(x, y, x - s, y); }
    else if (corner === 'bl') { doc.line(x, y - s, x, y); doc.line(x, y, x + s, y); }
    else if (corner === 'br') { doc.line(x, y - s, x, y); doc.line(x, y, x - s, y); }
}

// ==========================================
// FUNCIÓN PRINCIPAL
// ==========================================
async function emitirCertificado(participacionId, courseId) {

    // ── 1. DATOS ─────────────────────────────────────────────────────────
    const course = getLocalCourses().find(c => c.id == courseId);
    if (!course) { AlertService.error('Curso no encontrado.', 'Error'); return; }

    const participacion = getLocalParticipations().find(p => p.id === participacionId);
    if (!participacion || participacion.estado !== 'Aprobado') {
        AlertService.warning('Solo se emiten certificados para participantes Aprobados.', 'Condición No Cumplida');
        return;
    }

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const hardcoded  = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
    const user = [...hardcoded, ...localUsers]
        .find(u => u.email === participacion.userId || u.username === participacion.userId);

    const nombreCompleto = user ? `${(user.name || '')} ${(user.lastname || '')}`.trim() : participacion.userId;
    const cedula         = user?.cedula ? `C.I.: ${user.cedula}` : null;

    // Fechas de la activación
    const activaciones   = course.activaciones || [{ id: 1, label: `Activación 1 (${course.fechaInicio} a ${course.fechaFin})` }];
    const activacionId   = participacion.activacionId || 1;
    const activacion     = activaciones.find(a => a.id == activacionId) || activaciones[0];
    const fechaMatch     = activacion.label.match(/\((.*?) a (.*?)\)/);
    const fechaInicioStr = fechaMatch ? fechaMatch[1] : course.fechaInicio;
    const fechaFinStr    = fechaMatch ? fechaMatch[2]   : course.fechaFin;

    const certCode     = generateCertCode(courseId, activacionId, participacion.userId);
    const fechaEmision = new Date().toLocaleDateString('es-VE', { day: '2-digit', month: 'long', year: 'numeric' });
    const instrNombre  = course.instructor      || CERT_CONFIG.firmante1_nombre;
    const instrCargo   = course.instructorCargo || 'Facilitador(a) del Curso';

    // ── 2. RECURSOS ASYNC ────────────────────────────────────────────────
    AlertService.info('Generando certificado, por favor espere...', 'Procesando');

    const qrDataURL = await generateQRDataURL(`${certCode} | ${course.nombreCurso} | ${nombreCompleto}`);

    // ── 3. CONSTRUIR PDF (coordenadas FIJAS — A4 landscape 297x210mm) ────
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const C = CERT_CONFIG;
    const W = 297, H = 210, CX = W / 2;

    // ── Fondo blanco ──
    doc.setFillColor(...C.colorWhite);
    doc.rect(0, 0, W, H, 'F');

    // ── Marco exterior navy (4px) ──
    doc.setDrawColor(...C.colorNavy);
    doc.setLineWidth(4);
    doc.rect(6, 6, W - 12, H - 12);

    // ── Línea interior dorada (1px) ──
    doc.setDrawColor(...C.colorGold);
    doc.setLineWidth(1);
    doc.rect(10.5, 10.5, W - 21, H - 21);

    // ── Header navy (y:10 → y:52) ──
    doc.setFillColor(...C.colorNavy);
    doc.rect(10.5, 10.5, W - 21, 41, 'F');

    // ── Emblema tipográfico DCTI (círculo dorado centrado en el header) ──
    doc.setFillColor(...C.colorGold);
    doc.circle(CX, 31, 14, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.colorNavy);
    doc.text('DCTI', CX, 35, { align: 'center' });

    // ── Organismo (y:56) ──
    doc.setTextColor(...C.colorGold);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(C.organismo.toUpperCase(), CX, 56, { align: 'center' });

    // ── Separador dorado (y:60) ──
    doc.setDrawColor(...C.colorGold);
    doc.setLineWidth(0.8);
    doc.line(35, 60, W - 35, 60);

    // ── Título (y:72) ──
    doc.setFont('times', 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...C.colorNavy);
    doc.text('CERTIFICADO DE APROBACIÓN', CX, 72, { align: 'center' });

    // ── "Otorgado a:" (y:81) ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...C.colorGray);
    doc.text('Otorgado a:', CX, 81, { align: 'center' });

    // ── Nombre del participante (y:91) ──
    doc.setFont('times', 'bolditalic');
    doc.setFontSize(20);
    doc.setTextColor(...C.colorNavy);
    doc.text(nombreCompleto || 'Participante', CX, 91, { align: 'center' });

    // ── Cédula (y:98, solo si existe) ──
    let nextY = 98;
    if (cedula) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(...C.colorGray);
        doc.text(cedula, CX, 98, { align: 'center' });
        nextY = 106;
    } else {
        nextY = 102;
    }

    // ── Descripción (y:nextY) ──
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    doc.text('Por haber completado satisfactoriamente el programa de formación:', CX, nextY, { align: 'center' });

    // ── Nombre del curso (y:nextY+9) — máx 1-2 líneas ──
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...C.colorNavy);
    const cursoLines = doc.splitTextToSize(course.nombreCurso, 200);
    doc.text(cursoLines, CX, nextY + 9, { align: 'center' });

    // ── Separador de detalles (FIJO y:130) ──
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(40, 130, W - 40, 130);

    // ── Detalles del curso FIJO (sin cohorte) (y:137, y:143) ──
    const detalles = [
        { label: 'Área Temática', value: course.areaTematica || '—' },
        { label: 'Modalidad',     value: course.modalidad    || '—' },
        { label: 'Duración',      value: course.duracion     || '—' },
        { label: 'Período',       value: `${fechaInicioStr} al ${fechaFinStr}` },
    ];
    const colW = (W - 80) / detalles.length;
    detalles.forEach((d, i) => {
        const x = 40 + colW * i + colW / 2;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...C.colorNavy);
        doc.text(d.label, x, 137, { align: 'center' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(...C.colorGray);
        doc.text(d.value, x, 143, { align: 'center' });
    });

    // ── Fecha de emisión FIJO (y:152) ──
    doc.setFontSize(8);
    doc.setTextColor(...C.colorGray);
    doc.text(`Emitido el: ${fechaEmision}`, CX, 152, { align: 'center' });

    // ── Separador de firmas FIJO (y:159) — sin línea gris al medio ──
    doc.setDrawColor(...C.colorGold);
    doc.setLineWidth(0.4);
    doc.line(40, 159, W - 55, 159);  // W-55 deja espacio al QR

    // ── Firmas FIJAS: Director (x:85) | Instructor (x:190) ──
    drawSignatureBlock(doc,  85, 172, CERT_CONFIG.firmante1_nombre, CERT_CONFIG.firmante1_cargo, C.institucion, C.colorNavy, C.colorGray);
    drawSignatureBlock(doc, 190, 172, instrNombre, instrCargo, 'Facilitador(a) del Programa', C.colorNavy, C.colorGray);

    // ── Código de certificado FIJO (y:197, x:14) ──
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...C.colorGray);
    doc.text(`Código de verificación: ${certCode}`, 14, H - 13);

    // ── QR FIJO (esquina inferior derecha: 40x40mm, margen 14mm) ──
    if (qrDataURL) {
        const qrSize = 40;
        const qrX    = W - 14 - qrSize;
        const qrY    = H - 14 - qrSize;
        doc.addImage(qrDataURL, 'PNG', qrX, qrY, qrSize, qrSize);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(5.5);
        doc.setTextColor(...C.colorGray);
        doc.text('Verificar autenticidad', qrX + qrSize / 2, qrY + qrSize + 4, { align: 'center' });
    }

    // ── Ornamentos de esquina ──
    drawCornerOrnament(doc, 10, 10, 12, C.colorGold, 'tl');
    drawCornerOrnament(doc, W - 10, 10, 12, C.colorGold, 'tr');
    drawCornerOrnament(doc, 10, H - 10, 12, C.colorGold, 'bl');
    drawCornerOrnament(doc, W - 10, H - 10, 12, C.colorGold, 'br');

    // ── 4. DESCARGAR ─────────────────────────────────────────────────────
    const safeName  = (nombreCompleto || 'Participante').replace(/\s+/g, '_');
    const safeCurso = course.nombreCurso.substring(0, 25).replace(/\s+/g, '_');
    doc.save(`Certificado_${safeName}_${safeCurso}.pdf`);

    AlertService.success(`Certificado de ${nombreCompleto} descargado exitosamente.`, 'Certificado Emitido');
}

// Exponer globalmente para los botones HTML (onclick)
window.emitirCertificado = emitirCertificado;
