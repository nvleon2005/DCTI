/**
 * Presentacion/Controllers/Dashboard/Dashboard.controller.js
 * Lógica específica del Dashboard (Gráficos, métricas).
 */

const DashboardController = {
    initChart: () => {
        const canvas = document.getElementById('courseRegistrationChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        if (window.dashboardChartInstance) {
            window.dashboardChartInstance.destroy();
        }

        const participations = typeof getLocalParticipations === 'function' ? getLocalParticipations() : [];

        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        const labels = [];
        const counts = [0, 0, 0, 0, 0, 0];

        const hoy = new Date();
        for (let i = 5; i >= 0; i--) {
            const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
            labels.push(meses[d.getMonth()]);
        }

        participations.forEach(p => {
            if (!p.fechaInscripcion) return;
            const fechaInsc = new Date(p.fechaInscripcion);
            const diffMonths = (hoy.getFullYear() - fechaInsc.getFullYear()) * 12 + (hoy.getMonth() - fechaInsc.getMonth());
            if (diffMonths >= 0 && diffMonths <= 5) {
                const indexOnArray = 5 - diffMonths;
                counts[indexOnArray]++;
            }
        });

        window.dashboardChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Registros',
                    data: counts,
                    borderColor: '#6b21a8',
                    backgroundColor: 'rgba(107, 33, 168, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#6b21a8',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { min: 0, ticks: { stepSize: 20, color: '#94a3b8' } },
                    x: { ticks: { color: '#94a3b8' }, grid: { display: false } }
                }
            }
        });
    }
};
