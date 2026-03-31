function initPublicNavigation() {
    // --- INTEGRACIÓN DEL ESTADO DE SESIÓN (USER PILL) ---

    const authMenuContainer = document.getElementById('public-auth-menu');
    if (authMenuContainer) {
        const sessionStr = localStorage.getItem('dcti_session');
        if (sessionStr) {
            try {
                const session = JSON.parse(sessionStr);
                const displayName = session.name || session.username || 'Usuario';
                const avatarHTML = session.avatar
                    ? `<img src="${session.avatar}" alt="Avatar" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover;">`
                    : `<div style="width: 35px; height: 35px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.9rem;">${session.initials || 'U'}</div>`;

                authMenuContainer.innerHTML = `
                    <div class="public-user-pill-container" style="position: relative;">
                        <!-- User Pill Button -->
                        <div class="public-user-pill" id="public-user-pill-btn" style="display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 4px 14px 4px 4px; border-radius: 50px; background: #ffffff; border: 1px solid #c7d2fe; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            ${avatarHTML}
                            <span style="color: #4f46e5; font-weight: 600; font-size: 0.95rem; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</span>
                            <i class="fas fa-chevron-down" style="color: #4f46e5; font-size: 0.75rem; margin-left: 4px;"></i>
                        </div>
                        
                        <!-- Dropdown Menu -->
                        <div class="public-dropdown hidden" id="public-user-dropdown" style="position: absolute; top: calc(100% + 10px); right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15); width: max-content; overflow: hidden; z-index: 9999; border: 1px solid rgba(0,0,0,0.05);">
                            
                            <!-- Header Info -->
                            <div style="padding: 15px 20px; border-bottom: 1px solid #f1f5f9;">
                                <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Conectado como</p>
                                <p style="margin: 0; font-size: 1rem; font-weight: bold; color: #1e293b;" title="${session.email}">${displayName}</p>
                            </div>
                            
                            <!-- Action Items (Horizontal Layout) -->
                            <div style="display: flex; gap: 20px; padding: 15px 20px; align-items: center; background: #ffffff;">
                                
                                <!-- Dashboard -->
                                <a href="#" onclick="event.preventDefault(); if(typeof Router !== 'undefined') Router.navigateTo('dashboard');" style="display: flex; align-items: center; gap: 10px; color: #475569; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#4f46e5';" onmouseout="this.style.color='#475569';">
                                    <i class="fas fa-user-circle" style="color: #6366f1; font-size: 1.3rem;"></i>
                                    <span style="font-size: 0.85rem; line-height: 1.2; font-weight: 500;">Dashboard<br>/ Perfil</span>
                                </a>

                                ${session.role === 'visitante' ? `
                                <!-- Mis Cursos -->
                                <a href="#" onclick="event.preventDefault(); if(typeof Router !== 'undefined') Router.navigateTo('my-courses');" style="display: flex; align-items: center; gap: 10px; color: #475569; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color='#10b981';" onmouseout="this.style.color='#475569';">
                                    <i class="fas fa-book" style="color: #10b981; font-size: 1.3rem;"></i>
                                    <span style="font-size: 0.85rem; line-height: 1.2; font-weight: 500;">Mis<br>Cursos</span>
                                </a>` : ''}

                                <!-- Spacer to push logout to right if needed -->
                                <div style="flex-grow: 1; min-width: 10px;"></div>

                                <!-- Cerrar Sesión -->
                                <a href="#" id="public-logout-btn" style="display: flex; align-items: center; gap: 10px; color: #ef4444; text-decoration: none; transition: opacity 0.2s;" onmouseover="this.style.opacity='0.7';" onmouseout="this.style.opacity='1';">
                                    <i class="fas fa-sign-out-alt" style="font-size: 1.3rem;"></i>
                                    <span style="font-size: 0.85rem; line-height: 1.2; font-weight: 500;">Cerrar<br>Sesión</span>
                                </a>

                            </div>
                        </div>
                    </div>
                `;

                // Sub-Lógica del Dropdown
                const pillBtn = document.getElementById('public-user-pill-btn');
                const dropdown = document.getElementById('public-user-dropdown');
                const logoutBtn = document.getElementById('public-logout-btn');

                pillBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdown.classList.toggle('hidden');
                });

                document.addEventListener('click', () => {
                    if (dropdown && !dropdown.classList.contains('hidden')) {
                        dropdown.classList.add('hidden');
                    }
                });

                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof App !== 'undefined' && App.logout) {
                        App.logout();
                    } else {
                        localStorage.removeItem('dcti_session');
                        window.location.reload();
                    }
                });

            } catch (error) {
                console.error("Error parsing session in public view:", error);
                renderDefaultLoginLink(authMenuContainer);
            }
        } else {
            renderDefaultLoginLink(authMenuContainer);
        }
    }

    function renderDefaultLoginLink(container) {
        container.innerHTML = ''; // FIXED: No mostrar "Ingresar" en el nav público (el login se hace desde el footer)
    }

}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPublicNavigation);
} else {
    initPublicNavigation();
}

// =======================================================
// IIFE: Aislar todas las variables del portal público
// para evitar colisiones con el dashboard (interface-logic.js)
// Esto previene que `currentPage`, `coursesPerPage`, etc.
// sobrescriban las variables del panel administrativo.
// =======================================================
(function () {
    'use strict';

    // --- LÓGICA DINÁMICA DE CURSOS PÚBLICOS ---
    let currentPage = 1;
    const coursesPerPage = 6;
    let currentCourseIdContext = null;

    function getPublicCourses() {
        const allCourses = JSON.parse(localStorage.getItem('dcti_courses')) || [];
        // Solo mostrar cursos Publicados
        return allCourses.filter(c => c.estadoCurso === 'Publicado');
    }

    function getCourseParticipations(courseId) {
        const participations = JSON.parse(localStorage.getItem('dcti_participations')) || [];
        return participations.filter(p => p.courseId == courseId);
    }

    window.renderPublicCourses = function (page = 1) {
        currentPage = page;
        const gridCursos = document.getElementById('public-courses-grid');
        const paginationContainer = document.getElementById('public-courses-pagination');

        if (!gridCursos || !paginationContainer) return;

        const allPublished = getPublicCourses();

        // Manejo de estado vacío
        if (allPublished.length === 0) {
            gridCursos.style.display = 'block';
            gridCursos.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: var(--color-text-muted); width: 100%;">
                    <i class="fas fa-book-reader" style="font-size: 3rem; opacity: 0.5; margin-bottom: 15px;"></i>
                    <h3 style="margin-bottom: 10px; color: var(--color-primary);">Próximamente</h3>
                    <p>Actualmente estamos preparando nuestra nueva oferta académica. ¡Vuelve pronto!</p>
                </div>
            `;
            paginationContainer.innerHTML = '';
            return;
        }

        gridCursos.style.display = 'grid'; // Restaurar grid por si estaba en block por empty state

        // Lógica de paginación
        const totalPages = Math.ceil(allPublished.length / coursesPerPage);
        const startIndex = (currentPage - 1) * coursesPerPage;
        const endIndex = startIndex + coursesPerPage;
        const currentSlice = allPublished.slice(startIndex, endIndex);

        let html = '';
        currentSlice.forEach(course => {
            const coverImage = (course.images && course.images.length > 0) ? course.images[0] : 'assets/images/img5.jpg';

            // Calculo de cupos (Visual)
            const parts = getCourseParticipations(course.id);
            const cuposOcupados = parts.length;
            const cuposDisponibles = Math.max(0, (course.cupoMaximo || 0) - cuposOcupados);
            const badgeClass = cuposDisponibles > 0 ? 'badge-disponible' : 'badge-agotado';
            const badgeText = cuposDisponibles > 0 ? 'Disponible' : 'Agotado';
            const badgeColor = cuposDisponibles > 0 ? '#10b981' : '#ef4444';

            html += `
                <div class="course-item" style="border-left: 5px solid #530e90; width: 100% !important; max-width: none !important; margin: 0 !important; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: white; transition: transform 0.3s ease;">
                    <div style="height: 200px; width: 100%; position: relative;">
                        <img src="${coverImage}" alt="${course.nombreCurso}" style="width: 100%; height: 100%; object-fit: cover;">
                        <span style="position: absolute; top: 10px; right: 10px; background: ${badgeColor}; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: bold;">
                            ${badgeText}
                        </span>
                    </div>
                    <div style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column;">
                        <h3 style="margin: 0 0 10px 0; font-size: 1.1rem; color: #1e293b; line-height: 1.3;">${course.nombreCurso}</h3>
                        <p style="font-size: 0.85rem; color: #64748b; margin-bottom: 15px; flex-grow: 1;">
                            ${course.descripcion.length > 80 ? course.descripcion.substring(0, 80) + '...' : course.descripcion}
                        </p>
                        <a href="#" class="enlaceCurso btn-action" data-curso-id="${course.id}" style="text-align: center; padding: 10px; background: #530e90; color: white; text-decoration: none; border-radius: 4px; font-weight: 600; font-size: 0.9rem; transition: background 0.2s;">
                            Ver Detalles
                        </a>
                    </div>
                </div>
            `;
        });
        gridCursos.innerHTML = html;

        // Renderizar controles de paginación
        let paginationHtml = '';
        if (totalPages > 1) {
            paginationHtml += `
            <button class="public-page-btn" onclick="window.publicChangeCoursePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="cursor:pointer;"'}>
                <i class="fas fa-chevron-left"></i> Anterior
            </button>`;

            for (let i = 1; i <= totalPages; i++) {
                paginationHtml += `
                <button class="public-page-btn" onclick="window.publicChangeCoursePage(${i})" style="cursor:pointer; padding: 5px 10px; background: ${currentPage === i ? '#530e90' : 'white'}; color: ${currentPage === i ? 'white' : '#333'}; border: 1px solid #ccc; border-radius: 4px;">
                    ${i}
                </button>`;
            }

            paginationHtml += `
            <button class="public-page-btn" onclick="window.publicChangeCoursePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="cursor:pointer;"'}>
                Siguiente <i class="fas fa-chevron-right"></i>
            </button>`;
        }
        paginationContainer.innerHTML = paginationHtml;

        // Re-atar eventos a los nuevos botones
        attachCourseDetailEvents();
    }

    // Exponer la función de cambio de página al scope global temporalmente para los botones onclick
    window.publicChangeCoursePage = function (newPage) {
        const allPublished = getPublicCourses();
        const totalPages = Math.ceil(allPublished.length / coursesPerPage);
        if (newPage >= 1 && newPage <= totalPages) {
            renderPublicCourses(newPage);
            // Scroll suave hacia los cursos
            document.getElementById('view-cursos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    function attachCourseDetailEvents() {
        const gridCursos = document.getElementById('view-cursos');
        const detalleCurso = document.getElementById('view-curso-detalle');
        const btnVolverCursos = document.getElementById('btn-volver-cursos');
        const enlacesCursos = document.querySelectorAll('.enlaceCurso');

        enlacesCursos.forEach(enlace => {
            enlace.addEventListener('click', (e) => {
                e.preventDefault();
                const courseId = enlace.getAttribute('data-curso-id');
                currentCourseIdContext = courseId;

                // The provided snippet seems to be for a different context or has issues.
                // Applying it directly would introduce undefined variables ('link') and
                // potentially incorrect logic for 'enlaceCurso' elements.
                // Assuming the intent was to add hash navigation for course details,
                // but without a clear 'data-target' attribute on 'enlaceCurso' for 'view-ejes',
                // and to maintain syntactical correctness, I will apply a minimal change
                // that adds hash navigation for the course detail view itself.

                // Original logic for course detail navigation:
                // Pintar detalles
                renderCourseDetail(courseId);

                gridCursos.classList.remove('public-active');
                gridCursos.classList.add('public-hidden');

                detalleCurso.classList.remove('public-hidden');
                detalleCurso.classList.add('public-active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Asegurar que btnVolverCursos solo tenga un listener principal
        if (btnVolverCursos && !btnVolverCursos.hasAttribute('data-bound')) {
            btnVolverCursos.setAttribute('data-bound', 'true');
            btnVolverCursos.addEventListener('click', () => {
                detalleCurso.classList.remove('public-active');
                detalleCurso.classList.add('public-hidden');

                gridCursos.classList.remove('public-hidden');
                gridCursos.classList.add('public-active');

                // Refrescar cursos por si hubo inscripciones (para actualizar cupos visuales)
                renderPublicCourses(currentPage);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    }

    function renderCourseDetail(courseId) {
        const contentContainer = document.getElementById('public-course-detail-content');
        if (!contentContainer) return;

        const allCourses = getPublicCourses();
        const course = allCourses.find(c => c.id == courseId);

        if (!course) {
            contentContainer.innerHTML = `<div style="text-align:center; padding: 40px;">Curso no encontrado o no disponible.</div>`;
            return;
        }

        const parts = getCourseParticipations(courseId);
        const cuposOcupados = parts.length;
        const cuposTotales = course.cupoMaximo || 0;
        const cuposDisponibles = Math.max(0, cuposTotales - cuposOcupados);

        let sessionData = null;
        try { sessionData = JSON.parse(localStorage.getItem('dcti_session')); } catch (e) { }

        const isUserEnrolled = sessionData ? parts.some(p => p.userId === sessionData.email) : false;

        const coverImg = (course.images && course.images.length > 0) ? course.images[0] : 'assets/images/img5.jpg';

        let thumbnailsHtml = '';
        if (course.images && course.images.length > 1) {
            thumbnailsHtml = '<div class="curso-thumbnails" style="display: flex; gap: 10px; margin-top: 20px; overflow-x: auto; padding-bottom: 10px;">';
            course.images.forEach(img => {
                thumbnailsHtml += `<img src="${img}" style="width: 100px; height: 75px; object-fit: cover; border-radius: 6px; cursor: pointer; border: 2px solid transparent; transition: border 0.3s;" onmouseover="this.style.borderColor='#530e90'" onmouseout="this.style.borderColor='transparent'">`;
            });
            thumbnailsHtml += '</div>';
        }

        // Estado del Botón de Inscripción
        let btnHtml = '';
        const baseBtnStyle = "padding: 12px 24px; border-radius: 6px; font-size: 1rem; font-weight: 600; border: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.3s;";
        if (isUserEnrolled) {
            btnHtml = `<button class="btn-inscribirse" disabled style="${baseBtnStyle} background: #e2e8f0; color: #64748b; cursor: not-allowed;"><i class="fas fa-check-circle"></i> Ya estás inscrito</button>`;
        } else if (cuposDisponibles <= 0) {
            btnHtml = `<button class="btn-inscribirse" disabled style="${baseBtnStyle} background: #ef4444; color: white; cursor: not-allowed;"><i class="fas fa-ban"></i> Cupos Agotados</button>`;
        } else {
            btnHtml = `<button class="btn-inscribirse" id="btn-trigger-enrollment" style="${baseBtnStyle} background: #530e90; color: white; cursor: pointer; box-shadow: 0 4px 6px rgba(83, 14, 144, 0.2);"><i class="fas fa-user-plus"></i> Inscribirse Ahora</button>`;
        }

        contentContainer.innerHTML = `
            <div class="curso-detalle-header" style="margin-bottom: 20px;">
                <h2 style="font-size: 2rem; color: #530e90;">${course.nombreCurso}</h2>
            </div>
            <section class="curso-featured-wrapper" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; margin-bottom: 30px;">
                <div class="curso-featured" style="display: flex; flex-wrap: wrap; gap: 30px;">
                    <div style="flex: 1 1 450px; min-height: 350px;">
                        <img src="${coverImg}" alt="${course.nombreCurso}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="curso-featured-info" style="flex: 1 1 400px; padding: 30px; display: flex; flex-direction: column;">
                        <h3 style="margin-top: 0; color: #1e293b; font-size: 1.4rem;">Sobre este curso</h3>
                        <p style="color: #475569; line-height: 1.6; margin-bottom: 25px; font-size: 1.05rem; white-space: pre-wrap;">${course.descripcion}</p>
                        
                        <div class="curso-fechas" style="background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: flex; gap: 20px; border: 1px solid #e2e8f0;">
                            <div>
                                <p style="margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Inicio</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; color: #0f172a;"><i class="far fa-calendar-alt" style="color: #530e90;"></i> ${course.fechaInicio || 'Por definir'}</p>
                            </div>
                            <div>
                                <p style="margin: 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase;">Culminación</p>
                                <p style="margin: 5px 0 0 0; font-weight: bold; color: #0f172a;"><i class="far fa-calendar-check" style="color: #530e90;"></i> ${course.fechaFin || 'Por definir'}</p>
                            </div>
                        </div>
                        
                        <div class="curso-featured-footer" style="margin-top: auto; border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <p style="margin: 0; font-size: 0.9rem; color: #475569;">
                                    <strong><i class="fas fa-users" style="color: #530e90;"></i> Cupos Disponibles:</strong> 
                                    <span style="font-size: 1.1rem; font-weight: bold; color: ${cuposDisponibles > 0 ? '#10b981' : '#ef4444'}">${cuposDisponibles} de ${cuposTotales}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            
            <section class="curso-thumbnails-container" style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap;">
                ${thumbnailsHtml}
                <div class="curso-action" style="margin-top: 20px;">
                    ${btnHtml}
                </div>
            </section>
        `;

        // Atar evento modal inscripción dinámico si el botón está activo
        const btnTrigger = document.getElementById('btn-trigger-enrollment');
        if (btnTrigger) {
            btnTrigger.addEventListener('click', () => {
                if (!sessionData || !sessionData.email) {
                    if (typeof showLogin === 'function') showLogin();
                    return;
                }
                const modalInscripcion = document.getElementById('modal-inscripcion');
                if (modalInscripcion) {
                    modalInscripcion.classList.remove('public-hidden-modal');
                    const btnConfirmar = document.getElementById('btn-confirmar-inscripcion');
                    const btnExitosa = document.getElementById('btn-exitosa-msg');
                    if (btnConfirmar) btnConfirmar.classList.remove('public-hidden-modal');
                    if (btnExitosa) btnExitosa.classList.add('public-hidden-modal');
                }
            });
        }
    }

    // Modal Inscripción Lógica Final
    const modalInscripcion = document.getElementById('modal-inscripcion');
    const btnConfirmarInscripcion = document.getElementById('btn-confirmar-inscripcion');
    const btnExitosaMsg = document.getElementById('btn-exitosa-msg');

    if (btnConfirmarInscripcion && btnExitosaMsg && modalInscripcion) {
        btnConfirmarInscripcion.addEventListener('click', () => {
            const courseId = currentCourseIdContext;
            if (!courseId) return;

            let sessionData = null;
            try { sessionData = JSON.parse(localStorage.getItem('dcti_session')); } catch (e) { }
            if (!sessionData) return;

            // Re-Verificar cupos para evitar "condición de carrera"
            const courses = getPublicCourses();
            const course = courses.find(c => c.id == courseId);
            const participations = JSON.parse(localStorage.getItem('dcti_participations')) || [];

            const currentCourseParts = participations.filter(p => p.courseId == courseId);
            if (currentCourseParts.length >= (course.cupoMaximo || 0)) {
                alert("Lo sentimos, los cupos se han agotado.");
                modalInscripcion.classList.add('public-hidden-modal');
                renderCourseDetail(courseId); // Refrescar vista
                return;
            }

            // Registrar Participación
            const newParticipation = {
                id: Date.now(),
                courseId: parseInt(courseId),
                userId: sessionData.email,
                estado: "Aprobado", // O estado inicial por defecto
                fechaInscripcion: new Date().toISOString().split('T')[0]
            };

            participations.push(newParticipation);
            localStorage.setItem('dcti_participations', JSON.stringify(participations));

            // UI Confirmación
            btnConfirmarInscripcion.classList.add('public-hidden-modal');
            btnExitosaMsg.classList.remove('public-hidden-modal');

            // Actualizar vista detalle debajo del modal
            renderCourseDetail(courseId);

            setTimeout(() => {
                modalInscripcion.classList.add('public-hidden-modal');
            }, 2500);
        });
    }

    // Render inicial
    renderPublicCourses();

    // -------------------------------------------------------
    // --- INTEGRACIÓN DE DATOS DE CONTACTO DINÁMICOS (DCTI) ---
    // (Se llama desde ContactosView.init() una vez que el DOM está listo)
    // -------------------------------------------------------
    window.applyDctiContactLinks = function () {
        const dctiStorage = localStorage.getItem('dcti_info');
        let dctiData = null;
        if (dctiStorage) {
            try { dctiData = JSON.parse(dctiStorage); } catch (e) { console.error('Error parsing dcti_info', e); }
        } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.dcti) {
            dctiData = MOCK_DATA.dcti;
        }

        if (!dctiData) return;

        function setLink(linkId, textId, value, urlBuilder) {
            const link = document.getElementById(linkId);
            const text = document.getElementById(textId);
            if (link && text && value) {
                text.textContent = value;
                link.href = urlBuilder(value);
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        }

        setLink('contacto-facebook-link', 'contacto-facebook-text', dctiData.facebook,
            v => v.startsWith('http') ? v : `https://www.facebook.com/${v.replace('@', '')}`);

        setLink('contacto-twitter-link', 'contacto-twitter-text', dctiData.twitter,
            v => v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`);

        setLink('contacto-instagram-link', 'contacto-instagram-text', dctiData.instagram,
            v => v.startsWith('http') ? v : `https://www.instagram.com/${v.replace('@', '')}`);

        // Teléfono
        const phoneLink = document.getElementById('contacto-telefono-link');
        const phoneText = document.getElementById('contacto-telefono-text');
        if (phoneLink && phoneText && dctiData.phone) {
            phoneText.textContent = dctiData.phone;
            phoneLink.href = `tel:${dctiData.phone.replace(/[^0-9+]/g, '')}`;
        }

        // Dirección
        const dirLink = document.getElementById('contacto-direccion-link');
        const dirText = document.getElementById('contacto-direccion-text');
        if (dirLink && dirText && dctiData.address) {
            dirText.textContent = dctiData.address;
            dirLink.href = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dctiData.address)}`;
            dirLink.target = '_blank';
            dirLink.rel = 'noopener noreferrer';
        }

        // Footer social links (siempre presentes en el DOM)
        function setFooterLink(id, value, urlBuilder) {
            const el = document.getElementById(id);
            if (el && value) {
                el.href = urlBuilder(value);
                el.target = '_blank';
                el.rel = 'noopener noreferrer';
            }
        }
        setFooterLink('footer-instagram-link', dctiData.instagram,
            v => v.startsWith('http') ? v : `https://www.instagram.com/${v.replace('@', '')}`);
        setFooterLink('footer-facebook-link', dctiData.facebook,
            v => v.startsWith('http') ? v : `https://www.facebook.com/${v.replace('@', '')}`);
        setFooterLink('footer-twitter-link', dctiData.twitter,
            v => v.startsWith('http') ? v : `https://x.com/${v.replace('@', '')}`);
    };

    // Render inicial llamadas (AQUI ORIGINALMENTE CERRABA DOMContentLoaded)

    // ===========================================
    // --- LÓGICA DINÁMICA: NOTICIAS PÚBLICAS ---
    // ===========================================
    const newsCategoryPages = {
        'Institucionales': 1,
        'Local': 1,
        'Regional': 1,
        'Nacional': 1,
        'Internacional': 1,
        'Otras': 1
    };
    const newsCardsPerPage = 3;
    let currentNewsFilter = 'Todas';

    function getPublicNews() {
        const allNews = JSON.parse(localStorage.getItem('dcti_news')) || [];
        return allNews.filter(n => {
            if (Array.isArray(n.status)) {
                return n.status.includes('Publicado') || n.status.includes('Publicada');
            }
            return n.status === 'Publicado' || n.status === 'Publicada';
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const newsFilterBtns = document.querySelectorAll('.public-news-filter');
        newsFilterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                newsFilterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentNewsFilter = btn.getAttribute('data-category');

                Object.keys(newsCategoryPages).forEach(k => newsCategoryPages[k] = 1);
                renderPublicNews();
            });
        });
    });

    window.changeNewsCategoryPage = function (category, delta) {
        newsCategoryPages[category] += delta;
        renderPublicNews();
    };

    window.renderPublicNews = function () {
        const wrapper = document.getElementById('public-news-wrapper');
        const pagination = document.getElementById('public-news-pagination');
        if (!wrapper) return;

        let news = getPublicNews();
        if (news.length === 0) {
            wrapper.innerHTML = `<div style="text-align: center; width:100%; padding: 40px; color: #64748b;"><i class="fas fa-newspaper" style="font-size:3rem;opacity:0.4;margin-bottom:15px;"></i><p>No hay noticias disponibles.</p></div>`;
            if (pagination) pagination.innerHTML = '';
            return;
        }

        const categoriesList = [
            { id: 'Institucionales', title: 'Noticias institucionales', class: 'course-container-noticias' },
            { id: 'Local', title: 'Noticias locales', class: 'course-container-noticias2' },
            { id: 'Regional', title: 'Noticias regionales', class: 'course-container-noticias' },
            { id: 'Nacional', title: 'Noticias nacionales', class: 'course-container-noticias2' },
            { id: 'Internacional', title: 'Noticias internacionales', class: 'course-container-noticias' }
        ];

        let html = '';

        categoriesList.forEach(catDef => {
            const catNewsAll = news.filter(n => n.category === catDef.id);

            if (catNewsAll.length > 0) {
                const currentPage = newsCategoryPages[catDef.id] || 1;
                const totalPages = Math.ceil(catNewsAll.length / newsCardsPerPage);

                if (currentPage > totalPages && totalPages > 0) newsCategoryPages[catDef.id] = totalPages;
                if (currentPage < 1) newsCategoryPages[catDef.id] = 1;

                const safePage = newsCategoryPages[catDef.id];
                const catNewsPaged = catNewsAll.slice((safePage - 1) * newsCardsPerPage, safePage * newsCardsPerPage);

                html += `
                <section class="${catDef.class}">
                    <div class="titulo_noticia">
                        <h2>${catDef.title}</h2>
                    </div>
                    <div class="noticias" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; align-items: stretch; padding: 0 2% 2% 2%;">
                        ${catNewsPaged.map(n => {
                    const mediaArray = Array.isArray(n.multimedia) && n.multimedia.length > 0 ? n.multimedia : [n.multimedia || 'assets/images/img8.jpg'];
                    const coverMedia = mediaArray[0];
                    return `
                            <div class="noticia-card" style="cursor:pointer; width: 300px; max-width: 30%; margin: 1%; background-color: #fdfdfd; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;" onclick="window.showNewsDetail(${n.id})">
                                <img class="discrete-fade-img" data-index="0" data-multimedia='${JSON.stringify(mediaArray)}' src="${coverMedia}" alt="${n.headline}" style="width: 100%; height: 200px; object-fit: cover; transition:opacity 1s ease-in-out;">
                                <div class="noticia-card-body" style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column;">
                                    <a onclick="event.preventDefault(); window.showNewsDetail(${n.id})" class="redireccion" style="cursor:pointer; text-decoration: none; margin-bottom: 10px;">
                                        <h2 style="margin: 0; color: #0656c5; font-size: 1.1rem; line-height: 1.3;">${n.headline}</h2>
                                    </a>
                                    <p style="margin: 0; color: #475569; font-size: 0.9rem; line-height: 1.5; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                        ${n.content || ''}
                                    </p>
                                </div>
                            </div>`;
                }).join('')}
                    </div>
                    ${totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px; padding-bottom: 20px;">
                        <button onclick="window.changeNewsCategoryPage('${catDef.id}', -1)" ${safePage === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="public-page-btn" style="padding: 8px 16px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600;"><i class="fas fa-chevron-left"></i> Anterior</button>
                        <span style="display:flex; align-items:center; color: #333; font-weight: bold; font-family: Verdana;">Página ${safePage} de ${totalPages}</span>
                        <button onclick="window.changeNewsCategoryPage('${catDef.id}', 1)" ${safePage === totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="public-page-btn" style="padding: 8px 16px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600;">Siguiente <i class="fas fa-chevron-right"></i></button>
                    </div>
                    ` : ''}
                </section>`;
            }
        });

        // Para noticias que no encajen en esas categorías
        const otherNewsAll = news.filter(n => !categoriesList.find(c => c.id === n.category) && n.category !== 'Carrusel de Noticias');
        if (otherNewsAll.length > 0) {
            const currentPage = newsCategoryPages['Otras'] || 1;
            const totalPages = Math.ceil(otherNewsAll.length / newsCardsPerPage);

            if (currentPage > totalPages && totalPages > 0) newsCategoryPages['Otras'] = totalPages;
            if (currentPage < 1) newsCategoryPages['Otras'] = 1;

            const safePage = newsCategoryPages['Otras'];
            const otherNewsPaged = otherNewsAll.slice((safePage - 1) * newsCardsPerPage, safePage * newsCardsPerPage);

            html += `
                <section class="course-container-noticias2">
                    <div class="titulo_noticia">
                        <h2>Otras Noticias</h2>
                    </div>
                    <div class="noticias" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; align-items: stretch; padding: 0 2% 2% 2%;">
                        ${otherNewsPaged.map(n => {
                const mediaArray = Array.isArray(n.multimedia) && n.multimedia.length > 0 ? n.multimedia : [n.multimedia || 'assets/images/img8.jpg'];
                const coverMedia = mediaArray[0];
                return `
                            <div class="noticia-card" style="cursor:pointer; width: 300px; max-width: 30%; margin: 1%; background-color: #fdfdfd; border-radius: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden; display: flex; flex-direction: column;" onclick="window.showNewsDetail(${n.id})">
                                <img class="discrete-fade-img" data-index="0" data-multimedia='${JSON.stringify(mediaArray)}' src="${coverMedia}" alt="${n.headline}" style="width: 100%; height: 200px; object-fit: cover; transition:opacity 1s ease-in-out;">
                                <div class="noticia-card-body" style="padding: 15px; flex-grow: 1; display: flex; flex-direction: column;">
                                    <a onclick="event.preventDefault(); window.showNewsDetail(${n.id})" class="redireccion" style="cursor:pointer; text-decoration: none; margin-bottom: 10px;">
                                        <h2 style="margin: 0; color: #0656c5; font-size: 1.1rem; line-height: 1.3;">${n.headline}</h2>
                                    </a>
                                    <p style="margin: 0; color: #475569; font-size: 0.9rem; line-height: 1.5; flex-grow: 1; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">
                                        ${n.content || ''}
                                    </p>
                                </div>
                            </div>`;
            }).join('')}
                    </div>
                    ${totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; gap: 15px; margin-top: 15px; padding-bottom: 20px;">
                        <button onclick="window.changeNewsCategoryPage('Otras', -1)" ${safePage === 1 ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="public-page-btn" style="padding: 8px 16px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600;"><i class="fas fa-chevron-left"></i> Anterior</button>
                        <span style="display:flex; align-items:center; color: #333; font-weight: bold; font-family: Verdana;">Página ${safePage} de ${totalPages}</span>
                        <button onclick="window.changeNewsCategoryPage('Otras', 1)" ${safePage === totalPages ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : 'style="cursor:pointer;"'} class="public-page-btn" style="padding: 8px 16px; background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 4px; font-weight: 600;">Siguiente <i class="fas fa-chevron-right"></i></button>
                    </div>
                    ` : ''}
                </section>`;
        }

        wrapper.innerHTML = html;
        if (pagination) pagination.innerHTML = '';
    };

    window.showNewsDetail = function (id) {
        const grid = document.getElementById('view-noticias');
        const detail = document.getElementById('view-noticia-detalle');
        const content = document.getElementById('public-news-detail-content');
        if (!grid || !detail || !content) return;
        const news = getPublicNews().find(n => n.id == id);
        if (!news) return;
        const dateStr = news.published ? new Date(news.published).toLocaleDateString('es-VE') : 'N/A';
        const mediaArray = Array.isArray(news.multimedia) && news.multimedia.length > 0 ? news.multimedia : [news.multimedia || 'assets/images/img8.jpg'];
        
        let galleryHtml = '';
        if(mediaArray.length > 1) {
            galleryHtml = `
            <div style="display:flex; gap:10px; margin-top:15px; overflow-x:auto; padding-bottom:10px;">
                ${mediaArray.map(m => `<img src="${m}" style="height:80px; width:120px; object-fit:cover; border-radius:8px; border: 2px solid #e2e8f0; cursor:pointer; transition: 0.2s;" onmouseover="this.style.borderColor='#530e90'" onclick="document.getElementById('main-detail-img').src='${m}'">`).join('')}
            </div>`;
        }

        content.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);padding:30px;">
            <span style="background:rgba(83,14,144,0.1);color:#530e90;padding:5px 12px;border-radius:20px;font-size:0.8rem;font-weight:bold;margin-bottom:15px;display:inline-block;">${news.category || 'General'}</span>
            <h1 style="color:#1e293b;font-size:2rem;margin-top:10px;margin-bottom:15px;">${news.headline}</h1>
            <div style="display:flex;gap:20px;color:#64748b;font-size:0.9rem;margin-bottom:30px;border-bottom:1px solid #f1f5f9;padding-bottom:15px;">
                <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                <span><i class="fas fa-user-edit"></i> ${news.author || 'DCTI'}</span>
            </div>
            <div style="width:100%;max-height:450px;overflow:hidden;border-radius:8px;margin-bottom:${mediaArray.length > 1 ? '5px' : '30px'};">
                <img id="main-detail-img" src="${mediaArray[0]}" alt="${news.headline}" style="width:100%;height:100%;object-fit:cover;max-height:450px;">
            </div>
            ${galleryHtml}

            <div style="color:#334155;line-height:1.8;font-size:1.05rem;white-space:pre-wrap;">${news.content || ''}</div>
        </div>`;
        grid.classList.remove('public-active'); grid.classList.add('public-hidden');
        detail.classList.remove('public-hidden'); detail.classList.add('public-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'btn-volver-noticias' || e.target.closest('#btn-volver-noticias'))) {
            const viewDetail = document.getElementById('view-noticia-detalle');
            const viewList = document.getElementById('view-noticias');
            if (viewDetail && viewList) {
                viewDetail.classList.add('public-hidden');
                viewDetail.classList.remove('public-active');
                viewList.classList.add('public-active');
                viewList.classList.remove('public-hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // ===========================================
    // --- LÓGICA DINÁMICA: PROYECTOS PÚBLICOS ---
    // ===========================================
    let currentProjPage = 1;
    const projPerPage = 6;

    function getPublicProjects() {
        const allProj = JSON.parse(localStorage.getItem('dcti_projects')) || [];
        const validStatuses = ['Destacado', 'En Progreso', 'A Futuro'];
        const filtered = allProj.filter(p => validStatuses.includes(p.status));
        // Proyectos Destacados siempre primero
        return filtered.sort((a, b) => {
            if (a.status === 'Destacado' && b.status !== 'Destacado') return -1;
            if (a.status !== 'Destacado' && b.status === 'Destacado') return 1;
            return 0;
        });
    }

    window.publicChangeProjPage = function (newPage) {
        renderPublicProjects(newPage);
        const el = document.getElementById('view-proyectos');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.renderPublicProjects = function (page = 1) {
        currentProjPage = page;
        const grid = document.getElementById('public-projects-grid');
        const pagination = document.getElementById('public-projects-pagination');
        if (!grid) return;

        let projects = getPublicProjects();
        if (projects.length === 0) {
            grid.innerHTML = `<div style="text-align:center;width:100%;padding:40px;color:#64748b;">Aún no hay proyectos públicos para mostrar.</div>`;
            if (pagination) pagination.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(projects.length / projPerPage);
        const slice = projects.slice((page - 1) * projPerPage, page * projPerPage);

        // Group into chunks of 3
        const chunkedProjects = [];
        for (let i = 0; i < slice.length; i += 3) {
            chunkedProjects.push(slice.slice(i, i + 3));
        }

        let html = '';
        chunkedProjects.forEach(chunk => {
            html += `<section class="course-container-noticia">`;
            chunk.forEach(p => {
                const media = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'assets/images/img10.jpg');

                html += `
                <div class="proyecto-card" style="cursor:pointer;" onclick="window.showProjDetail(${p.id})">
                    <img src="${media}" alt="${p.title}">
                    <div class="proyecto-card-body">
                        <span style="font-size:0.7rem; font-weight:800; padding: 2px 8px; border-radius:12px; background:${p.status === 'Destacado' ? '#fef3c7' : (p.status === 'En Progreso' ? '#dbeafe' : '#f3f4f6')}; color:${p.status === 'Destacado' ? '#b45309' : (p.status === 'En Progreso' ? '#1e40af' : '#6b7280')}; display:inline-block; margin-bottom:6px;">${p.status}</span>
                        <h2>${p.title}</h2>
                    </div>
                </div>`;
            });
            html += `</section>`;
        });

        grid.innerHTML = html;

        if (pagination && totalPages > 1) {
            let pagHtml = `<button onclick="window.publicChangeProjPage(${page - 1})" ${page === 1 ? 'disabled style="opacity:0.4"' : ''}><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                pagHtml += `<button onclick="window.publicChangeProjPage(${i})" style="background:${page === i ? '#530e90' : 'white'};color:${page === i ? 'white' : '#333'};padding:5px 10px;border-radius:4px;border:1px solid #ccc;">${i}</button>`;
            }
            pagHtml += `<button onclick="window.publicChangeProjPage(${page + 1})" ${page === totalPages ? 'disabled style="opacity:0.4"' : ''}><i class="fas fa-chevron-right"></i></button>`;
            pagination.innerHTML = pagHtml;
        } else if (pagination) {
            pagination.innerHTML = '';
        }
    }

    window.showProjDetail = function (id) {
        const list = document.getElementById('view-proyectos');
        const detail = document.getElementById('view-proyecto-detalle');
        const content = document.getElementById('public-proj-detail-content');
        if (!list || !detail || !content) return;
        const p = getPublicProjects().find(x => x.id == id);
        if (!p) return;
        const media = (p.images && p.images.length > 0) ? p.images[0] : (p.image || 'assets/images/img10.jpg');
        const statusColors = {
            'Destacado':  { bg: '#fef3c7', color: '#b45309' },
            'En Progreso':{ bg: '#dbeafe', color: '#1e40af' },
            'A Futuro':   { bg: '#f3f4f6', color: '#6b7280' }
        };
        const sc = statusColors[p.status] || { bg: '#f3f4f6', color: '#6b7280' };
        content.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);padding:30px;">
            <div style="width:100%;max-height:400px;overflow:hidden;border-radius:8px;margin-bottom:25px;">
                <img src="${media}" alt="${p.title}" style="width:100%;object-fit:cover;">
            </div>
            <span style="background:${sc.bg};color:${sc.color};padding:4px 14px;border-radius:20px;font-size:0.8rem;font-weight:800;display:inline-block;margin-bottom:10px;">${p.status}</span>
            <h1 style="color:#1e293b;font-size:1.8rem;margin:10px 0 20px 0;">${p.title}</h1>

            <div style="margin-bottom:25px;">
                <h3 style="color:#530e90;margin-bottom:10px;font-size:1.1rem;"><i class="fas fa-align-left" style="margin-right:8px;"></i>Descripción</h3>
                <p style="color:#475569;line-height:1.7;white-space:pre-wrap;">${p.description || 'Sin descripción registrada.'}</p>
            </div>

            ${p.objectives ? `
            <div style="margin-bottom:25px;padding:20px;background:#f8f5ff;border-radius:8px;border-left:4px solid #530e90;">
                <h3 style="color:#530e90;margin-bottom:10px;font-size:1.1rem;"><i class="fas fa-bullseye" style="margin-right:8px;"></i>Objetivos Estratégicos</h3>
                <p style="white-space:pre-wrap;color:#334155;line-height:1.7;">${p.objectives}</p>
            </div>` : ''}

            ${p.advances ? `
            <div style="margin-bottom:10px;padding:20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e;">
                <h3 style="color:#15803d;margin-bottom:10px;font-size:1.1rem;"><i class="fas fa-check-double" style="margin-right:8px;"></i>Avances Realizados</h3>
                <p style="white-space:pre-wrap;color:#334155;line-height:1.7;">${p.advances}</p>
            </div>` : ''}
        </div>`;
        list.classList.remove('public-active'); list.classList.add('public-hidden');
        detail.classList.remove('public-hidden'); detail.classList.add('public-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'btn-volver-proyectos' || e.target.closest('#btn-volver-proyectos'))) {
            const viewDetail = document.getElementById('view-proyecto-detalle');
            const viewList = document.getElementById('view-proyectos');
            if (viewDetail && viewList) {
                viewDetail.classList.add('public-hidden');
                viewDetail.classList.remove('public-active');
                viewList.classList.add('public-active');
                viewList.classList.remove('public-hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // ===========================================
    // --- LÓGICA DINÁMICA: EJES ESTRATÉGICOS ---
    // ===========================================
    function getPublicEjes() {
        const raw = JSON.parse(localStorage.getItem('dcti_strategic')) || [];
        // Normalize: older records may use 'title' or 'name' instead of 'area'
        return raw.map(s => ({
            ...s,
            area: s.area || s.title || s.name || 'Sin nombre',
            image: s.image || (s.images && s.images[0] ? (s.images[0].image || s.images[0]) : null)
        }));
    }

    let currentEjePage = 1;
    const ejesPerPage = 6;

    window.publicChangeEjePage = function (page) {
        const ejes = getPublicEjes();
        const totalPages = Math.ceil(ejes.length / ejesPerPage);
        if (page < 1 || page > totalPages) return;
        currentEjePage = page;
        window.renderPublicEjes();
        const grid = document.getElementById('public-ejes-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.renderPublicEjes = function () {
        const grid = document.getElementById('public-ejes-grid');
        if (!grid) return;
        const ejes = getPublicEjes();
        if (ejes.length === 0) {
            grid.innerHTML = `<div style="text-align:center;width:100%;padding:40px;color:#64748b;">No hay información disponible sobre los ejes de gestión.</div>`;
            return;
        }

        const totalPages = Math.ceil(ejes.length / ejesPerPage);
        if (currentEjePage > totalPages) currentEjePage = totalPages;
        const start = (currentEjePage - 1) * ejesPerPage;
        const slice = ejes.slice(start, start + ejesPerPage);

        let html = `<div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; padding: 20px 0;">`;

        slice.forEach((eje, localIdx) => {
            const globalIndex = start + localIdx;
            const bgMedia = eje.image || 'assets/images/img7.jpg';
            const title = eje.area || 'Sin Título';
            const description = eje.description || '';
            const shortDesc = description.length > 120 ? description.substring(0, 120) + '...' : description;

            html += `
                <article style="display: flex; flex-direction: column; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; border-left: 5px solid #530e90; width: 350px; max-width: 100%; transition: transform 0.2s ease; margin-bottom: 20px;">
                    <div style="width: 100%; height: 200px; overflow: hidden; cursor: pointer;" onclick="if(typeof showEjeDetail === 'function') showEjeDetail(${globalIndex})">
                        <img src="${bgMedia}" alt="${title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    </div>
                    <div style="padding: 24px; display: flex; flex-direction: column; flex-grow: 1;">
                        <h2 style="margin: 0 0 12px 0; color: #530e90; font-size: 1.3rem; line-height: 1.3; overflow-wrap: anywhere; word-break: break-word;">${title}</h2>
                        <p style="margin: 0 0 20px 0; color: #475569; line-height: 1.6; font-size: 0.95rem; overflow-wrap: anywhere; word-break: break-word;">${shortDesc}</p>
                        <button onclick="if(typeof showEjeDetail === 'function') showEjeDetail(${globalIndex})" style="margin-top: auto; align-self: flex-start; background: transparent; color: #530e90; border: 1px solid #530e90; padding: 8px 16px; border-radius: 20px; font-weight: 600; cursor: pointer; transition: all 0.2s ease;" onmouseover="this.style.background='#530e90'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='#530e90';">Ver Detalles</button>
                    </div>
                </article>`;
        });

        html += `</div>`;

        // Paginación discreta (solo visible si hay más de una página)
        if (totalPages > 1) {
            html += `<div style="display: flex; justify-content: center; align-items: center; gap: 8px; padding: 10px 0 30px 0;">`;
            html += `<button onclick="window.publicChangeEjePage(${currentEjePage - 1})" ${currentEjePage === 1 ? 'disabled' : ''} style="width:32px;height:32px;border:1px solid #e2e8f0;background:white;border-radius:50%;cursor:${currentEjePage === 1 ? 'default' : 'pointer'};opacity:${currentEjePage === 1 ? '0.3' : '1'};display:flex;align-items:center;justify-content:center;"><i class="fas fa-chevron-left" style="font-size:0.75rem;"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                html += `<button onclick="window.publicChangeEjePage(${i})" style="width:32px;height:32px;border:1px solid ${currentEjePage === i ? '#530e90' : '#e2e8f0'};background:${currentEjePage === i ? '#530e90' : 'white'};color:${currentEjePage === i ? 'white' : '#475569'};border-radius:50%;cursor:pointer;font-size:0.85rem;font-weight:600;">${i}</button>`;
            }
            html += `<button onclick="window.publicChangeEjePage(${currentEjePage + 1})" ${currentEjePage === totalPages ? 'disabled' : ''} style="width:32px;height:32px;border:1px solid #e2e8f0;background:white;border-radius:50%;cursor:${currentEjePage === totalPages ? 'default' : 'pointer'};opacity:${currentEjePage === totalPages ? '0.3' : '1'};display:flex;align-items:center;justify-content:center;"><i class="fas fa-chevron-right" style="font-size:0.75rem;"></i></button>`;
            html += `</div>`;
        }

        grid.innerHTML = html;
    };

    window.showEjeDetail = function (index) {
        const ejes = getPublicEjes();
        const eje = ejes[index];
        if (!eje) return;

        const list = document.getElementById('view-ejes');
        const detail = document.getElementById('view-eje-detalle');
        const content = document.getElementById('public-eje-detail-content');
        if (!list || !detail || !content) return;

        const bgMedia = eje.image || 'assets/images/img7.jpg';

        content.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);padding:30px;">
            <div style="width:100%;max-height:400px;overflow:hidden;border-radius:8px;margin-bottom:25px;">
                <img src="${bgMedia}" alt="${eje.area || 'Eje'}" style="width:100%;height:100%;object-fit:cover;max-height:400px;">
            </div>
            <h1 style="color:#1e293b;font-size:1.8rem;margin:10px 0 20px 0;">${eje.area || 'Sin Título'}</h1>
            
            <div style="margin-bottom:25px;">
                <h3 style="color:#530e90;margin-bottom:10px;font-size:1.1rem;"><i class="fas fa-align-left" style="margin-right:8px;"></i>Descripción</h3>
                <p style="color:#475569;line-height:1.7;white-space:pre-wrap;">${(eje.description || '').replace(/\n/g, '<br>')}</p>
            </div>
        </div>`;

        list.classList.remove('public-active'); list.classList.add('public-hidden');
        detail.classList.remove('public-hidden'); detail.classList.add('public-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('click', (e) => {
        if (e.target && (e.target.id === 'btn-volver-ejes' || e.target.closest('#btn-volver-ejes'))) {
            const viewDetail = document.getElementById('view-eje-detalle');
            const viewList = document.getElementById('view-ejes');
            if (viewDetail && viewList) {
                viewDetail.classList.add('public-hidden');
                viewDetail.classList.remove('public-active');
                viewList.classList.add('public-active');
                viewList.classList.remove('public-hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    // ==============================================
    // --- LÓGICA DINÁMICA: CARRUSELES DE INICIO ---
    // ==============================================
    window.renderPublicInicio = function () {
        const principal = document.getElementById('principal');
        const miniatura = document.getElementById('miniatura');
        const noticiasG = document.getElementById('principal-noticias-grid');

        const news = getPublicNews();
        const projs = getPublicProjects();
        const courses = getPublicCourses();

        // Helper func to safely get media array
        function getMediaArray(item) {
            if (Array.isArray(item.multimedia)) return item.multimedia;
            return item.multimedia ? [item.multimedia] : [];
        }

        // 1. Carrusel Principal Hero
        if (principal) {
            let heroSlides = [];
            const principalNews = news.filter(n => n.carouselPlacement === 'Carrusel Principal');
            principalNews.slice(0, 5).forEach(n => {
                const imgs = getMediaArray(n);
                if (imgs.length === 0) imgs.push('assets/images/img15.jpg');
                imgs.forEach(img => heroSlides.push({ img, title: n.headline }));
            });
            
            // Fill with projects if not enough
            if (heroSlides.length < 2) {
                projs.slice(0, 2).forEach(p => heroSlides.push({ img: Array.isArray(p.multimedia)?p.multimedia[0]:(p.multimedia || 'assets/images/img4.jpg'), title: p.title }));
            }
            if (heroSlides.length === 0) {
                heroSlides = [
                    { img: 'assets/images/img3.jpg', title: 'Innovación Tecnológica' },
                    { img: 'assets/images/img8.jpg', title: 'Monagas Potencia Digital' }
                ];
            }
            const nCount = heroSlides.length;
            principal.style.width = (nCount * 100) + '%';
            principal.innerHTML = heroSlides.map(slide => `
            <div class="ccp" style="width:calc(100%/${nCount});">
                <div class="imgc"><img src="${slide.img}" alt="${slide.title}" style="width:100%;height:100%;object-fit:cover;"></div>
                <div class="tc" style="background:rgba(83,14,144,0.8);">
                    <h2 style="color:white;margin:0;">${slide.title.length > 50 ? slide.title.substring(0, 50) + '...' : slide.title}</h2>
                </div>
            </div>`).join('');

            const btn1 = document.getElementById('btn-left-principal');
            const btn2 = document.getElementById('btn-right-principal');
            if (btn1) btn1.style.display = 'block';
            if (btn2) btn2.style.display = 'block';

            if (typeof window.initCarruselPrincipal === 'function') {
                window.initCarruselPrincipal();
            }
        }

        // 2. Carrusel de Noticias (Sección media)
        if (noticiasG) {
            let topNews = news.filter(n => n.carouselPlacement === 'Carrusel Noticias' || n.category === 'Carrusel de Noticias');
            if (topNews.length === 0) topNews = news; // Fallback to all published news to not break layout
            
            topNews = topNews.slice(0, 6); // Up to 6

            if (topNews.length > 0) {
                const nCount = topNews.length;
                const containerWidth = Math.max(3, nCount) * 100;
                noticiasG.style.width = containerWidth + '%';

                noticiasG.innerHTML = topNews.map(n => {
                    const imgs = getMediaArray(n);
                    if (imgs.length === 0) imgs.push('assets/images/img8.jpg');
                    const coverMedia = imgs[0];

                    return `
                    <article class="noticia" style="width: calc(100% / ${Math.max(3, nCount)}); cursor:pointer;" onclick="document.querySelector('[data-target=view-noticias]').click(); window.showNewsDetail(${n.id})">
                        <img src="${coverMedia}" alt="${n.headline}" data-multimedia='${JSON.stringify(imgs)}' class="discrete-fade-img" data-index="0" style="transition: opacity 0.5s ease-in-out;">
                        <div class="contenido-noticia">
                            <h2 style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${n.headline}</h2>
                            <p style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${n.summary || ''}</p>
                        </div>
                    </article>`;
                }).join('');
                
                if (typeof window.initCarruselNoticias === 'function') {
                    window.initCarruselNoticias();
                }
            } else {
                noticiasG.innerHTML = '<div style="padding:20px;text-align:center;width:100%;">No hay noticias para mostrar en este carrusel.</div>';
            }
        }

        // 3. Miniaturas Inferiores
        // La estructura original usa un .miniaturas-contenedor con width:200% mostrando 4 a la vez
        // Cada .miniaturasc tiene width: calc(100%/4) del contenedor (que es 200% del viewport)
        if (miniatura) {
            let mix = [];
            const bottomNews = news.filter(n => n.carouselPlacement === 'Carrusel Miniaturas');
            bottomNews.slice(0, 4).forEach(n => mix.push({
                img: Array.isArray(n.multimedia) && n.multimedia.length > 0 ? n.multimedia[0] : (n.multimedia || 'assets/images/img8.jpg'),
                title: n.headline,
                type: 'Noticia',
                link: `document.querySelector('[data-target=view-noticias]').click(); window.showNewsDetail(${n.id});`
            }));
            courses.slice(0, 4).forEach(c => mix.push({
                img: (c.images && c.images[0]) ? c.images[0] : 'assets/images/img5.jpg',
                title: c.name,
                type: 'Curso',
                link: "document.querySelector('[data-target=view-cursos]').click();"
            }));
            projs.slice(0, 4).forEach(p => mix.push({
                img: Array.isArray(p.multimedia)?p.multimedia[0]:(p.multimedia || 'assets/images/img10.jpg'),
                title: p.title,
                type: 'Proyecto',
                link: `document.querySelector('[data-target=view-proyectos]').click(); window.showProjDetail(${p.id});`
            }));
            if (mix.length === 0) {
                mix = [
                    { img: 'assets/images/img5.jpg', title: 'Ciberseguridad', type: 'Formación', link: '' },
                    { img: 'assets/images/img7.jpg', title: 'I.O.T.', type: 'Tecnología', link: '' },
                    { img: 'assets/images/img3.jpg', title: 'Robótica', type: 'Educación', link: '' },
                    { img: 'assets/images/img10.jpg', title: 'AgroTech', type: 'Innovación', link: '' },
                    { img: 'assets/images/img1.png', title: 'Sedes Monagas', type: 'Infraestructura', link: '' },
                    { img: 'assets/images/img8.jpg', title: 'Pueblo Heroico', type: 'Institucional', link: '' },
                    { img: 'assets/images/img2.png', title: 'DCTI', type: 'Portal', link: '' },
                    { img: 'assets/images/img9.jpg', title: 'Cooperación', type: 'Acuerdos', link: '' }
                ];
            }

            // Fijar suficientes imágenes para al menos 2 "páginas" de 4
            while (mix.length < 5) {
                mix = mix.concat(mix);
            }
            const numImages = mix.length;

            // El contenedor debe ser lo suficientemente ancho para todos los slides
            // CSS: miniaturas-contenedor w=200% muestra 4 de 8 imágenes (4/8 = 50% del contenedor es visible)
            // Para N imágenes: contenedor = (N/4) * 100%
            miniatura.style.width = (numImages / 4 * 100) + '%';
            miniatura.style.display = 'flex';
            miniatura.style.transition = 'transform 0.6s ease';

            miniatura.innerHTML = mix.map(m => `
            <div class="miniaturasc" style="width:${100 / numImages}%;" onclick="${m.link}">
                <img src="${m.img}" alt="${m.title || 'Miniatura'}" style="width:100%;height:100%;object-fit:cover;transition:transform 0.3s;">
                <div class="miniaturasc-overlay">
                    <span style="font-weight:bold;display:block;">${m.type}</span>
                    <span style="font-size:0.7rem;">${m.title || ''}</span>
                </div>
            </div>`).join('');

            const m1 = document.getElementById('btn-left-m');
            const m2 = document.getElementById('btn-right-m');
            if (m1) m1.style.display = 'block';
            if (m2) m2.style.display = 'block';
            if (typeof window.initCarruselMiniaturas === 'function') {
                window.initCarruselMiniaturas();
            }
        }
        
        // Inicializar intervalo de paginación discreta para noticias con múltiples imágenes (cambiando src)
        if (window._discreteFadeInterval) clearInterval(window._discreteFadeInterval);
        window._discreteFadeInterval = setInterval(() => {
            document.querySelectorAll('.discrete-fade-img').forEach(img => {
                const arrStr = img.getAttribute('data-multimedia');
                if(!arrStr) return;
                try {
                    const arr = JSON.parse(arrStr);
                    if (arr.length <= 1) return;
                    let idx = parseInt(img.getAttribute('data-index') || '0');
                    idx = (idx + 1) % arr.length;
                    
                    img.style.opacity = '0';
                    setTimeout(() => {
                        img.src = arr[idx];
                        img.onload = () => { img.style.opacity = '1'; }; // fade in when loaded
                        if(img.complete) img.style.opacity = '1'; // fallback
                    }, 500);
                    
                    img.setAttribute('data-index', idx);
                } catch(e) {}
            });
        }, 4000); // 4 segundos por slide
    }


    // ==============================================
    // --- INICIALIZACIÓN GLOBAL ---
    // ==============================================
    function initializePublicPortal() {
        renderPublicCourses();
        renderPublicNews();
        renderPublicProjects();
        renderPublicEjes();
        if (typeof window.renderPublicInicio === 'function') window.renderPublicInicio();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePublicPortal);
    } else {
        initializePublicPortal();
    }

})(); // FIN DEL IIFE - Fin del alcance privado del portal público
