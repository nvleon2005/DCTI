/**
 * Presentacion/Pages/Public/NoticiasView.js
 * Vista de Noticias Públicas.
 */

window.NoticiasView = {
    render: () => {
        return `
            <section id="view-noticias" class="public-view public-active">
                <div class="cabeza">
                    <h1 class="title" style="text-align:center; padding: 20px 0; color: #530e90;">Noticias y Novedades</h1>
                </div>
                <div id="public-news-wrapper" style="width: 100%;">
                </div>
                <div id="public-news-pagination" style="display: flex; justify-content: center; gap: 10px; margin-top: 30px; margin-bottom: 40px;">
                </div>
            </section>
            <section id="view-noticia-detalle" class="public-view public-hidden">
                <div style="padding: 0 2%; margin-bottom: 15px;">
                    <button class="btn-volver" id="btn-volver-noticias"
                        style="background-color: transparent; border: 2px solid #530e90; color: #530e90; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; transition: all 0.3s; margin-top: 20px; margin-left: 20px;">
                        <i class="fas fa-arrow-left"></i> Volver a Noticias
                    </button>
                </div>
                <div id="public-news-detail-content" style="width: 100%; max-width: 1000px; margin: 0 auto; padding: 20px;">
                </div>
            </section>
        `;
    },
    init: () => {
        if (typeof window.renderPublicNews === 'function') {
            window.renderPublicNews();
        }
    }
};
