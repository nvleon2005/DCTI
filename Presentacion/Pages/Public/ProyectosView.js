/**
 * Presentacion/Pages/Public/ProyectosView.js
 * Vista de Proyectos Públicos.
 */

window.ProyectosView = {
    render: () => {
        return `
            <section id="view-proyectos" class="public-view public-active">
                <div class="titulo_noticia">
                    <h2>Proyectos en progreso</h2>
                </div>
                <div id="public-projects-wrapper" style="width: 100%; max-width: 95%; margin: 0 auto; padding: 20px;">
                    <div id="public-projects-grid" style="width: 100%; display: flex; flex-direction: column; gap: 30px;">
                    </div>
                    <div id="public-projects-pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 30px;">
                    </div>
                </div>
            </section>
            <section id="view-proyecto-detalle" class="public-view public-hidden">
                <div style="padding: 0 2%; margin-bottom: 15px;">
                    <button class="btn-volver" id="btn-volver-proyectos"
                        style="background-color: transparent; border: 2px solid #530e90; color: #530e90; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; transition: all 0.3s; margin-top: 20px; margin-left: 20px;">
                        <i class="fas fa-arrow-left"></i> Volver a Proyectos
                    </button>
                </div>
                <div id="public-proj-detail-content" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px;">
                </div>
            </section>
        `;
    },
    init: () => {
        if (typeof window.renderPublicProjects === 'function') {
            window.renderPublicProjects();
        }
    }
};
