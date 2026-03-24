/**
 * Presentacion/Application/Router.js
 * Enrutador unificado para el Portal Público y Dashboard Administrativo.
 */

const Router = {
    routes: {
        // Rutas Públicas
        'inicio': { component: 'InicioView', path: 'Presentacion/Pages/Public/InicioView.js' },
        'dcti': { component: 'DctiView', path: 'Presentacion/Pages/Public/DctiView.js' },
        'ejes': { component: 'EjesView', path: 'Presentacion/Pages/Public/EjesView.js' },
        'proyectos': { component: 'ProyectosView', path: 'Presentacion/Pages/Public/ProyectosView.js' },
        'noticias': { component: 'NoticiasView', path: 'Presentacion/Pages/Public/NoticiasView.js' },
        'cursos': { component: 'CursosView', path: 'Presentacion/Pages/Public/CursosView.js' },
        'contactos': { component: 'ContactosView', path: 'Presentacion/Pages/Public/ContactosView.js' },
        'login': { component: 'AuthView', path: 'Presentacion/Pages/Auth/Auth.page.js' },

        // Rutas de Administración (Dashboard)
        'dashboard': { admin: true },
        'profile': { admin: true },
        'users': { admin: true },
        'news': { admin: true },
        'projects': { admin: true },
        'courses': { admin: true },
        'my-courses': { admin: true },
        'strategic': { admin: true },
        'reports': { admin: true },
        'consultas': { admin: true },
        'admin-dcti': { admin: true } // Renombrado para evitar confusión con pública
    },

    currentRoute: null,

    init: function () {
        window.addEventListener('hashchange', () => this.handleRoute());

        // Links públicos
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const target = link.dataset.target?.replace('view-', '');
                if (target) {
                    e.preventDefault();
                    if (window.location.hash === '#' + target) {
                        this.handleRoute(); // Forzar si ya estamos ahí
                    } else {
                        window.location.hash = target;
                    }
                }
            });
        });

        // Inicializar con la ruta actual o 'inicio'
        this.handleRoute();
    },

    navigateTo: function (route) {
        window.location.hash = route;
    },

    handleRoute: async function () {
        const routeId = window.location.hash.replace('#', '') || 'inicio';
        const route = this.routes[routeId];

        if (!route) {
            console.warn(`Ruta no encontrada: ${routeId}`);
            this.navigateTo('inicio');
            return;
        }

        this.currentRoute = routeId;

        // Caso: Ruta de Administración
        if (route.admin) {
            this.showAdminView(routeId);
            return;
        }

        // Caso: Login / Auth
        if (routeId === 'login') {
            await this.showAuthView(route);
            return;
        }

        // Caso: Ruta Pública
        await this.showPublicView(routeId, route);
    },

    showAuthView: async function (config) {
        if (typeof App !== 'undefined' && App.isLoggedIn && App.isLoggedIn()) {
            this.navigateTo('dashboard');
            return;
        }

        document.getElementById('public-portal').classList.add('hidden');
        document.getElementById('admin-root').classList.add('hidden');
        const authRoot = document.getElementById('auth-view-root');
        if (authRoot) authRoot.classList.remove('hidden');

        // Cargar script de Auth si no existe
        if (typeof window.AuthView === 'undefined' && typeof AuthView === 'undefined') {
            await this.loadScript(config.path);
        }

        if (typeof renderAuthPage === 'function') {
            renderAuthPage();
        } else {
            console.error('renderAuthPage no definida en AuthService.js');
        }
    },

    showPublicView: async function (id, config) {
        // 1. Mostrar shell público, ocultar otros roots
        const publicPortal = document.getElementById('public-portal');
        const adminRoot = document.getElementById('admin-root');
        const authRoot = document.getElementById('auth-view-root');

        if (publicPortal) publicPortal.classList.remove('hidden');
        if (adminRoot) adminRoot.classList.add('hidden');
        if (authRoot) authRoot.classList.add('hidden');

        const root = document.getElementById('public-view-root');
        if (!root) return;

        // 2. Cargar componente dinámicamente si no existe
        if (typeof window[config.component] === 'undefined') {
            root.innerHTML = '<div class="loader-container"><i class="fas fa-spinner fa-spin"></i> Cargando sección...</div>';
            await this.loadScript(config.path);
        }

        // 3. Renderizar y ejecutar init
        const component = window[config.component];
        if (component) {
            root.innerHTML = component.render();
            if (component.init) component.init();

            // Actualizar navegación activa
            document.querySelectorAll('.nav-link').forEach(nav => {
                const target = nav.dataset.target?.replace('view-', '');
                nav.classList.toggle('public-nav-active', target === id);
            });

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    },

    showAdminView: function (viewId) {
        const session = JSON.parse(localStorage.getItem('dcti_session'));

        if (!session) {
            // Sin sesión: volver a inicio y mostrar login
            this.navigateTo('inicio');
            return;
        }

        const role = session.role;
        const isAdmin = role === 'admin' || role === 'editor';
        // Rutas que visitantes pueden ver (su propio perfil y sus cursos)
        const visitorAllowed = ['profile', 'my-courses', 'dashboard'];

        if (isAdmin || visitorAllowed.includes(viewId)) {
            const publicPortal = document.getElementById('public-portal');
            const adminRoot = document.getElementById('admin-root');
            const authRoot = document.getElementById('auth-view-root');

            if (publicPortal) publicPortal.classList.add('hidden');
            if (authRoot) authRoot.classList.add('hidden');
            if (adminRoot) adminRoot.classList.remove('hidden');

            // Asegurar que el Shell administrativo esté renderizado
            if (!document.getElementById('content-area') && typeof App !== 'undefined') {
                App.start(session);
            }

            if (typeof renderModule === 'function') {
                // Visitantes que navegan a 'dashboard' van directamente a su perfil
                const targetView = (!isAdmin && viewId === 'dashboard') ? 'profile' : viewId;
                renderModule(targetView);
            }
        } else {
            // Visitante que intenta acceder a rutas de admin → regresar al inicio y navegar al portal
            const publicPortal = document.getElementById('public-portal');
            const adminRoot = document.getElementById('admin-root');
            if (publicPortal) publicPortal.classList.remove('hidden');
            if (adminRoot) adminRoot.classList.add('hidden');
            this.navigateTo('inicio');
        }
    },

    loadScript: function (src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
};

// Exportar al scope global
window.switchView = (viewId) => Router.navigateTo(viewId);
