document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const publicViews = document.querySelectorAll('.public-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');

            // Si el link no tiene data-target (o es enlace normal a otra página), no hacer preventDefault
            if (!targetId) return;

            e.preventDefault();

            // 1. Actualizar estado de los enlaces
            navLinks.forEach(nav => nav.classList.remove('public-nav-active'));
            link.classList.add('public-nav-active');

            // 2. Ocultar todas las vistas y mostrar la objetivo
            publicViews.forEach(view => {
                if (view.id === targetId) {
                    view.classList.remove('public-hidden');
                    view.classList.add('public-active');

                    // Inicializar Leaflet dinámicamente solo al ver Contactos
                    if (targetId === 'view-contactos' && typeof window.initContactMap === 'function') {
                        setTimeout(() => window.initContactMap(), 300); // Dar un respiro a la UI
                    }
                } else {
                    view.classList.remove('public-active');
                    view.classList.add('public-hidden');
                }
            });

            // 3. Scroll top automático para simular cambio de página
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 4. Cerrar el menú móvil si está abierto
            const navMenu = document.getElementById("nav-menu");
            const navToggle = document.getElementById("nav-toggle");
            if (navMenu && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                const icon = navToggle.querySelector("i");
                if (icon) icon.classList.replace("fa-xmark", "fa-bars");
            }
        });
    });

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
                    : `<div style="width: 32px; height: 32px; border-radius: 50%; background: #6366f1; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; border: 2px solid white;">${session.initials || 'U'}</div>`;

                authMenuContainer.innerHTML = `
                    <div class="public-user-pill-container" style="position: relative;">
                        <div class="public-user-pill" style="display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 5px 12px; border-radius: 20px; background: #eef2ff; border: 1px solid #c7d2fe; transition: all 0.3s;" id="public-user-pill-btn">
                            ${avatarHTML}
                            <span style="color: #4338ca; font-weight: 600; font-size: 0.9rem; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${displayName}</span>
                            <i class="fas fa-chevron-down" style="color: #6366f1; font-size: 0.8rem; margin-left: 2px;"></i>
                        </div>
                        <div class="public-dropdown hidden" id="public-user-dropdown" style="position: absolute; top: calc(100% + 10px); right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); min-width: 180px; overflow: hidden; z-index: 1000; display: none;">
                            <div style="padding: 10px 15px; border-bottom: 1px solid #f1f5f9; background: #fafafa;">
                                <p style="margin: 0; font-size: 0.8rem; color: #64748b;">Conectado como</p>
                                <p style="margin: 0; font-size: 0.9rem; font-weight: bold; color: #0f172a;" title="${session.email}">${displayName}</p>
                            </div>
                            <ul style="list-style: none; padding: 5px 0; margin: 0;">
                                <li>
                                    <a href="login.html" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #334155; text-decoration: none; font-size: 0.9rem; transition: background 0.3s; background: transparent;" onmouseover="this.style.background='#f1f5f9';" onmouseout="this.style.background='transparent';">
                                        <i class="fas fa-user-circle" style="color: #6366f1;"></i> Dashboard / Perfil
                                    </a>
                                </li>
                                ${session.role === 'visitante' ? `
                                <li>
                                    <a href="login.html" style="display: flex; align-items: center; gap: 10px; padding: 10px 15px; color: #334155; text-decoration: none; font-size: 0.9rem; transition: background 0.3s; background: transparent;" onmouseover="this.style.background='#f1f5f9';" onmouseout="this.style.background='transparent';">
                                        <i class="fas fa-book-open" style="color: #10b981;"></i> Mis Cursos
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
                    const isVisible = dropdown.style.display === 'block';
                    dropdown.style.display = isVisible ? 'none' : 'block';
                });

                document.addEventListener('click', () => {
                    if (dropdown.style.display === 'block') {
                        dropdown.style.display = 'none';
                    }
                });

                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    localStorage.removeItem('dcti_session');
                    window.location.reload();
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
        container.innerHTML = `
            <a href="login.html" style="display: flex; align-items: center; gap: 8px; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); padding: 5px 15px; border-radius: 20px; color: white; text-decoration: none; font-weight: 500; font-size: 0.9rem; transition: all 0.3s;" onmouseover="this.style.background='white'; this.style.color='var(--color-primary)';" onmouseout="this.style.background='rgba(255, 255, 255, 0.15)'; this.style.color='white';">
                <i class="fas fa-sign-in-alt"></i> Ingresar
            </a>
        `;
    }

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

    function renderPublicCourses(page = 1) {
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
            const coverImage = (course.images && course.images.length > 0) ? course.images[0] : 'img/img5.jpg';

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

        const coverImg = (course.images && course.images.length > 0) ? course.images[0] : 'img/img5.jpg';

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
                    window.location.href = 'login.html';
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

});
