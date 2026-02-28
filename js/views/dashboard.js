const DashboardView = {
    render: (data) => {
        return `
            <div class="view-container">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card__icon icon--purple"><i class="fas fa-users"></i></div>
                        <div class="stat-card__info"><h3>${data.stats.users}</h3><p>Usuarios Totales</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__icon icon--blue"><i class="fas fa-project-diagram"></i></div>
                        <div class="stat-card__info"><h3>${data.stats.projects}</h3><p>Proyectos Activos</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__icon icon--green"><i class="fas fa-newspaper"></i></div>
                        <div class="stat-card__info"><h3>${data.stats.news}</h3><p>Noticias Publicadas</p></div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__icon icon--orange"><i class="fas fa-graduation-cap"></i></div>
                        <div class="stat-card__info"><h3>${data.stats.courses}</h3><p>Ofertas de Cursos</p></div>
                    </div>
                </div>
                <div class="recent-activity">
                    <h2 style="margin-bottom: var(--space-md); color: #1e293b;">Resumen de Gestión</h2>
                    <div style="background: white; padding: var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                        <p style="color: var(--color-text-muted);">Bienvenido al Panel de Gestión Administrativo. Use el menú lateral para acceder a los diferentes módulos de control.</p>
                    </div>
                </div>
            </div>
        `;
    }
};
