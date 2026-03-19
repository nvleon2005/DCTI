function initPortalController() {
    /* 1. CAROUSEL PRINCIPAL */
    const principalSlider = {
        btnLeft: document.querySelector("#view-inicio .btn-left"),
        btnRight: document.querySelector("#view-inicio .btn-right"),
        slider: document.querySelector("#principal"),
        slides: document.querySelectorAll("#principal .imgc"),
        operacion: 0,
        counter: 0,

        init() {
            if (!this.slider) return;
            this.widthImg = 100 / this.slides.length;
            this.btnLeft.addEventListener("click", () => this.moveToLeft());
            this.btnRight.addEventListener("click", () => this.moveToRight());
            if (this.interval) clearInterval(this.interval);
            this.interval = setInterval(() => this.moveToRight(), 8000);
        },
        // ... rest of the slider methods (moveToRight, moveToLeft) ...

        moveToRight() {
            if (!this.slider || !this.slides.length || !this.widthImg) return;
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
            if (!this.slider || !this.slides.length || !this.widthImg) return;
            if (this.counter <= 0) {
                this.counter = this.slides.length - 1;
                this.operacion = this.widthImg * (this.slides.length - 1);
                this.slider.style.transition = "none";
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
    // principalSlider.init(); // Lo inicializará renderPublicInicio cuando haya datos
    // noticiasSlider.init();
    // miniaturasSlider.init();

    // 3.5 EXPORTAR FUNCIONES AL SCOPE GLOBAL PARA INYECCIÓN DINÁMICA

    window.initCarruselPrincipal = function () {
        principalSlider.slider = document.querySelector("#principal");
        principalSlider.slides = document.querySelectorAll("#principal .imgc");
        principalSlider.widthImg = 100 / (principalSlider.slides.length || 1);

        // Limpiar event listeners viejos si existen (clonando botones)
        let oldLeft = document.querySelector("#view-inicio .btn-left");
        let oldRight = document.querySelector("#view-inicio .btn-right");
        if (oldLeft && oldRight) {
            let newLeft = oldLeft.cloneNode(true);
            let newRight = oldRight.cloneNode(true);
            oldLeft.parentNode.replaceChild(newLeft, oldLeft);
            oldRight.parentNode.replaceChild(newRight, oldRight);
            principalSlider.btnLeft = newLeft;
            principalSlider.btnRight = newRight;

            principalSlider.btnLeft.addEventListener("click", () => principalSlider.moveToLeft());
            principalSlider.btnRight.addEventListener("click", () => principalSlider.moveToRight());
        }

        if (principalSlider.interval) clearInterval(principalSlider.interval);
        principalSlider.interval = setInterval(() => principalSlider.moveToRight(), 8000);
    };

    window.initCarruselMiniaturas = function () {
        const sliderEl = document.querySelector("#miniatura");
        if (!sliderEl) return;

        const slides = sliderEl.querySelectorAll(".miniaturasc");
        const totalImages = slides.length;

        // Limpiar event listeners (clonar botones)
        let oldLeft = document.querySelector(".btn-left-m");
        let oldRight = document.querySelector(".btn-right-m");
        if (!oldLeft || !oldRight) return;

        let newLeft = oldLeft.cloneNode(true);
        let newRight = oldRight.cloneNode(true);
        oldLeft.parentNode.replaceChild(newLeft, oldLeft);
        oldRight.parentNode.replaceChild(newRight, oldRight);

        let counters = 0;
        const visibleCount = 4; // Siempre mostramos 4 imágenes

        function getStepPx() {
            // El ancho de cada miniatura = ancho del contenedor padre / 4
            const parent = sliderEl.parentElement;
            return parent ? parent.clientWidth / visibleCount : 0;
        }

        function moveRight() {
            const maxSteps = totalImages - visibleCount;
            if (counters < maxSteps) {
                counters++;
            } else {
                counters = 0;
            }
            const stepPx = getStepPx();
            sliderEl.style.transition = 'transform 0.6s ease';
            sliderEl.style.transform = `translateX(-${stepPx * counters}px)`;
        }

        function moveLeft() {
            const maxSteps = totalImages - visibleCount;
            if (counters > 0) {
                counters--;
            } else {
                counters = maxSteps;
            }
            const stepPx = getStepPx();
            sliderEl.style.transition = 'transform 0.6s ease';
            sliderEl.style.transform = `translateX(-${stepPx * counters}px)`;
        }

        newLeft.addEventListener("click", moveLeft);
        newRight.addEventListener("click", moveRight);

        if (window._miniaturasInterval) clearInterval(window._miniaturasInterval);
        window._miniaturasInterval = setInterval(moveRight, 6000);

        // Recalcular posición al redimensionar la ventana (responsive fix)
        let _resizeTimer;
        if (window._miniaturasResizeHandler) {
            window.removeEventListener('resize', window._miniaturasResizeHandler);
        }
        window._miniaturasResizeHandler = function () {
            clearTimeout(_resizeTimer);
            _resizeTimer = setTimeout(() => {
                const stepPx = getStepPx();
                sliderEl.style.transition = 'none';
                sliderEl.style.transform = `translateX(-${stepPx * counters}px)`;
            }, 100);
        };
        window.addEventListener('resize', window._miniaturasResizeHandler);
    };


    window.initCarruselNoticias = function () {
        noticiasSlider.slider = document.querySelector(".noticia-contenedor");
        noticiasSlider.slides = document.querySelectorAll(".noticia");
        noticiasSlider.dotsContainer = document.querySelector(".dots-container");
        if (!noticiasSlider.slider || !noticiasSlider.slides.length) return;

        // Limpiar dots previos
        noticiasSlider.dotsContainer.innerHTML = '';
        noticiasSlider.slides.forEach((_, index) => {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (index === 0) dot.classList.add("active");
            noticiasSlider.dotsContainer.appendChild(dot);
            dot.addEventListener("click", () => {
                noticiasSlider.currentIndex = index;
                noticiasSlider.updateSlider();
            });
        });

        if (noticiasSlider.interval) clearInterval(noticiasSlider.interval);
        noticiasSlider.interval = setInterval(() => {
            noticiasSlider.currentIndex = (noticiasSlider.currentIndex + 1) % noticiasSlider.slides.length;
            noticiasSlider.updateSlider();
        }, 10000);
    };

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

    // 5. LÓGICA DE FORMULARIO DE CONTACTO (CONSULTAS)
    window.initContactForm = function () {
        const contactForm = document.getElementById('contact-form');
        if (!contactForm) return;

        const nombreInput = document.getElementById('nombre');
        const apellidoInput = document.getElementById('apellido');
        const correoInput = document.getElementById('correo');
        const consultaInput = document.getElementById('consulta');

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Auto-llenado de sesión
        let isSessionValid = false;
        let requiresProfileCompletion = false;
        let currentUserEmail = '';

        try {
            const sessionData = JSON.parse(localStorage.getItem('dcti_session'));
            if (sessionData && sessionData.email) {
                isSessionValid = true;
                currentUserEmail = sessionData.email;

                // Buscar datos completos del usuario
                const localUsers = JSON.parse(localStorage.getItem('dcti_users') || '[]');
                const sessionUser = localUsers.find(u => u.email === sessionData.email) || sessionData;

                if (!sessionUser.name || !sessionUser.lastname) {
                    requiresProfileCompletion = true;
                } else {
                    // Llenar campos y hacerlos readonly
                    nombreInput.value = sessionUser.name;
                    apellidoInput.value = sessionUser.lastname;
                    correoInput.value = sessionUser.email;

                    nombreInput.setAttribute('readonly', true);
                    apellidoInput.setAttribute('readonly', true);
                    correoInput.setAttribute('readonly', true);

                    nombreInput.style.backgroundColor = '#f1f5f9';
                    apellidoInput.style.backgroundColor = '#f1f5f9';
                    correoInput.style.backgroundColor = '#f1f5f9';
                }
            }
        } catch (e) {
            console.error('Error al analizar la sesión:', e);
        }

        // Interceptar foco si falta el perfil
        contactForm.addEventListener('focusin', (e) => {
            if (isSessionValid && requiresProfileCompletion) {
                const modal = document.getElementById('modal-completar-perfil');
                if (modal) {
                    modal.classList.remove('public-hidden-modal');
                    const inputNom = document.getElementById('completar-nombre');
                    if (inputNom) inputNom.focus();
                }
            }
        });

        // Manejar modal de completar perfil
        const formCompletarPerfil = document.getElementById('form-completar-perfil');
        if (formCompletarPerfil) {
            formCompletarPerfil.addEventListener('submit', (e) => {
                e.preventDefault();
                const nuevoNombre = document.getElementById('completar-nombre').value.trim();
                const nuevoApellido = document.getElementById('completar-apellido').value.trim();

                if (!nuevoNombre || !nuevoApellido) return;

                const localUsers = JSON.parse(localStorage.getItem('dcti_users') || '[]');
                const userIndex = localUsers.findIndex(u => u.email === currentUserEmail);

                if (userIndex !== -1) {
                    localUsers[userIndex].name = nuevoNombre;
                    localUsers[userIndex].lastname = nuevoApellido;
                    localStorage.setItem('dcti_users', JSON.stringify(localUsers));
                }

                // Actualizar info en el session
                const sessionData = JSON.parse(localStorage.getItem('dcti_session'));
                sessionData.name = nuevoNombre;
                sessionData.lastname = nuevoApellido;
                localStorage.setItem('dcti_session', JSON.stringify(sessionData));

                // Auto-llenar
                nombreInput.value = nuevoNombre;
                apellidoInput.value = nuevoApellido;
                correoInput.value = currentUserEmail;

                nombreInput.setAttribute('readonly', true);
                apellidoInput.setAttribute('readonly', true);
                correoInput.setAttribute('readonly', true);

                nombreInput.style.backgroundColor = '#f1f5f9';
                apellidoInput.style.backgroundColor = '#f1f5f9';
                correoInput.style.backgroundColor = '#f1f5f9';

                requiresProfileCompletion = false;
                const modal = document.getElementById('modal-completar-perfil');
                if (modal) modal.classList.add('public-hidden-modal');

                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.success('¡Perfil actualizado con éxito! Ya puedes enviar tu consulta.');
                }
            });
        }

        // Restaurar borrador de sessionStorage si existe
        const draft = JSON.parse(sessionStorage.getItem('dcti_draft_consulta') || '{}');
        if (draft.nombre) nombreInput.value = draft.nombre;
        if (draft.apellido) apellidoInput.value = draft.apellido;
        if (draft.correo) correoInput.value = draft.correo;
        if (draft.consulta) consultaInput.value = draft.consulta;

        // Guardar borrador en tiempo real
        const saveDraft = () => {
            sessionStorage.setItem('dcti_draft_consulta', JSON.stringify({
                nombre: nombreInput.value,
                apellido: apellidoInput.value,
                correo: correoInput.value,
                consulta: consultaInput.value
            }));
        };

        nombreInput.addEventListener('input', saveDraft);
        apellidoInput.addEventListener('input', saveDraft);
        correoInput.addEventListener('input', saveDraft);
        consultaInput.addEventListener('input', saveDraft);

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = nombreInput.value.trim();
            const apellido = apellidoInput.value.trim();
            const correo = correoInput.value.trim();
            const consulta = consultaInput.value.trim();

            // Prevención de Spam (Rate Limiting de 10 minutos)
            const lastSubmit = localStorage.getItem('dcti_last_consulta');
            if (lastSubmit && (Date.now() - parseInt(lastSubmit)) < 600000) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.warning('Ya hemos recibido tu consulta. Por favor, espera antes de enviar otra.');
                } else {
                    alert('Por favor, espera unos minutos antes de enviar otra consulta.');
                }
                return;
            }

            if (!nombre || !correo || !consulta) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.error('Por favor, completa los campos obligatorios.');
                } else {
                    alert('Por favor, completa todos los campos.');
                }
                return;
            }

            if (!emailRegex.test(correo)) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.error('Formato de correo electrónico válido.');
                }
                return;
            }

            // Crear el objeto de la consulta
            const nuevaConsulta = {
                id: Date.now(),
                nombre, apellido, correo, consulta,
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
                estado: 'Pendiente'
            };

            const consultasGuardadas = JSON.parse(localStorage.getItem('dcti_consultas')) || [];
            consultasGuardadas.push(nuevaConsulta);
            localStorage.setItem('dcti_consultas', JSON.stringify(consultasGuardadas));
            localStorage.setItem('dcti_last_consulta', Date.now().toString());

            contactForm.reset();
            sessionStorage.removeItem('dcti_draft_consulta');

            if (typeof window.AlertService !== 'undefined') {
                window.AlertService.success('¡Consulta enviada! Nos pondremos en contacto contigo pronto.');
            } else {
                alert('¡Consulta enviada exitosamente!');
            }
        });
    };
}


if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initPortalController);
} else {
    initPortalController();
}
