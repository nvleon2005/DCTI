/**
 * Presentacion/Application/App.js
 * Coordinación de estado global, sesión y autenticación en modo SPA.
 */

const App = {
    isLoggedIn: () => {
        return !!localStorage.getItem('dcti_session');
    },

    start: (user) => {
        const currentHash = window.location.hash.replace('#', '');
        const isNavigatingToAdmin = currentHash === 'dashboard' || currentHash === 'profile' || currentHash === 'my-courses';

        // En modo SPA, si el usuario es visitante y no está intentando entrar explícitamente a su perfil, nos quedamos en el portal público
        if (user.role === 'visitante' && !isNavigatingToAdmin) {
            // Ocultar capas de auth/admin
            const authScreen = document.getElementById('auth-view-root');
            const adminRoot = document.getElementById('admin-root');
            const publicPortal = document.getElementById('public-portal');

            if (authScreen) authScreen.classList.add('hidden');
            if (adminRoot) adminRoot.classList.add('hidden');
            if (publicPortal) publicPortal.classList.remove('hidden');

            App.updateUserProfile(user);
            
            // Actualizar cabecera del portal público (User Pill) inmediatamente para reflejar la nueva sesión
            if (typeof initPublicNavigation === 'function') {
                initPublicNavigation();
            }

            // Navegar a inicio para refrescar vista pública con sesión
            if (typeof Router !== 'undefined') {
                Router.navigateTo('inicio');
            }
            return;
        }

        // 1. Ocultar capas innecesarias
        const publicPortal = document.getElementById('public-portal');
        const authScreen = document.getElementById('auth-view-root');
        const adminRoot = document.getElementById('admin-root');

        if (publicPortal) publicPortal.classList.add('hidden');
        if (authScreen) authScreen.classList.add('hidden');

        // 2. Renderizar AdminShell si no existe
        if (adminRoot) {
            adminRoot.classList.remove('hidden');
            adminRoot.innerHTML = AdminShell.render(user);
        }

        // 3. Inicializar Navegación del Sidebar
        document.querySelectorAll('.sidebar__item').forEach(item => {
            item.addEventListener('click', (e) => {
                let view = item.dataset.view;
                // Mapear 'dcti' a 'admin-dcti' en el sidebar administrativo
                if (view === 'dcti') view = 'admin-dcti';

                if (view && typeof Router !== 'undefined') {
                    Router.navigateTo(view);

                    // Actualizar estado activo visual
                    document.querySelectorAll('.sidebar__item').forEach(i => i.classList.remove('sidebar__item--active'));
                    item.classList.add('sidebar__item--active');

                    // Cerrar sidebar en móvil tras click
                    const sidebar = document.querySelector('.sidebar');
                    const overlay = document.getElementById('sidebar-overlay');
                    if (window.innerWidth <= 1024 && sidebar && overlay) {
                        sidebar.classList.remove('sidebar--open');
                        overlay.classList.remove('active');
                    }
                }
            });
        });

        // 4. Configurar Logout dinámico y Dropdowns
        const setupLogout = (id) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    App.logout();
                });
            }
        };
        setupLogout('dropdown-logout-btn');
        setupLogout('header-logout-btn');
        setupLogout('logout-btn'); // FIXED: Agregar listener para el boton de Cerrar sesión del sidebar

        // Toggles de Dropdown
        const setupDropdown = (btnId, dropdownId) => {
            const btn = document.getElementById(btnId);
            const dropdown = document.getElementById(dropdownId);
            if (btn && dropdown) {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Cerrar otros dropdowns primero
                    document.querySelectorAll('.user-dropdown').forEach(d => {
                        if (d !== dropdown) d.classList.remove('show');
                    });
                    dropdown.classList.toggle('show');
                });
            }
        };
        setupDropdown('sidebar-user-pill', 'sidebar-user-dropdown');
        setupDropdown('header-user-btn', 'header-user-dropdown');

        // Cerrar dropdowns al hacer click fuera
        document.addEventListener('click', () => {
            document.querySelectorAll('.user-dropdown').forEach(d => d.classList.remove('show'));
        });

        // 5. Vincular botón "Ir al Portal" y "Reportes"
        const bindSidebarLink = (id, target) => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (typeof Router !== 'undefined') {
                        Router.navigateTo(target);
                    }
                });
            }
        };
        bindSidebarLink('go-to-portal-btn-sidebar', 'inicio');
        bindSidebarLink('nav-reports', 'reports');

        App.updateUserProfile(user);
        App.applyPermissions(user.role);

        // 6. Sidebar Toggle y Buscador (Mover desde main.js)
        const sidebarToggle = document.getElementById('sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');

        if (sidebarToggle && sidebar) {
            // Limpiar listeners previos para evitar duplicados si App.start re-ejecuta
            const newToggle = sidebarToggle.cloneNode(true);
            sidebarToggle.parentNode.replaceChild(newToggle, sidebarToggle);

            newToggle.addEventListener('click', () => {
                const currentOverlay = document.getElementById('sidebar-overlay');
                if (window.innerWidth <= 1024) {
                    sidebar.classList.toggle('sidebar--open');
                    if (currentOverlay) currentOverlay.classList.toggle('active');
                } else {
                    sidebar.classList.toggle('sidebar--closed');
                }
            });
        }

        const searchInput = document.getElementById('dashboard-search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    window.globalSearchQuery = e.target.value.trim();
                    if (typeof renderModule === 'function') {
                        renderModule(window.currentActiveModule);
                    }
                }, 300);
            });
        }

        if (typeof switchView === 'function') {
            const currentHash = window.location.hash.replace('#', '');
            const isAdminRoute = currentHash && Router.routes[currentHash] && Router.routes[currentHash].admin;

            // Solo redirigir si no estamos ya en una ruta administrativa válida
            if (!isAdminRoute) {
                switchView('dashboard');
            } else if (typeof renderModule === 'function') {
                // Si ya estamos en una ruta admin, forzar renderizado tras cargar el shell
                renderModule(currentHash);
            }
        }

        // Actualizar cabecera del portal público por si el usuario cambia de vista
        if (typeof initPublicNavigation === 'function') {
            initPublicNavigation();
        }

        // Cambiar título de la página
        document.title = 'Panel de Gestión Administrativo | DCTI';
    },

    logout: () => {
        localStorage.removeItem('dcti_session');

        const adminRoot = document.getElementById('admin-root');
        const publicPortal = document.getElementById('public-portal');
        const authRoot = document.getElementById('auth-view-root');

        if (adminRoot) {
            adminRoot.innerHTML = '';
            adminRoot.classList.add('hidden');
        }
        if (authRoot) {
            authRoot.innerHTML = '';
            authRoot.classList.add('hidden');
        }
        if (publicPortal) {
            publicPortal.classList.remove('hidden');
        }

        // Resetear cabecera y menú de auth
        App.updateUserProfile(null);

        const publicAuthMenu = document.getElementById('public-auth-menu');
        if (publicAuthMenu) {
            // Se delegará a initPublicNavigation para limpiar correctamente
            if (typeof initPublicNavigation === 'function') {
                initPublicNavigation();
            } else {
                publicAuthMenu.innerHTML = '';
            }
        }

        document.title = 'DCTI | Portal de Ciencia y Tecnología';

        // Opcional: Notificar al PortalController que la sesión cerró
        if (typeof initPortalAuth === 'function') initPortalAuth();

        // Redirigir a login
        if (typeof Router !== 'undefined') {
            Router.navigateTo('login');
        }
    },

    updateUserProfile: (user) => {
        const initialsEl = document.getElementById('user-initials');
        const nameEl = document.getElementById('user-display-name');
        const roleEl = document.getElementById('user-display-role');

        const headerInitials = document.getElementById('header-user-initials');

        if (!user) {
            if (initialsEl) initialsEl.textContent = '';
            if (nameEl) nameEl.textContent = '';
            if (roleEl) roleEl.textContent = '';
            if (headerInitials) headerInitials.textContent = '';
            return;
        }

        const displayName = user.name || user.username || 'Usuario';
        const displayRole = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Editor';

        if (initialsEl) initialsEl.textContent = user.initials || '?';
        if (nameEl) nameEl.textContent = displayName;
        if (roleEl) roleEl.textContent = displayRole;

        if (headerInitials) headerInitials.textContent = user.initials || '?';
    },

    applyPermissions: (role = 'editor') => {
        const userRole = role.toLowerCase();

        const navUsers = document.getElementById('nav-users');
        const navReports = document.getElementById('nav-reports');
        const navReportsTitle = document.getElementById('nav-reports-title');
        const navProjects = document.getElementById('nav-projects');

        const navAdminTitle = document.getElementById('nav-admin-title');
        const navContentTitle = document.getElementById('nav-content-title');
        const navConsultas = document.getElementById('nav-consultas');

        const contentItems = ['dcti', 'strategic', 'projects', 'news', 'courses'];

        // Ocultar la sección "Mis Cursos" por defecto para admins/editores, mostrar para visitantes
        const navMyCourses = document.getElementById('nav-my-courses');
        const navDashboard = document.querySelector('[data-view="dashboard"]');

        if (userRole === 'admin') {
            if (navUsers) navUsers.style.display = 'flex';
            if (navProjects) navProjects.style.display = 'flex';
            if (navReports) navReports.style.display = 'flex';
            if (navReportsTitle) navReportsTitle.style.display = 'block';
            if (navAdminTitle) navAdminTitle.style.display = 'block';
            if (navContentTitle) navContentTitle.style.display = 'block';
            if (navDashboard) navDashboard.style.display = 'flex';
            if (navMyCourses) navMyCourses.style.display = 'none';
            if (navConsultas) navConsultas.style.display = 'flex';

            contentItems.forEach(id => {
                const item = document.querySelector(`[data-view="${id}"]`);
                if (item) item.style.display = 'flex';
            });
        } else if (userRole === 'editor') {
            if (navUsers) navUsers.style.display = 'none';
            if (navProjects) navProjects.style.display = 'none'; // Restricción exclusiva Administrador
            if (navReports) navReports.style.display = 'none';
            if (navReportsTitle) navReportsTitle.style.display = 'none';
            if (navAdminTitle) navAdminTitle.style.display = 'none';
            if (navContentTitle) navContentTitle.style.display = 'block';
            if (navDashboard) navDashboard.style.display = 'flex';
            if (navMyCourses) navMyCourses.style.display = 'none';
            if (navConsultas) navConsultas.style.display = 'flex'; // Editores pueden ver consultas

            ['dcti', 'strategic', 'news', 'courses'].forEach(id => {
                const item = document.querySelector(`[data-view="${id}"]`);
                if (item) item.style.display = 'flex';
            });
        } else if (userRole === 'visitante') {
            // Visitante solo ve "Mi perfil" y "Mis cursos"
            if (navUsers) navUsers.style.display = 'none';
            if (navProjects) navProjects.style.display = 'none';
            if (navReports) navReports.style.display = 'none';
            if (navReportsTitle) navReportsTitle.style.display = 'none';
            if (navAdminTitle) navAdminTitle.style.display = 'none';
            if (navContentTitle) navContentTitle.style.display = 'none';
            if (navDashboard) navDashboard.style.display = 'none';
            if (navMyCourses) navMyCourses.style.display = 'flex';
            if (navConsultas) navConsultas.style.display = 'none';

            contentItems.forEach(id => {
                const item = document.querySelector(`[data-view="${id}"]`);
                if (item) item.style.display = 'none';
            });
        }
    }
};
