/**
 * Presentacion/Pages/Public/CursosView.js
 * Vista de Cursos Públicos.
 */

window.CursosView = {
    render: () => {
        return `
            <section id="view-cursos" class="public-view public-active">
                <div class="titulo_noticia">
                    <h2>Cursos</h2>
                </div>
                <div id="public-courses-wrapper" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px;">
                    <div id="public-courses-grid" style="display: flex; flex-wrap: wrap; justify-content: center; gap: 20px; align-items: stretch; padding: 0 2% 2% 2%; width: 100%;">
                    </div>
                    <div id="public-courses-pagination" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; font-family: 'Inter', sans-serif;">
                    </div>
                </div>
            </section>
            <section id="view-curso-detalle" class="public-view public-hidden">
                <div style="padding: 0 2%; margin-bottom: 15px;">
                    <button class="btn-volver" id="btn-volver-cursos"
                        style="background-color: transparent; border: 2px solid #530e90; color: #530e90; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; transition: all 0.3s; margin-top: 20px; margin-left: 20px;">
                        <i class="fas fa-arrow-left"></i> Volver a cursos
                    </button>
                </div>
                <div id="public-course-detail-content" style="width: 100%; max-width: 1200px; margin: 0 auto;">
                </div>
            </section>
        `;
    },
    init: () => {
        if (typeof window.renderPublicCourses === 'function') {
            window.renderPublicCourses();
        }
    }
};
