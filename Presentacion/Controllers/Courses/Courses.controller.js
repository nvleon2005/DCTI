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
        objetivos: "Aplicar técnicas de ciencia de datos mediante el entorno Python.",
        areaTematica: "Tecnología e Informática",
        modalidad: "Virtual",
        duracion: "120 horas",
        fechaInicio: "2024-05-01",
        fechaFin: "2024-06-15",
        cupoMaximo: 45,
        estadoCurso: "Publicado",
        images: ["assets/images/img9.jpg"],
        activaciones: [{ id: 1, label: "Activación 1 (2024-05-01 a 2024-06-15)" }],
        auditLogs: [{ fecha: new Date().toISOString(), estado: "Publicado", motivo: "Creación inicial del curso", autor: "Sistema" }]
    },
    {
        id: 2,
        nombreCurso: "Gestión de Proyectos I+D",
        descripcion: "Metodologías ágiles en ciencia y tecnología.",
        objetivos: "Implementar Scrum en el desarrollo de productos tecnológicos.",
        areaTematica: "Gestión Estratégica",
        modalidad: "Híbrido",
        duracion: "40 horas",
        fechaInicio: "2024-03-10",
        fechaFin: "2024-04-20",
        cupoMaximo: 25,
        estadoCurso: "Finalizado",
        images: ["assets/images/img10.jpg"],
        activaciones: [{ id: 1, label: "Activación 1 (2024-03-10 a 2024-04-20)" }],
        auditLogs: [{ fecha: new Date().toISOString(), estado: "Finalizado", motivo: "Cierre de ciclo formal", autor: "Sistema" }]
    }
];

const DEFAULT_PARTICIPATIONS = [
    { id: 1, courseId: 2, userId: "admin@dcti.gob", estado: "Activo", fechaInscripcion: "2024-03-05" } // Demo Integridad
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
    let courses = JSON.parse(localStorage.getItem(COURSES_STORAGE_KEY)) || [];
    courses = courses.map(c => {
        if (!c.activaciones) {
            c.activaciones = [{ id: 1, label: `Activación 1 (${c.fechaInicio} a ${c.fechaFin})` }];
        }
        return c;
    });
    return courses;
}

function saveLocalCourses(coursesArray) {
    try {
        localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(coursesArray));
        if (typeof renderModule === 'function') {
            const currentCourseFilter = typeof globalCourseFilter !== 'undefined' ? globalCourseFilter : 'Publicado';
            filterCoursesAdmin(currentCourseFilter, false); // Forzar re-render respetando el filtro
        }
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            AlertService.error('No hay espacio para guardar los datos. Intente borrar otros registros o subir imágenes más pequeñas.', 'Almacenamiento Lleno');
        } else {
            console.error('Error guardando cursos en localStorage:', e);
        }
        throw e;
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
window.globalCourseFilter = globalCourseFilter; // Exponer al scope global


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
// 4.1 AUTOCOMPLETE: ÁREA TEMÁTICA
// ==========================================

const COURSE_AREAS = ['Tecnología e Informática', 'Gestión Estratégica', 'Innovación y Desarrollo', 'Ofimática'];

function showCourseAreas() {
    const dropdown = document.getElementById('course-area-dropdown');
    if (dropdown) {
        filterCourseAreas(document.getElementById('admin-course-area')?.value || '');
        dropdown.style.display = 'block';
    }
}

function hideCourseAreas() {
    const dropdown = document.getElementById('course-area-dropdown');
    if (dropdown) dropdown.style.display = 'none';
}

function filterCourseAreas(query) {
    const dropdown = document.getElementById('course-area-dropdown');
    if (!dropdown) return;
    dropdown.style.display = 'block';

    const options = dropdown.querySelectorAll('.ca-option');
    const hint = document.getElementById('ca-custom-hint');
    const q = query.toLowerCase().trim();
    let anyVisible = false;

    options.forEach(opt => {
        const text = opt.textContent.trim().toLowerCase();
        const match = !q || text.includes(q);
        opt.style.display = match ? 'flex' : 'none';
        if (match) anyVisible = true;
    });

    // Show custom hint if user typed something not in the list
    if (hint) hint.style.display = (q && !anyVisible) ? 'block' : 'none';
    if (!anyVisible && q && hint) hint.style.display = 'block';
}

function selectCourseArea(value) {
    const input = document.getElementById('admin-course-area');
    if (input) input.value = value;
    hideCourseAreas();
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
            if(document.getElementById('admin-course-objetivos')) document.getElementById('admin-course-objetivos').value = course.objetivos || '';
            if(document.getElementById('admin-course-area')) document.getElementById('admin-course-area').value = course.areaTematica || 'Tecnología e Informática';
            if(document.getElementById('admin-course-modalidad')) {
                document.getElementById('admin-course-modalidad').value = course.modalidad || 'Virtual';
                toggleCourseVirtualUrl(course.modalidad || 'Virtual');
            }
            if(document.getElementById('admin-course-url')) document.getElementById('admin-course-url').value = course.urlCurso || '';
            if(document.getElementById('admin-course-duracion')) document.getElementById('admin-course-duracion').value = course.duracion || '';
            // Costo: parsear costo guardado en moneda + monto
            const monedaEl = document.getElementById('admin-course-moneda');
            const montoEl = document.getElementById('admin-course-monto');
            if (monedaEl && montoEl) {
                const costoStr = course.costo || 'Gratuito';
                if (costoStr === 'Gratuito' || costoStr === '') {
                    monedaEl.value = 'Gratuito';
                    montoEl.value = '';
                    montoEl.style.display = 'none';
                } else if (costoStr.startsWith('$')) {
                    monedaEl.value = '$';
                    montoEl.value = costoStr.replace('$', '').trim();
                    montoEl.style.display = 'block';
                } else {
                    monedaEl.value = 'Bs.';
                    montoEl.value = costoStr.replace('Bs.', '').trim();
                    montoEl.style.display = 'block';
                }
            }
            if(document.getElementById('admin-course-instructor')) document.getElementById('admin-course-instructor').value = course.instructor || '';
            if(document.getElementById('admin-course-instructor-cargo')) document.getElementById('admin-course-instructor-cargo').value = course.instructorCargo || '';
            document.getElementById('admin-course-start').value = course.fechaInicio;
            document.getElementById('admin-course-end').value = course.fechaFin;
            document.getElementById('admin-course-quota').value = course.cupoMaximo;
            document.getElementById('admin-course-status').value = course.estadoCurso;
            if (document.getElementById('admin-course-carousel')) {
                document.getElementById('admin-course-carousel').value = course.carouselPlacement || 'Ninguno';
            }

            // Cargar Imágenes (Cola Base64 String - Compatibilidad backward)
            if (course.images && Array.isArray(course.images)) {
                courseImageQueue = [...course.images];
                renderCourseGallery();
            }

            // LÓGICA DE "SOLO LECTURA": ESTADO FINALIZADO
            const btnSaveCourse = document.querySelector('#course-admin-form button[type="submit"]');
            if (course.estadoCurso === "Finalizado") {
                inputs.forEach(el => el.disabled = true);
                document.getElementById('btn-reactivate-course').style.display = 'inline-block';
                if (btnSaveCourse) btnSaveCourse.style.display = 'none';
                AlertService.warning('El curso está Finalizado. Los datos han sido congelados por control de auditoría.', 'Modo Lectura');
            } else {
                if (btnSaveCourse) btnSaveCourse.style.display = 'inline-flex';
            }

            // Cargar Materiales y Fechas
            if (course.materiales) {
                courseMaterialsQueue = [...course.materiales];
            }
            const dateInput = document.getElementById('admin-course-materials-date');
            if (dateInput) dateInput.value = course.fechaLiberacionMateriales || '';
            renderCourseMaterialsGallery();

            // Lógica de Pestañas Adicionales (Participantes)
            if (typeof CoursesView !== 'undefined' && typeof CoursesView.renderParticipants === 'function') {
                CoursesView.renderParticipants(id);
            }
        }
    } else {
        document.getElementById('course-modal-title').textContent = "Nuevo Curso";
        document.getElementById('course-gallery-title').textContent = "Previsualizar imágenes";
        document.getElementById('admin-course-status').value = "Borrador"; // default
        const monedaElNew = document.getElementById('admin-course-moneda');
        const montoElNew = document.getElementById('admin-course-monto');
        if (monedaElNew) monedaElNew.value = 'Gratuito';
        if (montoElNew) { montoElNew.value = ''; montoElNew.style.display = 'none'; }
        if(document.getElementById('admin-course-area')) document.getElementById('admin-course-area').value = 'Tecnología e Informática';
        if(document.getElementById('admin-course-modalidad')) {
            document.getElementById('admin-course-modalidad').value = 'Virtual';
            toggleCourseVirtualUrl('Virtual'); // Virtual es el default, mostrar campo URL
        }
        if(document.getElementById('admin-course-url')) document.getElementById('admin-course-url').value = '';
        if (document.getElementById('admin-course-carousel')) {
            document.getElementById('admin-course-carousel').value = "Ninguno";
        }
        const btnSaveCourseNew = document.querySelector('#course-admin-form button[type="submit"]');
        if (btnSaveCourseNew) btnSaveCourseNew.style.display = 'inline-flex';

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
    setTimeout(() => { if (window.AdminTemplate) window.AdminTemplate.initFormBackup('course-admin-form'); }, 50);
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
    const btnSaveReactivate = document.querySelector('#course-admin-form button[type="submit"]');
    if (btnSaveReactivate) btnSaveReactivate.style.display = 'inline-flex';

    AlertService.success('El ciclo se ha abierto para edición. Al guardar se registrará en la auditoría.', 'Curso Reactivado');
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

window.handleCourseSubmit = window.rateLimitAction(async function(e) {
    e.preventDefault();

    const id = document.getElementById('edit-course-id').value;
    const nombreCurso = window.sanitizeHTML(document.getElementById('admin-course-name').value.trim());
    const descripcion = window.sanitizeHTML(document.getElementById('admin-course-description').value.trim());
    const objetivos = document.getElementById('admin-course-objetivos') ? window.sanitizeHTML(document.getElementById('admin-course-objetivos').value.trim()) : '';
    const areaTematica = document.getElementById('admin-course-area') ? document.getElementById('admin-course-area').value : 'Tecnología e Informática';
    const modalidad = document.getElementById('admin-course-modalidad') ? document.getElementById('admin-course-modalidad').value : 'Virtual';
    const urlCurso = (modalidad === 'Virtual' && document.getElementById('admin-course-url')) ? document.getElementById('admin-course-url').value.trim() : '';
    // Construir costo compuesto desde moneda + monto
    const monedaVal = document.getElementById('admin-course-moneda') ? document.getElementById('admin-course-moneda').value : 'Gratuito';
    const montoVal = document.getElementById('admin-course-monto') ? document.getElementById('admin-course-monto').value.trim() : '';
    const costo = monedaVal === 'Gratuito' ? 'Gratuito' : (montoVal ? `${monedaVal} ${montoVal}` : monedaVal);
    const duracion = document.getElementById('admin-course-duracion') ? document.getElementById('admin-course-duracion').value.trim() : '';
    const instructor = document.getElementById('admin-course-instructor') ? document.getElementById('admin-course-instructor').value.trim() : '';
    const instructorCargo = document.getElementById('admin-course-instructor-cargo') ? document.getElementById('admin-course-instructor-cargo').value.trim() : '';
    const fechaInicio = document.getElementById('admin-course-start').value;
    const fechaFin = document.getElementById('admin-course-end').value;
    const cupoMaximo = parseInt(document.getElementById('admin-course-quota').value, 10);
    const estadoCurso = document.getElementById('admin-course-status').value;
    const carouselPlacement = document.getElementById('admin-course-carousel') ? document.getElementById('admin-course-carousel').value : 'Ninguno';
    const fechaLiberacionMateriales = document.getElementById('admin-course-materials-date') ? document.getElementById('admin-course-materials-date').value : '';

    // Validación URL obligatoria si modalidad es Virtual
    if (modalidad === 'Virtual' && !urlCurso) {
        AlertService.error('Debe ingresar la URL de acceso al curso virtual (Zoom, Meet, Teams, etc.).', 'URL Requerida');
        return;
    }
    if (urlCurso && !/^https?:\/\/.+/.test(urlCurso)) {
        AlertService.error('La URL ingresada no es válida. Debe comenzar con http:// o https://', 'URL Inválida');
        return;
    }
    if (!nombreCurso || !descripcion || !objetivos) {
        AlertService.error('El nombre, la descripción y los objetivos no pueden contener únicamente espacios en blanco o estar vacíos.', 'Campos Vacíos');
        return;
    }

    // Validación Instructor (Hard Stop)
    if (!instructor || !instructorCargo) {
        AlertService.error('El nombre y el cargo del instructor/facilitador son obligatorios y no pueden estar vacíos.', 'Campos Obligatorios');
        return;
    }

    // Validación COHERENCIA TEMPORAL (Hard Stop)
    if (new Date(fechaInicio) >= new Date(fechaFin)) {
        AlertService.error('La Fecha de Inicio debe ser estrictamente anterior a la Fecha de Fin.', 'Error Temporal');
        return;
    }

    // Validación CAPACIDAD (Hard Stop)
    if (isNaN(cupoMaximo) || cupoMaximo <= 0) {
        AlertService.error('El Cupo Máximo debe ser un número entero estrictamente positivo (> 0).', 'Error de Capacidad');
        return;
    }

    // El curso no puede ser publicado automáticamente al momento de su creación
    if (!id && estadoCurso === 'Publicado') {
        AlertService.warning('El curso no puede ser publicado automáticamente al momento de su creación. Se guardará como Borrador.', 'Validación de Estado');
        document.getElementById('admin-course-status').value = 'Borrador';
        return;
    }

    // Validación de Imágenes mínimas requeridas (Hard Stop)
    if (courseImageQueue.length === 0) {
        if (!id) {
            AlertService.error('La oferta académica debe tener al menos una imagen promocional asociada.', 'Imagen Requerida');
            return;
        } else {
            // Si está editando, verificamos si ya tenía imágenes y las borró todas
            const allCoursesForCheck = getLocalCourses();
            const editingCourse = allCoursesForCheck.find(c => c.id == id);
            if (!editingCourse || !editingCourse.images || editingCourse.images.length === 0) {
                AlertService.error('El curso debe conservar o tener una nueva imagen promocional asociada.', 'Imagen Requerida');
                return;
            }
        }
    }

    let allCourses = getLocalCourses();

    if (id) {
        const index = allCourses.findIndex(c => c.id == id);
        if (index !== -1) {
            const currentCourse = allCourses[index];
            const previousState = currentCourse.estadoCurso;

            if (previousState === 'Finalizado' && document.getElementById('admin-course-status').disabled) {
                 AlertService.error('No se puede modificar un curso finalizado. Debe reactivarlo primero.', 'Acción Bloqueada');
                 return;
            }

            let activaciones = currentCourse.activaciones || [];
            
            // Detectar si el curso fue reactivado: viene de Finalizado y pasa a otro estado, 
            // habiéndose habilitado el formulario y cambiado fechas
            if (previousState === 'Finalizado' && estadoCurso !== 'Finalizado') {
                const nuevaActivacionId = activaciones.length + 1;
                activaciones.push({ id: nuevaActivacionId, label: `Activación ${nuevaActivacionId} (${fechaInicio} a ${fechaFin})` });
            }

            // Construimos el update manteniendo compatibilidad
            allCourses[index] = {
                ...currentCourse,
                nombreCurso,
                descripcion,
                objetivos,
                areaTematica,
                modalidad,
                urlCurso,
                costo,
                duracion,
                instructor,
                instructorCargo,
                fechaInicio,
                fechaFin,
                cupoMaximo,
                estadoCurso,
                carouselPlacement,
                images: courseImageQueue.length > 0 ? courseImageQueue : currentCourse.images,
                materiales: courseMaterialsQueue,
                fechaLiberacionMateriales,
                activaciones
            };

            // Verificar si hubo un cambio de Estado para activar la Función Log Audit
            if (previousState !== estadoCurso) {
                logCourseStateChange(allCourses[index], estadoCurso, `Modificación manual de estado (Anterior: ${previousState})`);
                if (typeof AuditService !== 'undefined') AuditService.log('Cambio de Estado', 'Cursos', id, nombreCurso, `Estado: ${previousState} → ${estadoCurso}`);
            } else {
                if (typeof AuditService !== 'undefined') AuditService.log('Modificación', 'Cursos', id, nombreCurso, 'Ficha pedagógica actualizada');
            }
            AlertService.success('La ficha pedagógica se ha guardado correctamente.', 'Curso Actualizado');
        }
    } else {
        const newCourse = {
            id: Date.now(),
            nombreCurso,
            descripcion,
            objetivos,
            areaTematica,
            modalidad,
            urlCurso,
            costo,
            duracion,
            instructor,
            instructorCargo,
            fechaInicio,
            fechaFin,
            cupoMaximo,
            estadoCurso,
            carouselPlacement,
            images: courseImageQueue,
            materiales: courseMaterialsQueue,
            fechaLiberacionMateriales,
            activaciones: [{ id: 1, label: `Activación 1 (${fechaInicio} a ${fechaFin})` }],
            auditLogs: []
        };
        // Auditoria Inicial de Registro
        logCourseStateChange(newCourse, estadoCurso, "Creación Inicial en Sistema");
        allCourses.push(newCourse);
        if (typeof AuditService !== 'undefined') AuditService.log('Creación', 'Cursos', newCourse.id, nombreCurso, 'Curso creado con estado: ' + estadoCurso);
        AlertService.success('La nueva oferta de formación se ha emitido correctamente.', 'Curso Publicado');
    }

    try {
        saveLocalCourses(allCourses);
        closeCourseModal();
    } catch (e) {
        console.warn("Persistencia abortada por falta de almacenamiento.");
    }
}, 2500);

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
            AlertService.error(`El archivo ${file.name} no es una imagen válida. Use JPG, PNG o WEBP.`, 'Formato Inválido');
            continue;
        }
        if (courseImageQueue.length >= 4) {
            AlertService.warning('Solo se permite un máximo de 4 imágenes por curso.', 'Límite Alcanzado');
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
                // Compresión WebP 0.7
                courseImageQueue.push(canvas.toDataURL('image/webp', 0.7));
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
        AlertService.warning('No puedes eliminar la última imagen de un curso. Sube otra primero.', 'Acción Bloqueada');
        return;
    }
    courseImageQueue.splice(index, 1);
    renderCourseGallery();
}


// ==========================================
// 8. LISTADO DE PARTICIPANTES
// ==========================================




// ==========================================
// 8.1 ACCIONES DE PARTICIPANTES
// ==========================================

function toggleParticipantStatus(participationId, newStatus, courseId) {
    let participations = getLocalParticipations();
    const index = participations.findIndex(p => p.id === participationId);
    if (index !== -1) {
        participations[index].estado = newStatus;
        localStorage.setItem(PARTICIPATIONS_STORAGE_KEY, JSON.stringify(participations));
        if (newStatus === 'Aprobado') {
            AlertService.success(`El estudiante ha sido aprobado académicamente y su certificado digital de culminación ha sido desbloqueado con éxito.`, 'Aprobación Exitosa');
        } else {
            AlertService.success(`El participante ahora está ${newStatus}.`, 'Estado Actualizado');
        }
        if (typeof CoursesView !== 'undefined' && typeof CoursesView.renderParticipants === 'function') {
            CoursesView.renderParticipants(courseId);
        }
    }
}

async function removeParticipant(participationId, courseId) {
    const confirmed = await AlertService.confirm(
        'Confirmar Retiro',
        '¿Está seguro de retirar este participante del curso? Esta acción no se puede deshacer.',
        'Retirar', 'Cancelar', true
    );
    if (!confirmed) return;

    let participations = getLocalParticipations();
    participations = participations.filter(p => p.id !== participationId);
    localStorage.setItem(PARTICIPATIONS_STORAGE_KEY, JSON.stringify(participations));
    AlertService.success('Participante retirado del curso exitosamente.', 'Retirado');
    if (typeof CoursesView !== 'undefined' && typeof CoursesView.renderParticipants === 'function') {
        CoursesView.renderParticipants(courseId);
    }
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
        AlertService.success(`El material ${materialId} del curso ha sido empaquetado y descargado. Permiso otorgado vía Token de Administrador.`, 'Simulación de Descarga');
        return;
    }

    const participations = getLocalParticipations();
    const isEnrolledAndActive = participations.some(p => p.courseId == courseId && (p.userId === sessionEmail || p.userId === sessionUsername) && (p.estado === "Activo" || p.estado === "Aprobado"));

    if (!isEnrolledAndActive) {
        AlertService.error('Integridad de Recursos: Acceso denegado por Ley sobre Derecho de Autor. No posees una inscripción activa en este módulo.', 'Acceso Restringido');
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
            AlertService.warning(`Este bloque de materiales ha sido configurado por el Docente para estar disponible a partir del ${course.fechaLiberacionMateriales}.`, 'Material Programado');
            return;
        }
    }

    const matName = course.materiales?.find(m => m.id === materialId)?.name || 'material_curso';
    AlertService.success(`Descarga del registro pedagógico #${materialId} iniciada satisfactoriamente. (Identificador Criptográfico asignado p/Trazabilidad)`, 'Material Liberado');

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
            AlertService.error(`El archivo "${file.name}" posee una extensión no autorizada.`, 'Formato Inválido');
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
    AlertService.info('Documento agregado a la cola de encriptación exitosamente.', 'Material Anexado');
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

async function deleteCourse(id) {
    // REGLA DE INTEGRIDAD REFERENCIAL
    const participations = getLocalParticipations().filter(p => p.courseId == id);
    if (participations.length > 0) {
        AlertService.error(`No se puede eliminar de forma física este curso porque ya posee ${participations.length} registro(s) atado(s) en la tabla de Participación. Cambie su estado a Finalizado o Borrador para ocultarlo de la oferta académica externa.`, 'Bloqueo Referencial (SQL Fk Violada)');
        return;
    }

    const confirmed = await AlertService.confirm(
        'Confirmar Eliminación Destructiva',
        '¿Está absolutamente seguro de que desea borrar de forma destructiva y permantente este curso? Esta acción no se puede deshacer.',
        'Eliminar', 'Cancelar', true
    );
    if (!confirmed) return;

    let courses = getLocalCourses();
    const deletedCourse = courses.find(c => c.id == id);
    courses = courses.filter(c => c.id != id);
    saveLocalCourses(courses);
    if (typeof AuditService !== 'undefined') AuditService.log('Eliminación', 'Cursos', id, deletedCourse ? deletedCourse.nombreCurso : 'N/A', 'Curso eliminado de forma destructiva');
    AlertService.success('Curso destruido de los registros.', 'Eliminado');
}

async function toggleCoursePublish(id, action) {
    const todos = getLocalCourses();
    const curso = todos.find(c => c.id == id);
    if (!curso) return;

    const previousState = curso.estadoCurso;
    if (previousState === 'Finalizado') {
        AlertService.warning('Los cursos finalizados no pueden reactivarse desde aquí. Abra el panel de edición.', 'Acción Bloqueada');
        return;
    }

    const newState = action === 'Publicar' ? 'Publicado' : 'Borrador';

    const confirmed = await AlertService.confirm(
        `Confirmar ${action}`,
        `¿Está seguro de que desea ${action.toLowerCase()} el curso "${curso.nombreCurso}"?`,
        action, 'Cancelar', true
    );

    if (!confirmed) return;

    curso.estadoCurso = newState;
    logCourseStateChange(curso, newState, `Cambio rápido de estado (Anterior: ${previousState})`);
    
    saveLocalCourses(todos);
    if (typeof AuditService !== 'undefined') AuditService.log('Cambio de Estado', 'Cursos', id, curso.nombreCurso, `Estado: ${previousState} → ${newState}`);
    AlertService.success(`El curso ha sido ${newState === 'Publicado' ? 'publicado' : 'desactivado (Borrador)'} exitosamente.`, 'Estado Actualizado');
}

function filterCoursesAdmin(category, resetPage = true) {
    if (typeof renderModule !== 'function') return;

    globalCourseFilter = category;
    window.globalCourseFilter = category; // Sincronizar con scope global

    // Respetar paginación (Ir a pag 1 si cambia filtro)
    if (resetPage && typeof PAGINATION_STATE !== 'undefined' && PAGINATION_STATE['courses']) {
        PAGINATION_STATE['courses'].currentPage = 1;
    }

    // Delegar el renderizado al orquestador central
    renderModule('courses');
}

// ==========================================
// 11. URL DEL CURSO VIRTUAL
// ==========================================

function toggleCourseVirtualUrl(modalidad) {
    const urlGroup = document.getElementById('course-url-group');
    const urlInput = document.getElementById('admin-course-url');
    if (!urlGroup) return;

    if (modalidad === 'Virtual') {
        urlGroup.style.display = 'block';
        if (urlInput) urlInput.setAttribute('required', 'required');
    } else {
        urlGroup.style.display = 'none';
        if (urlInput) {
            urlInput.removeAttribute('required');
            urlInput.value = '';
        }
    }
}
window.toggleCourseVirtualUrl = toggleCourseVirtualUrl;
