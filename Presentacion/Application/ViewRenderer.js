/**
 * Presentacion/Application/ViewRenderer.js
 * Orquestador central de renderizado y paginación para el Dashboard.
 */

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
                filterNewsAdmin(currentNewsCategoryFilter, false);
                return;
            }
        }
    }

    if (typeof renderModule === 'function') {
        renderModule(module);
    }
}

function renderModule(id, skipAnimation = false) {
    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'SELECT')) {
        skipAnimation = true;
    }

    // Sincronizar módulo activo global para buscadores/filtros
    window.currentActiveModule = id;

    // Seguridad
    if (id === 'reports' || id === 'users') {
        const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
        if (session.role !== 'admin') {
            if (typeof AlertService !== 'undefined') AlertService.notify('Acceso Restringido', 'Incidente de Seguridad: Módulo exclusivo para Administradores de la Plataforma.', 'error');
            if (typeof switchView === 'function') switchView('dashboard');
            return;
        }
    }

    let content = '';
    const viewData = { ...MOCK_DATA };

    // Sincronización de datos con controladores locales (LocalStorage)
    if (['dashboard', 'users', 'news', 'projects', 'profile', 'my-courses', 'strategic', 'courses'].includes(id)) {
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
                viewData.courses = getLocalCourses();
            }
        }

        const allNews = typeof getLocalNews === 'function' ? getLocalNews() : (MOCK_DATA.news || []);
        viewData.news = allNews;
        viewData.stats.news = allNews.length;

        if (id === 'projects' || id === 'dashboard') {
            if (typeof getLocalProjects === 'function') {
                const allProjects = getLocalProjects();
                viewData.projects = allProjects;
                viewData.stats.projects = allProjects.length;
            }
        }

        if (id === 'strategic' || id === 'dashboard') {
            if (typeof getLocalStrategic === 'function') {
                const allStrategic = getLocalStrategic();
                viewData.strategic = allStrategic;
                viewData.stats.strategic = allStrategic.length;
            }
        }

        if (id === 'courses' || id === 'dashboard') {
            if (typeof getLocalCourses === 'function') {
                const allCourses = getLocalCourses();
                viewData.courses = allCourses;
                viewData.stats.courses = allCourses.length;
            }
        }

        // --- APLICAR BÚSQUEDA GLOBAL ---
        const q = (window.globalSearchQuery || '').toLowerCase();

        if (id === 'users') {
            let filteredUsers = allUsers;
            if (typeof window.globalUserRoleFilter !== 'undefined' && window.globalUserRoleFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.role === window.globalUserRoleFilter);
            }
            if (typeof window.globalUserStatusFilter !== 'undefined' && window.globalUserStatusFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.status === window.globalUserStatusFilter);
            }
            if (q) {
                filteredUsers = filteredUsers.filter(u =>
                    Object.values(u).some(val => val && val.toString().toLowerCase().includes(q))
                );
            }
            viewData.pagination = getPaginatedData(filteredUsers, 'users');
        }

        if (id === 'news') {
            let filteredNews = allNews;
            if (typeof currentNewsCategoryFilter !== 'undefined' && currentNewsCategoryFilter !== 'Todas') {
                filteredNews = filteredNews.filter(n => n.category === currentNewsCategoryFilter);
            }
            if (q) {
                filteredNews = filteredNews.filter(n =>
                    Object.values(n).some(val => val && val.toString().toLowerCase().includes(q))
                );
            }
            viewData.pagination = getPaginatedData(filteredNews, 'news');
        }

        if (id === 'projects') {
            let filteredProjects = viewData.projects;
            if (q) {
                filteredProjects = filteredProjects.filter(p =>
                    Object.values(p).some(val => val && val.toString().toLowerCase().includes(q))
                );
            }
            viewData.pagination = getPaginatedData(filteredProjects, 'projects');
        }

        if (id === 'courses') {
            let filteredCourses = viewData.courses;
            if (typeof globalCourseFilter !== 'undefined' && globalCourseFilter !== 'Todos') {
                filteredCourses = filteredCourses.filter(c => c.estadoCurso === globalCourseFilter);
            }
            if (q) {
                filteredCourses = filteredCourses.filter(c =>
                    Object.values(c).some(val => val && val.toString().toLowerCase().includes(q))
                );
            }
            viewData.pagination = getPaginatedData(filteredCourses, 'courses');
        }
    }

    const contentArea = document.getElementById('content-area');
    if (!contentArea) return;

    try {
        switch (id) {
            case 'dashboard':
                content = typeof DashboardView !== 'undefined' ? DashboardView.render(viewData) : '<h2>Panel no cargado</h2>';
                document.getElementById('view-title').textContent = 'Panel de Control General';
                break;
            case 'profile':
                content = typeof ProfileView !== 'undefined' ? ProfileView.render(viewData) : '<h2>Perfil no cargado</h2>';
                document.getElementById('view-title').textContent = 'Perfil de Usuario';
                break;
            case 'my-courses':
                content = typeof MyCoursesView !== 'undefined' ? MyCoursesView.render(viewData) : '<h2>Vista en desarrollo</h2>';
                document.getElementById('view-title').textContent = 'Mis Capacitaciones';
                break;
            case 'users':
                content = typeof UsersView !== 'undefined' ? UsersView.render(viewData) : '<h2>Módulo de Usuarios no cargado</h2>';
                document.getElementById('view-title').textContent = 'Gestión de Cuentas de Usuario';
                break;
            case 'consultas':
                if (typeof ConsultasController !== 'undefined') {
                    ConsultasController.render(1);
                    return;
                }
                break;
            case 'admin-dcti':
            case 'dcti':
                content = typeof AdminDctiView !== 'undefined' ? AdminDctiView.render(viewData) : '<h2>Módulo Administrativo DCTI no configurado</h2>';
                document.getElementById('view-title').textContent = 'Gestión de Información Institucional';
                break;
            case 'strategic':
                content = typeof StrategicView !== 'undefined' ? StrategicView.render(viewData) : '<h2>Vista Estratégica en desarrollo</h2>';
                document.getElementById('view-title').textContent = 'Planificación Estratégica';
                break;
            case 'projects':
                content = typeof ProjectsView !== 'undefined' ? ProjectsView.render(viewData) : '<h2>Vista Proyectos en desarrollo</h2>';
                document.getElementById('view-title').textContent = 'Portafolio de Proyectos';
                break;
            case 'news':
                content = typeof AdminNewsView !== 'undefined' ? AdminNewsView.render(viewData) : '<h2>Vista Noticias en desarrollo</h2>';
                document.getElementById('view-title').textContent = 'Gestión de Noticias y Publicaciones';
                break;
            case 'courses':
                content = typeof CoursesView !== 'undefined' ? CoursesView.render(viewData) : '<h2>Módulo Académico no cargado</h2>';
                document.getElementById('view-title').textContent = 'Gestión Académica';
                break;
            case 'reports':
                content = typeof ReportsView !== 'undefined' ? ReportsView.render(viewData) : '<h2>Módulo de Reportes no cargado</h2>';
                document.getElementById('view-title').textContent = 'Inteligencia de Datos y Reportes';
                break;
            default:
                content = `<div class="view-container"><h2>Módulo en desarrollo</h2></div>`;
                document.getElementById('view-title').textContent = 'En Construcción';
        }
    } catch (err) {
        console.error(`Error renderizando módulo ${id}:`, err);
        content = `<div class="view-container"><h2>Error al cargar el módulo ${id}</h2><p>${err.message}</p></div>`;
    }

    contentArea.innerHTML = content;

    if (skipAnimation) {
        const container = contentArea.querySelector('.view-container');
        if (container) container.style.animation = 'none';
    }

    // Post-render initialization
    if (id === 'dashboard' && typeof DashboardController !== 'undefined') {
        DashboardController.initChart();
    }
    if ((id === 'admin-dcti' || id === 'dcti') && typeof initAdminMap === 'function') {
        setTimeout(initAdminMap, 100);
    }

    // Event Listeners for pages
    if (id === 'profile' && typeof handleProfileSubmit === 'function') {
        const form = document.getElementById('profile-user-form');
        if (form) form.addEventListener('submit', handleProfileSubmit);
    }
}
