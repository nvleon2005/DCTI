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
});
