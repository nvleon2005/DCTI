const MyCoursesView = {
    render: function (data) {
        const user = data.currentUser || {};

        let currentCourses = data.courses || [];

        // --- 1. Generación de Datos de Prueba Extendida (Simulación) ---
        const mockCourses = [
            { id: 101, title: 'Introducción a SCRUM', type: 'Virtual', progress: 45, instructor: 'Ing. Carlos Mendoza', hours: 40, desc: 'Aprende los fundamentos del marco de trabajo ágil más popular para el desarrollo de proyectos complejos.' },
            { id: 102, title: 'Gestión de Innovación y Tecnología', type: 'Presencial', progress: 100, instructor: 'Dra. Elena Silva', hours: 60, desc: 'Estrategias corporativas para fomentar la innovación continua dentro de organizaciones gubernamentales.' },
            { id: 103, title: 'Seguridad Informática Básica', type: 'Virtual', progress: 15, instructor: 'Ing. Roberto Gómez', hours: 30, desc: 'Conceptos fundamentales de ciberseguridad, prevención de phishing y buenas prácticas de contraseñas.' },
            { id: 104, title: 'Desarrollo Web con HTML5 y CSS3', type: 'Virtual', progress: 85, instructor: 'Lic. María Fernández', hours: 80, desc: 'Estructuración y maquetado moderno de aplicaciones web accesibles y responsivas.' },
            { id: 105, title: 'Liderazgo Transformacional', type: 'Presencial', progress: 0, instructor: 'MSc. Ana López', hours: 25, desc: 'Técnicas de liderazgo moderno, motivación de equipos y manejo de resolución de conflictos.' },
            { id: 106, title: 'Manejo de Bases de Datos SQL', type: 'Virtual', progress: 60, instructor: 'Ing. José Ramírez', hours: 50, desc: 'Diseño, creación y optimización de bases de datos relacionales orientadas a grandes volúmenes.' },
            { id: 107, title: 'Redes y Telecomunicaciones', type: 'Presencial', progress: 10, instructor: 'Ing. Luis Otero', hours: 45, desc: 'Arquitectura de redes, protocolos TCP/IP y administración de servidores locales.' },
            { id: 108, title: 'Programación en Python', type: 'Virtual', progress: 100, instructor: 'Dra. Carla Ortiz', hours: 70, desc: 'Desde lógica de programación básica hasta análisis de datos con librerías nativas.' }
        ];

        // Combinar cursos reales con los simulados para demostrar paginación sí o sí
        const existingNames = new Set(currentCourses.map(c => c.nombreCurso || c.title));
        const filteredMock = mockCourses.filter(c => !existingNames.has(c.title));
        let allCourses = [...currentCourses, ...filteredMock];

        // --- 2. Preparación de Paginación ---
        const itemsPerPage = 6; // Mostrar 6 tarjetas por página
        const totalItems = allCourses.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);

        let coursesHtml = '';

        if (totalItems === 0) {
            coursesHtml = `
            <div style="text-align: center; padding: 4rem 2rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border); grid-column: 1 / -1;">
                <i class="fas fa-book-open" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--color-text); margin-bottom: 0.5rem;">No tienes cursos en progreso</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Explora el catálogo de la DCTI e inscríbete para potenciar tus habilidades.</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html#courses'">Ver Catálogo de Cursos</button>
            </div>`;
        } else {
            allCourses.forEach((course, index) => {
                const progress = course.progress !== undefined ? course.progress : Math.floor(Math.random() * 100);
                const statusStr = progress === 100 ? 'Completado' : 'En Progreso';
                const statusColor = progress === 100 ? '#10b981' : 'var(--color-primary)';
                const pageNum = Math.floor(index / itemsPerPage) + 1;

                // Serializamos la info del curso usando Base64 para evitar problemas con comillas en el DOM
                const courseDataStr = btoa(unescape(encodeURIComponent(JSON.stringify(course))));

                coursesHtml += `
                <div class="course-card page-${pageNum}" style="display: ${pageNum === 1 ? 'flex' : 'none'}; background: var(--color-surface); border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: 1.5rem; box-shadow: var(--shadow-sm); flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                        <h4 style="font-size: 1.1rem; font-weight: 600; color: var(--color-text); margin: 0; line-height: 1.3;">${course.title || course.nombreCurso}</h4>
                        <span style="background: ${course.type === 'Virtual' || course.modalidad === 'Virtual' ? '#e0e7ff' : '#fce7f3'}; color: ${course.type === 'Virtual' || course.modalidad === 'Virtual' ? '#4338ca' : '#be185d'}; font-size: 0.75rem; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600;">
                            ${course.type || course.modalidad || 'Virtual'}
                        </span>
                    </div>
                    
                    <div style="margin-bottom: 1.5rem; flex-grow: 1;">
                        <p style="font-size: 0.85rem; color: var(--color-text-muted); margin: 0; line-height: 1.5;">
                            <i class="fas fa-chalkboard-teacher" style="margin-right: 5px; color: var(--color-primary);"></i> ${course.instructor || 'Instructor Asignado'}<br>
                            <i class="far fa-clock" style="margin-right: 5px; margin-top: 5px; color: var(--color-text-muted);"></i> ${course.hours ? course.hours + ' Horas' : '40 Horas'}
                        </p>
                    </div>

                    <div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                            <span style="font-size: 0.85rem; font-weight: 600; color: ${statusColor};">${statusStr}</span>
                            <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">${progress}%</span>
                        </div>
                        <div style="width: 100%; height: 8px; background: var(--color-background); border-radius: 4px; overflow: hidden;">
                            <div style="width: ${progress}%; height: 100%; background: ${statusColor}; border-radius: 4px;"></div>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                        <button class="btn" onclick="MyCoursesController.showDetails('${courseDataStr}')" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; background: var(--color-background); color: var(--color-text); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;">
                            <i class="fas fa-info-circle"></i> Detalles
                        </button>
                        ${progress < 100 ? `
                        <button class="btn btn-primary" onclick="window.MyCoursesController.startCourse(${course.id})" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; text-align: center; border-radius: var(--radius-sm); cursor: pointer; transition: filter 0.2s;">
                            <i class="fas fa-play"></i> Continuar
                        </button>
                        ` : `
                        <button class="btn btn-secondary" onclick="window.MyCoursesController.downloadCertificate(${course.id})" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; text-align: center; border-radius: var(--radius-sm); cursor: pointer; transition: filter 0.2s; background: #f59e0b;">
                            <i class="fas fa-award"></i> Certificado
                        </button>
                        `}
                    </div>
                </div>
                `;
            });
        }

        // Construct Pagination Controls HTML
        let paginationHtml = '';
        if (totalPages > 1) {
            paginationHtml += `
            <div class="pagination-controls" style="display: flex; justify-content: center; align-items: center; gap: 0.5rem; margin-top: 2rem; width: 100%; grid-column: 1 / -1; font-family: 'Outfit', sans-serif;">
                <button class="btn-page" onclick="MyCoursesController.prevPage()" id="btn-prev-page" style="padding: 0.4rem 0.8rem; border: 1px solid var(--color-border); background: white; border-radius: 6px; cursor: pointer; color: var(--color-text-muted);" disabled><i class="fas fa-chevron-left"></i></button>
            `;

            for (let i = 1; i <= totalPages; i++) {
                paginationHtml += `<button class="btn-page page-num-btn ${i === 1 ? 'active' : ''}" onclick="MyCoursesController.goToPage(${i}, ${totalPages})" data-val="${i}" style="padding: 0.4rem 0.8rem; border: 1px solid ${i === 1 ? 'var(--color-primary)' : 'var(--color-border)'}; background: ${i === 1 ? 'var(--color-primary)' : 'white'}; color: ${i === 1 ? 'white' : 'var(--color-text)'}; border-radius: 6px; cursor: pointer; font-weight: 600;">${i}</button>`;
            }

            paginationHtml += `
                <button class="btn-page" onclick="MyCoursesController.nextPage(${totalPages})" id="btn-next-page" style="padding: 0.4rem 0.8rem; border: 1px solid var(--color-border); background: white; border-radius: 6px; cursor: pointer; color: var(--color-text);"><i class="fas fa-chevron-right"></i></button>
            </div>`;
        }

        return `
        <div class="view-container">
            <div class="view-header" style="margin-bottom: 2rem;">
                <h2 style="font-size: 2.2rem; margin: 0; background: linear-gradient(to right, #1e293b, var(--color-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-family: 'Outfit', sans-serif;">Mis Cursos</h2>
                <p style="color: var(--color-text-muted); font-size: 1.05rem; margin-top: 0.3rem;">Haz seguimiento a tu progreso y continúa tu formación académica.</p>
            </div>

            <div id="courses-wrapper" class="courses-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; align-items: stretch;">
                ${coursesHtml}
                ${paginationHtml}
            </div>

            <!-- Modal Container para Detalles (Oculto por defecto usando CSS nativo custom-modal-overlay) -->
            <div id="course-details-modal" class="custom-modal-overlay" style="align-items: center; justify-content: center; z-index: 9999;">
                <div class="custom-modal" style="width: 90%; max-width: 600px; padding: 0; text-align: left; overflow: hidden; animation: modalFadeIn 0.3s ease;">
                    <div id="modal-c-header" style="background: linear-gradient(135deg, rgba(83, 14, 144, 0.9), rgba(160, 28, 173, 0.9)); padding: 2rem; position: relative; background-size: cover; background-position: center; border-bottom: 3px solid var(--color-primary);">
                        <!-- Botón de Cerrar (X) arriba a la derecha -->
                        <button onclick="MyCoursesController.closeDetails()" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.4); border: none; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1rem; transition: background 0.2s; z-index: 10;">
                            <i class="fas fa-times"></i>
                        </button>
                        
                        <div style="position: relative; z-index: 5;">
                            <span id="modal-c-badge" style="background: rgba(0,0,0,0.4); padding: 4px 12px; border-radius: 20px; color: white; font-size: 0.8rem; text-transform: uppercase; font-weight: 600; letter-spacing: 1px; border: 1px solid rgba(255,255,255,0.3); text-shadow: 1px 1px 2px rgba(0,0,0,0.5);">Modalidad</span>
                            <h3 id="modal-c-title" style="color: white; font-size: 1.8rem; margin: 10px 0 0 0; font-weight: 800; line-height: 1.2; text-shadow: 1px 1px 4px rgba(0,0,0,0.8);">Título del Curso</h3>
                        </div>
                    </div>
                    
                    <div style="padding: 2rem; background: var(--color-surface);">
                        <div style="display: flex; gap: 2rem; margin-bottom: 1.5rem; padding-bottom: 1.5rem; border-bottom: 1px solid var(--color-border);">
                            <div>
                                <h4 style="font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 5px 0;">Instructor</h4>
                                <p id="modal-c-instructor" style="margin: 0; font-weight: 600; color: var(--color-text);"><i class="fas fa-chalkboard-teacher" style="color: var(--color-primary); margin-right: 5px;"></i> Nombre</p>
                            </div>
                            <div>
                                <h4 style="font-size: 0.85rem; color: var(--color-text-muted); text-transform: uppercase; margin: 0 0 5px 0;">Carga Horaria</h4>
                                <p id="modal-c-hours" style="margin: 0; font-weight: 600; color: var(--color-text);"><i class="far fa-clock" style="color: var(--color-primary); margin-right: 5px;"></i> X Horas</p>
                            </div>
                        </div>

                        <div>
                            <h4 style="font-size: 1.1rem; color: var(--color-text); margin: 0 0 10px 0; font-weight: 700;">Descripción Académica</h4>
                            <p id="modal-c-desc" style="color: #475569; font-size: 0.95rem; line-height: 1.6; margin: 0;">Aquí va la descripción del curso.</p>
                        </div>
                        
                        <div style="margin-top: 1.5rem;">
                            <h4 style="font-size: 1.1rem; color: var(--color-text); margin: 0 0 10px 0; font-weight: 700;">Materiales Educativos</h4>
                            <div id="modal-c-materials" style="display: flex; flex-direction: column; gap: 0.5rem;">
                                <!-- Los materiales se inyectan acá -->
                            </div>
                        </div>
                        
                        <div style="margin-top: 2rem; display: flex; justify-content: flex-end;">
                            <button class="btn" onclick="MyCoursesController.closeDetails()" style="background: var(--color-background); border: 1px solid var(--color-border); padding: 0.6rem 1.5rem; border-radius: var(--radius-md); font-weight: 600; cursor: pointer; color: var(--color-text);">Cerrar Panel</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- CSS Específico temporal si es necesario -->
            <style>
                .course-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1); }
                .btn-page:hover:not(:disabled) { background: #f1f5f9; }
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            </style>
        </div>
        `;
    }
};

// --- Controlador Lógico de Mis Cursos ---
window.MyCoursesController = {
    currentPage: 1,

    goToPage: function (page, totalPages) {
        if (page < 1 || page > totalPages) return;
        this.currentPage = page;

        // Ocultar todas las tarjetas
        document.querySelectorAll('.course-card').forEach(card => card.style.display = 'none');

        // Mostrar tarjetas de la página actual
        document.querySelectorAll(`.course-card.page-${page}`).forEach(card => card.style.display = 'flex');

        // Actualizar botones de paginación
        document.querySelectorAll('.page-num-btn').forEach(btn => {
            const btnVal = parseInt(btn.getAttribute('data-val'));
            if (btnVal === page) {
                btn.style.background = 'var(--color-primary)';
                btn.style.color = 'white';
                btn.style.borderColor = 'var(--color-primary)';
                btn.classList.add('active');
            } else {
                btn.style.background = 'white';
                btn.style.color = 'var(--color-text)';
                btn.style.borderColor = 'var(--color-border)';
                btn.classList.remove('active');
            }
        });

        const btnPrev = document.getElementById('btn-prev-page');
        const btnNext = document.getElementById('btn-next-page');
        if (btnPrev) btnPrev.disabled = (page === 1);
        if (btnNext) btnNext.disabled = (page === totalPages);
    },

    prevPage: function () {
        const activeBtn = document.querySelector('.page-num-btn.active');
        if (!activeBtn) return;
        const total = document.querySelectorAll('.page-num-btn').length;
        const current = parseInt(activeBtn.getAttribute('data-val'));
        this.goToPage(current - 1, total);
    },

    nextPage: function (totalPages) {
        const activeBtn = document.querySelector('.page-num-btn.active');
        if (!activeBtn) return;
        const current = parseInt(activeBtn.getAttribute('data-val'));
        this.goToPage(current + 1, totalPages);
    },

    showDetails: function (courseDataEncoded) {
        try {
            const course = JSON.parse(decodeURIComponent(escape(atob(courseDataEncoded))));

            // Configurar Imagen de Cabecera (Default o Imagen Subida)
            const headerDiv = document.getElementById('modal-c-header');
            if (course.images && course.images.length > 0) {
                headerDiv.style.backgroundImage = `linear-gradient(135deg, rgba(83, 14, 144, 0.8), rgba(0, 0, 0, 0.8)), url('${course.images[0]}')`;
            } else {
                headerDiv.style.backgroundImage = `linear-gradient(135deg, rgba(83, 14, 144, 0.9), rgba(160, 28, 173, 0.9))`;
            }

            // Población de Textos
            document.getElementById('modal-c-title').textContent = course.title || course.nombreCurso || 'Curso DCTI';
            document.getElementById('modal-c-badge').textContent = course.type || course.modalidad || 'General';
            document.getElementById('modal-c-instructor').innerHTML = `<i class="fas fa-chalkboard-teacher" style="color: var(--color-primary); margin-right: 5px;"></i> ${course.instructor || 'Instructor No Asignado'}`;
            document.getElementById('modal-c-hours').innerHTML = `<i class="far fa-clock" style="color: var(--color-primary); margin-right: 5px;"></i> ${course.hours || 40} Horas Académicas`;
            document.getElementById('modal-c-desc').textContent = course.desc || course.descripcion || 'No hay descripción académica extendida para este curso actualmente. Contacte con la coordinación de métodos y procesos para más información.';

            // Renderizar Materiales Educativos
            const materialsContainer = document.getElementById('modal-c-materials');
            if (course.materiales && course.materiales.length > 0) {
                let matsHtml = '';
                course.materiales.forEach(mat => {
                    matsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: white;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas ${mat.iconClass || 'fa-file-alt'}" style="color: ${mat.iconColor || 'var(--color-primary)'}; font-size: 1.5rem;"></i>
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--color-text);">${mat.name}</p>
                                <p style="margin: 0; font-size: 0.75rem; color: var(--color-text-muted);">${mat.sizeMB} MB</p>
                            </div>
                        </div>
                        <button onclick="tryDownloadMaterial('${mat.id}', '${course.id}')" style="background: var(--color-primary); color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: filter 0.2s;"><i class="fas fa-download"></i> Descargar</button>
                    </div>`;
                });
                materialsContainer.innerHTML = matsHtml;
            } else {
                materialsContainer.innerHTML = `<p style="font-size: 0.85rem; color: var(--color-text-muted); font-style: italic;"><i class="fas fa-info-circle"></i> No hay archivos descargables anexados a este curso.</p>`;
            }

            // Mostrar modal usando transiciones de clase 'show'
            const overlay = document.getElementById('course-details-modal');
            overlay.classList.add('show');
        } catch (e) {
            console.error("Error mostrando detalles:", e);
        }
    },

    closeDetails: function () {
        const overlay = document.getElementById('course-details-modal');
        overlay.classList.remove('show');
    },

    startCourse: function (id) {
        if (window.AlertService) {
            AlertService.notify('Redirigiendo', 'Abriendo el aula virtual del curso...', 'info', 2000);
        }
    },

    downloadCertificate: function (id) {
        if (window.AlertService) {
            AlertService.notify('Descargando Certificado', 'Generando diploma en formato PDF...', 'success', 3000);
        }
    }
};
