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

    // --- LÓGICA DEL MÓDULO DE CURSOS (REJILLA -> DETALLE) ---
    const gridCursos = document.getElementById('view-cursos');
    const detalleCurso = document.getElementById('view-curso-detalle');
    const btnVolverCursos = document.getElementById('btn-volver-cursos');
    const enlacesCursos = document.querySelectorAll('.enlaceCurso');

    if (gridCursos && detalleCurso && btnVolverCursos) {
        // Abrir detalle al hacer clic en un curso
        enlacesCursos.forEach(enlace => {
            enlace.addEventListener('click', (e) => {
                e.preventDefault();
                gridCursos.classList.remove('public-active');
                gridCursos.classList.add('public-hidden');

                detalleCurso.classList.remove('public-hidden');
                detalleCurso.classList.add('public-active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        });

        // Volver a la rejilla de cursos
        btnVolverCursos.addEventListener('click', () => {
            detalleCurso.classList.remove('public-active');
            detalleCurso.classList.add('public-hidden');

            gridCursos.classList.remove('public-hidden');
            gridCursos.classList.add('public-active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- LÓGICA DEL MÓDULO DE CURSOS (MODAL INSCRIPCIÓN) ---
    const btnInscribirseCurso = document.getElementById('btn-inscribirse-curso');
    const modalInscripcion = document.getElementById('modal-inscripcion');
    const btnConfirmarInscripcion = document.getElementById('btn-confirmar-inscripcion');
    const btnExitosaMsg = document.getElementById('btn-exitosa-msg');

    if (btnInscribirseCurso && modalInscripcion) {
        // Abrir Modal
        btnInscribirseCurso.addEventListener('click', () => {
            modalInscripcion.classList.remove('public-hidden-modal');
        });

        // Cerrar Modal al hacer clic fuera del contenido
        modalInscripcion.addEventListener('click', (e) => {
            if (e.target === modalInscripcion) {
                modalInscripcion.classList.add('public-hidden-modal');
                // Resetear estado botones al cerrar
                if (btnConfirmarInscripcion && btnExitosaMsg) {
                    btnConfirmarInscripcion.classList.remove('public-hidden-modal');
                    btnExitosaMsg.classList.add('public-hidden-modal');
                }
            }
        });

        // Simular inscripción exitosa
        if (btnConfirmarInscripcion && btnExitosaMsg) {
            btnConfirmarInscripcion.addEventListener('click', () => {
                // Validación básica (simulada, en la realidad comprobaríamos el form)
                btnConfirmarInscripcion.classList.add('public-hidden-modal');
                btnExitosaMsg.classList.remove('public-hidden-modal');

                // Opcional: auto-cerrar el modal después de 3 segundos
                setTimeout(() => {
                }, 3000);
            });
        }
    }

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
