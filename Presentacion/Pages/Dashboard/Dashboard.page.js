const DashboardView = {
    render: (data) => {
        // Plantilla mantenible para las tarjetas estadísticas
        const createStatCard = (icon, number, label, textColor, bgColor) => `
            <div class="dcti-stat-card">
                <div class="dcti-stat-card-header">
                    <div class="dcti-stat-card-icon" style="background: ${bgColor}; color: ${textColor};">
                        <i class="${icon}"></i>
                    </div>
                    <span class="dcti-stat-card-number">${number}</span>
                </div>
                <hr class="dcti-stat-card-divider">
                <p class="dcti-stat-card-label">${label}</p>
            </div>
        `;

        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <h2 style="margin: 0; color: var(--color-text-main);">Panel de Control</h2>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-bottom: 24px;">
                    ${createStatCard('fas fa-users', data.stats.users, 'Usuarios Totales', 'var(--color-primary)', 'rgba(94, 27, 174, 0.1)')}
                    ${createStatCard('fas fa-project-diagram', data.stats.projects, 'Proyectos Activos', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                    ${createStatCard('fas fa-newspaper', data.stats.news, 'Noticias Publicadas', '#22c55e', 'rgba(34, 197, 94, 0.1)')}
                    ${createStatCard('fas fa-graduation-cap', data.stats.courses, 'Ofertas de Cursos', '#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                    ${createStatCard('fas fa-bullseye', data.stats.strategic, 'Áreas Estratégicas', '#ec4899', 'rgba(236, 72, 153, 0.15)')}
                </div>
                <div class="recent-activity">
                    <h2 style="margin-bottom: var(--space-md); color: #1e293b;">Evolución de Registros a Cursos</h2>
                    <div style="background: white; padding: var(--space-lg); border-radius: var(--radius-md); border: 1px solid var(--color-border); position: relative; height: 400px; width: 100%;">
                        <canvas id="courseRegistrationChart"></canvas>
                    </div>
                </div>
            </div>
        `;
    }
};
