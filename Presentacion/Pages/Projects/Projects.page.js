const ProjectsView = {
    render: (data) => {
        // En este punto, renderModule ya debió sincronizar MOCK_DATA.projects con localStorage si existe getLocalProjects
        const paginated = data.pagination;
        const projects = paginated ? paginated.items : data.projects;
        const session = JSON.parse(localStorage.getItem('dcti_session'));
        const isAdmin = session && session.role === 'admin';

        // Obtención de data global para estadísticas exactas
        const globalAllProjects = typeof getLocalProjects === 'function' ? getLocalProjects() : [];
        const countDestacados = globalAllProjects.filter(p => p.status === 'Destacado').length;

        const createStatCard = (icon, number, label, textColor, bgColor) => `
            <div class="dcti-stat-card">
                <div class="dcti-stat-card-header">
                    <div class="dcti-stat-card-icon" style="background: ${bgColor}; color: ${textColor};">
                        <i class="${icon}"></i>
                    </div>
                    <span class="dcti-stat-card-number">${number}</span>
                </div>
                <hr class="dcti-stat-card-divider">
                <p class="dcti-stat-card-label">${label}</p>
            </div>
        `;

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Iniciativas Estratégicas</h2>
                        </div>
                        ${isAdmin ? `
                            <button class="btn-action" onclick="openProjectModal()" title="Nuevo Proyecto" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2);">
                                <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                            </button>
                        ` : ''}
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 5px;">
                        ${createStatCard('fas fa-project-diagram', globalAllProjects.length, 'Validados', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                        ${createStatCard('fas fa-star', countDestacados, 'Destacados', '#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: var(--space-lg);">
                        <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" id="filter-project-search" placeholder="Buscar Proyecto..." oninput="window.lastFocusedInput = this.id; window.globalProjectSearch = this.value; window.debouncedRenderModule('projects');" value="${window.globalProjectSearch || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 150px; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>
                        <select onchange="window.globalProjectStatusFilter = this.value; if(typeof changePage === 'function'){changePage('projects', 1)} else {renderModule('projects')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalProjectStatusFilter === 'Todos' || !window.globalProjectStatusFilter ? 'selected' : ''}>Todos los Estados</option>
                            <option value="Destacado" ${window.globalProjectStatusFilter === 'Destacado' ? 'selected' : ''}>Destacados</option>
                            <option value="En Progreso" ${window.globalProjectStatusFilter === 'En Progreso' ? 'selected' : ''}>En Progreso</option>
                            <option value="A Futuro" ${window.globalProjectStatusFilter === 'A Futuro' ? 'selected' : ''}>A Futuro</option>
                        </select>
                        <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                            <span style="color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;"><i class="fas fa-calendar-alt"></i> Publicado:</span>
                            <input type="date" onchange="window.globalProjectDateFrom = this.value; if(typeof changePage === 'function'){changePage('projects', 1)} else {renderModule('projects')}" value="${window.globalProjectDateFrom || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Desde">
                            <span style="color: var(--color-text-muted); font-size: 0.85rem;">a</span>
                            <input type="date" onchange="window.globalProjectDateTo = this.value; if(typeof changePage === 'function'){changePage('projects', 1)} else {renderModule('projects')}" value="${window.globalProjectDateTo || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Hasta">
                        </div>
                </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
                    ${projects.map(p => {
            const coverImage = (p.images && p.images.length > 0) ? (p.images[0].image || p.images[0]) : (p.image || 'assets/images/img8.jpg');
            return window.AdminTemplate.Card({
                id: p.id,
                title: p.title,
                image: coverImage,
                badge: { text: p.status, type: p.status === 'Destacado' ? 'warning' : (p.status === 'En Progreso' ? 'info' : 'default') },
                module: 'projects',
                onEdit: 'openProjectModal(' + p.id + ')',
                onDelete: 'deleteProject(' + p.id + ')'
            });
        }).join('')}
                    ${projects.length === 0 ? `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: white; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
                            <i class="fas fa-project-diagram" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <p>No hay proyectos registrados.</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Paginación Footer -->
                ${paginated ? window.AdminTemplate.Pagination('projects', paginated.currentPage, paginated.totalPages) : ''}

                <!-- Modal de Proyectos (HU001, HU004) -->
                <div id="project-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 1000px; width: 95%; padding: 0;">
                        <div class="modal-header">
                            <h2 id="project-modal-title">Gestión de Proyecto</h2>
                            <button class="close-modal" onclick="closeProjectModal()">&times;</button>
                        </div>
                        <form id="project-admin-form" onsubmit="handleProjectSubmit(event)" style="padding: 30px; max-height: 90vh; overflow-y: auto;">
                            <input type="hidden" id="edit-project-id">
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr)); gap: 30px; box-sizing: border-box;">
                                
                                <!-- Columna Izquierda: Imagen y Carrusel -->
                                <div style="display: flex; flex-direction: column;">
                                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-text-muted);">Añadir imágenes</label>
                                    <div style="position: relative; width: 100%; aspect-ratio: 1; background: #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
                                        <div id="admin-project-preview" style="width: 100%; height: 100%; border-radius: 8px; background-color: #cbd5e1; background-position: center; background-size: cover; position: relative; border: 2px dashed var(--color-border); display: flex; align-items: center; justify-content: center;">
                                            <input type="file" id="admin-project-file" multiple accept="image/*" style="opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; z-index: 10;">
                                            <input type="hidden" id="admin-project-media">
                                            <i class="fas fa-image placeholder-icon" id="admin-project-icon" style="font-size: 2rem; color: #94a3b8; pointer-events: none;"></i>
                                        </div>
                                        <button type="button" onclick="document.getElementById('admin-project-file').click()" style="position: absolute; bottom: -15px; right: -15px; width: 40px; height: 40px; border-radius: 50%; background: #1d4ed8; color: white; border: none; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; z-index: 11; box-shadow: 0 4px 6px rgba(0,0,0,0.2); cursor: pointer;" title="Subir Imagen">+</button>
                                    </div>
                                    
                                    <label id="project-gallery-title" style="display: block; margin-bottom: 10px; font-size: 0.9rem; color: var(--color-text-muted);">Publicadas</label>
                                    <div id="admin-project-gallery" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                                        <!-- Renderizado dinámico -->
                                    </div>
                                </div>

                                <!-- Columna Derecha: Formulario -->
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Título <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-project-title" placeholder="Ej: Modernización Red Eléctrica" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                    </div>

                                    <div class="form-group" style="flex-grow: 1;">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Descripción Breve <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-project-description" placeholder="Resumen para el listado..." style="width: 100%; height: 140px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: vertical;" required></textarea>
                                    </div>

                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Objetivos Estratégicos <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-project-objectives" placeholder="Metas a alcanzar..." style="width: 100%; height: 120px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: vertical;" required></textarea>
                                    </div>

                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Estado <span style="color: #ef4444;">*</span></label>
                                            <select id="admin-project-status" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background-color: white; font-weight: 600;" required>
                                                <option value="Destacado">Destacado (Completado y Relevante)</option>
                                                <option value="En Progreso">En Progreso (En desarrollo actual)</option>
                                                <option value="A Futuro">A Futuro (Programado para después)</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Ubicación en Inicio (Público)</label>
                                            <select id="admin-project-carousel" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background-color: white;">
                                                <option value="Ninguno">Listado Estándar</option>
                                                <option value="Carrusel Principal">Carrusel Principal (Superior)</option>
                                                <option value="Carrusel Miniaturas">Carrusel Miniaturas (Inferior)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Avances Realizados <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-project-advances" placeholder="Describa los avances actuales del proyecto..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: vertical;" required></textarea>
                                    </div>

                                    ${window.AdminTemplate.ModalFooter('closeProjectModal()', 'project-admin-form')}
                                    

                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};
