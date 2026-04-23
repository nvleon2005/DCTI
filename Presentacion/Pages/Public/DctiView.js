/**
 * Presentacion/Pages/Public/DctiView.js
 * Vista Institucional (Reseña, Misión, Visión, Organigrama).
 */

window.handleOrganigramaZoom = function(e, imgElement) {
    if (!imgElement) return;
    const rect = imgElement.parentElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;
    
    imgElement.style.transformOrigin = `${xPercent}% ${yPercent}%`;
    imgElement.style.transform = "scale(2)";
};

window.resetOrganigramaZoom = function(imgElement) {
    if (!imgElement) return;
    imgElement.style.transition = "transform 0.3s ease-out";
    imgElement.style.transformOrigin = "center center";
    imgElement.style.transform = "scale(1)";
    
    setTimeout(() => {
        imgElement.style.transition = "transform 0.1s ease-out"; // Reset for smoother tracking
    }, 300);
};

window.openOrganigramaLightbox = function(src) {
    let overlay = document.getElementById('dcti-lightbox-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'dcti-lightbox-overlay';
        overlay.className = 'lightbox-overlay';
        overlay.innerHTML = `
            <button class="lightbox-close" onclick="closeOrganigramaLightbox()">&times;</button>
            <img class="lightbox-content" src="" alt="Organigrama Pantalla Completa">
        `;
        document.body.appendChild(overlay);
        
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) {
                closeOrganigramaLightbox();
            }
        });
    }
    
    const img = overlay.querySelector('.lightbox-content');
    img.src = src;
    
    // Add active class after a tiny delay to ensure CSS transition fires
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            overlay.classList.add('active');
        });
    });
};

window.closeOrganigramaLightbox = function() {
    const overlay = document.getElementById('dcti-lightbox-overlay');
    if (overlay) {
        overlay.classList.remove('active');
    }
};

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
                    <div class="zoom-wrapper" onmousemove="handleOrganigramaZoom(event, this.querySelector('img'))" onmouseleave="resetOrganigramaZoom(this.querySelector('img'))" onclick="openOrganigramaLightbox('${organigramaSrc}')">
                        <img src="${organigramaSrc}" alt="Organigrama de la Institucion" class="organigrama" style="transition: transform 0.1s ease-out;">
                    </div>
                </section>
            </section>
        `;
    }
};
