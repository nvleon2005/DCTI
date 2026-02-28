const PAGINATION_STATE = {
    users: { currentPage: 1, itemsPerPage: 5 },
    news: { currentPage: 1, itemsPerPage: 5 }
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
        renderModule(module);
    }
}

/**
 * ADMIN DASHBOARD - INTERFACE LOGIC (Local-First v10.0.0)
 * Responsabilidad: Orquestación del Dashboard, Navegación y Renderizado de Vistas.
 * Nota: La lógica de usuarios reside en js/users-logic.js y la de auth en js/auth-logic.js
 */

// 1. FUENTE DE VERDAD (Compendiado de Datos)
const MOCK_DATA = {
    stats: {
        users: 154,
        projects: 42,
        news: 89,
        courses: 12
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
    goHomeBtn: document.getElementById('go-home-btn')
};

// 3. CONTROLADOR DEL DASHBOARD

function startDashboardSession(user) {
    if (user.role === 'visitante') {
        window.location.href = 'portal.html';
        return;
    }

    DASHBOARD_UI.loginScreen.classList.add('hidden');
    DASHBOARD_UI.dashboardView.classList.remove('hidden');

    DASHBOARD_UI.userInitials.textContent = user.initials;
    DASHBOARD_UI.userName.textContent = user.name;
    DASHBOARD_UI.userRole.textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

    applyDashboardPermissions(user.role);
    switchView('dashboard');
}

function handleDashboardLogout() {
    localStorage.removeItem('dcti_session');
    location.reload();
}

function applyDashboardPermissions(role) {
    const navUsers = document.getElementById('nav-users');
    const navReports = document.getElementById('nav-reports');
    const navReportsTitle = document.getElementById('nav-reports-title');

    const navProjects = document.getElementById('nav-projects'); // Asumiendo que existe el ID

    if (role === 'admin') {
        navUsers.style.display = 'flex';
        navProjects.style.display = 'flex';
        navReports.style.display = 'flex';
        navReportsTitle.style.display = 'block';
    } else if (role === 'editor') {
        navUsers.style.display = 'none';
        navProjects.style.display = 'none'; // Restricción exclusiva Administrador
        navReports.style.display = 'none';
        navReportsTitle.style.display = 'none';
    }
}

// 4. MOTOR DE NAVEGACIÓN Y RENDERIZADO
function switchView(viewId) {
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

function renderModule(id) {
    let content = '';

    const viewData = { ...MOCK_DATA };

    if (id === 'dashboard' || id === 'users' || id === 'news' || id === 'projects') {
        const adminUsers = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
        const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
        const allUsers = [...adminUsers, ...localUsers];

        viewData.adminUsers = adminUsers;
        viewData.localUsers = localUsers;
        viewData.stats.users = allUsers.length;

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

        if (id === 'users') {
            viewData.pagination = getPaginatedData(allUsers, 'users');
        }
        if (id === 'news') {
            viewData.pagination = getPaginatedData(allNews, 'news');
        }
    }

    switch (id) {
        case 'dashboard': content = DashboardView.render(viewData); break;
        case 'users': content = UsersView.render(viewData); break;
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

    // Conexión con Lógica de Vistas (Event Listeners)
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
            sidebar.classList.toggle('sidebar--open');
            sidebarOverlay.classList.toggle('active');
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

    DASHBOARD_UI.sidebarItems.forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            if (view) switchView(view);
        });
    });

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

        if (session.role === 'admin' || session.role === 'editor') {
            startDashboardSession(session);
        }
    }
});
