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
window.globalSearchDebounceTimer = null;
window.debouncedRenderModule = function(module) {
    if (window.globalSearchDebounceTimer) clearTimeout(window.globalSearchDebounceTimer);
    window.globalSearchDebounceTimer = setTimeout(() => {
        if(typeof changePage === 'function') {
            changePage(module, 1);
        } else {
            renderModule(module);
        }
    }, 450);
};

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
    if (id === 'auditoria') {
        const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
        if (session.role !== 'admin' && session.role !== 'editor') {
            if (typeof AlertService !== 'undefined') AlertService.notify('Acceso Restringido', 'Este módulo es exclusivo para Administradores y Editores.', 'error');
            if (typeof switchView === 'function') switchView('dashboard');
            return;
        }
    }

    let content = '';
    const viewData = { ...MOCK_DATA };

    // Sincronización de datos con controladores locales (LocalStorage)
    if (['dashboard', 'users', 'news', 'projects', 'profile', 'my-courses', 'strategic', 'courses', 'auditoria'].includes(id)) {
        const adminUsers = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
        const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
        const allUsers = [...adminUsers, ...localUsers];

        viewData.adminUsers = adminUsers;
        viewData.localUsers = localUsers;
        viewData.stats.users = allUsers.length;
        viewData.stats.visitantes = allUsers.filter(u => u.role === 'visitante').length;

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

        // --- LA BÚSQUEDA AHORA SOLO FILTRA EL SIDEBAR ---
        // Se removió q (globalSearchQuery) de los filtros de tablas.

        if (id === 'users') {
            let filteredUsers = allUsers;
            
            if (typeof window.globalUserColName !== 'undefined' && window.globalUserColName) {
                const q = window.globalUserColName.toLowerCase();
                filteredUsers = filteredUsers.filter(u => (u.username || u.name || '').toLowerCase().includes(q));
            }
            if (typeof window.globalUserColEmail !== 'undefined' && window.globalUserColEmail) {
                const q = window.globalUserColEmail.toLowerCase();
                filteredUsers = filteredUsers.filter(u => (u.email || '').toLowerCase().includes(q));
            }

            if (typeof window.globalUserRoleFilter !== 'undefined' && window.globalUserRoleFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.role === window.globalUserRoleFilter);
            }
            if (typeof window.globalUserStatusFilter !== 'undefined' && window.globalUserStatusFilter !== 'Todos') {
                filteredUsers = filteredUsers.filter(u => u.status === window.globalUserStatusFilter);
            }
            if (typeof window.globalUserDateFrom !== 'undefined' && window.globalUserDateFrom) {
                const d = new Date(window.globalUserDateFrom); d.setHours(0,0,0,0);
                filteredUsers = filteredUsers.filter(u => u.updatedAt && new Date(u.updatedAt) >= d);
            }
            if (typeof window.globalUserDateTo !== 'undefined' && window.globalUserDateTo) {
                const d = new Date(window.globalUserDateTo); d.setHours(23,59,59,999);
                filteredUsers = filteredUsers.filter(u => u.updatedAt && new Date(u.updatedAt) <= d);
            }
            viewData.pagination = getPaginatedData(filteredUsers, 'users');
        }

        if (id === 'news') {
            let filteredNews = allNews;
            if (typeof window.globalNewsSearch !== 'undefined' && window.globalNewsSearch) {
                const q = window.globalNewsSearch.toLowerCase();
                filteredNews = filteredNews.filter(n => (n.headline || '').toLowerCase().includes(q) || (n.author || '').toLowerCase().includes(q));
            }
            if (typeof currentNewsCategoryFilter !== 'undefined' && currentNewsCategoryFilter !== 'Todas') {
                filteredNews = filteredNews.filter(n => n.category === currentNewsCategoryFilter);
            }
            if (typeof window.globalNewsStatusFilter !== 'undefined' && window.globalNewsStatusFilter !== 'Todos' && window.globalNewsStatusFilter !== '') {
                filteredNews = filteredNews.filter(n => {
                    const s = Array.isArray(n.status) ? n.status : [n.status || ''];
                    return s.some(val => val === window.globalNewsStatusFilter || (window.globalNewsStatusFilter === 'Publicado' && val === 'Publicada'));
                });
            }
            if (typeof window.globalNewsDateFrom !== 'undefined' && window.globalNewsDateFrom) {
                const d = new Date(window.globalNewsDateFrom); d.setHours(0,0,0,0);
                filteredNews = filteredNews.filter(n => n.published && new Date(n.published) >= d);
            }
            if (typeof window.globalNewsDateTo !== 'undefined' && window.globalNewsDateTo) {
                const d = new Date(window.globalNewsDateTo); d.setHours(23,59,59,999);
                filteredNews = filteredNews.filter(n => n.published && new Date(n.published) <= d);
            }
            viewData.pagination = getPaginatedData(filteredNews, 'news');
        }

        if (id === 'projects') {
            let filteredProjects = viewData.projects;
            if (typeof window.globalProjectSearch !== 'undefined' && window.globalProjectSearch) {
                const q = window.globalProjectSearch.toLowerCase();
                filteredProjects = filteredProjects.filter(p => (p.title || '').toLowerCase().includes(q) || (p.desc || p.description || '').toLowerCase().includes(q));
            }
            if (typeof window.globalProjectStatusFilter !== 'undefined' && window.globalProjectStatusFilter !== 'Todos' && window.globalProjectStatusFilter !== '') {
                filteredProjects = filteredProjects.filter(p => p.status === window.globalProjectStatusFilter);
            }
            if (typeof window.globalProjectDateFrom !== 'undefined' && window.globalProjectDateFrom) {
                const d = new Date(window.globalProjectDateFrom); d.setHours(0,0,0,0);
                filteredProjects = filteredProjects.filter(p => p.createdAt && new Date(p.createdAt) >= d);
            }
            if (typeof window.globalProjectDateTo !== 'undefined' && window.globalProjectDateTo) {
                const d = new Date(window.globalProjectDateTo); d.setHours(23,59,59,999);
                filteredProjects = filteredProjects.filter(p => p.createdAt && new Date(p.createdAt) <= d);
            }
            viewData.pagination = getPaginatedData(filteredProjects, 'projects');
        }

        if (id === 'strategic') {
            let filteredStrategic = viewData.strategic;
            if (typeof window.globalStrategicSearch !== 'undefined' && window.globalStrategicSearch) {
                const q = window.globalStrategicSearch.toLowerCase();
                filteredStrategic = filteredStrategic.filter(s => (s.name || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q));
            }
            viewData.pagination = getPaginatedData(filteredStrategic, 'strategic');
        }

        if (id === 'courses') {
            let filteredCourses = viewData.courses;
            const activeCourseFilter = typeof window.globalCourseFilter !== 'undefined' ? window.globalCourseFilter : 'Publicado';
            viewData.categoryFilter = activeCourseFilter;
            if (typeof window.globalCourseSearch !== 'undefined' && window.globalCourseSearch) {
                const q = window.globalCourseSearch.toLowerCase();
                filteredCourses = filteredCourses.filter(c => (c.nombreCurso || c.title || '').toLowerCase().includes(q) || (c.instructor || '').toLowerCase().includes(q));
            }
            if (activeCourseFilter !== 'Todos') {
                filteredCourses = filteredCourses.filter(c => c.estadoCurso === activeCourseFilter || c.status === activeCourseFilter);
            }
            if (typeof window.globalCourseModalityFilter !== 'undefined' && window.globalCourseModalityFilter && window.globalCourseModalityFilter !== 'Todas') {
                filteredCourses = filteredCourses.filter(c => c.modalidad === window.globalCourseModalityFilter);
            }
            if (typeof window.globalCourseDateFrom !== 'undefined' && window.globalCourseDateFrom) {
                const d = new Date(window.globalCourseDateFrom); d.setHours(0,0,0,0);
                filteredCourses = filteredCourses.filter(c => c.fechaLiberacionMateriales && new Date(c.fechaLiberacionMateriales) >= d);
            }
            if (typeof window.globalCourseDateTo !== 'undefined' && window.globalCourseDateTo) {
                const d = new Date(window.globalCourseDateTo); d.setHours(23,59,59,999);
                filteredCourses = filteredCourses.filter(c => c.fechaLiberacionMateriales && new Date(c.fechaLiberacionMateriales) <= d);
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
                break;
            case 'profile':
                content = typeof ProfileView !== 'undefined' ? ProfileView.render(viewData) : '<h2>Perfil no cargado</h2>';
                break;
            case 'my-courses':
                content = typeof MyCoursesView !== 'undefined' ? MyCoursesView.render(viewData) : '<h2>Vista en desarrollo</h2>';
                break;
            case 'users':
                content = typeof UsersView !== 'undefined' ? UsersView.render(viewData) : '<h2>Módulo de Usuarios no cargado</h2>';
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
                break;
            case 'strategic':
                content = typeof StrategicView !== 'undefined' ? StrategicView.render(viewData) : '<h2>Vista Estratégica en desarrollo</h2>';
                break;
            case 'projects':
                content = typeof ProjectsView !== 'undefined' ? ProjectsView.render(viewData) : '<h2>Vista Proyectos en desarrollo</h2>';
                break;
            case 'news':
                content = typeof AdminNewsView !== 'undefined' ? AdminNewsView.render(viewData) : '<h2>Vista Noticias en desarrollo</h2>';
                break;
            case 'courses':
                content = typeof CoursesView !== 'undefined' ? CoursesView.render(viewData) : '<h2>Módulo Académico no cargado</h2>';
                break;
            case 'reports':
                content = typeof ReportsView !== 'undefined' ? ReportsView.render(viewData) : '<h2>Módulo de Reportes no cargado</h2>';
                break;
            case 'auditoria':
                content = typeof AuditoriaView !== 'undefined' ? AuditoriaView.render(viewData) : '<h2>Módulo de Auditoría no cargado</h2>';
                break;
            default:
                content = `<div class="view-container"><h2>Módulo en desarrollo</h2></div>`;
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
    if ((id === 'admin-dcti' || id === 'dcti')) {
        if (typeof initAdminMap === 'function') setTimeout(initAdminMap, 100);
        setTimeout(() => { if (window.AdminTemplate) window.AdminTemplate.initFormBackup('dcti-admin-form'); }, 150);
    }

    // Event Listeners for pages
    if (id === 'profile' && typeof handleProfileSubmit === 'function') {
        const form = document.getElementById('profile-user-form');
        if (form) form.addEventListener('submit', handleProfileSubmit);
    }

    // Restaurar foco para filtros de texto dinámicos
    if (window.lastFocusedInput) {
        setTimeout(() => {
            const el = document.getElementById(window.lastFocusedInput);
            if (el) {
                el.focus();
                // Colocar cursor al final del texto si es un input text
                try {
                    if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'email' || el.type === 'search')) {
                        const len = el.value.length;
                        el.setSelectionRange(len, len);
                    }
                } catch (e) {}
            }
        }, 10);
    }
}
