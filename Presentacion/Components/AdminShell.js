/**
 * Presentacion/Components/AdminShell.js
 * Genera dinámicamente el Sidebar y Header del Dashboard.
 */

const AdminShell = {
    render: (user) => {
        const initials = user.initials || '??';
        const displayName = user.name || user.username || 'Usuario';
        const displayRole = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Rol';
        const isVisitor = user.role === 'visitante';

        return `
        <div class="app-container">
            <!-- Sidebar Principal -->
            <aside class="sidebar">
                <div class="sidebar__header">
                    <div class="sidebar__logo">
                        <i class="fas fa-shield-halved"></i>
                        <span>DCTI</span>
                    </div>
                </div>
                <style>
                    /* Bypass browser caching for the crucial filter class */
                    .hidden-by-filter { display: none !important; }
                </style>
                <nav class="sidebar__nav">
                    <ul class="sidebar__list">
                        ${!isVisitor ? `<li class="sidebar__item sidebar__item--active" data-view="dashboard">
                            <i class="fas fa-chart-line"></i>
                            <span>Dashboard</span>
                        </li>` : ''}
                        <li class="sidebar__section-title">MI CUENTA</li>
                        <li class="sidebar__item ${isVisitor ? 'sidebar__item--active' : ''}" data-view="profile" id="nav-profile">
                            <i class="fas fa-user-circle"></i>
                            <span>Mi Perfil</span>
                        </li>
                        <li class="sidebar__item" data-view="my-courses" id="nav-my-courses">
                            <i class="fas fa-book-open"></i>
                            <span>Mis Cursos</span>
                        </li>
                        ${!isVisitor ? `
                        <li class="sidebar__section-title" id="nav-admin-title">ADMINISTRACIÓN</li>
                        <li class="sidebar__item" data-view="users" id="nav-users">
                            <i class="fas fa-users-cog"></i>
                            <span>Gestión de Usuarios</span>
                        </li>
                        <li class="sidebar__item" data-view="consultas" id="nav-consultas">
                            <i class="fas fa-headset"></i>
                            <span>Consultas</span>
                        </li>
                        <li class="sidebar__item" data-view="auditoria" id="nav-auditoria">
                            <i class="fas fa-clipboard-list"></i>
                            <span>Auditoría</span>
                        </li>
                        <li class="sidebar__section-title" id="nav-content-title">CONTENIDOS</li>
                        <li class="sidebar__item" data-view="admin-dcti">
                            <i class="fas fa-building"></i>
                            <span>DCTI</span>
                        </li>
                        <li class="sidebar__item" data-view="strategic">
                            <i class="fas fa-layer-group"></i>
                            <span>Áreas Estratégicas</span>
                        </li>
                        <li class="sidebar__item" data-view="projects" id="nav-projects">
                            <i class="fas fa-diagram-project"></i>
                            <span>Proyectos</span>
                        </li>
                        <li class="sidebar__item" data-view="news">
                            <i class="fas fa-newspaper"></i>
                            <span>Noticias</span>
                        </li>
                        <li class="sidebar__item" data-view="courses">
                            <i class="fas fa-graduation-cap"></i>
                            <span>Cursos</span>
                        </li>
                        <li class="sidebar__section-title" id="nav-reports-title">REPORTES</li>
                        <li class="sidebar__item" data-view="reports" id="nav-reports">
                            <i class="fas fa-chart-pie"></i>
                            <span>Reportes</span>
                        </li>` : ''}
                        <li class="sidebar__section-title">NAVEGACIÓN</li>
                        <li class="sidebar__item" onclick="window.location.href='index.html'"
                            style="color: #fff; font-weight: 600;">
                            <i class="fas fa-external-link-alt"></i>
                            <span>Ir al Portal</span>
                        </li>
                    </ul>
                </nav>

                <div class="sidebar__footer">
                    <div class="user-pill" id="logout-btn" title="Cerrar Sesión" style="cursor: pointer;">
                        <div class="user-pill__avatar" id="user-initials">${initials}</div>
                        <div class="user-pill__info">
                            <span class="user-pill__name" id="user-display-name">${displayName}</span>
                            <span class="user-pill__role" id="user-display-role">${displayRole}</span>
                        </div>
                        <i class="fas fa-sign-out-alt"
                            style="margin-left: auto; font-size: 0.8rem; color: var(--color-text-muted);"></i>
                    </div>
                </div>
            </aside>

            <!-- Main Content Area -->
            <main class="main-content">
                <header class="main-header">
                    <div class="main-header__left">
                        <button class="mobile-toggle" id="sidebar-toggle">
                            <i class="fas fa-bars"></i>
                        </button>
                    </div>
                    <div class="main-header__right">
                        <div class="top-nav-filter-wrap">
                            <i class="fas fa-search" style="color: #64748b;"></i>
                            <input type="text" id="sidebar-filter-input" class="top-nav-filter-input" placeholder="Filtrar menú lateral...">
                        </div>
                    </div>
                </header>

                <section class="content-view" id="content-area">
                    <!-- Las vistas se inyectan dinámicamente desde JS -->
                </section>
            </main>
        </div>
        `;
    }
};
