document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link');
    const publicViews = document.querySelectorAll('.public-view');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('data-target');

            // Si el link no tiene data-target (o es enlace normal a otra página), no hacer preventDefault
            if (!targetId) return;

            e.preventDefault();

            // 1. Actualizar estado de los enlaces
            navLinks.forEach(nav => nav.classList.remove('public-nav-active'));
            link.classList.add('public-nav-active');

            // 2. Ocultar todas las vistas y mostrar la objetivo
            publicViews.forEach(view => {
                if (view.id === targetId) {
                    view.classList.remove('public-hidden');
                    view.classList.add('public-active');

                    // Inicializar Leaflet dinámicamente solo al ver Contactos
                    if (targetId === 'view-contactos' && typeof window.initContactMap === 'function') {
                        setTimeout(() => window.initContactMap(), 300); // Dar un respiro a la UI
                    }
                } else {
                    view.classList.remove('public-active');
                    view.classList.add('public-hidden');
                }
            });

            // 3. Scroll top automático para simular cambio de página
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // 4. Cerrar el menú móvil si está abierto
            const navMenu = document.getElementById("nav-menu");
            const navToggle = document.getElementById("nav-toggle");
            if (navMenu && navMenu.classList.contains("active")) {
                navMenu.classList.remove("active");
                const icon = navToggle.querySelector("i");
                if (icon) icon.classList.replace("fa-xmark", "fa-bars");
            }
        });
    });
});
