const ProjectsView = {
    render: (data) => {
        // En este punto, renderModule ya debió sincronizar MOCK_DATA.projects con localStorage si existe getLocalProjects
        const paginated = data.pagination;
        const projects = paginated ? paginated.items : data.projects;
        const session = JSON.parse(localStorage.getItem('dcti_session'));
        const isAdmin = session && session.role === 'admin';

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Iniciativas Estratégicas</h2>
                            <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                                Total: ${paginated ? paginated.totalItems : projects.length}
                            </span>
                        </div>
                        ${isAdmin ? `
                            <button class="btn-action" onclick="openProjectModal()" title="Nuevo Proyecto" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2);">
                                <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                            </button>
                        ` : ''}
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: var(--space-lg);">
                        <select onchange="window.globalProjectStatusFilter = this.value; if(typeof changePage === 'function'){changePage('projects', 1)} else {renderModule('projects')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalProjectStatusFilter === 'Todos' || !window.globalProjectStatusFilter ? 'selected' : ''}>Todos los Estados</option>
                            <option value="En Proceso" ${window.globalProjectStatusFilter === 'En Proceso' ? 'selected' : ''}>En Proceso</option>
                            <option value="Validado" ${window.globalProjectStatusFilter === 'Validado' ? 'selected' : ''}>Validados</option>
                            <option value="Borrador" ${window.globalProjectStatusFilter === 'Borrador' ? 'selected' : ''}>Borradores</option>
                        </select>
                        <select onchange="window.globalProjectFeaturedFilter = this.value; if(typeof changePage === 'function'){changePage('projects', 1)} else {renderModule('projects')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalProjectFeaturedFilter === 'Todos' || !window.globalProjectFeaturedFilter ? 'selected' : ''}>Cualquier Relevancia</option>
                            <option value="Destacados" ${window.globalProjectFeaturedFilter === 'Destacados' ? 'selected' : ''}>Solo Destacados</option>
                            <option value="Regulares" ${window.globalProjectFeaturedFilter === 'Regulares' ? 'selected' : ''}>Solo Regulares</option>
                        </select>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
                    ${projects.map(p => {
            const coverImage = (p.images && p.images.length > 0) ? (p.images[0].image || p.images[0]) : (p.image || 'assets/images/img8.jpg');
            return `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;">
                            ${p.featured ? `
                                <div style="position: absolute; top: 12px; left: 12px; background: #f59e0b; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                    <i class="fas fa-star"></i> DESTACADO
                                </div>
                            ` : ''}
                            <div style="height: 140px; background: #f1f5f9; overflow: hidden; position: relative;">
                                <img src="${coverImage}" style="width: 100%; height: 100%; object-fit: cover;">
                            </div>
                            <div style="padding: var(--space-md); flex: 1; display: flex; flex-direction: column;">
                                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                                    <span style="font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; font-weight: 700; background: ${p.status === 'Validado' ? '#dcfce7' : (p.status === 'En Proceso' ? '#fef9c3' : '#f3f4f6')}; color: ${p.status === 'Validado' ? '#166534' : (p.status === 'En Proceso' ? '#854d0e' : '#374151')}; border: 1px solid ${p.status === 'Validado' ? '#bbf7d0' : (p.status === 'En Proceso' ? '#fef08a' : '#e5e7eb')};">
                                        ${p.status}
                                    </span>
                                    <div style="font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600;">ID: #${p.id}</div>
                                </div>
                                
                                <h3 style="font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 2.8em;">${p.title}</h3>
                                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 3em;">${p.description}</p>
                                
                                <div style="margin-bottom: 15px; margin-top: auto;">
                                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px; font-weight: 600;">
                                        <span>Progreso</span>
                                        <span>${p.progress}%</span>
                                    </div>
                                    <div style="width: 100%; height: 6px; background: #eee; border-radius: 10px; overflow: hidden;">
                                        <div style="width: ${p.progress}%; height: 100%; background: var(--color-primary); border-radius: 10px; transition: width 0.3s ease;"></div>
                                    </div>
                                </div>
    
                                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 15px;">
                                    <button onclick="toggleFeatured(${p.id})" title="${p.featured ? 'Quitar Destacado' : 'Destacar'}" style="flex: 0 0 auto; width: 35px; background: ${p.featured ? '#fffbeb' : 'white'}; border: 1px solid ${p.featured ? '#fde68a' : 'var(--color-border)'}; border-radius: 6px; cursor: pointer; color: ${p.featured ? '#f59e0b' : '#cbd5e1'}; font-size: 1rem; transition: 0.2s;"><i class="${p.featured ? 'fas' : 'far'} fa-star"></i></button>
                                    <button onclick="openProjectModal(${p.id})" title="Editar" style="flex: 1; background: none; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; cursor: pointer; color: var(--color-text-main); transition: 0.2s;"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteProject(${p.id})" title="Eliminar" style="flex: 1; background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                        `;
        }).join('')}
                    ${projects.length === 0 ? `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: white; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
                            <i class="fas fa-project-diagram" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <p>No hay proyectos registrados.</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Paginación Footer -->
                ${paginated && paginated.totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 20px 0;">
                        <button onclick="changePage('projects', ${paginated.currentPage - 1})" ${paginated.currentPage === 1 ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === 1 ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === 1 ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-left" style="font-size: 0.8rem;"></i>
                        </button>
                        <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">Página ${paginated.currentPage} de ${paginated.totalPages}</span>
                        <button onclick="changePage('projects', ${paginated.currentPage + 1})" ${paginated.currentPage === paginated.totalPages ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === paginated.totalPages ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === paginated.totalPages ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-right" style="font-size: 0.8rem;"></i>
                        </button>
                    </div>
                ` : ''}

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
                                                <option value="Borrador">Borrador</option>
                                                <option value="En Proceso">En Proceso</option>
                                                <option value="Validado">Validar Proyecto (Listo para Destacar)</option>
                                            </select>
                                        </div>

                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Progreso (%)</label>
                                            <input type="number" id="admin-project-progress" min="0" max="100" value="0" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;">
                                        </div>
                                    </div>

                                    <div class="form-group" style="display: flex; flex-direction: column; gap: 5px; padding-top: 5px;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <input type="checkbox" id="admin-project-featured" style="width: 20px; height: 20px;">
                                            <label for="admin-project-featured" style="font-size: 0.9rem; font-weight: 700; color: var(--color-primary);">Marcar como Destacado (Visible en el Portal)</label>
                                        </div>
                                        <span id="featured-hint" style="font-size: 0.75rem; color: #ef4444; margin-left: 30px; display: none;">* Requiere estado "Validar Proyecto"</span>
                                    </div>

                                    <div class="form-group" style="display: flex; gap: 15px; margin-top: auto; padding-top: 15px; border-top: 1px solid #eee;">
                                        <button type="submit" class="btn-primary" style="flex: 1; padding: 12px; border-radius: 6px; background: #16a34a; color: white; border: none; font-weight: 600;">Publicar</button>
                                        <button type="button" class="btn-secondary" onclick="closeProjectModal()" style="flex: 1; padding: 12px; border-radius: 6px; background: #9333ea; color: white; border: none; font-weight: 600;">Borrar / Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};
