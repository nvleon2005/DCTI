/**
 * Presentacion/Pages/Public/EjesView.js
 * Vista de Ejes de Gestión.
 */

window.EjesView = {
    render: () => {
        return `
            <section id="view-ejes" class="public-view public-active">
                <h2 class="view-section-title">Ejes de Gestión</h2>
                <div id="public-ejes-wrapper" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 20px;">
                    <div id="public-ejes-grid" style="display: flex; flex-direction: column; gap: 40px; width: 100%;">
                        <!-- Se llenará dinámicamente -->
                    </div>
                </div>
            </section>
            
            <section id="view-eje-detalle" class="public-view public-hidden">
                <div style="width: 100%; max-width: 900px; margin: 0 auto; padding: 20px; padding-top: 40px;">
                    <button class="btn-volver" id="btn-volver-ejes"
                        style="background-color: transparent; border: 2px solid #530e90; color: #530e90; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; gap: 8px; transition: all 0.3s; margin-top: 20px; margin-bottom: 20px;">
                        <i class="fas fa-arrow-left"></i> Volver a los Ejes de Gestión
                    </button>
                    <div id="public-eje-detail-content">
                        <!-- Detalles cargados aquí -->
                    </div>
                </div>
            </section>
        `;
    },
    init: () => {
        if (typeof window.renderPublicEjes === 'function') {
            window.renderPublicEjes();
        }
    }
};
