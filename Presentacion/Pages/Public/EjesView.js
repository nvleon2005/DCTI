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
        `;
    },
    init: () => {
        if (typeof window.renderPublicEjes === 'function') {
            window.renderPublicEjes();
        }
    }
};
