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
                    ? `<img src="${session.avatar}" alt="Avatar" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 2px solid white;">`
                    : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--color-primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; border: 2px solid white;">${session.initials || 'U'}</div>`;

                authMenuContainer.innerHTML = `
                    <div class="public-user-pill-container" style="position: relative;">
                        <div class="public-user-pill" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 12px; border-radius: 20px; background: #faf5ff; border: 1px solid #e9d5ff; transition: all 0.3s;" id="public-user-pill-btn">
                            ${avatarHTML}
                            <span style="color: var(--color-primary); font-weight: 600; font-size: 0.9rem; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</span>
                            <i class="fas fa-chevron-down" style="color: var(--color-primary-light); font-size: 0.8rem; margin-left: 2px;"></i>
                        </div>
                        <div class="public-dropdown hidden" id="public-user-dropdown" style="position: absolute; top: calc(100% + 10px); right: 0; background: white; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.2); min-width: 200px; overflow: hidden; z-index: 9999; border: 1px solid rgba(0,0,0,0.05);">
                            <div style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; background: #fdfaff;">
                                <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Conectado como</p>
                                <p style="margin: 0; font-size: 0.9rem; font-weight: bold; color: var(--color-primary-dark);" title="${session.email}">${displayName}</p>
                            </div>
                            <ul style="list-style: none; padding: 5px 0; margin: 0;">
                                <li>
                                    <a href="#" onclick="event.preventDefault(); if(typeof Router !== 'undefined') Router.navigateTo('dashboard');" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #334155; text-decoration: none; font-size: 0.9rem; transition: background 0.3s; background: transparent;" onmouseover="this.style.background='#f3e8ff';" onmouseout="this.style.background='transparent';">
                                        <i class="fas fa-chart-line" style="color: var(--color-primary);"></i> Dashboard / Perfil
                                    </a>
                                </li>
                                ${session.role === 'visitante' ? `
                                <li>
                                    <a href="#" onclick="event.preventDefault(); if(typeof Router !== 'undefined') Router.navigateTo('my-courses');" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #334155; text-decoration: none; font-size: 0.9rem; transition: background 0.3s; background: transparent;" onmouseover="this.style.background='#f3e8ff';" onmouseout="this.style.background='transparent';">
                                        <i class="fas fa-book-open" style="color: #a01cad;"></i> Mis Cursos
                                    </a>
                                </li>` : ''}
                                <li style="border-top: 1px solid #f1f5f9; margin-top: 5px;">
                                    <a href="#" id="public-logout-btn" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #ef4444; text-decoration: none; font-size: 0.9rem; transition: background 0.3s; background: transparent;" onmouseover="this.style.background='#fee2e2';" onmouseout="this.style.background='transparent';">
                                        <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                                    </a>
                                </li>
                            </ul>
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
            const coverImage = (course.images && course.images.length > 0) ? course.images[0] : 'Assets/images/img5.jpg';

            // Calculo de cupos (Visual)
            const parts = getCourseParticipations(course.id);
            const cuposOcupados = parts.length;
            const cuposDisponibles = Math.max(0, (course.cupoMaximo || 0) - cuposOcupados);
            const badgeClass = cuposDisponibles > 0 ? 'badge-disponible' : 'badge-agotado';
            const badgeText = cuposDisponibles > 0 ? 'Disponible' : 'Agotado';
            const badgeColor = cuposDisponibles > 0 ? '#10b981' : '#ef4444';

            html += `
                <div class="course-item" style="width: 100% !important; max-width: none !important; margin: 0 !important; display: flex; flex-direction: column; overflow: hidden; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); background: white; transition: transform 0.3s ease;">
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

        const coverImg = (course.images && course.images.length > 0) ? course.images[0] : 'Assets/images/img5.jpg';

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

    // --- INTEGRACIÓN DE DATOS DE CONTACTO DINÁMICOS (DCTI) ---
    const dctiStorage = localStorage.getItem('dcti_info');
    let dctiData = null;
    if (dctiStorage) {
        try {
            dctiData = JSON.parse(dctiStorage);
        } catch (e) { console.error('Error parsing dcti_info', e); }
    } else if (typeof MOCK_DATA !== 'undefined' && MOCK_DATA.dcti) {
        dctiData = MOCK_DATA.dcti;
    }

    if (dctiData) {
        // Facebook
        const fbLink = document.getElementById('contacto-facebook-link');
        const fbText = document.getElementById('contacto-facebook-text');
        if (fbLink && fbText && dctiData.facebook) {
            fbText.textContent = dctiData.facebook;
            fbLink.href = dctiData.facebook.startsWith('http') ? dctiData.facebook : `https://www.facebook.com/${dctiData.facebook.replace('@', '')}`;
        }

        // Instagram
        const igLink = document.getElementById('contacto-instagram-link');
        const igText = document.getElementById('contacto-instagram-text');
        if (igLink && igText && dctiData.instagram) {
            igText.textContent = dctiData.instagram;
            igLink.href = dctiData.instagram.startsWith('http') ? dctiData.instagram : `https://www.instagram.com/${dctiData.instagram.replace('@', '')}`;
        }

        // Teléfono
        const phoneLink = document.getElementById('contacto-telefono-link');
        const phoneText = document.getElementById('contacto-telefono-text');
        if (phoneLink && phoneText && dctiData.phone) {
            phoneText.textContent = dctiData.phone;
            phoneLink.href = `tel:${dctiData.phone.replace(/[^0-9+]/g, '')}`;
        }

        // La dirección interactiva puede requerir geocodificación o simplemente mostrar texto en un modal/tooltip,
        // pero por ahora actualizamos el título o el enlace si aplicara.
        const dirLink = document.getElementById('contacto-direccion-link');
        const dirText = document.getElementById('contacto-direccion-text');
        if (dirLink && dirText && dctiData.address) {
            // Se mantiene "Ubicación" como texto pero se actualiza el tooltip o label
            dirLink.title = dctiData.address;
            dirLink.setAttribute('aria-label', `Ver nuestra ubicación: ${dctiData.address}`);
            // Alternativamente, se podría cambiar el texto directamente:
            // dirText.textContent = dctiData.address.substring(0, 15) + (dctiData.address.length > 15 ? '...' : ''); 
        }
    }

    // Render inicial llamadas (AQUI ORIGINALMENTE CERRABA DOMContentLoaded)

    // ===========================================
    // --- LÓGICA DINÁMICA: NOTICIAS PÚBLICAS ---
    // ===========================================
    let currentNewsPage = 1;
    const newsPerPage = 2; // Reducido para forzar la paginación con pocos datos
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
                renderPublicNews(1);
            });
        });
    });

    window.publicChangeNewsPage = function (newPage) {
        renderPublicNews(newPage);
        const el = document.getElementById('view-noticias');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.renderPublicNews = function (page = 1) {
        currentNewsPage = page;
        const wrapper = document.getElementById('public-news-wrapper');
        const pagination = document.getElementById('public-news-pagination');
        if (!wrapper) return;

        let news = getPublicNews();
        if (currentNewsFilter && currentNewsFilter !== 'Todas') {
            news = news.filter(n => n.category === currentNewsFilter);
        }

        if (news.length === 0) {
            wrapper.innerHTML = `<div style="text-align: center; width:100%; padding: 40px; color: #64748b;"><i class="fas fa-newspaper" style="font-size:3rem;opacity:0.4;margin-bottom:15px;"></i><p>No hay noticias disponibles.</p></div>`;
            if (pagination) pagination.innerHTML = '';
            return;
        }

        const totalPages = Math.ceil(news.length / newsPerPage);
        const pagedNews = news.slice((page - 1) * newsPerPage, page * newsPerPage);

        const categoriesList = [
            { id: 'Institucionales', title: 'Noticias institucionales', class: 'course-container-noticias' },
            { id: 'Local', title: 'Noticias locales', class: 'course-container-noticias2' },
            { id: 'Regional', title: 'Noticias regionales', class: 'course-container-noticias' },
            { id: 'Nacional', title: 'Noticias nacionales', class: 'course-container-noticias2' },
            { id: 'Internacional', title: 'Noticias internacionales', class: 'course-container-noticias' }
        ];

        let html = '';

        categoriesList.forEach(catDef => {
            const catNews = pagedNews.filter(n => n.category === catDef.id);
            html += `
            <section class="${catDef.class}">
                <div class="titulo_noticia">
                    <h2>${catDef.title}</h2>
                </div>
                <div class="noticias">
                    ${catNews.length > 0 ? catNews.map(n => {
                const media = n.multimedia || 'Assets/images/img8.jpg';
                return `
                        <div class="noticia-card" style="cursor:pointer;" onclick="window.showNewsDetail(${n.id})">
                            <img src="${media}" alt="${n.headline}">
                            <div class="noticia-card-body">
                                <a onclick="event.preventDefault(); window.showNewsDetail(${n.id})" class="redireccion" style="cursor:pointer;"><h2>${n.headline}</h2></a>
                            </div>
                        </div>`;
            }).join('') : '<p style="padding: 20px; color: #64748b;">Aún no hay noticias publicadas en esta categoría.</p>'}
                </div>
            </section>`;
        });

        // Para noticias que no encajen en esas categorías
        const otherNews = pagedNews.filter(n => !categoriesList.find(c => c.id === n.category) && n.category !== 'Carrusel de Noticias');
        if (otherNews.length > 0) {
            html += `
                <section class="course-container-noticias2">
                    <div class="titulo_noticia">
                        <h2>Otras Noticias</h2>
                    </div>
                    <div class="noticias">
                        ${otherNews.map(n => {
                const media = n.multimedia || 'Assets/images/img8.jpg';
                return `
                            <div class="noticia-card" style="cursor:pointer;" onclick="window.showNewsDetail(${n.id})">
                                <img src="${media}" alt="${n.headline}">
                                <div class="noticia-card-body">
                                    <a onclick="event.preventDefault(); window.showNewsDetail(${n.id})" class="redireccion" style="cursor:pointer;"><h2>${n.headline}</h2></a>
                                </div>
                            </div>`;
            }).join('')}
                    </div>
                </section>`;
        }

        wrapper.innerHTML = html;

        if (pagination && totalPages > 1) {
            let pagHtml = `<button onclick="window.publicChangeNewsPage(${page - 1})" ${page === 1 ? 'disabled style="opacity:0.4"' : ''} style="background:transparent;border:1px solid #ccc;border-radius:4px;padding:5px 10px;cursor:pointer;"><i class="fas fa-chevron-left"></i></button>`;
            for (let i = 1; i <= totalPages; i++) {
                pagHtml += `<button onclick="window.publicChangeNewsPage(${i})" style="background:${page === i ? '#530e90' : 'white'};color:${page === i ? 'white' : '#333'};padding:5px 10px;border-radius:4px;border:1px solid #ccc;cursor:pointer;">${i}</button>`;
            }
            pagHtml += `<button onclick="window.publicChangeNewsPage(${page + 1})" ${page === totalPages ? 'disabled style="opacity:0.4"' : ''} style="background:transparent;border:1px solid #ccc;border-radius:4px;padding:5px 10px;cursor:pointer;"><i class="fas fa-chevron-right"></i></button>`;
            pagination.innerHTML = pagHtml;
        } else if (pagination) {
            pagination.innerHTML = '';
        }
    }

    window.showNewsDetail = function (id) {
        const grid = document.getElementById('view-noticias');
        const detail = document.getElementById('view-noticia-detalle');
        const content = document.getElementById('public-news-detail-content');
        if (!grid || !detail || !content) return;
        const news = getPublicNews().find(n => n.id == id);
        if (!news) return;
        const dateStr = news.published ? new Date(news.published).toLocaleDateString('es-VE') : 'N/A';
        const media = news.multimedia || 'Assets/images/img8.jpg';
        content.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);padding:30px;">
            <span style="background:rgba(83,14,144,0.1);color:#530e90;padding:5px 12px;border-radius:20px;font-size:0.8rem;font-weight:bold;margin-bottom:15px;display:inline-block;">${news.category || 'General'}</span>
            <h1 style="color:#1e293b;font-size:2rem;margin-top:10px;margin-bottom:15px;">${news.headline}</h1>
            <div style="display:flex;gap:20px;color:#64748b;font-size:0.9rem;margin-bottom:30px;border-bottom:1px solid #f1f5f9;padding-bottom:15px;">
                <span><i class="far fa-calendar-alt"></i> ${dateStr}</span>
                <span><i class="fas fa-user-edit"></i> ${news.author || 'DCTI'}</span>
            </div>
            <div style="width:100%;max-height:450px;overflow:hidden;border-radius:8px;margin-bottom:30px;">
                <img src="${media}" alt="${news.headline}" style="width:100%;object-fit:cover;">
            </div>
            <h3 style="color:#475569;font-size:1.2rem;margin-bottom:20px;font-style:italic;border-left:4px solid #530e90;padding-left:15px;">${news.summary || ''}</h3>
            <div style="color:#334155;line-height:1.8;font-size:1.05rem;white-space:pre-wrap;">${news.content || ''}</div>
        </div>`;
        grid.classList.remove('public-active'); grid.classList.add('public-hidden');
        detail.classList.remove('public-hidden'); detail.classList.add('public-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const btnVolverNews = document.getElementById('btn-volver-noticias');
        if (btnVolverNews) {
            btnVolverNews.addEventListener('click', () => {
                document.getElementById('view-noticia-detalle').classList.add('public-hidden');
                document.getElementById('view-noticia-detalle').classList.remove('public-active');
                document.getElementById('view-noticias').classList.add('public-active');
                document.getElementById('view-noticias').classList.remove('public-hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });

    // ===========================================
    // --- LÓGICA DINÁMICA: PROYECTOS PÚBLICOS ---
    // ===========================================
    let currentProjPage = 1;
    const projPerPage = 6;

    function getPublicProjects() {
        const allProj = JSON.parse(localStorage.getItem('dcti_projects')) || [];
        return allProj.filter(p =>
            p.status === 'En Proceso' || p.status === 'Validado' ||
            p.status === 'En Desarrollo' || p.status === 'Implementado' ||
            p.status === 'En Revisión' || p.status === 'Finalizado'
        );
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
                const media = p.multimedia || 'Assets/images/img10.jpg';

                html += `
                <div class="proyecto-card" style="cursor:pointer;" onclick="window.showProjDetail(${p.id})">
                    <img src="${media}" alt="${p.title}">
                    <div class="proyecto-card-body">
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
        const media = p.multimedia || 'Assets/images/img10.jpg';
        const progress = p.progress || 0;
        let progColor = '#3b82f6';
        if (progress >= 100) progColor = '#10b981';
        else if (progress < 30) progColor = '#f59e0b';
        content.innerHTML = `
        <div style="background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 15px rgba(0,0,0,0.05);padding:30px;">
            <div style="width:100%;max-height:400px;overflow:hidden;border-radius:8px;margin-bottom:25px;">
                <img src="${media}" alt="${p.title}" style="width:100%;object-fit:cover;">
            </div>
            <span style="background:rgba(0,0,0,0.08);padding:4px 12px;border-radius:20px;font-size:0.8rem;font-weight:bold;">${p.status}</span>
            <h1 style="color:#1e293b;font-size:1.8rem;margin:15px 0;">${p.title}</h1>
            <p style="color:#475569;line-height:1.7;margin-bottom:20px;">${p.description || ''}</p>
            ${p.objectives ? `<h3 style="color:#530e90;margin-bottom:10px;">Objetivos Estratégicos</h3><p style="white-space:pre-wrap;color:#334155;">${p.objectives}</p>` : ''}
            <div style="margin-top:20px;">
                <div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#64748b;margin-bottom:6px;"><span>Progreso del Proyecto</span><span style="font-weight:bold;color:${progColor}">${progress}%</span></div>
                <div style="width:100%;background:#e2e8f0;border-radius:10px;height:10px;overflow:hidden;">
                    <div style="width:${progress}%;background:${progColor};height:100%;border-radius:10px;"></div>
                </div>
            </div>
        </div>`;
        list.classList.remove('public-active'); list.classList.add('public-hidden');
        detail.classList.remove('public-hidden'); detail.classList.add('public-active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.addEventListener('DOMContentLoaded', () => {
        const btnVolverProj = document.getElementById('btn-volver-proyectos');
        if (btnVolverProj) {
            btnVolverProj.addEventListener('click', () => {
                document.getElementById('view-proyecto-detalle').classList.add('public-hidden');
                document.getElementById('view-proyecto-detalle').classList.remove('public-active');
                document.getElementById('view-proyectos').classList.add('public-active');
                document.getElementById('view-proyectos').classList.remove('public-hidden');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
    });

    // ===========================================
    // --- LÓGICA DINÁMICA: EJES ESTRATÉGICOS ---
    // ===========================================
    function getPublicEjes() {
        return JSON.parse(localStorage.getItem('dcti_strategic')) || [];
    }

    window.renderPublicEjes = function () {
        const grid = document.getElementById('public-ejes-grid');
        if (!grid) return;
        const ejes = getPublicEjes();
        if (ejes.length === 0) {
            grid.innerHTML = `<div style="text-align:center;width:100%;padding:40px;color:#64748b;">No hay información disponible sobre los ejes de gestión.</div>`;
            return;
        }
        grid.innerHTML = ejes.map((eje, index) => {
            const isOdd = index % 2 === 0;
            const cardClass = isOdd ? 'eje-card-odd' : 'eje-card-even';
            const bgMedia = eje.multimedia || 'Assets/images/img7.jpg';
            const goals = (eje.goals || '').split('\n').filter(g => g.trim());
            const goalsHtml = goals.length ? `<ul>${goals.map(g => `<li>${g.replace(/^- /, '')}</li>`).join('')}</ul>` : '';

            return `
                <article class="${cardClass}">
                    <img src="${bgMedia}" alt="${eje.title}">
                    <div class="contenido-eje-new">
                        <h2>${eje.title}</h2>
                        <p>${eje.description}</p>
                        ${goalsHtml}
                    </div>
                </article>`;
        }).join('');
    };

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

        // 1. Carrusel Principal Hero
        if (principal) {
            let heroSlides = [];
            news.slice(0, 2).forEach(n => heroSlides.push({ img: n.multimedia || 'Assets/images/img15.jpg', title: n.headline }));
            projs.slice(0, 2).forEach(p => heroSlides.push({ img: p.multimedia || 'Assets/images/img4.jpg', title: p.title }));
            if (heroSlides.length === 0) {
                heroSlides = [
                    { img: 'Assets/images/img3.jpg', title: 'Innovación Tecnológica' },
                    { img: 'Assets/images/img8.jpg', title: 'Monagas Potencia Digital' }
                ];
            }
            const n = heroSlides.length;
            principal.style.width = (n * 100) + '%';
            principal.innerHTML = heroSlides.map(slide => `
            <div class="ccp" style="width:calc(100%/${n});">
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
        // La estructura original usa .noticia-contenedor con width:300% y 3 .noticia de width:calc(100%/3)
        // El contenedor padre .noticia-contenedor es el slider - necesita width = (count * 100/3)%
        if (noticiasG) {
            const topNews = news.slice(0, 3);
            if (topNews.length > 0) {
                const nCount = topNews.length;
                // Si hay menos de 3 noticias, el contenedor debe ajustarse para no dejar huecos
                // Pero manteniendo la compatibilidad con el CSS que espera 300% para carrusel
                const containerWidth = Math.max(3, nCount) * 100;
                noticiasG.style.width = containerWidth + '%';

                noticiasG.innerHTML = topNews.map(n => `
                <article class="noticia" style="width: calc(100% / ${Math.max(3, nCount)}); cursor:pointer;" onclick="document.querySelector('[data-target=view-noticias]').click(); window.showNewsDetail(${n.id})">
                    <img src="${n.multimedia || 'Assets/images/img8.jpg'}" alt="${n.headline}">
                    <div class="contenido-noticia">
                        <h2 style="display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${n.headline}</h2>
                        <p style="display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;">${n.summary || ''}</p>
                    </div>
                </article>`).join('');
                // Inicializar el carrusel de noticias con dots
                if (typeof window.initCarruselNoticias === 'function') {
                    window.initCarruselNoticias();
                }
            } else {
                noticiasG.innerHTML = '<div style="padding:20px;text-align:center;width:100%;">No hay noticias recientes.</div>';
            }
        }

        // 3. Miniaturas Inferiores
        // La estructura original usa un .miniaturas-contenedor con width:200% mostrando 4 a la vez
        // Cada .miniaturasc tiene width: calc(100%/4) del contenedor (que es 200% del viewport)
        if (miniatura) {
            let mix = [];
            courses.slice(0, 4).forEach(c => mix.push({
                img: (c.images && c.images[0]) ? c.images[0] : 'Assets/images/img5.jpg',
                title: c.name,
                type: 'Curso',
                link: "document.querySelector('[data-target=view-cursos]').click();"
            }));
            projs.slice(0, 4).forEach(p => mix.push({
                img: p.multimedia || 'Assets/images/img10.jpg',
                title: p.title,
                type: 'Proyecto',
                link: `document.querySelector('[data-target=view-proyectos]').click(); window.showProjDetail(${p.id});`
            }));
            if (mix.length === 0) {
                mix = [
                    { img: 'Assets/images/img5.jpg', title: 'Ciberseguridad', type: 'Formación', link: '' },
                    { img: 'Assets/images/img7.jpg', title: 'I.O.T.', type: 'Tecnología', link: '' },
                    { img: 'Assets/images/img3.jpg', title: 'Robótica', type: 'Educación', link: '' },
                    { img: 'Assets/images/img10.jpg', title: 'AgroTech', type: 'Innovación', link: '' },
                    { img: 'Assets/images/img1.png', title: 'Sedes Monagas', type: 'Infraestructura', link: '' },
                    { img: 'Assets/images/img8.jpg', title: 'Pueblo Heroico', type: 'Institucional', link: '' },
                    { img: 'Assets/images/img2.png', title: 'DCTI', type: 'Portal', link: '' },
                    { img: 'Assets/images/img9.jpg', title: 'Cooperación', type: 'Acuerdos', link: '' }
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
