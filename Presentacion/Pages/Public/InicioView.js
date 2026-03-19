/**
 * Presentacion/Pages/Public/InicioView.js
 * Vista de Inicio del Portal Público.
 */

window.InicioView = {
    render: () => {
        return `
            <section id="view-inicio" class="public-view public-active">
                <!-- Carrusel Principal -->
                <section class="carrusel-principal">
                    <div class="carrusel-contenedor" id="principal"
                        style="overflow:hidden; width:100%; position:relative; min-height:480px;">
                        <div
                            style="text-align: center; color: var(--color-text-muted); padding:50px; width:100%; position:absolute; top:50%; left:50%; transform:translate(-50%,-50%);">
                            <i class="fas fa-spinner fa-spin" style="font-size: 2rem;"></i>
                        </div>
                    </div>
                    <div class="btn-left" id="btn-left-principal" style="display:none; z-index:100;">&#10094;</div>
                    <div class="btn-right" id="btn-right-principal" style="display:none; z-index:100;">&#10095;</div>
                </section>

                <!-- Carrusel Noticias -->
                <section class="carrusel-noticias">
                    <div class="noticia-contenedor" id="principal-noticias-grid">
                    </div>
                    <div class="dots-container" id="principal-noticias-dots"></div>
                </section>

                <!-- Carrusel Miniaturas -->
                <section class="carrusel-miniaturas">
                    <div class="miniaturas-contenedor" id="miniatura" style="min-height: 180px;">
                    </div>
                    <div class="btn-left-m" id="btn-left-m" style="display:none;">&#10094;</div>
                    <div class="btn-right-m" id="btn-right-m" style="display:none;">&#10095;</div>
                </section>
            </section>
        `;
    },
    init: () => {
        // Inicializar controladores de carrusel una vez que el DOM está listo
        if (typeof window.renderPublicInicio === 'function') {
            window.renderPublicInicio();
        }
    }
};
