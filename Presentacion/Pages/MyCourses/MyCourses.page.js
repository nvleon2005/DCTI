const MyCoursesView = {
    render: function (data) {
        const user = data.currentUser || {};
        const userId = user.email || user.username || null;

        // Obtener todos los cursos y todas las participaciones reales
        const allCourses = window.getLocalCourses ? window.getLocalCourses() : [];
        const allParticipations = window.getLocalParticipations ? window.getLocalParticipations() : [];

        // Filtrar cursos donde el usuario actual esté inscrito y tenga estado Aprobado/Activo
        const enrolledCourseIds = allParticipations
            .filter(p => p.userId === userId)
            .map(p => p.courseId);

        let myEnrolledCourses = allCourses.filter(c => enrolledCourseIds.includes(c.id));

        // --- Aplicar Filtros (Búsqueda y Estado) ---
        const searchQuery = (window.globalSearchQuery || '').toLowerCase();
        const statusFilter = window.myCoursesStatusFilter || 'Todos';

        myEnrolledCourses = myEnrolledCourses.filter(c => {
            // Evaluamos la búsqueda
            let matchSearch = true;
            if (searchQuery) {
                const title = (c.nombreCurso || c.title || '').toLowerCase();
                const desc = (c.descripcion || c.desc || '').toLowerCase();
                const instructor = (c.instructor || '').toLowerCase();
                matchSearch = title.includes(searchQuery) || desc.includes(searchQuery) || instructor.includes(searchQuery);
            }

            // Evaluamos el estado (Progreso real según participación)
            let matchStatus = true;
            if (statusFilter !== 'Todos') {
                const myParticipant = allParticipations.find(p => p.courseId === c.id && p.userId === userId);
                const statusStr = myParticipant ? myParticipant.estado : 'Activo';
                const mappedStatus = (statusStr === 'Aprobado') ? 'Completado' : 'En Progreso';
                matchStatus = (mappedStatus === statusFilter);
            }

            return matchSearch && matchStatus;
        });

        // --- 2. Preparación de Paginación ---
        const itemsPerPage = 6; // Mostrar 6 tarjetas por página
        const totalItems = myEnrolledCourses.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

        let coursesHtml = '';

        if (totalItems === 0) {
            coursesHtml = `
            <div style="text-align: center; padding: 4rem 2rem; background: var(--color-surface); border-radius: var(--radius-lg); border: 1px dashed var(--color-border); grid-column: 1 / -1;">
                <i class="fas fa-book-open" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 1rem;"></i>
                <h3 style="color: var(--color-text); margin-bottom: 0.5rem;">No tienes cursos en progreso</h3>
                <p style="color: var(--color-text-muted); margin-bottom: 1.5rem;">Explora el catálogo de la DCTI e inscríbete para potenciar tus habilidades.</p>
                <button class="btn btn-primary" onclick="window.location.href='index.html#view-cursos'">Ver Catálogo de Cursos</button>
            </div>`;
        } else {
            myEnrolledCourses.forEach((course, index) => {
                const myParticipation = allParticipations.find(p => p.courseId === course.id && p.userId === userId);
                const rawStatus = myParticipation ? myParticipation.estado : 'Activo';
                const statusStr = rawStatus === 'Aprobado' ? 'Completado' : 'En Progreso';
                const statusColor = rawStatus === 'Aprobado' ? '#10b981' : 'var(--color-primary)';
                const isCompleted = rawStatus === 'Aprobado';
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
                            <span style="font-size: 0.85rem; font-weight: 600; color: ${statusColor};"><i class="fas fa-user-graduate" style="margin-right: 5px;"></i> ${statusStr}</span>
                            <span style="font-size: 0.85rem; color: var(--color-text-muted); font-weight: 600;">Estado Oficial</span>
                        </div>
                    </div>
                    
                    <div style="margin-top: 1.5rem; display: flex; gap: 0.5rem;">
                        <button class="btn" onclick="MyCoursesController.showDetails('${courseDataStr}')" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; background: var(--color-background); color: var(--color-text); text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); cursor: pointer; transition: background 0.2s;">
                            <i class="fas fa-info-circle"></i> Detalles
                        </button>
                        ${!isCompleted ? `
                        <button class="btn btn-primary" onclick="window.MyCoursesController.startCourse(${course.id})" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; text-align: center; border-radius: var(--radius-sm); cursor: pointer; transition: filter 0.2s;">
                            <i class="fas fa-play"></i> Continuar
                        </button>
                        ` : `
                        <button class="btn btn-secondary" onclick="window.MyCoursesController.downloadCertificate(${course.id})" style="flex: 1; padding: 0.5rem; font-size: 0.85rem; text-align: center; border-radius: var(--radius-sm); cursor: pointer; transition: filter 0.2s; background: #f59e0b; border: none; color: white;">
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
            <div class="view-header" style="margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1.5rem;">
                <div>
                    <h2 style="font-size: 2.2rem; margin: 0; background: linear-gradient(to right, #1e293b, var(--color-primary)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-weight: 800; font-family: 'Outfit', sans-serif;">Mis Cursos</h2>
                    <p style="color: var(--color-text-muted); font-size: 1.05rem; margin-top: 0.3rem;">Haz seguimiento a tu progreso y continúa tu formación académica.</p>
                </div>
                
                <div style="display: flex; gap: 1rem; align-items: center;">
                    <label for="filter-my-courses-status" style="font-weight: 600; font-size: 0.9rem; color: var(--color-text-muted);"><i class="fas fa-filter" style="margin-right: 5px;"></i> Estado:</label>
                    <select id="filter-my-courses-status" onchange="MyCoursesController.filterByStatus(this.value)" style="padding: 0.6rem 1rem; border: 1px solid var(--color-border); border-radius: 6px; font-family: 'Outfit', sans-serif; font-size: 0.9rem; background: var(--color-surface); color: var(--color-text); outline: none; cursor: pointer; min-width: 160px; box-shadow: var(--shadow-sm);">
                        <option value="Todos" ${statusFilter === 'Todos' ? 'selected' : ''}>Todos los cursos</option>
                        <option value="En Progreso" ${statusFilter === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                        <option value="Completado" ${statusFilter === 'Completado' ? 'selected' : ''}>Completados</option>
                    </select>
                </div>
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

    filterByStatus: function (statusVal) {
        window.myCoursesStatusFilter = statusVal;
        if (typeof renderModule === 'function') {
            renderModule('mis-cursos', true);
        }
    },

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

            // Renderizar Materiales Educativos con restricciones de fecha
            const materialsContainer = document.getElementById('modal-c-materials');
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Ignorar tiempo, comparar solo días

            let isMaterialAvailable = true;
            let restrictionMessage = '';

            if (course.fechaLiberacionMateriales) {
                const releaseDate = new Date(course.fechaLiberacionMateriales);
                releaseDate.setHours(0, 0, 0, 0);

                // Asegurarse de lidiar con posibles desajustes de zona horaria añadiendo un día a la comparativa visual
                const releaseDateLocal = new Date(course.fechaLiberacionMateriales + 'T00:00:00');

                if (today < releaseDateLocal) {
                    isMaterialAvailable = false;
                    const dateFormatted = releaseDateLocal.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
                    restrictionMessage = `Disponible a partir del ${dateFormatted}`;
                }
            }

            if (course.materiales && course.materiales.length > 0) {
                let matsHtml = '';
                course.materiales.forEach(mat => {
                    const btnStyle = isMaterialAvailable
                        ? `background: var(--color-primary); color: white; border: none; padding: 6px 15px; border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; transition: filter 0.2s;`
                        : `background: #e2e8f0; color: #64748b; border: none; padding: 6px 15px; border-radius: 4px; cursor: not-allowed; font-size: 0.8rem; font-weight: 600;`;

                    const btnIcon = isMaterialAvailable ? '<i class="fas fa-download"></i> Descargar' : `<i class="fas fa-lock"></i> ${restrictionMessage}`;
                    const btnOnClick = isMaterialAvailable ? `onclick="tryDownloadMaterial('${mat.id}', '${course.id}')"` : 'disabled';

                    matsHtml += `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: white;">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <i class="fas ${mat.iconClass || 'fa-file-alt'}" style="color: ${mat.iconColor || 'var(--color-primary)'}; font-size: 1.5rem;"></i>
                            <div>
                                <p style="margin: 0; font-weight: 600; font-size: 0.9rem; color: var(--color-text);">${mat.name}</p>
                                <p style="margin: 0; font-size: 0.75rem; color: var(--color-text-muted);">${mat.sizeMB ? mat.sizeMB + ' MB' : 'Archivo'}</p>
                            </div>
                        </div>
                        <button ${btnOnClick} style="${btnStyle}">${btnIcon}</button>
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
