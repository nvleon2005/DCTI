const PAGINATION_STATE = {
    users: { currentPage: 1, itemsPerPage: 5 },
    news: { currentPage: 1, itemsPerPage: 6 },
    projects: { currentPage: 1, itemsPerPage: 6 },
    strategic: { currentPage: 1, itemsPerPage: 6 },
    courses: { currentPage: 1, itemsPerPage: 6 }
};

/**
 * Helper para obtener datos paginados
 */
function getPaginatedData(data, module) {
    const config = PAGINATION_STATE[module];
    if (!config) return { items: data, totalPages: 1, currentPage: 1 };

    const totalPages = Math.ceil(data.length / config.itemsPerPage) || 1;
    if (config.currentPage > totalPages) config.currentPage = totalPages;

    const start = (config.currentPage - 1) * config.itemsPerPage;
    const end = start + config.itemsPerPage;

    return {
        items: data.slice(start, end),
        totalPages,
        currentPage: config.currentPage,
        totalItems: data.length
    };
}

/**
 * Cambiar de página
 */
function changePage(module, page) {
    if (PAGINATION_STATE[module]) {
        PAGINATION_STATE[module].currentPage = page;

        // Soporte para filtros dinámicos en vivo (ej: Noticias)
        if (module === 'news' && typeof currentNewsCategoryFilter !== 'undefined' && currentNewsCategoryFilter !== 'Todas') {
            if (typeof filterNewsAdmin === 'function') {
                filterNewsAdmin(currentNewsCategoryFilter, false); // false = don't reset page
                return;
            }
        }
    }

    // Ejecutar renderización final independientemente de si tiene paginación controlada o no
    if (typeof renderModule === 'function') {
        renderModule(module);
    }
}

/**
 * ADMIN DASHBOARD - INTERFACE LOGIC (Local-First v10.0.0)
 * Responsabilidad: Orquestación del Dashboard, Navegación y Renderizado de Vistas.
 * Nota: La lógica de usuarios reside en js/users-logic.js y la de auth en js/auth-logic.js
 */

// 1. FUENTE DE VERDAD (Compendiado de Datos)
window.globalSearchQuery = '';
window.currentActiveModule = 'dashboard';

const MOCK_DATA = {
    stats: {
        users: 154,
        projects: 42,
        news: 89,
        courses: 12,
        strategic: 2
    },
    dcti: {
        mission: "Impulsar el desarrollo científico y tecnológico a través de la innovación y la transferencia de conocimiento.",
        vision: "Ser el referente regional en gestión de proyectos de ciencia y tecnología para el año 2030.",
        review: "El DCTI nació como una respuesta a la necesidad de centralizar los esfuerzos de investigación en el país."
    },
    strategic: [
        { id: 1, area: "Tecnología de Alimentos", responsible: "Dr. Arreaza" },
        { id: 2, area: "Biotecnología Médica", responsible: "Dra. Márquez" }
    ],
    projects: [
        { id: 1, title: "Nano-Sensores de Suelo", date: "2024-02-15", featured: true },
        { id: 2, title: "Planta de Hidrógeno", date: "2024-02-10", featured: false }
    ],
    news: [
        {
            id: 1,
            headline: "Inauguración Laboratorio A1",
            summary: "El nuevo laboratorio de alta tecnología servirá para investigaciones avanzadas en biotecnología.",
            content: "El DCTI ha inaugurado oficialmente el Laboratorio A1, diseñado para centralizar investigaciones críticas en el estado Monagas. Contará con equipos de última generación importados recientemente.",
            published: "2024-02-15",
            author: "Dr. Arreaza",
            multimedia: "img/img8.jpg",
            status: ["Destacada", "Validada", "Publicada"]
        },
        {
            id: 2,
            headline: "Nueva Beca para Investigadores",
            summary: "Programa de incentivo financiero para jóvenes talentos en el área de telecomunicaciones.",
            content: "Se abre la convocatoria para el programa de becas de posgrado para investigadores locales, con un enfoque en soberanía tecnológica y desarrollo de redes libres.",
            published: "2024-02-10",
            author: "Dra. Márquez",
            multimedia: "img/img16.jpg",
            status: ["Validada", "Publicada"]
        }
    ],
    courses: [
        { id: 1, title: "Python para Datos", type: "Virtual", enrollment: 45 },
        { id: 2, title: "Gestión de Proyectos I+D", type: "Presencial", enrollment: 28 }
    ]
};

// 2. ELEMENTOS DE LA UI (Dashboard)
const DASHBOARD_UI = {
    loginScreen: document.getElementById('login-screen'),
    dashboardView: document.getElementById('dashboard-view'),

    sidebarItems: document.querySelectorAll('.sidebar__item'),
    contentArea: document.getElementById('content-area'),
    viewTitle: document.getElementById('view-title'),

    userInitials: document.getElementById('user-initials'),
    userName: document.getElementById('user-display-name'),
    userRole: document.getElementById('user-display-role'),
    logoutBtn: document.getElementById('logout-btn'),
    goHomeBtn: document.getElementById('go-home-btn'),

    // Nodos del nuevo Header Pill
    headerUserBtn: document.getElementById('header-user-btn'),
    headerUserInitials: document.getElementById('header-user-initials'),
    headerUserName: document.getElementById('header-user-name'),
    headerUserRole: document.getElementById('header-user-role')
};

// 3. CONTROLADOR DEL DASHBOARD

function startDashboardSession(user) {
    // Visitantes ahora pueden ingresar, ya no redirigimos forzadamente a index.html
    // si llegaron acá al Dashboard. Sin embargo, su vista por defecto puede ser 'profile'.

    DASHBOARD_UI.loginScreen.classList.add('hidden');
    DASHBOARD_UI.dashboardView.classList.remove('hidden');

    if (user.avatar) {
        DASHBOARD_UI.userInitials.textContent = '';
        DASHBOARD_UI.userInitials.style.backgroundImage = `url(${user.avatar})`;
        DASHBOARD_UI.userInitials.style.backgroundSize = 'cover';
        DASHBOARD_UI.userInitials.style.backgroundPosition = 'center';
        DASHBOARD_UI.userInitials.style.border = '2px solid rgba(255,255,255,0.2)';
    } else {
        DASHBOARD_UI.userInitials.textContent = user.initials;
        DASHBOARD_UI.userInitials.style.backgroundImage = 'none';
        DASHBOARD_UI.userInitials.style.border = 'none';

        if (DASHBOARD_UI.headerUserInitials) {
            DASHBOARD_UI.headerUserInitials.textContent = user.initials;
            DASHBOARD_UI.headerUserInitials.style.backgroundImage = 'none';
            DASHBOARD_UI.headerUserInitials.style.border = 'none';
        }
    }

    const displayName = user.name || user.username || 'Usuario';
    const displayRole = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    DASHBOARD_UI.userName.textContent = displayName;
    DASHBOARD_UI.userRole.textContent = displayRole;

    if (DASHBOARD_UI.headerUserName) DASHBOARD_UI.headerUserName.textContent = displayName;
    if (DASHBOARD_UI.headerUserRole) DASHBOARD_UI.headerUserRole.textContent = displayRole;

    applyDashboardPermissions(user.role);
    switchView(user.role === 'visitante' ? 'profile' : 'dashboard');
}

function handleDashboardLogout() {
    localStorage.removeItem('dcti_session');
    location.reload();
}

function applyDashboardPermissions(role) {
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

    if (role === 'admin') {
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
    } else if (role === 'editor') {
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
    } else if (role === 'visitante') {
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

// 4. MOTOR DE NAVEGACIÓN Y RENDERIZADO
function switchView(viewId) {
    window.currentActiveModule = viewId;
    DASHBOARD_UI.sidebarItems.forEach(item => {
        if (item.dataset.view === viewId) {
            item.classList.add('sidebar__item--active');
        } else {
            item.classList.remove('sidebar__item--active');
        }
    });

    const activeItem = Array.from(DASHBOARD_UI.sidebarItems).find(i => i.dataset.view === viewId);
    DASHBOARD_UI.viewTitle.textContent = activeItem ? activeItem.querySelector('span').textContent : 'Dashboard';

    renderModule(viewId);
}

function renderModule(id, skipAnimation = false) {
    // Si el usuario está escribiendo o usando un filtro (INPUT o SELECT), evitamos la animación
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        skipAnimation = true;
    }

    // HARD STOP: Seguridad Anti-Inyección de DOM para Módulos Exclusivos de Admin
    if (id === 'reports' || id === 'users') {
        const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
        if (session.role !== 'admin') {
            if (typeof AlertService !== 'undefined') AlertService.notify('Acceso Restringido', 'Incidente de Seguridad: Módulo exclusivo para Administradores de la Plataforma.', 'error');
            switchView('dashboard');
            return;
        }
    }

    let content = '';

    const viewData = { ...MOCK_DATA };

    if (id === 'dashboard' || id === 'users' || id === 'news' || id === 'projects' || id === 'profile' || id === 'my-courses' || id === 'strategic' || id === 'courses') {
        const adminUsers = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
        const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
        const allUsers = [...adminUsers, ...localUsers];

        viewData.adminUsers = adminUsers;
        viewData.localUsers = localUsers;
        viewData.stats.users = allUsers.length;

        if (id === 'profile' || id === 'my-courses') {
            const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
            const currentUser = allUsers.find(u => u.email === session.email) || session;
            viewData.currentUser = currentUser;

            if (id === 'my-courses' && typeof getLocalCourses === 'function') {
                viewData.courses = getLocalCourses(); // Cargar los cursos globales para filtrar
            }
        }

        // Sincronizar noticias para stats del dashboard y vista de noticias
        const allNews = typeof getLocalNews === 'function' ? getLocalNews() : (MOCK_DATA.news || []);
        viewData.news = allNews;
        viewData.stats.news = allNews.length;

        if (id === 'projects' || id === 'dashboard') {
            if (typeof getLocalProjects === 'function') {
                const allProjects = getLocalProjects();
                viewData.projects = allProjects;
                viewData.stats.projects = allProjects.length;
                MOCK_DATA.projects = allProjects; // Sincronizar globalmente
            }
        }

        if (id === 'strategic' || id === 'dashboard') {
            if (typeof getLocalStrategic === 'function') {
                const allStrategic = getLocalStrategic();
                viewData.strategic = allStrategic;
                viewData.stats.strategic = allStrategic.length;
                MOCK_DATA.strategic = allStrategic;
            }
        }

        if (id === 'courses' || id === 'dashboard') {
            if (typeof getLocalCourses === 'function') {
                const allCourses = getLocalCourses();
                // Por defecto el Grid UI va a mostrar solo "Publicados" a menos que modifiquen el Pill
                viewData.courses = allCourses;
                viewData.stats.courses = allCourses.length;
                MOCK_DATA.courses = allCourses;
            }
        }

        // === APPLY GLOBAL SEARCH ===
        const q = (window.globalSearchQuery || '').toLowerCase();

        if (id === 'users') {
            let filteredUsers = allUsers;

            if (typeof window.globalUserRoleFilter !== 'undefined' && window.globalUserRoleFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.role === window.globalUserRoleFilter);
            }
            if (typeof window.globalUserStatusFilter !== 'undefined' && window.globalUserStatusFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.status === window.globalUserStatusFilter);
            }

            if (window.globalUserColName) {
                const searchName = window.globalUserColName.toLowerCase();
                filteredUsers = filteredUsers.filter(u =>
                    (u.name && u.name.toLowerCase().includes(searchName)) ||
                    (u.username && u.username.toLowerCase().includes(searchName))
                );
            }

            if (window.globalUserColEmail) {
                const searchEmail = window.globalUserColEmail.toLowerCase();
                filteredUsers = filteredUsers.filter(u =>
                    (u.email && u.email.toLowerCase().includes(searchEmail))
                );
            }

            if (q) {
                filteredUsers = filteredUsers.filter(u =>
                    Object.values(u).some(val =>
                        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
                    )
                );
            }
            viewData.pagination = getPaginatedData(filteredUsers, 'users');
        }
        if (id === 'news') {
            let filteredNews = allNews;

            if (typeof window.globalNewsCategoryFilter !== 'undefined' && window.globalNewsCategoryFilter !== 'Todas') {
                filteredNews = filteredNews.filter(n => n.category === window.globalNewsCategoryFilter);
            }
            if (typeof window.globalNewsStatusFilter !== 'undefined' && window.globalNewsStatusFilter !== 'Todos') {
                filteredNews = filteredNews.filter(n => {
                    const statusArr = Array.isArray(n.status) ? n.status : [n.status];
                    const searchStatus = window.globalNewsStatusFilter.replace('a', 'o').replace('o', 'a'); // Match Publicado/a
                    return statusArr.some(s => s === window.globalNewsStatusFilter || s === searchStatus || (s && s.includes(window.globalNewsStatusFilter.substring(0, window.globalNewsStatusFilter.length - 1))));
                });
            }

            if (q) {
                filteredNews = filteredNews.filter(n =>
                    Object.values(n).some(val =>
                        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
                    )
                );
            }
            viewData.pagination = getPaginatedData(filteredNews, 'news');
        }
        if (id === 'projects') {
            let filteredProjects = viewData.projects;

            if (typeof window.globalProjectStatusFilter !== 'undefined' && window.globalProjectStatusFilter !== 'Todos') {
                filteredProjects = filteredProjects.filter(p => p.status === window.globalProjectStatusFilter);
            }
            if (typeof window.globalProjectFeaturedFilter !== 'undefined' && window.globalProjectFeaturedFilter !== 'Todos') {
                const isFeatured = window.globalProjectFeaturedFilter === 'Destacados';
                filteredProjects = filteredProjects.filter(p => Boolean(p.featured) === isFeatured);
            }

            if (q) {
                filteredProjects = filteredProjects.filter(p =>
                    Object.values(p).some(val =>
                        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
                    )
                );
            }
            viewData.pagination = getPaginatedData(filteredProjects, 'projects');
        }
        if (id === 'strategic') {
            let filteredStrategic = viewData.strategic;
            if (q) {
                filteredStrategic = filteredStrategic.filter(s =>
                    (s.area && s.area.toLowerCase().includes(q)) ||
                    (s.responsible && s.responsible.toLowerCase().includes(q))
                );
            }
            viewData.pagination = getPaginatedData(filteredStrategic, 'strategic');
        }
        if (id === 'courses') {
            // Support Live Pill Filter for Courses too
            if (typeof globalCourseFilter !== 'undefined' && globalCourseFilter !== 'Todos') {
                viewData.courses = viewData.courses.filter(c => c.estadoCurso === globalCourseFilter || c.type === globalCourseFilter);
            }
            let filteredCourses = viewData.courses;

            if (typeof window.globalCourseModalityFilter !== 'undefined' && window.globalCourseModalityFilter !== 'Todas') {
                filteredCourses = filteredCourses.filter(c => c.type === window.globalCourseModalityFilter);
            }

            if (q) {
                filteredCourses = filteredCourses.filter(c =>
                    Object.values(c).some(val =>
                        val !== null && val !== undefined && val.toString().toLowerCase().includes(q)
                    )
                );
            }
            viewData.pagination = getPaginatedData(filteredCourses, 'courses');
        }
    }

    switch (id) {
        case 'dashboard': content = DashboardView.render(viewData); break;
        case 'profile': content = ProfileView.render(viewData); break;
        case 'my-courses': content = typeof MyCoursesView !== 'undefined' ? MyCoursesView.render(viewData) : '<h2>Vista en desarrollo</h2>'; break;
        case 'users': content = UsersView.render(viewData); break;
        case 'consultas':
            if (typeof ConsultasController !== 'undefined') {
                ConsultasController.render(1);
                return; // Consultas renderiza por sí mismo
            } else {
                content = '<h2>Error al cargar el módulo de consultas</h2>';
            }
            break;
        case 'dcti':
            if (typeof getLocalDcti === 'function') MOCK_DATA.dcti = getLocalDcti();
            content = DctiView.render(viewData);
            break;
        case 'strategic':
            if (typeof getLocalStrategic === 'function') MOCK_DATA.strategic = getLocalStrategic();
            content = StrategicView.render(viewData);
            break;
        case 'projects':
            if (typeof getLocalProjects === 'function') MOCK_DATA.projects = getLocalProjects();
            content = ProjectsView.render(viewData);
            break;
        case 'news':
            // Aseguramos que MOCK_DATA.news esté sincronizado para que NewsView reciba lo correcto
            if (typeof getLocalNews === 'function') MOCK_DATA.news = getLocalNews();
            content = NewsView.render(viewData);
            break;
        case 'courses': content = CoursesView.render(viewData); break;
        case 'reports': content = ReportsView.render(viewData); break;
        default: content = `<div class="view-container"><h2>Módulo en desarrollo</h2></div>`;
    }
    DASHBOARD_UI.contentArea.innerHTML = content;

    // Deshabilita la animación de entrada si estamos filtrando o buscando
    if (skipAnimation) {
        const container = DASHBOARD_UI.contentArea.querySelector('.view-container');
        if (container) {
            container.style.animation = 'none';
        }
    }

    // Restaurar foco si un input de texto causó el re-render (ej. filtros de texto)
    if (window.lastFocusedInput) {
        const inputToFocus = document.getElementById(window.lastFocusedInput);
        if (inputToFocus) {
            inputToFocus.focus();
            // Mover el cursor al final del texto
            const val = inputToFocus.value;
            inputToFocus.value = '';
            inputToFocus.value = val;
        }
    }    // Inicializar gráficos si estamos en el dashboard
    if (id === 'dashboard') {
        initDashboardChart();
    }

    // Inicializar mapa interactivo si estamos en DCTI
    if (id === 'dcti' && typeof initAdminMap === 'function') {
        // Pequeño timeout para asegurar que el DOM está listo
        setTimeout(initAdminMap, 100);
    }

    // Conexión con Lógica de Vistas (Event Listeners)
    if (id === 'profile') {
        const form = document.getElementById('profile-user-form');
        if (form && typeof handleProfileSubmit === 'function') {
            form.addEventListener('submit', handleProfileSubmit);
        }

        const avatarInput = document.getElementById('profile-avatar-input');
        if (avatarInput && typeof previewProfileAvatar === 'function') {
            avatarInput.addEventListener('change', previewProfileAvatar);
        }
    }

    if (id === 'users') {
        const form = document.getElementById('user-admin-form');
        if (form && typeof handleUserAdminSubmit === 'function') {
            form.addEventListener('submit', handleUserAdminSubmit);
        }
    }

    if (id === 'dcti') {
        const form = document.getElementById('dcti-admin-form');
        if (form && typeof handleDctiSubmit === 'function') {
            form.addEventListener('submit', handleDctiSubmit);
        }
    }
}

// 5. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle && sidebar && sidebarOverlay) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('sidebar--open');
                sidebarOverlay.classList.toggle('active');
            } else {
                sidebar.classList.toggle('sidebar--closed');
            }
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar--open');
            sidebarOverlay.classList.remove('active');
        });

        // Cerrar sidebar al hacer click en un item (en mobile)
        document.querySelectorAll('.sidebar__item').forEach(item => {
            item.addEventListener('click', () => {
                if (window.innerWidth <= 1024) {
                    sidebar.classList.remove('sidebar--open');
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }

    if (DASHBOARD_UI.logoutBtn) DASHBOARD_UI.logoutBtn.addEventListener('click', handleDashboardLogout);
    if (DASHBOARD_UI.goHomeBtn) DASHBOARD_UI.goHomeBtn.addEventListener('click', () => switchView('dashboard'));
    if (DASHBOARD_UI.headerUserBtn) DASHBOARD_UI.headerUserBtn.addEventListener('click', () => switchView('profile'));

    DASHBOARD_UI.sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) {
                // Clear global search when navigating to a new section manually
                window.globalSearchQuery = '';
                const searchInput = document.getElementById('dashboard-search-input');
                if (searchInput) searchInput.value = '';
                switchView(view);
            }
        });
    });

    // Global Search Event Listener
    const dashboardSearchInput = document.getElementById('dashboard-search-input');
    if (dashboardSearchInput) {
        let searchTimeout;
        dashboardSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                window.globalSearchQuery = e.target.value.trim();

                // Si estamos en reportes, solo actualizamos los datos sin reconstruir toda la vista (evita el corte/parpadeo)
                if (window.currentActiveModule === 'reports') {
                    if (typeof renderReportDashboard === 'function') {
                        renderReportDashboard();
                    }
                    return;
                }

                // Go to page 1 implicitly when filtering
                if (typeof changePage === 'function') {
                    changePage(window.currentActiveModule, 1);
                } else {
                    renderModule(window.currentActiveModule);
                }
            }, 300); // Debounce de 300ms
        });
    }

    const savedSession = localStorage.getItem('dcti_session');
    if (savedSession) {
        const session = JSON.parse(savedSession);

        // Validar expiración del token (si existe)
        if (session.token) {
            try {
                const payload = JSON.parse(atob(session.token));
                if (Date.now() > payload.exp) {
                    console.warn("Sesión expirada");
                    localStorage.removeItem('dcti_session');
                    return;
                }
            } catch (e) {
                console.error("Token inválido");
                localStorage.removeItem('dcti_session');
                return;
            }
        }

        if (session.role === 'admin' || session.role === 'editor' || session.role === 'visitante') {
            startDashboardSession(session);
        }
    }
});

// 6. GRÁFICOS DEL DASHBOARD
function initDashboardChart() {
    const canvas = document.getElementById('courseRegistrationChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Destruir gráfico previo si existe para evitar superposiciones al re-renderizar la vista
    if (window.dashboardChartInstance) {
        window.dashboardChartInstance.destroy();
    }

    // Calcular datos dinámicos basados en inscripciones (Participations)
    const participations = typeof getLocalParticipations === 'function' ? getLocalParticipations() : [];

    // Generar últimos 6 meses (incluyendo actual) para las etiquetas (labels)
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const labels = [];
    const counts = [0, 0, 0, 0, 0, 0];

    const hoy = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        labels.push(meses[d.getMonth()]);
    }

    // Contabilizar inscripciones por mes (ej: '2024-03-05' => extraer mes y comparar)
    participations.forEach(p => {
        if (!p.fechaInscripcion) return;
        const fechaInsc = new Date(p.fechaInscripcion);

        // Determinar qué tan viejo es el registro respecto al mes actual
        const diffMonths = (hoy.getFullYear() - fechaInsc.getFullYear()) * 12 + (hoy.getMonth() - fechaInsc.getMonth());

        // Si pertenece a uno de los últimos 6 meses (0 = este mes, 5 = hace 5 meses)
        if (diffMonths >= 0 && diffMonths <= 5) {
            const indexOnArray = 5 - diffMonths; // 5 es el mes actual al final del array [0,1,2,3,4,5]
            counts[indexOnArray]++;
        }
    });

    // Configuración del gráfico según diseño de referencia (ahora dinámico)
    window.dashboardChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Registros',
                data: counts,
                borderColor: '#6b21a8', // Color morado DCTI
                backgroundColor: 'rgba(107, 33, 168, 0.1)', // Fondo semi-transparente
                borderWidth: 2,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#6b21a8',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
                fill: true, // Habilitar el área rellenada debajo de la línea
                tension: 0.4 // Curvas suaves
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Ocultar leyenda según diseño
                },
                tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#1e293b',
                    bodyColor: '#475569',
                    borderColor: '#cbd5e1',
                    borderWidth: 1,
                    padding: 10,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    min: 0,
                    ticks: {
                        stepSize: 20,
                        color: '#94a3b8',
                        font: { size: 11 }
                    },
                    grid: {
                        color: '#f1f5f9',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: { size: 11 }
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            }
        }
    });
}
