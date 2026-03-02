document.addEventListener("DOMContentLoaded", () => {
    // Inicializar todos los carruseles de Ejes de Gestión
    const ejesIds = [1, 2, 3, 4, 5, 6];

    ejesIds.forEach(id => {
        const sliderEje = document.querySelector(`.eje-contenedor${id}`);
        const slidesEje = document.querySelectorAll(`.eje${id}`);
        const dotsContainerEje = document.querySelector(`.dots-container-eje${id}`);
        let currentIndexEje = 0;

        if (!sliderEje || slidesEje.length === 0 || !dotsContainerEje) return;

        // Crear los puntos
        slidesEje.forEach((slide, index) => {
            const dot = document.createElement('div');
            dot.classList.add(`dot-eje${id}`);
            dotsContainerEje.appendChild(dot);

            // Agregar evento de clic a cada punto
            dot.addEventListener('click', () => {
                currentIndexEje = index;
                updateSlider();
            });
        });

        const dots = document.querySelectorAll(`.dot-eje${id}`);

        function updateSlider() {
            const offsetEje = -currentIndexEje * (100 / slidesEje.length); // Calcula el desplazamiento
            sliderEje.style.transform = `translateX(${offsetEje}%)`; // Aplica el desplazamiento

            // Actualiza los puntos activos
            dots.forEach((d, i) => {
                d.classList.toggle('active', i === currentIndexEje);
            });
        }

        // Activar punto inicial visible si hace falta
        if (dots.length > 0) {
            dots[0].classList.add("active");
        }

        // Iniciar el carrusel
        setInterval(() => {
            currentIndexEje = (currentIndexEje + 1) % slidesEje.length; // Cambia de índice
            updateSlider();
        }, 30000); // Cambia cada 30 segundos
    });
});
