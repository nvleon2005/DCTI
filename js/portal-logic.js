/* --- PORTAL DCTI - CONSOLIDATED CAROUSEL LOGIC --- */


document.addEventListener("DOMContentLoaded", () => {
    /* 1. CAROUSEL PRINCIPAL */
    const principalSlider = {
        btnLeft: document.querySelector(".btn-left"),
        btnRight: document.querySelector(".btn-right"),
        slider: document.querySelector("#principal"),
        slides: document.querySelectorAll(".imgc"),
        operacion: 0,
        counter: 0,

        init() {
            if (!this.slider) return;
            this.widthImg = 100 / this.slides.length;
            this.btnLeft.addEventListener("click", () => this.moveToLeft());
            this.btnRight.addEventListener("click", () => this.moveToRight());
            setInterval(() => this.moveToRight(), 8000); // 8 segundos para visibilidad
        },

        moveToRight() {
            if (this.counter >= this.slides.length - 1) {
                this.counter = 0;
                this.operacion = 0;
                this.slider.style.transition = "none";
            } else {
                this.counter++;
                this.operacion += this.widthImg;
                this.slider.style.transition = "all ease .6s";
            }
            this.slider.style.transform = `translateX(-${this.operacion}%)`;
        },

        moveToLeft() {
            if (this.counter <= 0) {
                this.counter = this.slides.length - 1;
                this.operacion = this.widthImg * (this.slides.length - 1);
                this.slider.style.transition = "all ease .6s";
            } else {
                this.counter--;
                this.operacion -= this.widthImg;
                this.slider.style.transition = "all ease .6s";
            }
            this.slider.style.transform = `translateX(-${this.operacion}%)`;
        }
    };

    /* 2. CAROUSEL NOTICIAS (DOTS) */
    const noticiasSlider = {
        slider: document.querySelector(".noticia-contenedor"),
        slides: document.querySelectorAll(".noticia"),
        dotsContainer: document.querySelector(".dots-container"),
        currentIndex: 0,

        init() {
            if (!this.slider) return;
            this.slides.forEach((_, index) => {
                const dot = document.createElement("div");
                dot.classList.add("dot");
                if (index === 0) dot.classList.add("active");
                this.dotsContainer.appendChild(dot);
                dot.addEventListener("click", () => {
                    this.currentIndex = index;
                    this.updateSlider();
                });
            });
            setInterval(() => {
                this.currentIndex = (this.currentIndex + 1) % this.slides.length;
                this.updateSlider();
            }, 10000);
        },

        updateSlider() {
            const offset = -this.currentIndex * (100 / this.slides.length);
            this.slider.style.transform = `translateX(${offset}%)`;
            const dots = this.dotsContainer.querySelectorAll(".dot");
            dots.forEach((d, i) => d.classList.toggle("active", i === this.currentIndex));
        }
    };

    /* 3. CAROUSEL MINIATURAS */
    const miniaturasSlider = {
        btnLeft: document.querySelector(".btn-left-m"),
        btnRight: document.querySelector(".btn-right-m"),
        slider: document.querySelector("#miniatura"),
        slides: document.querySelectorAll(".miniaturasc"),
        operaciones: 0,
        counters: 0,

        init() {
            if (!this.slider) return;
            this.totalImages = this.slides.length;
            this.btnLeft.addEventListener("click", () => this.moveToLeft());
            this.btnRight.addEventListener("click", () => this.moveToRight());
            setInterval(() => this.moveToRight(), 6000);
        },

        moveToRight() {
            if (this.counters < this.totalImages - 4) {
                this.counters++;
            } else {
                this.counters = 0;
            }
            this.operaciones = this.counters * (100 / this.totalImages);
            this.slider.style.transform = `translateX(-${this.operaciones}%)`;
        },

        moveToLeft() {
            if (this.counters > 0) {
                this.counters--;
            } else {
                this.counters = this.totalImages - 4;
            }
            this.operaciones = this.counters * (100 / this.totalImages);
            this.slider.style.transform = `translateX(-${this.operaciones}%)`;
        }
    };

    // Inicializar carruseles
    principalSlider.init();
    noticiasSlider.init();
    miniaturasSlider.init();

    // 4. LÓGICA DE NAVEGACIÓN MÓVIL
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navMenu.classList.toggle("active");
            const icon = navToggle.querySelector("i");
            if (navMenu.classList.contains("active")) {
                icon.classList.replace("fa-bars", "fa-xmark");
            } else {
                icon.classList.replace("fa-xmark", "fa-bars");
            }
        });
    }
});
