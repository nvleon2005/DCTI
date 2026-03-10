// courses-logic.js
// Lógica de Persistencia y Negocio para el Módulo de Cursos (Validaciones, Tags, Auditoría & Regulación)

// ==========================================
// 1. SISTEMA DE ALMACENAMIENTO (LocalStorage)
// ==========================================

const COURSES_STORAGE_KEY = 'dcti_courses';
const PARTICIPATIONS_STORAGE_KEY = 'dcti_participations';

// MOCK DATA INICIAL (Si LocalStorage está vacío)
const DEFAULT_COURSES = [
    {
        id: 1,
        nombreCurso: "Python para Análisis de Datos",
        descripcion: "Dominio de librerías Pandas y NumPy.",
        fechaInicio: "2024-05-01",
        fechaFin: "2024-06-15",
        cupoMaximo: 45,
        estadoCurso: "Publicado",
        images: ["img/img9.jpg"],
        auditLogs: [{ fecha: new Date().toISOString(), estado: "Publicado", motivo: "Creación inicial del curso", autor: "Sistema" }]
    },
    {
        id: 2,
        nombreCurso: "Gestión de Proyectos I+D",
        descripcion: "Metodologías ágiles en ciencia y tecnología.",
        fechaInicio: "2024-03-10",
        fechaFin: "2024-04-20",
        cupoMaximo: 25,
        estadoCurso: "Finalizado",
        images: ["img/img10.jpg"],
        auditLogs: [{ fecha: new Date().toISOString(), estado: "Finalizado", motivo: "Cierre de ciclo formal", autor: "Sistema" }]
    }
];

const DEFAULT_PARTICIPATIONS = [
    { id: 1, courseId: 2, userId: "admin@dcti.gob", estado: "Aprobado", fechaInscripcion: "2024-03-05" } // Demo Integridad
];

// Instanciación y Migración
let existingCourses = JSON.parse(localStorage.getItem(COURSES_STORAGE_KEY));
if (!existingCourses || (existingCourses.length > 0 && !existingCourses[0].nombreCurso)) {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
}
if (!localStorage.getItem(PARTICIPATIONS_STORAGE_KEY)) {
    localStorage.setItem(PARTICIPATIONS_STORAGE_KEY, JSON.stringify(DEFAULT_PARTICIPATIONS));
}

// ==========================================
// 2. GETTERS Y SETTERS
// ==========================================

function getLocalCourses() {
    return JSON.parse(localStorage.getItem(COURSES_STORAGE_KEY)) || [];
}

function saveLocalCourses(coursesArray) {
    localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(coursesArray));
    if (typeof renderModule === 'function') {
        const currentCourseFilter = typeof globalCourseFilter !== 'undefined' ? globalCourseFilter : 'Publicado';
        filterCoursesAdmin(currentCourseFilter, false); // Forzar re-render respetando el filtro
    }
}

function getLocalParticipations() {
    return JSON.parse(localStorage.getItem(PARTICIPATIONS_STORAGE_KEY)) || [];
}


// ==========================================
// 3. VARIABLES DE ESTADO Y FILTROS
// ==========================================

let courseImageQueue = []; // Cola de subida para el modal
let courseMaterialsQueue = []; // Cola de materiales didácticos
let globalCourseFilter = 'Publicado'; // Query de Listado por Defecto


// ==========================================
// 4. LÓGICA DE AUDITORÍA Y CONTROL (Ley de Delitos Informáticos)
// ==========================================

/**
 * Graba un registro de auditoría si el estado cambia.
 */
function logCourseStateChange(course, nuevoEstado, motivo = "Cambio realizado por el administrador") {
    if (!course.auditLogs) course.auditLogs = [];
    course.auditLogs.push({
        fecha: new Date().toISOString(),
        estado: nuevoEstado,
        motivo: motivo,
        autor: JSON.parse(localStorage.getItem('dcti_session'))?.email || "Usuario Desconocido"
    });
}

// ==========================================
// 5. MODAL MULTI-ENTIDAD (Lógica UI)
// ==========================================

function openCourseModal(id = null) {
    if (typeof courseImageQueue !== 'undefined') courseImageQueue = [];
    courseMaterialsQueue = [];

    document.getElementById('edit-course-id').value = id ? id : '';

    // Reseteo visual Base
    document.getElementById('course-admin-form').reset();
    document.getElementById('admin-course-gallery').innerHTML = '';

    // Pestañas UI por defecto
    switchCourseTab('technical');

    // Quitar bloqueos por reactivacion (si vienen del cierre anterior)
    const inputs = document.querySelectorAll('#course-admin-form input, #course-admin-form textarea, #course-admin-form select');
    inputs.forEach(el => el.disabled = false);
    document.getElementById('btn-reactivate-course').style.display = 'none';

    if (id) {
        document.getElementById('course-modal-title').textContent = "Gestionar Curso";
        const allCourses = getLocalCourses();
        const course = allCourses.find(c => c.id == id);

        if (course) {
            document.getElementById('admin-course-name').value = course.nombreCurso;
            document.getElementById('admin-course-description').value = course.descripcion;
            document.getElementById('admin-course-start').value = course.fechaInicio;
            document.getElementById('admin-course-end').value = course.fechaFin;
            document.getElementById('admin-course-quota').value = course.cupoMaximo;
            document.getElementById('admin-course-status').value = course.estadoCurso;

            // Cargar Imágenes (Cola Base64 String - Compatibilidad backward)
            if (course.images && Array.isArray(course.images)) {
                courseImageQueue = [...course.images];
                renderCourseGallery();
            }

            // LÓGICA DE "SOLO LECTURA": ESTADO FINALIZADO
            if (course.estadoCurso === "Finalizado") {
                inputs.forEach(el => el.disabled = true);
                document.getElementById('btn-reactivate-course').style.display = 'inline-block';
                document.getElementById('btn-save-course').style.display = 'none';
                AlertService.notify('Modo Lectura', 'El curso está Finalizado. Los datos han sido congelados por control de auditoría.', 'warning');
            } else {
                document.getElementById('btn-save-course').style.display = 'inline-block';
            }

            // Cargar Materiales y Fechas
            if (course.materiales) {
                courseMaterialsQueue = [...course.materiales];
            }
            const dateInput = document.getElementById('admin-course-materials-date');
            if (dateInput) dateInput.value = course.fechaLiberacionMateriales || '';
            renderCourseMaterialsGallery();

            // Lógica de Pestañas Adicionales (Participantes)
            renderCourseParticipants(id);
        }
    } else {
        document.getElementById('course-modal-title').textContent = "Nuevo Curso";
        document.getElementById('course-gallery-title').textContent = "Previsualizar imágenes";
        document.getElementById('admin-course-status').value = "Borrador"; // default
        document.getElementById('btn-save-course').style.display = 'inline-block';

        // Bloquear tabs que requieren ID del curso para relacionarse (Alumnos)
        document.getElementById('tab-students-btn').style.opacity = '0.5';
        document.getElementById('tab-students-btn').style.pointerEvents = 'none';

        // Pestaña materiales sí disponible desde creación
        const dateInput = document.getElementById('admin-course-materials-date');
        if (dateInput) dateInput.value = '';
        renderCourseMaterialsGallery();
    }

    document.getElementById('course-modal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeCourseModal() {
    document.getElementById('course-modal').classList.add('hidden');
    document.body.style.overflow = 'auto';
}

function changeCourseStatusToReactivate() {
    // Reactivación explícita
    const inputs = document.querySelectorAll('#course-admin-form input, #course-admin-form textarea, #course-admin-form select');
    inputs.forEach(el => el.disabled = false);

    // Forzamos pasar a borrador para revisión
    document.getElementById('admin-course-status').value = "Borrador";

    document.getElementById('btn-reactivate-course').style.display = 'none';
    document.getElementById('btn-save-course').style.display = 'inline-block';

    AlertService.notify('Curso Reactivado', 'El ciclo se ha abierto para edición. Al guardar se registrará en la auditoría.', 'success');
}


// Navegación de Pestañas dentro del Modal
function switchCourseTab(tabName) {
    const tabs = ['technical', 'students', 'materials'];
    const modalCard = document.querySelector('#course-modal .modal-card');

    if (modalCard) {
        // Aseguramos que el modal mantenga el tamaño de la Ficha Pedagógica
        modalCard.style.maxWidth = '950px';
        modalCard.style.width = '95%';
        modalCard.style.transition = 'max-width 0.3s ease';
    }

    tabs.forEach(t => {
        const btn = document.getElementById(`tab-${t}-btn`);
        const content = document.getElementById(`tab-${t}-content`);
        if (btn && content) {
            if (t === tabName) {
                btn.style.borderBottom = "3px solid var(--color-primary)";
                btn.style.color = "var(--color-primary)";
                content.style.display = "block";
            } else {
                btn.style.borderBottom = "none";
                btn.style.color = "var(--color-text-muted)";
                content.style.display = "none";
            }
        }
    });
}


// ==========================================
// 6. VALIDACIONES CORE Y SUBMIT ESTRICTO
// ==========================================

async function handleCourseSubmit(e) {
    e.preventDefault();

    const id = document.getElementById('edit-course-id').value;
    const nombreCurso = document.getElementById('admin-course-name').value.trim();
    const descripcion = document.getElementById('admin-course-description').value.trim();
    const fechaInicio = document.getElementById('admin-course-start').value;
    const fechaFin = document.getElementById('admin-course-end').value;
    const cupoMaximo = parseInt(document.getElementById('admin-course-quota').value, 10);
    const estadoCurso = document.getElementById('admin-course-status').value;
    const fechaLiberacionMateriales = document.getElementById('admin-course-materials-date') ? document.getElementById('admin-course-materials-date').value : '';

    // Validación Anti-Espacios Vacíos (Hard Stop)
    if (!nombreCurso || !descripcion) {
        AlertService.notify('Campos Vacíos', 'El nombre y descripción no pueden contener únicamente espacios en blanco.', 'error');
        return;
    }

    // Validación COHERENCIA TEMPORAL (Hard Stop)
    if (new Date(fechaInicio) >= new Date(fechaFin)) {
        AlertService.notify('Error Temporal', 'La Fecha de Inicio debe ser estrictamente anterior a la Fecha de Fin.', 'error');
        return;
    }

    // Validación CAPACIDAD (Hard Stop)
    if (isNaN(cupoMaximo) || cupoMaximo <= 0) {
        AlertService.notify('Error de Capacidad', 'El Cupo Máximo debe ser un número entero estrictamente positivo (> 0).', 'error');
        return;
    }

    // Validación de Imágenes mínimas requeridas si es creacion 
    // En edición podemos dejar la que estaba, pero debe haber 1 al menos.
    if (!id && courseImageQueue.length === 0) {
        AlertService.notify('Imagen Requerida', 'La oferta académica debe tener al menos una imagen promocional asociada.', 'warning');
        return;
    }

    let allCourses = getLocalCourses();

    if (id) {
        const index = allCourses.findIndex(c => c.id == id);
        if (index !== -1) {
            const currentCourse = allCourses[index];
            const previousState = currentCourse.estadoCurso;

            // Construimos el update manteniendo compatibilidad
            allCourses[index] = {
                ...currentCourse,
                nombreCurso,
                descripcion,
                fechaInicio,
                fechaFin,
                cupoMaximo,
                estadoCurso,
                images: courseImageQueue.length > 0 ? courseImageQueue : currentCourse.images,
                materiales: courseMaterialsQueue,
                fechaLiberacionMateriales
            };

            // Verificar si hubo un cambio de Estado para activar la Función Log Audit
            if (previousState !== estadoCurso) {
                logCourseStateChange(allCourses[index], estadoCurso, `Modificación manual de estado (Anterior: ${previousState})`);
            }
            AlertService.notify('Curso Actualizado', 'La ficha pedagógica se ha guardado correctamente.', 'success');
        }
    } else {
        const newCourse = {
            id: Date.now(),
            nombreCurso,
            descripcion,
            fechaInicio,
            fechaFin,
            cupoMaximo,
            estadoCurso,
            images: courseImageQueue,
            materiales: courseMaterialsQueue,
            fechaLiberacionMateriales,
            auditLogs: []
        };
        // Auditoria Inicial de Registro
        logCourseStateChange(newCourse, estadoCurso, "Creación Inicial en Sistema");
        allCourses.push(newCourse);
        AlertService.notify('Curso Publicado', 'La nueva oferta de formación se ha emitido correctamente.', 'success');
    }

    saveLocalCourses(allCourses);
    closeCourseModal();
}

// ==========================================
// 7. MULTIMEDIA (Previsualización Image Queue)
// ==========================================

function handleCourseImageUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const validExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            AlertService.notify('Formato Inválido', `El archivo ${file.name} no es una imagen válida. Use JPG, PNG o WEBP.`, 'error');
            continue;
        }
        if (courseImageQueue.length >= 4) {
            AlertService.notify('Límite Alcanzado', 'Solo se permite un máximo de 4 imágenes por curso.', 'warning');
            break;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                // Compresión WebP 0.82
                courseImageQueue.push(canvas.toDataURL('image/webp', 0.82));
                renderCourseGallery();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function renderCourseGallery() {
    const galleryContainer = document.getElementById('admin-course-gallery');
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    courseImageQueue.forEach((src, index) => {
        const div = document.createElement('div');
        div.style.position = 'relative';
        div.style.aspectRatio = '1';
        div.style.borderRadius = '6px';
        div.style.overflow = 'hidden';
        div.style.border = '1px solid var(--color-border)';

        div.innerHTML = `
            <img src="${src}" style="width: 100%; height: 100%; object-fit: cover;">
            <button type="button" onclick="removeCourseImage(${index})" style="position: absolute; top: 5px; right: 5px; background: rgba(239, 68, 68, 0.9); color: white; border: none; width: 22px; height: 22px; border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(2px);"><i class="fas fa-times"></i></button>
            <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: rgba(0,0,0,0.5); color: white; font-size: 0.65rem; padding: 2px 4px; text-align: center;">Imagen ${index + 1}</div>
        `;
        galleryContainer.appendChild(div);
    });
}

function removeCourseImage(index) {
    if (document.getElementById('edit-course-id').value && courseImageQueue.length === 1) {
        AlertService.notify('Acción Bloqueada', 'No puedes eliminar la última imagen de un curso. Sube otra primero.', 'warning');
        return;
    }
    courseImageQueue.splice(index, 1);
    renderCourseGallery();
}


// ==========================================
// 8. LISTADO DE PARTICIPANTES
// ==========================================

function renderCourseParticipants(courseId) {
    const listContainer = document.getElementById('admin-course-students-list');
    if (!listContainer) return;

    const participations = getLocalParticipations().filter(p => p.courseId == courseId);

    if (participations.length === 0) {
        listContainer.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--color-text-muted);"><i class="fas fa-users-slash" style="font-size: 2rem; opacity:0.5; margin-bottom: 10px;"></i><p>Aún no hay participantes inscritos en esta cohorte.</p></div>`;
        return;
    }

    // Tabla Renderizada Interna
    let tableHtml = `
    <table style="width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left;">
        <thead>
            <tr style="border-bottom: 2px solid var(--color-border); color: var(--color-text-muted);">
                <th style="padding: 10px;">Usuario / Email</th>
                <th style="padding: 10px;">Fech. Inscripción</th>
                <th style="padding: 10px;">Estado</th>
                <th style="padding: 10px; text-align: right;">Acciones</th>
            </tr>
        </thead>
        <tbody>
    `;

    participations.forEach(p => {
        let spanColor = p.estado === 'Aprobado' || p.estado === 'Activo' ? '#166534' : (p.estado === 'Suspendido' ? '#991b1b' : '#374151');
        let spanBg = p.estado === 'Aprobado' || p.estado === 'Activo' ? '#dcfce7' : (p.estado === 'Suspendido' ? '#fee2e2' : '#f3f4f6');

        tableHtml += `
            <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 10px; font-weight: 600;">${p.userId}</td>
                <td style="padding: 10px;">${p.fechaInscripcion}</td>
                <td style="padding: 10px;">
                    <span style="background: ${spanBg}; color: ${spanColor}; padding: 2px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 700;">${p.estado}</span>
                </td>
                <td style="padding: 10px; text-align: right;">
                    <button title="Suspender" style="background:none; border:none; cursor:pointer; color: #f59e0b;"><i class="fas fa-user-slash"></i></button>
                    <button title="Retirar" style="background:none; border:none; cursor:pointer; color: #ef4444; margin-left: 5px;"><i class="fas fa-user-minus"></i></button>
                </td>
            </tr>
        `;
    });

    tableHtml += `</tbody></table>`;
    listContainer.innerHTML = tableHtml;
}


// ==========================================
// 9. CONTROL DE ACCESO (Granularidad Fina a Materiales - DD.AA)
// ==========================================

function tryDownloadMaterial(materialId, courseId) {
    const sessionData = JSON.parse(localStorage.getItem('dcti_session')) || {};
    const sessionEmail = sessionData.email;
    const sessionUsername = sessionData.username;
    const adminMode = sessionData.role === 'admin';

    if (adminMode) {
        AlertService.notify('Simulación de Descarga', `El material ${materialId} del curso ha sido empaquetado y descargado. Permiso otorgado vía Token de Administrador.`, 'success');
        return;
    }

    const participations = getLocalParticipations();
    const isEnrolledAndActive = participations.some(p => p.courseId == courseId && (p.userId === sessionEmail || p.userId === sessionUsername) && (p.estado === "Activo" || p.estado === "Aprobado"));

    if (!isEnrolledAndActive) {
        AlertService.notify('Acceso Restringido', 'Integridad de Recursos: Acceso denegado por Ley sobre Derecho de Autor. No posees una inscripción activa en este módulo.', 'error');
        return;
    }

    const allCourses = getLocalCourses();
    const course = allCourses.find(c => c.id == courseId);
    if (course && course.fechaLiberacionMateriales) {
        const releaseDate = new Date(course.fechaLiberacionMateriales);
        const today = new Date();
        releaseDate.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        if (today < releaseDate) {
            AlertService.notify('Material Programado', `Este bloque de materiales ha sido configurado por el Docente para estar disponible a partir del ${course.fechaLiberacionMateriales}.`, 'warning');
            return;
        }
    }

    const matName = course.materiales?.find(m => m.id === materialId)?.name || 'material_curso';
    AlertService.notify('Material Liberado', `Descarga del registro pedagógico #${materialId} iniciada satisfactoriamente. (Identificador Criptográfico asignado p/Trazabilidad)`, 'success');

    // Generar archivo simulado y forzar descarga en el navegador con la extensión cambiada a .txt preventivamente
    const mockContent = "Este es un documento generado por el simulador del Portal DCTI para validar la funcionalidad de descarga de materiales protegidos.";
    const blob = new Blob([mockContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // Forzamos la extensión de salida a .txt para evitar que el visor PDF o Word de tu PC arroje "archivo corrupto" al intentar leer texto plano
    a.download = matName.replace(/\.[^/.]+$/, "") + "_simulado.txt";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function handleCourseMaterialUpload(event) {
    const files = event.target.files;
    if (files.length === 0) return;

    const validExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'zip'];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (!validExtensions.includes(fileExt)) {
            AlertService.notify('Formato Inválido', `El archivo "${file.name}" posee una extensión no autorizada.`, 'error');
            continue;
        }

        let iconClass = 'fa-file-alt';
        let iconColor = '#64748b';

        if (fileExt === 'pdf') { iconClass = 'fa-file-pdf'; iconColor = '#ef4444'; }
        else if (['doc', 'docx'].includes(fileExt)) { iconClass = 'fa-file-word'; iconColor = '#3b82f6'; }
        else if (['xls', 'xlsx'].includes(fileExt)) { iconClass = 'fa-file-excel'; iconColor = '#10b981'; }
        else if (fileExt === 'zip') { iconClass = 'fa-file-archive'; iconColor = '#eab308'; }

        const sizeMB = (file.size / (1024 * 1024)).toFixed(2);

        courseMaterialsQueue.push({
            id: 'MAT-' + Date.now() + i,
            name: file.name,
            sizeMB,
            iconClass,
            iconColor
        });
    }

    renderCourseMaterialsGallery();
    AlertService.notify('Material Anexado', 'Documento agregado a la cola de encriptación exitosamente.', 'info');
}

function renderCourseMaterialsGallery() {
    const materialsContainer = document.getElementById('materials-grid-container');
    if (!materialsContainer) return;

    let html = '';
    courseMaterialsQueue.forEach((mat, index) => {
        html += `
        <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 15px; text-align: center; background: white; position: relative;">
            <i class="fas fa-check-circle" style="color: #10b981; position: absolute; top: 10px; right: 10px;" title="Archivo Validado"></i>
            <i class="fas ${mat.iconClass}" style="font-size: 2.5rem; color: ${mat.iconColor}; margin-bottom: 10px;"></i>
            <h4 style="margin: 0 0 5px 0; font-size: 0.9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 150px; display: inline-block;">${mat.name}</h4>
            <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 0 0 10px 0;">${mat.sizeMB} MB - Local</p>
            <div style="display: flex; gap: 5px;">
                <button type="button" onclick="tryDownloadMaterial('${mat.id}', document.getElementById('edit-course-id').value)" style="flex: 1; padding: 8px; background: #f1f5f9; border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--color-primary); transition: 0.2s;" title="Simular Descarga Lícita"><i class="fas fa-download"></i></button>
                <button type="button" onclick="removeCourseMaterial(${index})" style="flex: 1; padding: 8px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: #ef4444; transition: 0.2s;" title="Eliminar"><i class="fas fa-trash"></i></button>
            </div>
        </div>
        `;
    });

    html += `
        <!-- SUBIR MATERIAL VÍA MODAL -->
        <div style="position: relative; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; background: #fafafa; cursor: pointer; transition: 0.2s;">
            <input type="file" id="admin-course-materials-file" accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.zip,application/zip" multiple onchange="if(typeof handleCourseMaterialUpload==='function') handleCourseMaterialUpload(event)" style="opacity: 0; position: absolute; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; z-index: 10;">
            <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 10px; pointer-events: none;"></i>
            <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); pointer-events: none;">Repositorio Segurizado</span>
            <span style="font-size: 0.7rem; color: var(--color-primary); font-weight: 600; pointer-events: none; margin-top: 5px; text-align: center;">Formatos: PDF, DOCX, XLSX, ZIP</span>
        </div>
    `;

    materialsContainer.innerHTML = html;
}

function removeCourseMaterial(index) {
    courseMaterialsQueue.splice(index, 1);
    renderCourseMaterialsGallery();
}


// ==========================================
// 10. ELIMINACIÓN Y FILTROS DEL GRID UI
// ==========================================

function deleteCourse(id) {
    // REGLA DE INTEGRIDAD REFERENCIAL
    const participations = getLocalParticipations().filter(p => p.courseId == id);
    if (participations.length > 0) {
        AlertService.notify('Bloqueo Referencial (SQL Fk Violada)', `No se puede eliminar de forma física este curso porque ya posee ${participations.length} registro(s) atado(s) en la tabla de Participación. Cambie su estado a Finalizado o Borrador para ocultarlo de la oferta académica externa.`, 'error');
        return;
    }

    if (confirm("¿Está absolutamente seguro de que desea borrar de forma destructiva y permantente este curso? Esta acción no se puede deshacer.")) {
        let courses = getLocalCourses();
        courses = courses.filter(c => c.id != id);
        saveLocalCourses(courses);
        AlertService.notify('Eliminado', 'Curso destruido de los registros.', 'success');
    }
}

function filterCoursesAdmin(category, resetPage = true) {
    if (typeof renderModule !== 'function') return;

    globalCourseFilter = category;

    // Respetar paginación (Ir a pag 1 si cambia filtro)
    if (resetPage && PAGINATION_STATE['courses']) {
        PAGINATION_STATE['courses'].currentPage = 1;
    }

    let allCourses = getLocalCourses();
    let filtered = allCourses;

    if (category !== 'Todos') {
        filtered = allCourses.filter(c => c.estadoCurso === category);
    }

    const mainContent = document.getElementById('content-area');
    if (!mainContent) return;

    const fakeData = {
        courses: filtered,
        categoryFilter: category,
        pagination: typeof getPaginatedData === 'function' ? getPaginatedData(filtered, 'courses') : null
    };

    if (typeof CoursesView !== 'undefined') {
        mainContent.innerHTML = CoursesView.render(fakeData);
    }
}
