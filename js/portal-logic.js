/* --- PORTAL DCTI - CONSOLIDATED CAROUSEL LOGIC --- */


document.addEventListener("DOMContentLoaded", () => {
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

    // 5. LÓGICA DE FORMULARIO DE CONTACTO (CONSULTAS)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
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
                document.getElementById('modal-completar-perfil').classList.remove('public-hidden-modal');
                document.getElementById('completar-nombre').focus();
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
                document.getElementById('modal-completar-perfil').classList.add('public-hidden-modal');

                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.success('¡Perfil actualizado con éxito! Ya puedes enviar tu consulta.');
                } else {
                    alert('Perfil actualizado. Ahora puedes enviar la consulta.');
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

            if (isSessionValid && requiresProfileCompletion) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.warning('Debes completar tus nombres reales antes de enviar una consulta.');
                } else {
                    alert('Completa tus datos reales para proceder.');
                }
                document.getElementById('modal-completar-perfil').classList.remove('public-hidden-modal');
                return;
            }

            if (!nombre || !correo || !consulta) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.error('Por favor, completa los campos obligatorios (Nombre, Correo, Consulta).');
                } else {
                    alert('Por favor, completa todos los campos.');
                }
                return;
            }

            // Validación específica de Correo (Regex)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(correo)) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.error('Por favor, ingresa un formato de correo electrónico válido.');
                } else {
                    alert('Formato de correo inválido.');
                }
                return;
            }

            // Validación específica de longitud de la consulta
            if (consulta.length < 15) {
                if (typeof window.AlertService !== 'undefined') {
                    window.AlertService.warning('Tu consulta es muy corta. Por favor, sé un poco más descriptivo.');
                } else {
                    alert('Consulta muy corta, por favor amplía.');
                }
                return;
            }

            // Crear el objeto de la consulta
            const nuevaConsulta = {
                id: Date.now(),
                nombre: nombre,
                apellido: apellido,
                correo: correo,
                consulta: consulta,
                fecha: new Date().toISOString().split('T')[0],
                hora: new Date().toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' }),
                estado: 'Pendiente' // Estado inicial
            };

            // Guardar en localStorage
            const consultasGuardadas = JSON.parse(localStorage.getItem('dcti_consultas')) || [];
            consultasGuardadas.push(nuevaConsulta);
            localStorage.setItem('dcti_consultas', JSON.stringify(consultasGuardadas));
            localStorage.setItem('dcti_last_consulta', Date.now().toString()); // Registrar timestamp

            // Limpiar formulario, borrador y mostrar éxito
            contactForm.reset();
            sessionStorage.removeItem('dcti_draft_consulta');

            if (typeof window.AlertService !== 'undefined') {
                window.AlertService.success('¡Consulta enviada! Nos pondremos en contacto contigo pronto.');
            } else {
                alert('¡Consulta enviada exitosamente!');
            }
        });
    }

});
