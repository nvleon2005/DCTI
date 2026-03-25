/**
 * Presentacion/Pages/Public/DctiView.js
 * Vista Institucional (Reseña, Misión, Visión, Organigrama).
 */

window.DctiView = {
    render: () => {
        let info = {
            review: "Historia no disponible.",
            mission: "Misión no definida.",
            vision: "Visión no definida.",
            organigrama: null
        };

        try {
            const lsData = localStorage.getItem('dcti_info');
            if (lsData) {
                info = { ...info, ...JSON.parse(lsData) };
            }
        } catch (e) {
            console.error("Error leyendo info de la DCTI", e);
        }

        const organigramaSrc = info.organigrama || 'assets/images/organigrama_nuevo.png';

        return `
            <section id="view-dcti" class="public-view public-active">
                <section>
                    <article class="caja">
                        <h2>Reseña Historica</h2>
                        <p style="white-space: pre-wrap;">${info.review}</p>
                    </article>
                </section>
                <section class="conten">
                    <article class="caja">
                        <h2>Misión</h2>
                        <p style="white-space: pre-wrap;">${info.mission}</p>
                    </article>
                    <article class="caja">
                        <h2>Visión</h2>
                        <p style="white-space: pre-wrap;">${info.vision}</p>
                    </article>
                </section>
                <section class="c_organigrama">
                    <img src="${organigramaSrc}" alt="Organigrama de la Institucion"
                        class="organigrama">
                </section>
            </section>
        `;
    }
};
