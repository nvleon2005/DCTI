const CoursesView = {
    render: (data) => {
        const paginated = data.pagination;
        const courses = paginated ? paginated.items : data.courses;
        const currentCategory = data.categoryFilter || 'Publicado';

        const filters = ['Todos', 'Publicado', 'Borrador', 'Finalizado'];
        const filterButtons = filters.map(cat => `
            <button onclick="if(typeof filterCoursesAdmin === 'function') filterCoursesAdmin('${cat}')" 
                style="padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid var(--color-border); transition: 0.2s; 
                ${currentCategory === cat ? 'background: var(--color-accent); color: white; border-color: var(--color-accent);' : 'background: white; color: var(--color-text-main);'}">
                ${cat}
            </button>
        `).join('');

        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Gestión Académica de Cursos</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total listados: ${data.courses.length}
                        </span>
                    </div>
                    <button class="btn-action" onclick="openCourseModal()" title="Crear Curso" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                    </button>
                </div>

                <div style="display: flex; gap: 10px; margin-bottom: var(--space-lg); overflow-x: auto; padding-bottom: 5px; scrollbar-width: none;">
                    ${filterButtons}
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
                    ${courses.map(c => {
            const coverImage = (c.images && c.images.length > 0) ? (c.images[0].image || c.images[0]) : 'img/img9.jpg';
            const isFinalizado = c.estadoCurso === 'Finalizado';
            const isPublicado = c.estadoCurso === 'Publicado';

            return `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative; opacity: ${isFinalizado ? '0.75' : '1'};">
                            ${isPublicado ? `
                                <div style="position: absolute; top: 12px; left: 12px; background: #22c55e; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                    <i class="fas fa-satellite-dish"></i> EN EMISIÓN
                                </div>
                            ` : ''}
                            <div style="height: 150px; background: #f1f5f9; overflow: hidden; position: relative;">
                                <img src="${coverImage}" style="width: 100%; height: 100%; object-fit: cover; filter: ${isFinalizado ? 'grayscale(90%)' : 'none'};">
                            </div>
                            <div style="padding: var(--space-md); flex: 1; display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; background: ${c.estadoCurso === 'Publicado' ? '#dcfce7' : (c.estadoCurso === 'Finalizado' ? '#fee2e2' : '#f3f4f6')}; color: ${c.estadoCurso === 'Publicado' ? '#166534' : (c.estadoCurso === 'Finalizado' ? '#991b1b' : '#374151')}; border: 1px solid ${c.estadoCurso === 'Publicado' ? '#bbf7d0' : (c.estadoCurso === 'Finalizado' ? '#fecaca' : '#e5e7eb')};">
                                        ${c.estadoCurso}
                                    </span>
                                    <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;"><i class="fas fa-users"></i> Max: ${c.cupoMaximo}</div>
                                </div>
                                
                                <h3 style="font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">${c.nombreCurso}</h3>
                                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.4em;">${c.descripcion}</p>
                                
                                <div style="margin-bottom: 15px; margin-top: auto; font-size: 0.75rem; color: var(--color-text-muted); display:flex; justify-content: space-between; background: #f8fafc; padding: 6px; border-radius: 4px;">
                                    <span><i class="far fa-calendar-alt"></i> ${c.fechaInicio}</span>
                                    <span><i class="far fa-flag"></i> ${c.fechaFin}</span>
                                </div>
    
                                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                                    <button onclick="openCourseModal(${c.id})" title="Gestionar (Alumnos, Materiales, Edición)" style="flex: 1; background: none; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; cursor: pointer; color: var(--color-text-main); transition: 0.2s;"><i class="fas fa-folder-open" style="margin-right:5px;"></i> Abrir</button>
                                    <button onclick="deleteCourse(${c.id})" title="Eliminar (Físico)" style="flex: 0 0 auto; width: 40px; background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                    ${courses.length === 0 ? `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: white; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
                            <i class="fas fa-graduation-cap" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <p>No se encontraron Programas Académicos en este estado de filtro.</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Paginación Footer -->
                ${paginated && paginated.totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 20px 0;">
                        <button onclick="changePage('courses', ${paginated.currentPage - 1})" ${paginated.currentPage === 1 ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === 1 ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === 1 ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-left" style="font-size: 0.8rem;"></i>
                        </button>
                        <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">Página ${paginated.currentPage} de ${paginated.totalPages}</span>
                        <button onclick="changePage('courses', ${paginated.currentPage + 1})" ${paginated.currentPage === paginated.totalPages ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === paginated.totalPages ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === paginated.totalPages ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-right" style="font-size: 0.8rem;"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Modal Multifase de Cursos -->
                <div id="course-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 950px; width: 95%; padding: 0; display: flex; flex-direction: column; max-height: 90vh;">
                        <div class="modal-header" style="background: var(--color-sidebar); color: white; padding: 15px 25px; margin-bottom: 0;">
                            <div>
                                <h2 id="course-modal-title" style="margin: 0; font-size: 1.15rem;">Creación Académica</h2>
                            </div>
                            <button class="close-modal" onclick="closeCourseModal()" style="color: white; border: none; background: none; font-size: 1.5rem; cursor: pointer; opacity: 0.8;">&times;</button>
                        </div>
                        
                        <!-- Pestañas -->
                        <div style="display: flex; background: #f8fafc; border-bottom: 1px solid var(--color-border); padding: 0 25px;">
                            <button id="tab-technical-btn" onclick="switchCourseTab('technical')" style="padding: 15px 20px; border: none; background: none; cursor: pointer; font-weight: 600; color: var(--color-primary); border-bottom: 3px solid var(--color-primary); font-size: 0.9rem;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i> Ficha Pedagógica</button>
                            <button id="tab-students-btn" onclick="switchCourseTab('students')" style="padding: 15px 20px; border: none; background: none; cursor: pointer; font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; transition: 0.2s;"><i class="fas fa-users" style="margin-right: 8px;"></i> Participantes</button>
                            <button id="tab-materials-btn" onclick="switchCourseTab('materials')" style="padding: 15px 20px; border: none; background: none; cursor: pointer; font-weight: 600; color: var(--color-text-muted); font-size: 0.9rem; transition: 0.2s;"><i class="fas fa-book" style="margin-right: 8px;"></i> Materiales (DD.AA)</button>
                        </div>

                        <!-- Contenedor SCROLLABLE -->
                        <div style="flex: 1; overflow-y: auto; padding: 25px;">
                            
                            <!-- TAB 1: FICHA TÉCNICA -->
                            <div id="tab-technical-content" style="display: block;">
                                <form id="course-admin-form" onsubmit="handleCourseSubmit(event)">
                                    <input type="hidden" id="edit-course-id">
                                    <div style="display: grid; grid-template-columns: 2fr 3fr; gap: 30px;">
                                        
                                        <!-- Col Img -->
                                        <div style="display: flex; flex-direction: column;">
                                            <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-text-muted); font-weight: 600;"><i class="fas fa-images"></i> Galerías Promocionales</label>
                                            <div style="position: relative; width: 100%; aspect-ratio: 1; background: #e2e8f0; border-radius: 8px; margin-bottom: 15px;">
                                                <div style="width: 100%; height: 100%; border-radius: 8px; background-color: #cbd5e1; display: flex; align-items: center; justify-content: center; border: 2px dashed var(--color-border); position: relative;">
                                                    <input type="file" id="admin-course-file" accept="image/*" multiple onchange="handleCourseImageUpload(event)" style="opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; z-index: 10;">
                                                    <i class="fas fa-cloud-upload-alt placeholder-icon" style="font-size: 2.5rem; color: #94a3b8; pointer-events: none;"></i>
                                                </div>
                                            </div>
                                            <label id="course-gallery-title" style="display: block; margin-bottom: 10px; font-size: 0.85rem; color: var(--color-text-muted);">Imágenes subidas (Max 4). Formatos: JPG, PNG, WEBP.</label>
                                            <div id="admin-course-gallery" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
                                                <!-- Dynamic gallery injected here -->
                                            </div>
                                        </div>

                                        <!-- Col Formularios -->
                                        <div style="display: flex; flex-direction: column; gap: 15px;">
                                            <div class="form-group">
                                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Denominación del Curso <span style="color: #ef4444;">*</span></label>
                                                <input type="text" id="admin-course-name" placeholder="Ej: Fundamentos de IA" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-weight: 500;" required>
                                            </div>

                                            <div class="form-group">
                                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Síntesis del Programa <span style="color: #ef4444;">*</span></label>
                                                <textarea id="admin-course-description" placeholder="Objetivos y alcance pedagógico..." style="width: 100%; height: 100px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: vertical;" required></textarea>
                                            </div>

                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                                <div class="form-group">
                                                    <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;"><i class="fas fa-hourglass-start"></i> Inicio <span style="color: #ef4444;">*</span></label>
                                                    <input type="date" id="admin-course-start" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                                </div>
                                                <div class="form-group">
                                                    <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;"><i class="fas fa-hourglass-end"></i> Culminación <span style="color: #ef4444;">*</span></label>
                                                    <input type="date" id="admin-course-end" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                                </div>
                                            </div>

                                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                                <div class="form-group">
                                                    <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;"><i class="fas fa-user-friends"></i> Cupo Máximo <span style="color: #ef4444;">*</span></label>
                                                    <input type="number" min="1" step="1" onkeypress="return event.charCode >= 48 && event.charCode <= 57" oninput="this.value = this.value.replace(/[^0-9]/g, '')" id="admin-course-quota" placeholder="Ej: 30" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                                    <span style="font-size: 0.65rem; color: var(--color-text-muted); display: block; margin-top: 5px;"><i class="fas fa-info-circle"></i> Solo números enteros.</span>
                                                </div>
                                                <div class="form-group">
                                                    <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Estado de Apertura <span style="color: #ef4444;">*</span></label>
                                                    <select id="admin-course-status" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-weight: 600;" required>
                                                        <option value="Borrador">Borrador (Inactivo)</option>
                                                        <option value="Publicado">Publicado (Ofertable)</option>
                                                        <option value="Finalizado">Finalizado (Histórico)</option>
                                                    </select>
                                                </div>
                                            </div>
                                            
                                            <!-- Auditoría Informática Disclaimer -->
                                            <div style="background: #fdf2f8; border-left: 3px solid #db2777; padding: 10px; border-radius: 4px; font-size: 0.75rem; color: #831843;">
                                                <i class="fas fa-shield-alt" style="margin-right: 5px;"></i> <strong>Ley Especial contra Delitos Informáticos:</strong> Todos los cambios de Estado ("Borrador", "Publicado", "Finalizado") generarán logs inmutables atados a la identidad de sesión.
                                            </div>
                                            
                                            <div style="margin-top: 20px; text-align: right;">
                                                <button type="button" id="btn-reactivate-course" onclick="changeCourseStatusToReactivate()" style="display:none; padding: 10px 20px; background: #eab308; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; margin-right: 10px;"><i class="fas fa-unlock"></i> Reactivar Ciclo</button>
                                                <button type="button" class="btn-secondary" onclick="closeCourseModal()" style="padding: 10px 20px; margin-right: 10px; border-radius: 6px; font-weight: 600;">Cancelar</button>
                                                <button type="submit" id="btn-save-course" class="btn-primary" style="padding: 10px 25px; border-radius: 6px; font-weight: 700; background: #2563eb; color: white; border: none;"><i class="fas fa-save" style="margin-right:5px;"></i> Guardar Estructura</button>
                                            </div>

                                        </div>
                                    </div>
                                </form>
                            </div>

                            <!-- TAB 2: ESTUDIANTES -->
                            <div id="tab-students-content" style="display: none;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h3 style="margin: 0; font-size: 1.1rem; color: var(--color-primary);">Auditoría de Matrícula</h3>
                                    <button style="padding: 8px 15px; background: white; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: var(--color-text-main);"><i class="fas fa-file-csv" style="color: #16a34a;"></i> Exportar a CSV</button>
                                </div>
                                <div id="admin-course-students-list" style="background: white; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden;">
                                    <!-- Inyección de courses-logic.js -> renderCourseParticipants() -->
                                </div>
                            </div>

                            <!-- TAB 3: MATERIALES (DERECHOS DE AUTOR) -->
                            <div id="tab-materials-content" style="display: none;">
                                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                                    <h4 style="margin: 0 0 5px 0; color: #166534;"><i class="fas fa-balance-scale"></i> Protección de Propiedad Intelectual</h4>
                                    <p style="margin: 0; font-size: 0.85rem; color: #15803d; line-height: 1.4;">Los documentos, manuales y audiovisuales anexados están amparados por la Ley Sobre el Derecho de Autor. Sólo los participantes con el Status <strong style="background: #166534; color: white; padding: 1px 5px; border-radius: 3px;">Activo</strong> podrán acceder e invocar la función de <i>Solo Lectura / Préstamo Pedagógico</i>.</p>
                                </div>
                                
                                <div style="margin-bottom: 20px; background: white; padding: 15px; border-radius: 8px; border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between;">
                                    <div>
                                        <h4 style="margin: 0 0 5px 0; font-size: 0.95rem; display: flex; align-items: center; gap: 8px;"><i class="far fa-calendar-alt" style="color: var(--color-primary);"></i> Fecha de Liberación de Materiales</h4>
                                        <p style="margin: 0; font-size: 0.8rem; color: var(--color-text-muted);">Si se establece, los estudiantes no podrán visualizar ni descargar el material adjunto antes de esta fecha.</p>
                                    </div>
                                    <div style="width: 200px;">
                                        <input type="date" id="admin-course-materials-date" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; font-weight: 500;">
                                    </div>
                                </div>
                                
                                <div id="materials-grid-container" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
                                    
                                    <!-- SIMULACRO MATERIALES EXISTENTES -->
                                    <div style="border: 1px solid var(--color-border); border-radius: 8px; padding: 15px; text-align: center; background: white;">
                                        <i class="fas fa-file-pdf" style="font-size: 2.5rem; color: #ef4444; margin-bottom: 10px;"></i>
                                        <h4 style="margin: 0 0 5px 0; font-size: 0.9rem;">Guía Tema 1.pdf</h4>
                                        <p style="font-size: 0.75rem; color: var(--color-text-muted); margin: 0 0 10px 0;">2.4 MB - Encriptado</p>
                                        <button type="button" onclick="tryDownloadMaterial('MAT-9921', document.getElementById('edit-course-id').value)" style="width: 100%; padding: 8px; background: #f1f5f9; border: 1px solid var(--color-border); border-radius: 4px; cursor: pointer; font-size: 0.8rem; font-weight: 600; color: var(--color-primary); transition: 0.2s;"><i class="fas fa-download"></i> Simular Descarga Lícita</button>
                                    </div>
                                    
                                    <!-- SUBIR MATERIAL VÍA MODAL -->
                                    <div style="position: relative; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 160px; background: #fafafa; cursor: pointer; transition: 0.2s;">
                                        <input type="file" id="admin-course-materials-file" accept="application/pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.zip,application/zip" multiple onchange="if(typeof handleCourseMaterialUpload==='function') handleCourseMaterialUpload(event)" style="opacity: 0; position: absolute; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; z-index: 10;">
                                        <i class="fas fa-cloud-upload-alt" style="font-size: 2.5rem; color: var(--color-primary); margin-bottom: 10px; pointer-events: none;"></i>
                                        <span style="font-size: 0.85rem; font-weight: 600; color: var(--color-text-muted); pointer-events: none;">Repositorio Segurizado</span>
                                        <span style="font-size: 0.7rem; color: var(--color-primary); font-weight: 600; pointer-events: none; margin-top: 5px; text-align: center;">Formatos: PDF, DOCX, XLSX, ZIP</span>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};
