const ReportsView = {
    render: () => {
        return `
            <div class="view-container">
                <div style="background: white; padding: var(--space-xl); border-radius: var(--radius-lg); border: 1px solid var(--color-border);">
                    <h2 style="margin-bottom: var(--space-lg);">Módulo de Reportes Estadísticos</h2>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-xl);">
                        <div style="padding: var(--space-md); border: 1.5px dashed var(--color-border); border-radius: var(--radius-md); text-align: center; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor=getComputedStyle(document.documentElement).getPropertyValue('--color-primary')" onmouseout="this.style.borderColor='var(--color-border)'">
                            <i class="fas fa-file-pdf" style="font-size: 2rem; color: #ef4444; margin-bottom: 10px;"></i>
                            <p style="font-weight: 600;">Exportar PDF</p>
                        </div>
                        <div style="padding: var(--space-md); border: 1.5px dashed var(--color-border); border-radius: var(--radius-md); text-align: center; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor=getComputedStyle(document.documentElement).getPropertyValue('--color-primary')" onmouseout="this.style.borderColor='var(--color-border)'">
                            <i class="fas fa-file-excel" style="font-size: 2rem; color: #22c55e; margin-bottom: 10px;"></i>
                            <p style="font-weight: 600;">Exportar Excel</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
